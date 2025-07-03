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
    pub content_score: Option<f64>, // Task #14
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
        "INSERT INTO File (FileID, FilePath, OriginalName, FileSize, Status, ImportedAt) VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))"
    )
    .bind(&file_id)
    .bind(file_path)
    .bind(&filename)
    .bind(content.len() as i64)
    .bind("Imported")
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
    // Task #14: Include ContentScore in query
    let rows = sqlx::query_as::<_, (String, String, i64, String, String, String, Option<f64>)>(
        "SELECT t.TranscriptID, f.OriginalName, t.WordCount, t.Language, t.Content, t.ImportedAt, t.ContentScore FROM Transcript t JOIN File f ON t.FileID = f.FileID ORDER BY t.ImportedAt DESC"
    )
    .fetch_all(&database.pool)
    .await
    .map_err(|e| format!("Query failed: {}", e))?;
    
    let transcripts = rows
        .into_iter()
        .map(|(id, filename, word_count, language, content, imported_at, content_score)| {
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
                content_score, // Task #14
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
        "SELECT t.TranscriptID, f.FilePath, f.OriginalName, t.Content, t.WordCount, t.Language FROM Transcript t JOIN File f ON t.FileID = f.FileID WHERE t.TranscriptID = ?1"
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

// Task #14: AI-Powered Tag Extraction
#[derive(Debug, Serialize, Deserialize)]
pub struct ExtractTagsRequest {
    pub transcript_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtractedTag {
    pub tag: String,
    pub relevance: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TagExtractionResult {
    pub transcript_id: String,
    pub tags: Vec<ExtractedTag>,
    pub content_score: f64,
    pub platform_scores: PlatformScores,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlatformScores {
    pub thread: f64,
    pub carousel: f64,
    pub blog: f64,
}

#[tauri::command]
pub async fn extract_and_store_tags(
    database: State<'_, Arc<Database>>,
    transcript_id: String,
    tags: Vec<ExtractedTag>,
    content_score: f64,
) -> Result<(), String> {
    // Start a transaction
    let mut tx = database.pool.begin()
        .await
        .map_err(|e| format!("Failed to start transaction: {}", e))?;
    
    // Update content score in transcript table
    sqlx::query(
        "UPDATE Transcript SET ContentScore = ?1, AnalyzedAt = datetime('now') WHERE TranscriptID = ?2"
    )
    .bind(content_score)
    .bind(&transcript_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| format!("Failed to update transcript: {}", e))?;
    
    // Insert or update tags
    for tag_data in tags {
        // First, insert tag if it doesn't exist
        let tag_id = Uuid::new_v4().to_string();
        
        // Check if tag already exists
        let existing_tag = sqlx::query_as::<_, (String,)>(
            "SELECT TagID FROM Tag WHERE LOWER(TagName) = LOWER(?1)"
        )
        .bind(&tag_data.tag)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| format!("Failed to check existing tag: {}", e))?;
        
        let final_tag_id = if let Some((existing_id,)) = existing_tag {
            existing_id
        } else {
            // Insert new tag
            sqlx::query(
                "INSERT INTO Tag (TagID, TagName, CreatedAt) VALUES (?1, ?2, datetime('now'))"
            )
            .bind(&tag_id)
            .bind(&tag_data.tag)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to insert tag: {}", e))?;
            
            tag_id
        };
        
        // Insert or update transcript-tag relationship
        sqlx::query(
            "INSERT OR REPLACE INTO TranscriptTags (TranscriptID, TagID, Relevance) VALUES (?1, ?2, ?3)"
        )
        .bind(&transcript_id)
        .bind(&final_tag_id)
        .bind(tag_data.relevance)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to insert transcript-tag relationship: {}", e))?;
    }
    
    // Commit transaction
    tx.commit()
        .await
        .map_err(|e| format!("Failed to commit transaction: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn get_transcript_tags(
    database: State<'_, Arc<Database>>,
    transcript_id: String,
) -> Result<Vec<ExtractedTag>, String> {
    let rows = sqlx::query_as::<_, (String, f64)>(
        "SELECT t.TagName, tt.Relevance FROM TranscriptTags tt 
         JOIN Tag t ON tt.TagID = t.TagID 
         WHERE tt.TranscriptID = ?1 
         ORDER BY tt.Relevance DESC"
    )
    .bind(&transcript_id)
    .fetch_all(&database.pool)
    .await
    .map_err(|e| format!("Failed to fetch tags: {}", e))?;
    
    let tags = rows
        .into_iter()
        .map(|(tag, relevance)| ExtractedTag { tag, relevance })
        .collect();
    
    Ok(tags)
}

#[tauri::command]
pub async fn get_all_tags(
    database: State<'_, Arc<Database>>,
) -> Result<Vec<(String, i64)>, String> {
    let rows = sqlx::query_as::<_, (String, i64)>(
        "SELECT t.TagName, COUNT(tt.TranscriptID) as usage_count 
         FROM Tag t 
         LEFT JOIN TranscriptTags tt ON t.TagID = tt.TagID 
         GROUP BY t.TagID 
         ORDER BY usage_count DESC"
    )
    .fetch_all(&database.pool)
    .await
    .map_err(|e| format!("Failed to fetch all tags: {}", e))?;
    
    Ok(rows)
}

// Task #12: Full-Text Search Implementation
#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptSearchRequest {
    pub query: String,
    pub limit: Option<i32>,
    pub offset: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptSearchResult {
    pub transcript_id: String,
    pub file_id: String,
    pub filename: String,
    pub content_snippet: String,
    pub word_count: i32,
    pub language: String,
    pub imported_at: String,
    pub rank: f64,
    pub highlight_positions: Vec<(usize, usize)>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptSearchResponse {
    pub results: Vec<TranscriptSearchResult>,
    pub total_count: i32,
    pub search_time_ms: f64,
}

#[tauri::command]
pub async fn search_transcripts(
    database: State<'_, Arc<Database>>,
    request: TranscriptSearchRequest,
) -> Result<TranscriptSearchResponse, String> {
    let start_time = std::time::Instant::now();
    
    // Validate search query
    if request.query.trim().is_empty() {
        return Err("Search query cannot be empty".to_string());
    }
    
    let limit = request.limit.unwrap_or(20).min(100);
    let offset = request.offset.unwrap_or(0);
    
    // First get total count of matching results
    let count_row = sqlx::query_as::<_, (i32,)>(
        "SELECT COUNT(*) FROM TranscriptFTS WHERE TranscriptFTS MATCH ?1"
    )
    .bind(&request.query)
    .fetch_one(&database.pool)
    .await
    .map_err(|e| format!("Count query failed: {}", e))?;
    
    let total_count = count_row.0;
    
    // Perform FTS5 search with ranking
    let search_query = format!(
        r#"
        SELECT 
            t.TranscriptID,
            t.FileID,
            f.OriginalName,
            t.Content,
            t.WordCount,
            t.Language,
            t.ImportedAt,
            rank
        FROM TranscriptFTS fts
        JOIN Transcript t ON fts.TranscriptID = t.TranscriptID
        JOIN File f ON t.FileID = f.FileID
        WHERE TranscriptFTS MATCH ?1
        ORDER BY rank
        LIMIT ?2 OFFSET ?3
        "#
    );
    
    let rows = sqlx::query_as::<_, (String, String, String, String, i32, String, String, f64)>(
        &search_query
    )
    .bind(&request.query)
    .bind(limit)
    .bind(offset)
    .fetch_all(&database.pool)
    .await
    .map_err(|e| format!("Search query failed: {}", e))?;
    
    let mut results = Vec::new();
    
    for (transcript_id, file_id, filename, content, word_count, language, imported_at, rank) in rows {
        // Create highlighted snippet
        let (snippet, positions) = create_highlighted_snippet(&content, &request.query, 200);
        
        results.push(TranscriptSearchResult {
            transcript_id,
            file_id,
            filename,
            content_snippet: snippet,
            word_count,
            language,
            imported_at,
            rank: -rank, // FTS5 rank is negative, lower is better
            highlight_positions: positions,
        });
    }
    
    let search_time_ms = start_time.elapsed().as_secs_f64() * 1000.0;
    
    Ok(TranscriptSearchResponse {
        results,
        total_count,
        search_time_ms,
    })
}

// Helper function to create highlighted snippet
fn create_highlighted_snippet(
    content: &str,
    query: &str,
    _max_length: usize,
) -> (String, Vec<(usize, usize)>) {
    let _content_lower = content.to_lowercase();
    let query_lower = query.to_lowercase();
    let query_words: Vec<&str> = query_lower.split_whitespace().collect();
    
    let mut highlight_positions = Vec::new();
    let mut best_start = 0;
    let mut best_score = 0;
    
    // Find the best window that contains the most query terms
    let words: Vec<&str> = content.split_whitespace().collect();
    for (i, _) in words.iter().enumerate() {
        let mut score = 0;
        let mut found_positions = Vec::new();
        
        // Check window starting at position i
        let window_end = (i + 30).min(words.len());
        let window_text = words[i..window_end].join(" ");
        let window_lower = window_text.to_lowercase();
        
        for query_word in &query_words {
            if let Some(pos) = window_lower.find(query_word) {
                score += 1;
                found_positions.push((pos, pos + query_word.len()));
            }
        }
        
        if score > best_score {
            best_score = score;
            best_start = i;
            highlight_positions = found_positions;
        }
    }
    
    // Create snippet
    let snippet_end = (best_start + 30).min(words.len());
    let snippet_words = &words[best_start..snippet_end];
    let snippet = snippet_words.join(" ");
    
    // Adjust highlight positions relative to snippet start
    let start_offset = words[0..best_start].iter().map(|w| w.len() + 1).sum::<usize>();
    let adjusted_positions: Vec<(usize, usize)> = highlight_positions
        .into_iter()
        .map(|(start, end)| (start.saturating_sub(start_offset), end.saturating_sub(start_offset)))
        .collect();
    
    // Add ellipsis if needed
    let final_snippet = if best_start > 0 {
        format!("...{}", snippet)
    } else {
        snippet
    };
    
    let final_snippet = if snippet_end < words.len() {
        format!("{}...", final_snippet)
    } else {
        final_snippet
    };
    
    (final_snippet, adjusted_positions)
}