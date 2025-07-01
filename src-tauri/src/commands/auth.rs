use crate::services::descript_auth::{AuthError, AuthState, AuthTokens, DescriptAuth};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Emitter, State};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthUrlResponse {
    pub auth_url: String,
    pub state: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthCallbackRequest {
    pub code: String,
    pub state: String,
}

#[derive(Debug, Clone)]
pub struct AuthManager {
    pub descript_auth: Arc<DescriptAuth>,
    pub pending_verifiers: Arc<Mutex<std::collections::HashMap<String, String>>>,
}

impl AuthManager {
    pub fn new(client_id: String, client_secret: String) -> Self {
        Self {
            descript_auth: Arc::new(DescriptAuth::new(client_id, client_secret)),
            pending_verifiers: Arc::new(Mutex::new(std::collections::HashMap::new())),
        }
    }
}

#[tauri::command]
pub async fn initiate_auth(
    auth_manager: State<'_, AuthManager>,
) -> Result<AuthUrlResponse, String> {
    // Generate state for CSRF protection
    let state = uuid::Uuid::new_v4().to_string();
    
    // Get auth URL with PKCE
    let (auth_url, verifier) = auth_manager.descript_auth.get_auth_url(&state);
    
    // Store verifier for later use
    auth_manager.pending_verifiers
        .lock()
        .await
        .insert(state.clone(), verifier);
    
    Ok(AuthUrlResponse { auth_url, state })
}

#[tauri::command]
pub async fn handle_auth_callback(
    app: AppHandle,
    auth_manager: State<'_, AuthManager>,
    request: AuthCallbackRequest,
) -> Result<AuthState, String> {
    // Retrieve and remove verifier
    let verifier = auth_manager.pending_verifiers
        .lock()
        .await
        .remove(&request.state)
        .ok_or_else(|| "Invalid or expired auth state".to_string())?;
    
    // Exchange code for tokens
    let tokens = auth_manager.descript_auth
        .exchange_code(request.code, verifier)
        .await
        .map_err(|e| format!("Failed to exchange code: {}", e.message))?;
    
    // Encrypt and store tokens
    let encrypted = auth_manager.descript_auth
        .encrypt_tokens(&tokens)
        .map_err(|e| format!("Failed to encrypt tokens: {}", e.message))?;
    
    DescriptAuth::store_tokens(&app, &encrypted)
        .map_err(|e| format!("Failed to store tokens: {}", e.message))?;
    
    // Emit auth success event
    app.emit("auth-success", &tokens.expires_at)
        .map_err(|e| format!("Failed to emit auth event: {}", e))?;
    
    // Return current auth state
    Ok(AuthState {
        is_authenticated: true,
        user_email: None, // Would need to fetch from user API
        expires_at: Some(tokens.expires_at),
    })
}

#[tauri::command]
pub async fn get_auth_state(
    app: AppHandle,
    auth_manager: State<'_, AuthManager>,
) -> Result<AuthState, String> {
    Ok(auth_manager.descript_auth.get_auth_state(&app).await)
}

#[tauri::command]
pub async fn refresh_auth(
    app: AppHandle,
    auth_manager: State<'_, AuthManager>,
) -> Result<AuthState, String> {
    let encrypted = DescriptAuth::get_stored_tokens(&app)
        .map_err(|e| format!("No stored tokens: {}", e.message))?;
    
    let tokens = auth_manager.descript_auth
        .decrypt_tokens(&encrypted)
        .map_err(|e| format!("Failed to decrypt tokens: {}", e.message))?;
    
    let refresh_token = tokens.refresh_token
        .ok_or_else(|| "No refresh token available".to_string())?;
    
    let new_tokens = auth_manager.descript_auth
        .refresh_token(&refresh_token)
        .await
        .map_err(|e| format!("Failed to refresh tokens: {}", e.message))?;
    
    let encrypted = auth_manager.descript_auth
        .encrypt_tokens(&new_tokens)
        .map_err(|e| format!("Failed to encrypt new tokens: {}", e.message))?;
    
    DescriptAuth::store_tokens(&app, &encrypted)
        .map_err(|e| format!("Failed to store new tokens: {}", e.message))?;
    
    Ok(AuthState {
        is_authenticated: true,
        user_email: None,
        expires_at: Some(new_tokens.expires_at),
    })
}

#[tauri::command]
pub async fn logout(
    app: AppHandle,
) -> Result<(), String> {
    DescriptAuth::clear_tokens(&app)
        .map_err(|e| format!("Failed to clear tokens: {}", e.message))?;
    
    app.emit("auth-logout", ())
        .map_err(|e| format!("Failed to emit logout event: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn get_access_token(
    app: AppHandle,
    auth_manager: State<'_, AuthManager>,
) -> Result<String, String> {
    let encrypted = DescriptAuth::get_stored_tokens(&app)
        .map_err(|e| format!("No stored tokens: {}", e.message))?;
    
    let mut tokens = auth_manager.descript_auth
        .decrypt_tokens(&encrypted)
        .map_err(|e| format!("Failed to decrypt tokens: {}", e.message))?;
    
    // Check if token needs refresh
    if DescriptAuth::needs_refresh(&tokens) {
        if let Some(refresh_token) = &tokens.refresh_token {
            let new_tokens = auth_manager.descript_auth
                .refresh_token(refresh_token)
                .await
                .map_err(|e| format!("Failed to refresh tokens: {}", e.message))?;
            
            let encrypted = auth_manager.descript_auth
                .encrypt_tokens(&new_tokens)
                .map_err(|e| format!("Failed to encrypt refreshed tokens: {}", e.message))?;
            
            DescriptAuth::store_tokens(&app, &encrypted)
                .map_err(|e| format!("Failed to store refreshed tokens: {}", e.message))?;
            
            tokens = new_tokens;
        }
    }
    
    Ok(tokens.access_token)
}