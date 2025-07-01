#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;
mod db;

use std::sync::Arc;
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to ContentFlow!", name)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let handle = app.handle();
            
            // Initialize database
            tauri::async_runtime::block_on(async move {
                let database = db::Database::new(&handle).await
                    .expect("Failed to initialize database");
                
                // Run migrations
                database.migrate().await
                    .expect("Failed to run database migrations");
                
                // Store database in app state
                app.manage(Arc::new(database));
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::database::test_database_schema,
            commands::database::get_table_count
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}