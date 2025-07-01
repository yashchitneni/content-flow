use crate::services::settings::{
    ApiKey, BrandSettings, FileOrganization, Preferences, Settings, SettingsService, UsageStats,
};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

pub struct SettingsState(pub Mutex<Option<SettingsService>>);

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiKeyUpdate {
    pub service: String,
    pub key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SettingsResponse {
    pub api_keys: Vec<ApiKeyInfo>,
    pub preferences: Preferences,
    pub file_organization: FileOrganization,
    pub brand_settings: BrandSettings,
    pub usage_stats: UsageStats,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiKeyInfo {
    pub service: String,
    pub is_set: bool,
    pub created_at: String,
    pub last_used: Option<String>,
}

#[tauri::command]
pub async fn get_settings(
    state: State<'_, SettingsState>,
    app_handle: tauri::AppHandle,
) -> Result<SettingsResponse, String> {
    let mut state_guard = state.0.lock().unwrap();
    
    if state_guard.is_none() {
        let service = SettingsService::new(&app_handle)
            .map_err(|e| format!("Failed to initialize settings service: {}", e))?;
        *state_guard = Some(service);
    }
    
    let service = state_guard.as_ref().unwrap();
    let settings = service.load_settings()
        .map_err(|e| format!("Failed to load settings: {}", e))?;
    
    // Convert api_keys to info format (without exposing encrypted keys)
    let api_keys_info: Vec<ApiKeyInfo> = settings
        .api_keys
        .iter()
        .map(|(service, key)| ApiKeyInfo {
            service: service.clone(),
            is_set: true,
            created_at: key.created_at.clone(),
            last_used: key.last_used.clone(),
        })
        .collect();
    
    Ok(SettingsResponse {
        api_keys: api_keys_info,
        preferences: settings.preferences,
        file_organization: settings.file_organization,
        brand_settings: settings.brand_settings,
        usage_stats: settings.usage_stats,
    })
}

#[tauri::command]
pub async fn update_api_key(
    state: State<'_, SettingsState>,
    app_handle: tauri::AppHandle,
    update: ApiKeyUpdate,
) -> Result<(), String> {
    let mut state_guard = state.0.lock().unwrap();
    
    if state_guard.is_none() {
        let service = SettingsService::new(&app_handle)
            .map_err(|e| format!("Failed to initialize settings service: {}", e))?;
        *state_guard = Some(service);
    }
    
    let service = state_guard.as_ref().unwrap();
    service.update_api_key(&update.service, &update.key)
        .map_err(|e| format!("Failed to update API key: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn remove_api_key(
    state: State<'_, SettingsState>,
    app_handle: tauri::AppHandle,
    service: String,
) -> Result<(), String> {
    let mut state_guard = state.0.lock().unwrap();
    
    if state_guard.is_none() {
        let settings_service = SettingsService::new(&app_handle)
            .map_err(|e| format!("Failed to initialize settings service: {}", e))?;
        *state_guard = Some(settings_service);
    }
    
    let settings_service = state_guard.as_ref().unwrap();
    settings_service.remove_api_key(&service)
        .map_err(|e| format!("Failed to remove API key: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn update_preferences(
    state: State<'_, SettingsState>,
    app_handle: tauri::AppHandle,
    preferences: Preferences,
) -> Result<(), String> {
    let mut state_guard = state.0.lock().unwrap();
    
    if state_guard.is_none() {
        let service = SettingsService::new(&app_handle)
            .map_err(|e| format!("Failed to initialize settings service: {}", e))?;
        *state_guard = Some(service);
    }
    
    let service = state_guard.as_ref().unwrap();
    service.update_preferences(preferences)
        .map_err(|e| format!("Failed to update preferences: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn update_file_organization(
    state: State<'_, SettingsState>,
    app_handle: tauri::AppHandle,
    file_organization: FileOrganization,
) -> Result<(), String> {
    let mut state_guard = state.0.lock().unwrap();
    
    if state_guard.is_none() {
        let service = SettingsService::new(&app_handle)
            .map_err(|e| format!("Failed to initialize settings service: {}", e))?;
        *state_guard = Some(service);
    }
    
    let service = state_guard.as_ref().unwrap();
    service.update_file_organization(file_organization)
        .map_err(|e| format!("Failed to update file organization: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn update_brand_settings(
    state: State<'_, SettingsState>,
    app_handle: tauri::AppHandle,
    brand_settings: BrandSettings,
) -> Result<(), String> {
    let mut state_guard = state.0.lock().unwrap();
    
    if state_guard.is_none() {
        let service = SettingsService::new(&app_handle)
            .map_err(|e| format!("Failed to initialize settings service: {}", e))?;
        *state_guard = Some(service);
    }
    
    let service = state_guard.as_ref().unwrap();
    service.update_brand_settings(brand_settings)
        .map_err(|e| format!("Failed to update brand settings: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn update_usage_stats(
    state: State<'_, SettingsState>,
    app_handle: tauri::AppHandle,
    usage_stats: UsageStats,
) -> Result<(), String> {
    let mut state_guard = state.0.lock().unwrap();
    
    if state_guard.is_none() {
        let service = SettingsService::new(&app_handle)
            .map_err(|e| format!("Failed to initialize settings service: {}", e))?;
        *state_guard = Some(service);
    }
    
    let service = state_guard.as_ref().unwrap();
    service.update_usage_stats(usage_stats)
        .map_err(|e| format!("Failed to update usage stats: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn verify_api_key(
    state: State<'_, SettingsState>,
    app_handle: tauri::AppHandle,
    service: String,
) -> Result<bool, String> {
    let mut state_guard = state.0.lock().unwrap();
    
    if state_guard.is_none() {
        let settings_service = SettingsService::new(&app_handle)
            .map_err(|e| format!("Failed to initialize settings service: {}", e))?;
        *state_guard = Some(settings_service);
    }
    
    let settings_service = state_guard.as_ref().unwrap();
    let key = settings_service.get_decrypted_api_key(&service)
        .map_err(|e| format!("Failed to get API key: {}", e))?;
    
    // In a real implementation, we would verify the key with the actual service
    // For now, we just check if it exists
    Ok(key.is_some())
}