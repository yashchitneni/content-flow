#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;

use commands::settings::SettingsState;
use std::sync::Mutex;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to ContentFlow!", name)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SettingsState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::settings::get_settings,
            commands::settings::update_api_key,
            commands::settings::remove_api_key,
            commands::settings::update_preferences,
            commands::settings::update_file_organization,
            commands::settings::update_brand_settings,
            commands::settings::update_usage_stats,
            commands::settings::verify_api_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}