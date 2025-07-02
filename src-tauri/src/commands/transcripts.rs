// Task #2 & #11: Database Schema + Transcript Auto-Import System
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::{AppHandle, State};
use uuid::Uuid;
use std::fs;
use std::sync::Arc;
use crate::db::Database;

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptImportRequest {
    pub file_paths: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportedTranscript {
    pub id: String,
    pub file_path: String,
    pub filename: String,
    pub content: String,
    pub word_count: usize,
    pub language: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptImportError {
    pub file_path: String,
    pub error: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptImportResult {
    pub success: bool,
    pub imported_transcripts: Vec<ImportedTranscript>,
    pub errors: Vec<TranscriptImportError>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptSummary {
    pub id: String,
    pub filename: String,
    pub word_count: usize,
    pub language: String,
    pub content_preview: String,
    pub imported_at: String,
    pub status: String,
}

// Valid transcript file extensions
const VALID_TRANSCRIPT_EXTENSIONS: &[&str] = &["txt", "srt", "vtt"];

#[tauri::command]
pub async fn validate_transcript_files(file_paths: Vec<String>) -> Result<Vec<String>, String> {
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
            if VALID_TRANSCRIPT_EXTENSIONS.contains(&ext.as_str()) {
                valid_files.push(file_path);
            }
        }
    }
    
    Ok(valid_files)
}

#[tauri::command]
pub async fn import_transcript_files(
    app_handle: AppHandle,
    database: State<'_, Arc<Database>>,
    request: TranscriptImportRequest,
) -> Result<TranscriptImportResult, String> {
    let mut imported_transcripts = Vec::new();
    let mut errors = Vec::new();

    for file_path in request.file_paths {
        match import_single_transcript(&app_handle, &database, &file_path).await {
            Ok(imported_transcript) => imported_transcripts.push(imported_transcript),
            Err(error) => errors.push(TranscriptImportError {
                file_path: file_path.clone(),
                error: error.to_string(),
            }),
        }
    }

    Ok(TranscriptImportResult {
        success: errors.is_empty(),
        imported_transcripts,
        errors,
    })
}

async fn import_single_transcript(
    _app_handle: &AppHandle,
    database: &Arc<Database>,
    file_path: &str,
) -> Result<ImportedTranscript, Box<dyn std::error::Error>> {
    let path = Path::new(file_path);
    
    // Validate file exists and is transcript
    if !path.exists() {
        return Err("File does not exist".into());
    }
    
    let extension = path.extension()
        .and_then(|ext| ext.to_str())
        .ok_or("No file extension")?
        .to_lowercase();
    
    if !VALID_TRANSCRIPT_EXTENSIONS.contains(&extension.as_str()) {
        return Err("Invalid transcript format".into());
    }
    
    // Read transcript content
    let content = fs::read_to_string(path)?;
    
    // Basic content validation
    if content.trim().is_empty() {
        return Err("Transcript file is empty".into());
    }
    
    // Clean content for SRT files (remove timestamps)
    let cleaned_content = if extension == "srt" {
        clean_srt_content(&content)
    } else {
        content.clone()
    };
    
    let filename = path.file_name()
        .and_then(|name| name.to_str())
        .ok_or("Invalid filename")?
        .to_string();
    
    let word_count = count_words(&cleaned_content);
    
    // Generate unique ID
    let transcript_id = Uuid::new_v4().to_string();
    
    // Create a placeholder file record (for standalone transcripts)
    let file_id = Uuid::new_v4().to_string();
    
    // Insert file record first
    sqlx::query(
        "INSERT INTO files (id, original_path, filename, file_size, format, status, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))"
    )
    .bind(&file_id)
    .bind(file_path)
    .bind(&filename)
    .bind(content.len() as i64)
    .bind(&extension)
    .bind("transcript_only")
    .execute(&database.pool)
    .await?;
    
    // Insert transcript into database
    sqlx::query(
        "INSERT INTO Transcript (TranscriptID, FileID, Content, WordCount, Language, ImportedAt) VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))"
    )
    .bind(&transcript_id)
    .bind(&file_id)
    .bind(&cleaned_content)
    .bind(word_count as i64)
    .bind("en") // Default to English for now
    .execute(&database.pool)
    .await?;
    
    Ok(ImportedTranscript {
        id: transcript_id,
        file_path: file_path.to_string(),
        filename,
        content: cleaned_content,
        word_count,
        language: "en".to_string(),
        status: "imported".to_string(),
    })
}

#[tauri::command]
pub async fn get_imported_transcripts(
    database: State<'_, Arc<Database>>,
) -> Result<Vec<TranscriptSummary>, String> {
    let rows = sqlx::query_as::<_, (String, String, i64, String, String, String)>(
        "SELECT t.TranscriptID, f.filename, t.WordCount, t.Language, t.Content, t.ImportedAt FROM Transcript t JOIN files f ON t.FileID = f.id ORDER BY t.ImportedAt DESC"
    )
    .fetch_all(&database.pool)
    .await
    .map_err(|e| format!("Query failed: {}", e))?;
    
    let transcripts = rows
        .into_iter()
        .map(|(id, filename, word_count, language, content, imported_at)| {
            let content_preview = if content.len() > 200 {
                format!("{}...", &content[..200])
            } else {
                content
            };
            
            TranscriptSummary {
                id,
                filename,
                word_count: word_count as usize,
                language,
                content_preview,
                imported_at,
                status: "imported".to_string(),
            }
        })
        .collect();
    
    Ok(transcripts)
}

#[tauri::command] 
pub async fn get_transcript_count(
    database: State<'_, Arc<Database>>,
) -> Result<i64, String> {
    let row = sqlx::query_as::<_, (i64,)>("SELECT COUNT(*) FROM Transcript")
        .fetch_one(&database.pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;
    
    Ok(row.0)
}

#[tauri::command]
pub async fn get_transcript_by_id(
    database: State<'_, Arc<Database>>,
    transcript_id: String,
) -> Result<ImportedTranscript, String> {
    let row = sqlx::query_as::<_, (String, String, String, String, i64, String)>(
        "SELECT t.TranscriptID, f.original_path, f.filename, t.Content, t.WordCount, t.Language FROM Transcript t JOIN files f ON t.FileID = f.id WHERE t.TranscriptID = ?1"
    )
    .bind(&transcript_id)
    .fetch_one(&database.pool)
    .await
    .map_err(|e| format!("Transcript not found: {}", e))?;
    
    Ok(ImportedTranscript {
        id: row.0,
        file_path: row.1,
        filename: row.2,
        content: row.3,
        word_count: row.4 as usize,
        language: row.5,
        status: "imported".to_string(),
    })
}

// Helper function to clean SRT content
fn clean_srt_content(srt_content: &str) -> String {
    let mut cleaned_lines = Vec::new();
    let lines: Vec<&str> = srt_content.lines().collect();
    
    let mut i = 0;
    while i < lines.len() {
        let line = lines[i].trim();
        
        // Skip sequence numbers
        if line.parse::<u32>().is_ok() {
            i += 1;
            continue;
        }
        
        // Skip timestamp lines (contain -->)
        if line.contains("-->") {
            i += 1;
            continue;
        }
        
        // Skip empty lines
        if line.is_empty() {
            i += 1;
            continue;
        }
        
        // This is actual content
        cleaned_lines.push(line);
        i += 1;
    }
    
    cleaned_lines.join(" ")
}

// Helper function to count words
fn count_words(text: &str) -> usize {
    text.split_whitespace().count()
}