use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::api::path::app_data_dir;
use std::fs;
use std::path::PathBuf;
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce, Key
};
use aes_gcm::aead::rand_core::RngCore;
use base64::{Engine as _, engine::general_purpose};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiKey {
    pub service: String,
    pub encrypted_key: String,
    pub created_at: String,
    pub last_used: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Preferences {
    pub theme: String,
    pub auto_save_interval: u32,
    pub default_export_format: String,
    pub show_tips: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileOrganization {
    pub watch_folder: Option<String>,
    pub auto_organize: bool,
    pub folder_pattern: String,
    pub cleanup_after_days: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BrandSettings {
    pub primary_color: String,
    pub secondary_color: String,
    pub font_family: String,
    pub logo_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UsageStats {
    pub descript_api_calls: u32,
    pub openai_tokens_used: u32,
    pub claude_tokens_used: u32,
    pub storage_used_mb: f64,
    pub last_updated: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub api_keys: HashMap<String, ApiKey>,
    pub preferences: Preferences,
    pub file_organization: FileOrganization,
    pub brand_settings: BrandSettings,
    pub usage_stats: UsageStats,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            api_keys: HashMap::new(),
            preferences: Preferences {
                theme: "light".to_string(),
                auto_save_interval: 30,
                default_export_format: "png".to_string(),
                show_tips: true,
            },
            file_organization: FileOrganization {
                watch_folder: None,
                auto_organize: true,
                folder_pattern: "{year}/{month}/{orientation}".to_string(),
                cleanup_after_days: 30,
            },
            brand_settings: BrandSettings {
                primary_color: "#0066FF".to_string(),
                secondary_color: "#6B46C1".to_string(),
                font_family: "Inter".to_string(),
                logo_path: None,
            },
            usage_stats: UsageStats {
                descript_api_calls: 0,
                openai_tokens_used: 0,
                claude_tokens_used: 0,
                storage_used_mb: 0.0,
                last_updated: chrono::Utc::now().to_rfc3339(),
            },
        }
    }
}

pub struct SettingsService {
    settings_path: PathBuf,
    encryption_key: Vec<u8>,
}

impl SettingsService {
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        let config_dir = app_data_dir(&app_handle.config()).ok_or("Failed to get app data dir")?;
        let settings_dir = config_dir.join("ContentFlow");
        fs::create_dir_all(&settings_dir)?;
        
        let settings_path = settings_dir.join("settings.json");
        let key_path = settings_dir.join(".key");
        
        // Generate or load encryption key
        let encryption_key = if key_path.exists() {
            fs::read(&key_path)?
        } else {
            let mut key = vec![0u8; 32];
            OsRng.fill_bytes(&mut key);
            fs::write(&key_path, &key)?;
            key
        };
        
        Ok(SettingsService {
            settings_path,
            encryption_key,
        })
    }
    
    pub fn load_settings(&self) -> Result<Settings, Box<dyn std::error::Error>> {
        if !self.settings_path.exists() {
            let default_settings = Settings::default();
            self.save_settings(&default_settings)?;
            return Ok(default_settings);
        }
        
        let contents = fs::read_to_string(&self.settings_path)?;
        let settings: Settings = serde_json::from_str(&contents)?;
        Ok(settings)
    }
    
    pub fn save_settings(&self, settings: &Settings) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(settings)?;
        fs::write(&self.settings_path, json)?;
        Ok(())
    }
    
    pub fn encrypt_api_key(&self, key: &str) -> Result<String, Box<dyn std::error::Error>> {
        let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&self.encryption_key));
        
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);
        
        let ciphertext = cipher.encrypt(nonce, key.as_bytes())
            .map_err(|_| "Encryption failed")?;
        
        // Combine nonce and ciphertext
        let mut combined = nonce_bytes.to_vec();
        combined.extend_from_slice(&ciphertext);
        
        Ok(general_purpose::STANDARD.encode(&combined))
    }
    
    pub fn decrypt_api_key(&self, encrypted: &str) -> Result<String, Box<dyn std::error::Error>> {
        let combined = general_purpose::STANDARD.decode(encrypted)?;
        
        if combined.len() < 12 {
            return Err("Invalid encrypted data".into());
        }
        
        let (nonce_bytes, ciphertext) = combined.split_at(12);
        let nonce = Nonce::from_slice(nonce_bytes);
        
        let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&self.encryption_key));
        let plaintext = cipher.decrypt(nonce, ciphertext)
            .map_err(|_| "Decryption failed")?;
        
        Ok(String::from_utf8(plaintext)?)
    }
    
    pub fn update_api_key(&self, service: &str, key: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut settings = self.load_settings()?;
        let encrypted_key = self.encrypt_api_key(key)?;
        
        settings.api_keys.insert(
            service.to_string(),
            ApiKey {
                service: service.to_string(),
                encrypted_key,
                created_at: chrono::Utc::now().to_rfc3339(),
                last_used: None,
            },
        );
        
        self.save_settings(&settings)?;
        Ok(())
    }
    
    pub fn remove_api_key(&self, service: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut settings = self.load_settings()?;
        settings.api_keys.remove(service);
        self.save_settings(&settings)?;
        Ok(())
    }
    
    pub fn update_preferences(&self, preferences: Preferences) -> Result<(), Box<dyn std::error::Error>> {
        let mut settings = self.load_settings()?;
        settings.preferences = preferences;
        self.save_settings(&settings)?;
        Ok(())
    }
    
    pub fn update_file_organization(&self, file_org: FileOrganization) -> Result<(), Box<dyn std::error::Error>> {
        let mut settings = self.load_settings()?;
        settings.file_organization = file_org;
        self.save_settings(&settings)?;
        Ok(())
    }
    
    pub fn update_brand_settings(&self, brand: BrandSettings) -> Result<(), Box<dyn std::error::Error>> {
        let mut settings = self.load_settings()?;
        settings.brand_settings = brand;
        self.save_settings(&settings)?;
        Ok(())
    }
    
    pub fn update_usage_stats(&self, stats: UsageStats) -> Result<(), Box<dyn std::error::Error>> {
        let mut settings = self.load_settings()?;
        settings.usage_stats = stats;
        settings.usage_stats.last_updated = chrono::Utc::now().to_rfc3339();
        self.save_settings(&settings)?;
        Ok(())
    }
    
    pub fn get_decrypted_api_key(&self, service: &str) -> Result<Option<String>, Box<dyn std::error::Error>> {
        let settings = self.load_settings()?;
        
        if let Some(api_key) = settings.api_keys.get(service) {
            let decrypted = self.decrypt_api_key(&api_key.encrypted_key)?;
            Ok(Some(decrypted))
        } else {
            Ok(None)
        }
    }
}