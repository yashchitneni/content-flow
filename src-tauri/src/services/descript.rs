use reqwest::{Client, multipart};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::{AppHandle, Manager, Emitter};
use tokio::fs::File;
use tokio::io::AsyncReadExt;
use std::sync::Arc;
use tokio::sync::{Mutex, Semaphore};
use std::collections::VecDeque;
use std::time::Duration;
use tokio::time::sleep;

use super::descript_auth::{DescriptAuth, AuthTokens, AuthError};

const DESCRIPT_API_BASE: &str = "https://api.descript.com/v1";
const MAX_CONCURRENT_UPLOADS: usize = 3;
const MAX_BATCH_SIZE: usize = 20;
const MAX_RETRIES: u32 = 3;
const INITIAL_RETRY_DELAY: u64 = 1000; // 1 second

#[derive(Debug, Serialize, Deserialize)]
pub struct DescriptProject {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadRequest {
    pub file_path: String,
    pub project_id: String,
    pub file_name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UploadProgress {
    pub file_path: String,
    pub file_name: String,
    pub progress: f32,
    pub status: UploadStatus,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum UploadStatus {
    Queued,
    Uploading,
    Processing,
    Completed,
    Failed,
    ManualExportRequired,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchUploadResult {
    pub total_files: usize,
    pub successful_uploads: usize,
    pub failed_uploads: usize,
    pub upload_results: Vec<UploadProgress>,
    pub manual_export_required: bool,
}

#[derive(Debug, Serialize)]
pub struct DescriptError {
    pub message: String,
    pub code: String,
}

#[derive(Debug)]
pub struct DescriptUploadService {
    auth: Arc<DescriptAuth>,
    client: Client,
    upload_queue: Arc<Mutex<VecDeque<UploadRequest>>>,
    semaphore: Arc<Semaphore>,
    app_handle: AppHandle,
}

impl DescriptUploadService {
    pub fn new(auth: DescriptAuth, app_handle: AppHandle) -> Self {
        Self {
            auth: Arc::new(auth),
            client: Client::builder()
                .timeout(Duration::from_secs(300)) // 5 minute timeout for large files
                .build()
                .unwrap(),
            upload_queue: Arc::new(Mutex::new(VecDeque::new())),
            semaphore: Arc::new(Semaphore::new(MAX_CONCURRENT_UPLOADS)),
            app_handle,
        }
    }

    // Get stored access token
    async fn get_access_token(&self) -> Result<String, DescriptError> {
        let encrypted = DescriptAuth::get_stored_tokens(&self.app_handle)
            .map_err(|e| DescriptError {
                message: format!("Failed to get stored tokens: {:?}", e),
                code: "AUTH_ERROR".to_string(),
            })?;

        let tokens = self.auth.decrypt_tokens(&encrypted)
            .map_err(|e| DescriptError {
                message: format!("Failed to decrypt tokens: {:?}", e),
                code: "AUTH_ERROR".to_string(),
            })?;

        // Check if token needs refresh
        if DescriptAuth::needs_refresh(&tokens) {
            if let Some(refresh_token) = &tokens.refresh_token {
                let new_tokens = self.auth.refresh_token(refresh_token).await
                    .map_err(|e| DescriptError {
                        message: format!("Failed to refresh token: {:?}", e),
                        code: "REFRESH_ERROR".to_string(),
                    })?;
                
                let encrypted = self.auth.encrypt_tokens(&new_tokens)
                    .map_err(|e| DescriptError {
                        message: format!("Failed to encrypt tokens: {:?}", e),
                        code: "ENCRYPT_ERROR".to_string(),
                    })?;
                
                DescriptAuth::store_tokens(&self.app_handle, &encrypted)
                    .map_err(|e| DescriptError {
                        message: format!("Failed to store tokens: {:?}", e),
                        code: "STORAGE_ERROR".to_string(),
                    })?;

                return Ok(new_tokens.access_token);
            }
        }

        Ok(tokens.access_token)
    }

    // Create a new project
    pub async fn create_project(&self, name: String) -> Result<DescriptProject, DescriptError> {
        let access_token = self.get_access_token().await?;
        
        let response = self.client
            .post(format!("{}/projects", DESCRIPT_API_BASE))
            .header("Authorization", format!("Bearer {}", access_token))
            .json(&serde_json::json!({
                "name": name
            }))
            .send()
            .await
            .map_err(|e| DescriptError {
                message: format!("Failed to create project: {}", e),
                code: "PROJECT_CREATE_ERROR".to_string(),
            })?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(DescriptError {
                message: format!("Project creation failed: {}", error_text),
                code: "PROJECT_CREATE_FAILED".to_string(),
            });
        }

        let project: DescriptProject = response.json().await
            .map_err(|e| DescriptError {
                message: format!("Failed to parse project response: {}", e),
                code: "PARSE_ERROR".to_string(),
            })?;

        Ok(project)
    }

    // Upload a single file with retry logic
    async fn upload_file_with_retry(&self, request: &UploadRequest) -> Result<(), DescriptError> {
        let mut retry_count = 0;
        let mut delay = INITIAL_RETRY_DELAY;

        loop {
            match self.upload_single_file(request).await {
                Ok(_) => return Ok(()),
                Err(e) => {
                    retry_count += 1;
                    if retry_count >= MAX_RETRIES {
                        return Err(e);
                    }

                    // Exponential backoff
                    sleep(Duration::from_millis(delay)).await;
                    delay *= 2;

                    // Emit retry event
                    let _ = self.app_handle.emit("upload-retry", &serde_json::json!({
                        "file_name": request.file_name,
                        "retry_count": retry_count,
                        "max_retries": MAX_RETRIES
                    }));
                }
            }
        }
    }

    // Upload a single file
    async fn upload_single_file(&self, request: &UploadRequest) -> Result<(), DescriptError> {
        let access_token = self.get_access_token().await?;
        
        // Read file
        let mut file = File::open(&request.file_path).await
            .map_err(|e| DescriptError {
                message: format!("Failed to open file: {}", e),
                code: "FILE_ERROR".to_string(),
            })?;

        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer).await
            .map_err(|e| DescriptError {
                message: format!("Failed to read file: {}", e),
                code: "FILE_READ_ERROR".to_string(),
            })?;

        // Create multipart form
        let part = multipart::Part::bytes(buffer)
            .file_name(request.file_name.clone());

        let form = multipart::Form::new()
            .part("file", part)
            .text("project_id", request.project_id.clone());

        // Upload file
        let response = self.client
            .post(format!("{}/media", DESCRIPT_API_BASE))
            .header("Authorization", format!("Bearer {}", access_token))
            .multipart(form)
            .send()
            .await
            .map_err(|e| DescriptError {
                message: format!("Failed to upload file: {}", e),
                code: "UPLOAD_ERROR".to_string(),
            })?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(DescriptError {
                message: format!("Upload failed: {}", error_text),
                code: "UPLOAD_FAILED".to_string(),
            });
        }

        Ok(())
    }

