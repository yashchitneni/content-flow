use crate::db::Database;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct GeneratedContent {
    pub content_id: String,
    pub template_id: String,
    pub title: Option<String>,
    pub content_data: String, // JSON
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct ContentWithTemplate {
    pub content_id: String,
    pub template_id: String,
    pub template_name: String,
    pub template_type: String,
    pub title: Option<String>,
    pub content_data: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct SaveContentRequest {
    pub template_id: String,
    pub title: String,
    pub content: serde_json::Value,
    pub source_transcript_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateContentRequest {
    pub title: Option<String>,
    pub content_data: Option<String>,
    pub status: Option<String>,
}

#[tauri::command]
pub async fn save_generated_content(
    db: State<'_, Database>,
    request: SaveContentRequest,
) -> Result<String, String> {
    let content_id = Uuid::new_v4().to_string();
    let content_data = serde_json::to_string(&request.content)
        .map_err(|e| format!("Failed to serialize content: {}", e))?;
    
    // Start transaction
    let mut tx = db.pool.begin().await
        .map_err(|e| format!("Failed to start transaction: {}", e))?;
    
    // Insert generated content
    sqlx::query(
        r#"
        INSERT INTO GeneratedContent (
            content_id,
            template_id,
            title,
            content_data,
            status
        ) VALUES (?, ?, ?, ?, 'Draft')
        "#
    )
    .bind(&content_id)
    .bind(&request.template_id)
    .bind(&request.title)
    .bind(&content_data)
    .execute(&mut *tx)
    .await
    .map_err(|e| format!("Failed to save content: {}", e))?;
    
    // Insert content sources
    for (index, transcript_id) in request.source_transcript_ids.iter().enumerate() {
        sqlx::query(
            r#"
            INSERT INTO ContentSources (
                content_id,
                transcript_id,
                order_index
            ) VALUES (?, ?, ?)
            "#
        )
        .bind(&content_id)
        .bind(transcript_id)
        .bind(index as i32)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to save content source: {}", e))?;
    }
    
    // Commit transaction
    tx.commit().await
        .map_err(|e| format!("Failed to commit transaction: {}", e))?;
    
    Ok(content_id)
}

#[tauri::command]
pub async fn get_all_content(
    db: State<'_, Database>,
) -> Result<Vec<ContentWithTemplate>, String> {
    let content = sqlx::query_as::<_, ContentWithTemplate>(
        r#"
        SELECT 
            gc.content_id,
            gc.template_id,
            t.template_name,
            t.template_type,
            gc.title,
            gc.content_data,
            gc.status,
            gc.created_at,
            gc.updated_at
        FROM GeneratedContent gc
        JOIN Template t ON gc.template_id = t.template_id
        ORDER BY gc.created_at DESC
        "#
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| format!("Failed to fetch content: {}", e))?;

    Ok(content)
}

#[tauri::command]
pub async fn get_content_by_id(
    db: State<'_, Database>,
    content_id: String,
) -> Result<ContentWithTemplate, String> {
    let content = sqlx::query_as::<_, ContentWithTemplate>(
        r#"
        SELECT 
            gc.content_id,
            gc.template_id,
            t.template_name,
            t.template_type,
            gc.title,
            gc.content_data,
            gc.status,
            gc.created_at,
            gc.updated_at
        FROM GeneratedContent gc
        JOIN Template t ON gc.template_id = t.template_id
        WHERE gc.content_id = ?
        "#
    )
    .bind(&content_id)
    .fetch_one(&db.pool)
    .await
    .map_err(|e| format!("Failed to fetch content: {}", e))?;

    Ok(content)
}

#[tauri::command]
pub async fn update_content(
    db: State<'_, Database>,
    content_id: String,
    request: UpdateContentRequest,
) -> Result<(), String> {
    let mut query = String::from("UPDATE GeneratedContent SET ");
    let mut updates = Vec::new();
    let mut bind_values: Vec<String> = Vec::new();
    
    if let Some(title) = request.title {
        updates.push("title = ?");
        bind_values.push(title);
    }
    
    if let Some(content_data) = request.content_data {
        updates.push("content_data = ?");
        bind_values.push(content_data);
    }
    
    if let Some(status) = request.status {
        updates.push("status = ?");
        bind_values.push(status);
    }
    
    if updates.is_empty() {
        return Err("No fields to update".to_string());
    }
    
    query.push_str(&updates.join(", "));
    query.push_str(" WHERE content_id = ?");
    
    let mut q = sqlx::query(&query);
    for value in bind_values {
        q = q.bind(value);
    }
    q = q.bind(&content_id);
    
    q.execute(&db.pool)
        .await
        .map_err(|e| format!("Failed to update content: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn delete_content(
    db: State<'_, Database>,
    content_id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM GeneratedContent WHERE content_id = ?")
        .bind(&content_id)
        .execute(&db.pool)
        .await
        .map_err(|e| format!("Failed to delete content: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn search_content(
    db: State<'_, Database>,
    query: String,
) -> Result<Vec<ContentWithTemplate>, String> {
    let search_pattern = format!("%{}%", query);
    
    let content = sqlx::query_as::<_, ContentWithTemplate>(
        r#"
        SELECT 
            gc.content_id,
            gc.template_id,
            t.template_name,
            t.template_type,
            gc.title,
            gc.content_data,
            gc.status,
            gc.created_at,
            gc.updated_at
        FROM GeneratedContent gc
        JOIN Template t ON gc.template_id = t.template_id
        WHERE gc.title LIKE ? OR gc.content_data LIKE ?
        ORDER BY gc.created_at DESC
        "#
    )
    .bind(&search_pattern)
    .bind(&search_pattern)
    .fetch_all(&db.pool)
    .await
    .map_err(|e| format!("Failed to search content: {}", e))?;

    Ok(content)
}