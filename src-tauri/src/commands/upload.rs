use crate::services::descript::{
    DescriptUploadService, DescriptProject, UploadRequest, BatchUploadResult, 
    UploadProgress, ExportInstructions
};
use crate::commands::auth::AuthManager;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Emitter, State};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone)]
pub struct UploadManager {
    pub upload_service: Arc<Mutex<Option<DescriptUploadService>>>,
}

impl UploadManager {
    pub fn new() -> Self {
        Self {
            upload_service: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn initialize_service(&self, auth_manager: &AuthManager, app_handle: AppHandle) {
        let service = DescriptUploadService::new(
            (*auth_manager.descript_auth).clone(),
            app_handle
        );
        *self.upload_service.lock().await = Some(service);
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProjectRequest {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchUploadRequest {
    pub project_id: String,
    pub files: Vec<UploadFileRequest>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadFileRequest {
    pub file_path: String,
    pub file_name: String,
}

#[tauri::command]
pub async fn initialize_upload_service(
    app: AppHandle,
    auth_manager: State<'_, AuthManager>,
    upload_manager: State<'_, UploadManager>,
) -> Result<(), String> {
    upload_manager.initialize_service(&auth_manager, app).await;
    Ok(())
}

#[tauri::command]
pub async fn create_descript_project(
    upload_manager: State<'_, UploadManager>,
    request: CreateProjectRequest,
) -> Result<DescriptProject, String> {
    let service_guard = upload_manager.upload_service.lock().await;
    let service = service_guard.as_ref()
        .ok_or_else(|| "Upload service not initialized".to_string())?;
    
    service.create_project(request.name)
        .await
        .map_err(|e| format!("Failed to create project: {}", e.message))
}

#[tauri::command]
pub async fn batch_upload_files(
    upload_manager: State<'_, UploadManager>,
    request: BatchUploadRequest,
) -> Result<BatchUploadResult, String> {
    let service_guard = upload_manager.upload_service.lock().await;
    let service = service_guard.as_ref()
        .ok_or_else(|| "Upload service not initialized".to_string())?;
    
    // Convert request to internal format
    let upload_requests: Vec<UploadRequest> = request.files
        .into_iter()
        .map(|file| UploadRequest {
            file_path: file.file_path,
            project_id: request.project_id.clone(),
            file_name: file.file_name,
        })
        .collect();
    
    service.batch_upload(upload_requests)
        .await
        .map_err(|e| format!("Batch upload failed: {}", e.message))
}

#[tauri::command]
pub async fn get_export_instructions(
    app: AppHandle,
) -> Result<ExportInstructions, String> {
    // Get the default export folder path
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    let export_folder = app_data_dir
        .join("transcript_exports")
        .to_string_lossy()
        .to_string();
    
    // Ensure the export folder exists
    if let Err(e) = std::fs::create_dir_all(&export_folder) {
        return Err(format!("Failed to create export folder: {}", e));
    }
    
    Ok(ExportInstructions::new(export_folder))
}

#[tauri::command]
pub async fn open_export_folder(
    app: AppHandle,
) -> Result<(), String> {
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    let export_folder = app_data_dir.join("transcript_exports");
    
    // Ensure the export folder exists
    if let Err(e) = std::fs::create_dir_all(&export_folder) {
        return Err(format!("Failed to create export folder: {}", e));
    }
    
    // Open the folder in the system file manager
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&export_folder)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&export_folder)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&export_folder)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn get_upload_status(
    upload_manager: State<'_, UploadManager>,
) -> Result<Vec<UploadProgress>, String> {
    // In a real implementation, this would return the current upload status
    // For now, return empty array as uploads are event-driven
    Ok(vec![])
}

#[tauri::command] 
pub async fn cancel_upload(
    upload_manager: State<'_, UploadManager>,
    file_path: String,
) -> Result<(), String> {
    // In a real implementation, this would cancel the specific upload
    // For now, just return success as the upload service handles cancellation internally
    Ok(())
}