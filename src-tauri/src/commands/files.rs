use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::{AppHandle, State};
use uuid::Uuid;
use std::fs;
use std::sync::Arc;
use crate::db::Database;
use chrono::{Utc, DateTime, Datelike};
use std::process::Command;

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
    pub tags: Option<Vec<String>>,
    pub folder: Option<String>,
    pub metadata: Option<FileMetadata>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileMetadata {
    pub creation_date: Option<String>,
    pub duration: Option<f64>,
    pub resolution: Option<String>,
    pub codec: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileImportError {
    pub file_path: String,
    pub error: String,
}

// Valid video file extensions
const VALID_VIDEO_EXTENSIONS: &[&str] = &["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"];

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

#[tauri::command]
pub async fn import_and_organize_video_files(
    app_handle: AppHandle,
    database: State<'_, Arc<Database>>,
    request: FileImportRequest,
) -> Result<FileImportResult, String> {
    let mut imported_files = Vec::new();
    let mut errors = Vec::new();

    for file_path in request.file_paths {
        match import_and_organize_single_file(&app_handle, &database, &file_path).await {
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

async fn extract_video_metadata(file_path: &str) -> Option<FileMetadata> {
    // Try to use ffprobe to get video metadata
    let output = Command::new("ffprobe")
        .args(&[
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            file_path
        ])
        .output();

    if let Ok(output) = output {
        if output.status.success() {
            // Parse ffprobe JSON output
            if let Ok(json_str) = String::from_utf8(output.stdout) {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&json_str) {
                    let mut metadata = FileMetadata {
                        creation_date: None,
                        duration: None,
                        resolution: None,
                        codec: None,
                    };

                    // Extract duration
                    if let Some(format) = json.get("format") {
                        if let Some(duration) = format.get("duration").and_then(|d| d.as_str()) {
                            metadata.duration = duration.parse::<f64>().ok();
                        }
                        
                        // Try to get creation date from tags
                        if let Some(tags) = format.get("tags") {
                            if let Some(creation_time) = tags.get("creation_time").and_then(|t| t.as_str()) {
                                metadata.creation_date = Some(creation_time.to_string());
                            }
                        }
                    }

                    // Extract video stream info
                    if let Some(streams) = json.get("streams").and_then(|s| s.as_array()) {
                        for stream in streams {
                            if stream.get("codec_type").and_then(|t| t.as_str()) == Some("video") {
                                // Get resolution
                                if let (Some(width), Some(height)) = (
                                    stream.get("width").and_then(|w| w.as_i64()),
                                    stream.get("height").and_then(|h| h.as_i64())
                                ) {
                                    metadata.resolution = Some(format!("{}x{}", width, height));
                                }

                                // Get codec
                                if let Some(codec) = stream.get("codec_name").and_then(|c| c.as_str()) {
                                    metadata.codec = Some(codec.to_string());
                                }
                                break;
                            }
                        }
                    }

                    return Some(metadata);
                }
            }
        }
    }

    // Fallback: use file system metadata
    let path = Path::new(file_path);
    if let Ok(fs_metadata) = fs::metadata(path) {
        if let Ok(modified) = fs_metadata.modified() {
            let datetime: DateTime<Utc> = modified.into();
            return Some(FileMetadata {
                creation_date: Some(datetime.to_rfc3339()),
                duration: None,
                resolution: None,
                codec: None,
            });
        }
    }

    None
}

fn generate_tags_from_metadata(file_path: &str, metadata: &Option<FileMetadata>) -> Vec<String> {
    let mut tags = Vec::new();
    let path = Path::new(file_path);

    // Add format tag
    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
        tags.push(ext.to_uppercase());
    }

    // Add resolution tags
    if let Some(metadata) = metadata {
        if let Some(resolution) = &metadata.resolution {
            tags.push(resolution.clone());
            
            // Add quality tags based on resolution
            let height = resolution.split('x').nth(1).and_then(|h| h.parse::<i32>().ok());
            if let Some(h) = height {
                if h >= 2160 {
                    tags.push("4K".to_string());
                    tags.push("UHD".to_string());
                } else if h >= 1080 {
                    tags.push("FullHD".to_string());
                    tags.push("1080p".to_string());
                } else if h >= 720 {
                    tags.push("HD".to_string());
                    tags.push("720p".to_string());
                } else {
                    tags.push("SD".to_string());
                }
            }
        }

        // Add codec tag
        if let Some(codec) = &metadata.codec {
            tags.push(codec.to_uppercase());
        }

        // Add duration-based tags
        if let Some(duration) = metadata.duration {
            if duration < 60.0 {
                tags.push("Short".to_string());
            } else if duration < 300.0 {
                tags.push("Medium".to_string());
            } else {
                tags.push("Long".to_string());
            }
        }
    }

    tags
}

fn determine_folder_structure(file_path: &str, metadata: &Option<FileMetadata>) -> Option<String> {
    let path = Path::new(file_path);
    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("unknown");

    // Determine date for organization
    let date_str = if let Some(metadata) = metadata {
        if let Some(creation_date) = &metadata.creation_date {
            // Parse date string to extract year and month
            if let Ok(datetime) = DateTime::parse_from_rfc3339(creation_date) {
                format!("{}/{:02}", datetime.year(), datetime.month())
            } else {
                "Unsorted".to_string()
            }
        } else {
            "Unsorted".to_string()
        }
    } else {
        "Unsorted".to_string()
    };

    // Create folder structure: Format/Year/Month
    Some(format!("{}/{}", ext.to_uppercase(), date_str))
}

async fn import_and_organize_single_file(
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
    let fs_metadata = fs::metadata(path)?;
    let file_size = fs_metadata.len();
    let filename = path.file_name()
        .and_then(|name| name.to_str())
        .ok_or("Invalid filename")?
        .to_string();
    
    // Extract video metadata
    let video_metadata = extract_video_metadata(file_path).await;
    
    // Generate tags based on metadata
    let tags = generate_tags_from_metadata(file_path, &video_metadata);
    
    // Determine folder structure
    let folder = determine_folder_structure(file_path, &video_metadata);
    
    // Generate unique ID
    let file_id = Uuid::new_v4().to_string();
    
    // Get current timestamp
    let now = Utc::now().to_rfc3339();
    
    // Create or get folder ID
    let folder_id = if let Some(folder_path) = &folder {
        // Check if folder exists
        let existing_folder = sqlx::query_as::<_, (String,)>(
            "SELECT FolderID FROM Folder WHERE FolderPath = ?"
        )
        .bind(folder_path)
        .fetch_optional(&database.pool)
        .await?;

        if let Some((id,)) = existing_folder {
            Some(id)
        } else {
            // Create new folder
            let folder_id = Uuid::new_v4().to_string();
            sqlx::query(
                r#"
                INSERT INTO Folder (
                    FolderID,
                    FolderPath,
                    FolderName,
                    IsOrganized,
                    CreatedAt,
                    UpdatedAt
                ) VALUES (?, ?, ?, ?, ?, ?)
                "#
            )
            .bind(&folder_id)
            .bind(folder_path)
            .bind(folder_path.split('/').last().unwrap_or(folder_path))
            .bind(true)
            .bind(&now)
            .bind(&now)
            .execute(&database.pool)
            .await?;
            
            Some(folder_id)
        }
    } else {
        None
    };
    
    // Insert file into database
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
    .bind(&folder_id)
    .bind(file_path)
    .bind(&filename)
    .bind(file_size as i64)
    .bind("Imported")
    .bind(&now)
    .bind(&now)
    .execute(&database.pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?;
    
    // Insert tags
    for tag in &tags {
        // Check if tag exists
        let existing_tag = sqlx::query_as::<_, (String,)>(
            "SELECT TagID FROM Tag WHERE TagName = ?"
        )
        .bind(tag)
        .fetch_optional(&database.pool)
        .await?;

        let tag_id = if let Some((id,)) = existing_tag {
            id
        } else {
            // Create new tag
            let tag_id = Uuid::new_v4().to_string();
            sqlx::query(
                r#"
                INSERT INTO Tag (TagID, TagName, CreatedAt)
                VALUES (?, ?, ?)
                "#
            )
            .bind(&tag_id)
            .bind(tag)
            .bind(&now)
            .execute(&database.pool)
            .await?;
            tag_id
        };

        // Create file-tag relationship
        sqlx::query(
            r#"
            INSERT INTO FileTag (FileTagID, FileID, TagID, CreatedAt)
            VALUES (?, ?, ?, ?)
            "#
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&file_id)
        .bind(&tag_id)
        .bind(&now)
        .execute(&database.pool)
        .await?;
    }
    
    Ok(ImportedFile {
        id: file_id,
        original_path: file_path.to_string(),
        filename,
        file_size,
        format: extension,
        status: "Imported".to_string(),
        tags: if tags.is_empty() { None } else { Some(tags) },
        folder,
        metadata: video_metadata,
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
        tags: None,
        folder: None,
        metadata: None,
    })
}

#[tauri::command]
pub async fn get_imported_files(
    database: State<'_, Arc<Database>>,
) -> Result<Vec<ImportedFile>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, i64, Option<String>, String, Option<String>)>(
        r#"
        SELECT 
            f.FileID, 
            f.FilePath, 
            f.OriginalName, 
            f.FileSize,
            f.Orientation,
            f.Status,
            fo.FolderPath
        FROM File f
        LEFT JOIN Folder fo ON f.FolderID = fo.FolderID
        ORDER BY f.ImportedAt DESC
        "#
    )
    .fetch_all(&database.pool)
    .await
    .map_err(|e| format!("Query failed: {}", e))?;
    
    let mut files = Vec::new();
    
    for (id, file_path, filename, file_size, _orientation, status, folder_path) in rows {
        // Get tags for this file
        let tags = sqlx::query_as::<_, (String,)>(
            r#"
            SELECT t.TagName
            FROM Tag t
            JOIN FileTag ft ON t.TagID = ft.TagID
            WHERE ft.FileID = ?
            "#
        )
        .bind(&id)
        .fetch_all(&database.pool)
        .await
        .map(|rows| rows.into_iter().map(|(name,)| name).collect::<Vec<_>>())
        .ok();
        
        // Extract format from filename
        let format = filename.split('.').last()
            .unwrap_or("unknown")
            .to_lowercase();
        
        files.push(ImportedFile {
            id,
            original_path: file_path,
            filename,
            file_size: file_size as u64,
            format,
            status,
            tags: if tags.as_ref().map_or(true, |t| t.is_empty()) { None } else { tags },
            folder: folder_path,
            metadata: None, // We don't store full metadata in DB yet
        });
    }
    
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