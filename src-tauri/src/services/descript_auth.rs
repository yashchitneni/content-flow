use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use tauri::{AppHandle, Manager};
use rand::{thread_rng, RngCore};
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce, Key
};
use aes_gcm::aead::generic_array::GenericArray;

const DESCRIPT_AUTH_URL: &str = "https://api.descript.com/oauth/authorize";
const DESCRIPT_TOKEN_URL: &str = "https://api.descript.com/oauth/token";
const REDIRECT_URI: &str = "contentflow://auth/callback";
const SCOPES: &str = "read write";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: i64,
    pub token_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthState {
    pub is_authenticated: bool,
    pub user_email: Option<String>,
    pub expires_at: Option<i64>,
}

#[derive(Debug, Clone)]
pub struct DescriptAuth {
    client_id: String,
    client_secret: String,
    encryption_key: Key<Aes256Gcm>,
}

#[derive(Debug, Serialize)]
pub struct AuthError {
    message: String,
    code: String,
}

impl DescriptAuth {
    pub fn new(client_id: String, client_secret: String) -> Self {
        // Generate or retrieve encryption key (in production, store this securely)
        let mut key_bytes = [0u8; 32];
        thread_rng().fill_bytes(&mut key_bytes);
        let encryption_key = Key::<Aes256Gcm>::from_slice(&key_bytes).clone();
        
        Self {
            client_id,
            client_secret,
            encryption_key,
        }
    }
    
    // Generate PKCE challenge
    fn generate_pkce_challenge() -> (String, String) {
        let mut verifier_bytes = [0u8; 32];
        thread_rng().fill_bytes(&mut verifier_bytes);
        let verifier = URL_SAFE_NO_PAD.encode(&verifier_bytes);
        
        let mut hasher = Sha256::new();
        hasher.update(&verifier);
        let challenge = URL_SAFE_NO_PAD.encode(hasher.finalize());
        
        (verifier, challenge)
    }
    
    // Generate authorization URL with PKCE
    pub fn get_auth_url(&self, state: &str) -> (String, String) {
        let (verifier, challenge) = Self::generate_pkce_challenge();
        
        let params = vec![
            ("client_id", &self.client_id),
            ("redirect_uri", &REDIRECT_URI.to_string()),
            ("response_type", &"code".to_string()),
            ("scope", &SCOPES.to_string()),
            ("state", &state.to_string()),
            ("code_challenge", &challenge),
            ("code_challenge_method", &"S256".to_string()),
        ];
        
        let mut url = String::from(DESCRIPT_AUTH_URL);
        url.push('?');
        
        for (i, (key, value)) in params.iter().enumerate() {
            if i > 0 {
                url.push('&');
            }
            url.push_str(&format!("{}={}", key, urlencoding::encode(value)));
        }
        
        (url, verifier)
    }
    
    // Exchange authorization code for tokens
    pub async fn exchange_code(&self, code: String, verifier: String) -> Result<AuthTokens, AuthError> {
        let client = Client::new();
        
        let mut params = HashMap::new();
        params.insert("grant_type", "authorization_code");
        params.insert("client_id", &self.client_id);
        params.insert("client_secret", &self.client_secret);
        params.insert("code", &code);
        params.insert("redirect_uri", REDIRECT_URI);
        params.insert("code_verifier", &verifier);
        
        let response = client
            .post(DESCRIPT_TOKEN_URL)
            .form(&params)
            .send()
            .await
            .map_err(|e| AuthError {
                message: format!("Failed to exchange code: {}", e),
                code: "EXCHANGE_FAILED".to_string(),
            })?;
        
        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(AuthError {
                message: format!("Token exchange failed: {}", error_text),
                code: "TOKEN_EXCHANGE_ERROR".to_string(),
            });
        }
        
        let token_response: serde_json::Value = response.json().await
            .map_err(|e| AuthError {
                message: format!("Failed to parse token response: {}", e),
                code: "PARSE_ERROR".to_string(),
            })?;
        
        let expires_in = token_response["expires_in"].as_i64().unwrap_or(3600);
        let expires_at = chrono::Utc::now().timestamp() + expires_in;
        