    // Process upload queue
    async fn process_upload(&self, request: UploadRequest) -> UploadProgress {
        let file_name = request.file_name.clone();
        let file_path = request.file_path.clone();

        // Emit upload started event
        let _ = self.app_handle.emit("upload-started", &UploadProgress {
            file_path: file_path.clone(),
            file_name: file_name.clone(),
            progress: 0.0,
            status: UploadStatus::Uploading,
            error: None,
        });

        // Simulate progress updates (in real implementation, track actual upload progress)
        for i in 1..=10 {
            let progress = (i as f32) * 10.0;
            let _ = self.app_handle.emit("upload-progress", &UploadProgress {
                file_path: file_path.clone(),
                file_name: file_name.clone(),
                progress,
                status: UploadStatus::Uploading,
                error: None,
            });
            sleep(Duration::from_millis(100)).await;
        }

        // Perform actual upload
        match self.upload_file_with_retry(&request).await {
            Ok(_) => {
                // Upload successful, but manual export is required
                let result = UploadProgress {
                    file_path: file_path.clone(),
                    file_name: file_name.clone(),
                    progress: 100.0,
                    status: UploadStatus::ManualExportRequired,
                    error: None,
                };
                
                let _ = self.app_handle.emit("upload-completed", &result);
                result
            }
            Err(e) => {
                let result = UploadProgress {
                    file_path: file_path.clone(),
                    file_name: file_name.clone(),
                    progress: 0.0,
                    status: UploadStatus::Failed,
                    error: Some(e.message),
                };
                
                let _ = self.app_handle.emit("upload-failed", &result);
                result
            }
        }
    }

