use crate::db::Database;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Template {
    pub template_id: String,
    pub template_name: String,
    pub template_type: String,
    pub description: Option<String>,
    pub prompt: String,
    pub constraints: Option<String>,
    pub is_default: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTemplateRequest {
    pub template_name: String,
    pub template_type: String,
    pub description: Option<String>,
    pub prompt: String,
    pub constraints: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTemplateRequest {
    pub template_name: String,
    pub template_type: String,
    pub description: Option<String>,
    pub prompt: String,
    pub constraints: Option<String>,
}

#[tauri::command]
pub async fn get_all_templates(db: State<'_, Database>) -> Result<Vec<Template>, String> {
    let templates = sqlx::query_as::<_, Template>(
        r#"
        SELECT 
            template_id,
            template_name,
            template_type,
            description,
            prompt,
            constraints,
            is_default,
            created_at,
            updated_at
        FROM Template
        ORDER BY is_default DESC, updated_at DESC
        "#
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| format!("Failed to fetch templates: {}", e))?;

    Ok(templates)
}

#[tauri::command]
pub async fn get_template(
    db: State<'_, Database>,
    template_id: String,
) -> Result<Template, String> {
    let template = sqlx::query_as::<_, Template>(
        r#"
        SELECT 
            template_id,
            template_name,
            template_type,
            description,
            prompt,
            constraints,
            is_default,
            created_at,
            updated_at
        FROM Template
        WHERE template_id = ?
        "#
    )
    .bind(&template_id)
    .fetch_one(&db.pool)
    .await
    .map_err(|e| format!("Failed to fetch template: {}", e))?;

    Ok(template)
}

#[tauri::command]
pub async fn create_template(
    db: State<'_, Database>,
    template_data: CreateTemplateRequest,
) -> Result<Template, String> {
    let template_id = Uuid::new_v4().to_string();
    
    sqlx::query(
        r#"
        INSERT INTO Template (
            template_id,
            template_name,
            template_type,
            description,
            prompt,
            constraints,
            is_default
        ) VALUES (?, ?, ?, ?, ?, ?, 0)
        "#
    )
    .bind(&template_id)
    .bind(&template_data.template_name)
    .bind(&template_data.template_type)
    .bind(&template_data.description)
    .bind(&template_data.prompt)
    .bind(&template_data.constraints)
    .execute(&db.pool)
    .await
    .map_err(|e| format!("Failed to create template: {}", e))?;

    get_template(db, template_id).await
}

#[tauri::command]
pub async fn update_template(
    db: State<'_, Database>,
    template_id: String,
    template_data: UpdateTemplateRequest,
) -> Result<Template, String> {
    // Check if template exists and is not default
    let existing: (bool,) = sqlx::query_as(
        "SELECT is_default FROM Template WHERE template_id = ?"
    )
    .bind(&template_id)
    .fetch_one(&db.pool)
    .await
    .map_err(|e| format!("Template not found: {}", e))?;

    if existing.0 {
        return Err("Cannot modify default templates".to_string());
    }

    sqlx::query(
        r#"
        UPDATE Template SET
            template_name = ?,
            template_type = ?,
            description = ?,
            prompt = ?,
            constraints = ?
        WHERE template_id = ?
        "#
    )
    .bind(&template_data.template_name)
    .bind(&template_data.template_type)
    .bind(&template_data.description)
    .bind(&template_data.prompt)
    .bind(&template_data.constraints)
    .bind(&template_id)
    .execute(&db.pool)
    .await
    .map_err(|e| format!("Failed to update template: {}", e))?;

    get_template(db, template_id).await
}

#[tauri::command]
pub async fn delete_template(
    db: State<'_, Database>,
    template_id: String,
) -> Result<(), String> {
    // Check if template is default
    let existing: (bool,) = sqlx::query_as(
        "SELECT is_default FROM Template WHERE template_id = ?"
    )
    .bind(&template_id)
    .fetch_one(&db.pool)
    .await
    .map_err(|e| format!("Template not found: {}", e))?;

    if existing.0 {
        return Err("Cannot delete default templates".to_string());
    }

    // Check if template is used in any generated content
    let usage_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM GeneratedContent WHERE template_id = ?"
    )
    .bind(&template_id)
    .fetch_one(&db.pool)
    .await
    .map_err(|e| format!("Failed to check template usage: {}", e))?;

    if usage_count.0 > 0 {
        return Err(format!("Cannot delete template: it is used in {} generated content items", usage_count.0));
    }

    sqlx::query("DELETE FROM Template WHERE template_id = ?")
        .bind(&template_id)
        .execute(&db.pool)
        .await
        .map_err(|e| format!("Failed to delete template: {}", e))?;

    Ok(())
}