#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;
mod db;

use std::sync::Arc;
use tauri::Manager;
use commands::auth::{AuthManager, initiate_auth, handle_auth_callback, get_auth_state, refresh_auth, logout, get_access_token};
use commands::upload::{UploadManager, initialize_upload_service, create_descript_project, batch_upload_files, get_export_instructions, open_export_folder, get_upload_status, cancel_upload};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to ContentFlow!", name)
}

fn main() {
    // Initialize managers
    let auth_manager = AuthManager::new(
        std::env::var("DESCRIPT_CLIENT_ID").unwrap_or_else(|_| "demo_client_id".to_string()),
        std::env::var("DESCRIPT_CLIENT_SECRET").unwrap_or_else(|_| "demo_client_secret".to_string()),
    );
    let upload_manager = UploadManager::new();

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
        .manage(auth_manager)
        .manage(upload_manager)
        .invoke_handler(tauri::generate_handler![
            greet,
            // Database commands
            commands::database::test_database_schema,
            commands::database::get_table_count,
            // Auth commands
            initiate_auth,
            handle_auth_callback,
            get_auth_state,
            refresh_auth,
            logout,
            get_access_token,
            // Upload commands
            initialize_upload_service,
            create_descript_project,
            batch_upload_files,
            get_export_instructions,
            open_export_folder,
            get_upload_status,
            cancel_upload
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}