    // Batch upload files
    pub async fn batch_upload(&self, requests: Vec<UploadRequest>) -> Result<BatchUploadResult, DescriptError> {
        if requests.len() > MAX_BATCH_SIZE {
            return Err(DescriptError {
                message: format!("Batch size exceeds maximum of {} files", MAX_BATCH_SIZE),
                code: "BATCH_SIZE_EXCEEDED".to_string(),
            });
        }

        let total_files = requests.len();
        let mut upload_results = Vec::new();
        let mut handles = Vec::new();

        // Add requests to queue
        {
            let mut queue = self.upload_queue.lock().await;
            for request in requests {
                queue.push_back(request);
            }
        }

        // Process uploads concurrently
        for _ in 0..total_files {
            let queue = self.upload_queue.clone();
            let semaphore = self.semaphore.clone();
            let service = self.clone_for_task();

            let handle = tokio::spawn(async move {
                let _permit = semaphore.acquire().await.unwrap();
                
                let request = {
                    let mut queue_lock = queue.lock().await;
                    queue_lock.pop_front()
                };

                if let Some(request) = request {
                    service.process_upload(request).await
                } else {
                    UploadProgress {
                        file_path: String::new(),
                        file_name: String::new(),
                        progress: 0.0,
                        status: UploadStatus::Failed,
                        error: Some("No request in queue".to_string()),
                    }
                }
            });

            handles.push(handle);
        }

        // Wait for all uploads to complete
        for handle in handles {
            if let Ok(result) = handle.await {
                upload_results.push(result);
            }
        }

        // Calculate results
        let successful_uploads = upload_results.iter()
            .filter(|r| r.status == UploadStatus::ManualExportRequired)
            .count();
        let failed_uploads = upload_results.iter()
            .filter(|r| r.status == UploadStatus::Failed)
            .count();

        Ok(BatchUploadResult {
            total_files,
            successful_uploads,
            failed_uploads,
            upload_results,
            manual_export_required: successful_uploads > 0,
        })
    }

    // Clone service for concurrent tasks
    fn clone_for_task(&self) -> Self {
        Self {
            auth: self.auth.clone(),
            client: self.client.clone(),
            upload_queue: self.upload_queue.clone(),
            semaphore: self.semaphore.clone(),
            app_handle: self.app_handle.clone(),
        }
    }
}

// Export instructions for manual transcript export
#[derive(Debug, Serialize)]
pub struct ExportInstructions {
    pub title: String,
    pub steps: Vec<String>,
    pub export_folder: String,
    pub important_notes: Vec<String>,
}

impl ExportInstructions {
    pub fn new(export_folder: String) -> Self {
        Self {
            title: "Manual Export Required from Descript".to_string(),
            steps: vec![
                "Open Descript in your web browser or desktop app".to_string(),
                "Navigate to the project containing your uploaded videos".to_string(),
                "Wait for cloud transcription to complete (you'll see a progress indicator)".to_string(),
                "Once transcription is done, click on the project".to_string(),
                "Go to File → Export → Transcript".to_string(),
                "Choose 'Text (.txt)' or 'SRT (.srt)' format".to_string(),
                format!("Save the file to: {}", export_folder),
                "ContentFlow will automatically detect and import the transcript".to_string(),
            ],
            export_folder,
            important_notes: vec![
                "⚠️ The Descript API does not support automatic transcript retrieval".to_string(),
                "📁 Make sure to save transcripts to the monitored folder".to_string(),
                "⏱️ Transcription time varies based on video length (typically 1-5 minutes)".to_string(),
                "✅ You'll receive a notification when the transcript is imported".to_string(),
            ],
        }
    }
}