        Ok(AuthTokens {
            access_token: token_response["access_token"]
                .as_str()
                .ok_or_else(|| AuthError {
                    message: "Missing access token".to_string(),
                    code: "MISSING_TOKEN".to_string(),
                })?
                .to_string(),
            refresh_token: token_response["refresh_token"]
                .as_str()
                .map(|s| s.to_string()),
            expires_at,
            token_type: token_response["token_type"]
                .as_str()
                .unwrap_or("Bearer")
                .to_string(),
        })
    }
    
    // Refresh access token
    pub async fn refresh_token(&self, refresh_token: &str) -> Result<AuthTokens, AuthError> {
        let client = Client::new();
        
        let mut params = HashMap::new();
        params.insert("grant_type", "refresh_token");
        params.insert("client_id", &self.client_id);
        params.insert("client_secret", &self.client_secret);
        params.insert("refresh_token", refresh_token);
        
        let response = client
            .post(DESCRIPT_TOKEN_URL)
            .form(&params)
            .send()
            .await
            .map_err(|e| AuthError {
                message: format!("Failed to refresh token: {}", e),
                code: "REFRESH_FAILED".to_string(),
            })?;
        
        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(AuthError {
                message: format!("Token refresh failed: {}", error_text),
                code: "REFRESH_ERROR".to_string(),
            });
        }
        
        let token_response: serde_json::Value = response.json().await
            .map_err(|e| AuthError {
                message: format!("Failed to parse refresh response: {}", e),
                code: "PARSE_ERROR".to_string(),
            })?;
        
        let expires_in = token_response["expires_in"].as_i64().unwrap_or(3600);
        let expires_at = chrono::Utc::now().timestamp() + expires_in;
        
        Ok(AuthTokens {
            access_token: token_response["access_token"]
                .as_str()
                .ok_or_else(|| AuthError {
                    message: "Missing access token in refresh response".to_string(),
                    code: "MISSING_TOKEN".to_string(),
                })?
                .to_string(),
            refresh_token: token_response["refresh_token"]
                .as_str()
                .map(|s| s.to_string())
                .or(Some(refresh_token.to_string())),
            expires_at,
            token_type: token_response["token_type"]
                .as_str()
                .unwrap_or("Bearer")
                .to_string(),
        })
    }
    
    // Encrypt tokens for storage
    pub fn encrypt_tokens(&self, tokens: &AuthTokens) -> Result<String, AuthError> {
        let cipher = Aes256Gcm::new(&self.encryption_key);
        
        let serialized = serde_json::to_string(tokens)
            .map_err(|e| AuthError {
                message: format!("Failed to serialize tokens: {}", e),
                code: "SERIALIZE_ERROR".to_string(),
            })?;
        
        let mut nonce_bytes = [0u8; 12];
        thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);
        
        let ciphertext = cipher
            .encrypt(nonce, serialized.as_bytes())
            .map_err(|e| AuthError {
                message: format!("Failed to encrypt tokens: {}", e),
                code: "ENCRYPT_ERROR".to_string(),
            })?;
        
        // Combine nonce and ciphertext
        let mut combined = nonce_bytes.to_vec();
        combined.extend_from_slice(&ciphertext);
        
        Ok(URL_SAFE_NO_PAD.encode(&combined))
    }
    
    // Decrypt tokens from storage
    pub fn decrypt_tokens(&self, encrypted: &str) -> Result<AuthTokens, AuthError> {
        let combined = URL_SAFE_NO_PAD
            .decode(encrypted)
            .map_err(|e| AuthError {
                message: format!("Failed to decode encrypted tokens: {}", e),
                code: "DECODE_ERROR".to_string(),
            })?;
        
        if combined.len() < 12 {
            return Err(AuthError {
                message: "Invalid encrypted token format".to_string(),
                code: "INVALID_FORMAT".to_string(),
            });
        }
        
        let (nonce_bytes, ciphertext) = combined.split_at(12);
        let nonce = Nonce::from_slice(nonce_bytes);
        
        let cipher = Aes256Gcm::new(&self.encryption_key);
        let plaintext = cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| AuthError {
                message: format!("Failed to decrypt tokens: {}", e),
                code: "DECRYPT_ERROR".to_string(),
            })?;
        
        let tokens: AuthTokens = serde_json::from_slice(&plaintext)
            .map_err(|e| AuthError {
                message: format!("Failed to deserialize tokens: {}", e),
                code: "DESERIALIZE_ERROR".to_string(),
            })?;
        
        Ok(tokens)
    }
    
    // Check if token needs refresh
    pub fn needs_refresh(tokens: &AuthTokens) -> bool {
        let now = chrono::Utc::now().timestamp();
        // Refresh if token expires in less than 5 minutes
        tokens.expires_at - now < 300
    }
    
    // Get current auth state
    pub async fn get_auth_state(&self, app: &AppHandle) -> AuthState {
        if let Ok(encrypted_tokens) = Self::get_stored_tokens(app) {
            if let Ok(tokens) = self.decrypt_tokens(&encrypted_tokens) {
                let is_expired = chrono::Utc::now().timestamp() > tokens.expires_at;
                return AuthState {
                    is_authenticated: !is_expired,
                    user_email: None, // Would need to fetch from API
                    expires_at: Some(tokens.expires_at),
                };
            }
        }
        
        AuthState {
            is_authenticated: false,
            user_email: None,
            expires_at: None,
        }
    }
    
    // Store encrypted tokens
    pub fn store_tokens(app: &AppHandle, encrypted: &str) -> Result<(), AuthError> {
        let storage_dir = app.path_resolver()
            .app_data_dir()
            .ok_or_else(|| AuthError {
                message: "Failed to get app data directory".to_string(),
                code: "STORAGE_ERROR".to_string(),
            })?;
        
        std::fs::create_dir_all(&storage_dir)
            .map_err(|e| AuthError {
                message: format!("Failed to create storage directory: {}", e),
                code: "STORAGE_ERROR".to_string(),
            })?;
        
        let token_file = storage_dir.join("descript_auth.enc");
        std::fs::write(&token_file, encrypted)
            .map_err(|e| AuthError {
                message: format!("Failed to write tokens: {}", e),
                code: "STORAGE_ERROR".to_string(),
            })?;
        
        Ok(())
    }
    
    // Retrieve stored tokens
    pub fn get_stored_tokens(app: &AppHandle) -> Result<String, AuthError> {
        let storage_dir = app.path_resolver()
            .app_data_dir()
            .ok_or_else(|| AuthError {
                message: "Failed to get app data directory".to_string(),
                code: "STORAGE_ERROR".to_string(),
            })?;
        
        let token_file = storage_dir.join("descript_auth.enc");
        std::fs::read_to_string(&token_file)
            .map_err(|e| AuthError {
                message: format!("Failed to read tokens: {}", e),
                code: "STORAGE_ERROR".to_string(),
            })
    }
    
    // Clear stored tokens (logout)
    pub fn clear_tokens(app: &AppHandle) -> Result<(), AuthError> {
        let storage_dir = app.path_resolver()
            .app_data_dir()
            .ok_or_else(|| AuthError {
                message: "Failed to get app data directory".to_string(),
                code: "STORAGE_ERROR".to_string(),
            })?;
        
        let token_file = storage_dir.join("descript_auth.enc");
        if token_file.exists() {
            std::fs::remove_file(&token_file)
                .map_err(|e| AuthError {
                    message: format!("Failed to remove tokens: {}", e),
                    code: "STORAGE_ERROR".to_string(),
                })?;
        }
        
        Ok(())
    }
}

