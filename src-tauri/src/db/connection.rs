use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub struct Database {
    pub pool: SqlitePool,
}

impl Database {
    pub async fn new(app: &AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        let app_dir = app.path()
            .app_data_dir()
            .map_err(|e| format!("Could not resolve app data directory: {}", e))?;
        
        // Ensure directory exists
        std::fs::create_dir_all(&app_dir)?;
        
        let db_path = app_dir.join("contentflow.db");
        let db_url = format!("sqlite://{}?mode=rwc", db_path.display());
        
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await?;
        
        Ok(Self { pool })
    }
    
    // Task #12: Add in-memory database for testing
    pub async fn new_in_memory() -> Result<Self, Box<dyn std::error::Error>> {
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite:?mode=memory&cache=shared")
            .await?;
        
        Ok(Self { pool })
    }
    
    pub async fn migrate(&self) -> Result<(), Box<dyn std::error::Error>> {
        crate::db::migrations::run_migrations(&self.pool).await?;
        Ok(())
    }
}

// Helper function to get database path for development/testing
#[allow(dead_code)]
pub fn get_db_path(app: &AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
    let app_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Could not resolve app data directory: {}", e))?;
    
    Ok(app_dir.join("contentflow.db"))
}