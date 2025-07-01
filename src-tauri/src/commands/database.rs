use crate::db::Database;
use std::sync::Arc;
use tauri::State;

#[derive(serde::Serialize)]
pub struct TableInfo {
    name: String,
    sql: String,
}

#[tauri::command]
pub async fn test_database_schema(
    db: State<'_, Arc<Database>>
) -> Result<Vec<TableInfo>, String> {
    // Query to get all tables and their creation SQL
    let tables = sqlx::query_as::<_, (String, String)>(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| e.to_string())?;
    
    let table_info: Vec<TableInfo> = tables
        .into_iter()
        .map(|(name, sql)| TableInfo { name, sql })
        .collect();
    
    Ok(table_info)
}

#[tauri::command]
pub async fn get_table_count(
    db: State<'_, Arc<Database>>,
    table_name: String
) -> Result<i64, String> {
    let query = format!("SELECT COUNT(*) as count FROM {}", table_name);
    let count: (i64,) = sqlx::query_as(&query)
        .fetch_one(&db.pool)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(count.0)
}