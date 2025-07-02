use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::{AppHandle, State};
use uuid::Uuid;
use std::fs;
use std::sync::Arc;
use crate::db::Database;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileImportRequest {
    pub file_paths: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileImportResult {
    pub success: bool,
    pub imported_files: Vec<ImportedFile>,
    pub errors: Vec<FileImportError>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportedFile {
    pub id: String,
    pub original_path: String,
    pub filename: String,
    pub file_size: u64,
    pub format: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileImportError {
    pub file_path: String,
    pub error: String,
}

// Valid video file extensions
const VALID_VIDEO_EXTENSIONS: &[&str] = &["mp4", "mov", "avi", "mkv"];

#[tauri::command]
pub async fn validate_video_files(file_paths: Vec<String>) -> Result<Vec<String>, String> {
    let mut valid_files = Vec::new();
    
    for file_path in file_paths {
        let path = Path::new(&file_path);
        
        // Check if file exists
        if !path.exists() {
            continue;
        }
        
        // Check file extension
        if let Some(extension) = path.extension() {
            let ext = extension.to_string_lossy().to_lowercase();
            if VALID_VIDEO_EXTENSIONS.contains(&ext.as_str()) {
                valid_files.push(file_path);
            }
        }
    }
    
    Ok(valid_files)
}

#[tauri::command]
pub async fn import_video_files(
    app_handle: AppHandle,
    database: State<'_, Arc<Database>>,
    request: FileImportRequest,
) -> Result<FileImportResult, String> {
    let mut imported_files = Vec::new();
    let mut errors = Vec::new();

    for file_path in request.file_paths {
        match import_single_file(&app_handle, &database, &file_path).await {
            Ok(imported_file) => imported_files.push(imported_file),
            Err(error) => errors.push(FileImportError {
                file_path: file_path.clone(),
                error: error.to_string(),
            }),
        }
    }

    Ok(FileImportResult {
        success: errors.is_empty(),
        imported_files,
        errors,
    })
}

async fn import_single_file(
    _app_handle: &AppHandle,
    database: &Arc<Database>,
    file_path: &str,
) -> Result<ImportedFile, Box<dyn std::error::Error>> {
    let path = Path::new(file_path);
    
    // Validate file exists and is video
    if !path.exists() {
        return Err("File does not exist".into());
    }
    
    let extension = path.extension()
        .and_then(|ext| ext.to_str())
        .ok_or("No file extension")?
        .to_lowercase();
    
    if !VALID_VIDEO_EXTENSIONS.contains(&extension.as_str()) {
        return Err("Invalid video format".into());
    }
    
    // Get file metadata
    let metadata = fs::metadata(path)?;
    let file_size = metadata.len();
    let filename = path.file_name()
        .and_then(|name| name.to_str())
        .ok_or("Invalid filename")?
        .to_string();
    
    // Generate unique ID
    let file_id = Uuid::new_v4().to_string();
    
    // Get current timestamp
    let now = Utc::now().to_rfc3339();
    
    // Insert into database using our actual schema
    sqlx::query(
        r#"
        INSERT INTO File (
            FileID, 
            FolderID,
            FilePath, 
            OriginalName, 
            FileSize, 
            Status,
            ImportedAt,
            UpdatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&file_id)
    .bind::<Option<String>>(None) // FolderID - will be set later by organization system
    .bind(file_path)
    .bind(&filename)
    .bind(file_size as i64)
    .bind("Imported")
    .bind(&now)
    .bind(&now)
    .execute(&database.pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?;
    
    Ok(ImportedFile {
        id: file_id,
        original_path: file_path.to_string(),
        filename,
        file_size,
        format: extension,
        status: "Imported".to_string(),
    })
}

#[tauri::command]
pub async fn get_imported_files(
    database: State<'_, Arc<Database>>,
) -> Result<Vec<ImportedFile>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, i64, Option<String>, String)>(
        r#"
        SELECT 
            FileID, 
            FilePath, 
            OriginalName, 
            FileSize,
            Orientation,
            Status 
        FROM File 
        ORDER BY ImportedAt DESC
        "#
    )
    .fetch_all(&database.pool)
    .await
    .map_err(|e| format!("Query failed: {}", e))?;
    
    let files = rows
        .into_iter()
        .map(|(id, file_path, filename, file_size, _orientation, status)| {
            // Extract format from filename
            let format = filename.split('.').last()
                .unwrap_or("unknown")
                .to_lowercase();
            
            ImportedFile {
                id,
                original_path: file_path,
                filename,
                file_size: file_size as u64,
                format,
                status,
            }
        })
        .collect();
    
    Ok(files)
}

#[tauri::command] 
pub async fn get_file_count(
    database: State<'_, Arc<Database>>,
) -> Result<i64, String> {
    let row = sqlx::query_as::<_, (i64,)>("SELECT COUNT(*) FROM File")
        .fetch_one(&database.pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;
    
    Ok(row.0)
}