// Auto-refresh manager
pub struct TokenRefreshManager {
    auth: DescriptAuth,
    app: AppHandle,
}

impl TokenRefreshManager {
    pub fn new(auth: DescriptAuth, app: AppHandle) -> Self {
        Self { auth, app }
    }
    
    pub async fn start_refresh_timer(&self) {
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
            
            if let Err(e) = self.check_and_refresh().await {
                eprintln!("Token refresh error: {:?}", e);
            }
        }
    }
    
    async fn check_and_refresh(&self) -> Result<(), AuthError> {
        if let Ok(encrypted) = DescriptAuth::get_stored_tokens(&self.app) {
            if let Ok(tokens) = self.auth.decrypt_tokens(&encrypted) {
                if DescriptAuth::needs_refresh(&tokens) {
                    if let Some(refresh_token) = &tokens.refresh_token {
                        let new_tokens = self.auth.refresh_token(refresh_token).await?;
                        let encrypted = self.auth.encrypt_tokens(&new_tokens)?;
                        DescriptAuth::store_tokens(&self.app, &encrypted)?;
                        
                        // Emit event to notify frontend
                        self.app.emit_all("auth-refreshed", &new_tokens.expires_at)
                            .map_err(|e| AuthError {
                                message: format!("Failed to emit refresh event: {}", e),
                                code: "EVENT_ERROR".to_string(),
                            })?;
                    }
                }
            }
        }
        
        Ok(())
    }
}