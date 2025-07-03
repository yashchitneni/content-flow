#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;
mod db;

use std::sync::{Arc, Mutex};
use tauri::Manager;
use commands::auth::{AuthManager, initiate_auth, handle_auth_callback, get_auth_state, refresh_auth, logout, get_access_token};
use commands::files::{validate_video_files, import_video_files, import_and_organize_video_files, get_imported_files, get_file_count};
use commands::transcripts::{
    validate_transcript_files, import_transcript_files, get_imported_transcripts, 
    get_transcript_count, get_transcript_by_id, search_transcripts,
    extract_and_store_tags, get_transcript_tags, get_all_tags // Task #14
};
use commands::upload::{UploadManager, initialize_upload_service, create_descript_project, batch_upload_files, get_export_instructions, open_export_folder, get_upload_status, cancel_upload};
use commands::settings::SettingsState;
use commands::templates::{get_all_templates, get_template, create_template, update_template, delete_template};
use commands::content::{save_generated_content, get_all_content, get_content_by_id, update_content, delete_content, search_content};

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
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let handle = app.handle();
            
            // Initialize database
            let database = tauri::async_runtime::block_on(async {
                let database = db::Database::new(&handle).await
                    .expect("Failed to initialize database");
                
                // Run migrations
                database.migrate().await
                    .expect("Failed to run database migrations");
                
                database
            });
            
            // Store database in app state
            app.manage(Arc::new(database));
            
            Ok(())
        })
        .manage(auth_manager)
        .manage(upload_manager)
        .manage(SettingsState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            greet,
            // Database commands
            commands::database::test_database_schema,
            commands::database::get_table_count,
            // File commands
            validate_video_files,
            import_video_files,
            import_and_organize_video_files,
            get_imported_files,
            get_file_count,
            // Transcript commands
            validate_transcript_files,
            import_transcript_files,
            get_imported_transcripts,
            get_transcript_count,
            get_transcript_by_id,
            search_transcripts,
            extract_and_store_tags, // Task #14
            get_transcript_tags, // Task #14
            get_all_tags, // Task #14
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
            cancel_upload,
            // Settings commands
            commands::settings::get_settings,
            commands::settings::update_api_key,
            commands::settings::remove_api_key,
            commands::settings::update_preferences,
            commands::settings::update_file_organization,
            commands::settings::update_brand_settings,
            commands::settings::update_usage_stats,
            commands::settings::verify_api_key,
            // Template commands
            get_all_templates,
            get_template,
            create_template,
            update_template,
            delete_template,
            // Content commands
            save_generated_content,
            get_all_content,
            get_content_by_id,
            update_content,
            delete_content,
            search_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}