// Example main.rs integration for Descript auth

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod services;

use commands::auth::{
    AuthManager, get_auth_state, get_access_token, handle_auth_callback,
    initiate_auth, logout, refresh_auth
};
use services::descript_auth::TokenRefreshManager;
use std::env;

fn main() {
    // Load environment variables
    dotenv::dotenv().ok();
    
    // Initialize auth manager
    let client_id = env::var("DESCRIPT_CLIENT_ID")
        .expect("DESCRIPT_CLIENT_ID environment variable not set");
    let client_secret = env::var("DESCRIPT_CLIENT_SECRET")
        .expect("DESCRIPT_CLIENT_SECRET environment variable not set");
    
    let auth_manager = AuthManager::new(client_id, client_secret);
    
    tauri::Builder::default()
        .manage(auth_manager.clone())
        .invoke_handler(tauri::generate_handler![
            initiate_auth,
            handle_auth_callback,
            get_auth_state,
            refresh_auth,
            logout,
            get_access_token,
        ])
        .setup(move |app| {
            // Start token refresh manager
            let app_handle = app.handle();
            let refresh_manager = TokenRefreshManager::new(
                auth_manager.descript_auth.as_ref().clone(),
                app_handle.clone()
            );
            
            // Spawn refresh timer in background
            tauri::async_runtime::spawn(async move {
                refresh_manager.start_refresh_timer().await;
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}