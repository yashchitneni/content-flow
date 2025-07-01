use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

// Enums for constrained fields
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "PascalCase")]
pub enum Orientation {
    Horizontal,
    Vertical,
    Square,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "PascalCase")]
pub enum ContentType {
    MainContent,
    BRoll,
    Tutorial,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "PascalCase")]
pub enum FileStatus {
    Imported,
    Analyzing,
    Organized,
    Uploaded,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "PascalCase")]
pub enum ContentStatus {
    Draft,
    Ready,
    Published,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "lowercase")]
pub enum TemplateType {
    Carousel,
    Thread,
    Article,
    Script,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "PascalCase")]
pub enum FolderType {
    Root,
    ByDate,
    ByOrientation,
    ByContentType,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "PascalCase")]
pub enum ProjectStatus {
    Created,
    Uploading,
    Processing,
    Complete,
    Failed,
}

// Entity structs
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Folder {
    #[sqlx(rename = "FolderID")]
    pub folder_id: String,
    #[sqlx(rename = "Path")]
    pub path: String,
    #[sqlx(rename = "FolderType")]
    pub folder_type: FolderType,
    #[sqlx(rename = "CreatedAt")]
    pub created_at: DateTime<Utc>,
    #[sqlx(rename = "UpdatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct File {
    #[sqlx(rename = "FileID")]
    pub file_id: String,
    #[sqlx(rename = "FolderID")]
    pub folder_id: Option<String>,
    #[sqlx(rename = "FilePath")]
    pub file_path: String,
    #[sqlx(rename = "OriginalName")]
    pub original_name: String,
    #[sqlx(rename = "FileSize")]
    pub file_size: i64,
    #[sqlx(rename = "Duration")]
    pub duration: Option<f64>,
    #[sqlx(rename = "Width")]
    pub width: Option<i32>,
    #[sqlx(rename = "Height")]
    pub height: Option<i32>,
    #[sqlx(rename = "Orientation")]
    pub orientation: Option<Orientation>,
    #[sqlx(rename = "ContentType")]
    pub content_type: Option<ContentType>,
    #[sqlx(rename = "CreatedAt")]
    pub created_at: Option<DateTime<Utc>>,
    #[sqlx(rename = "ImportedAt")]
    pub imported_at: DateTime<Utc>,
    #[sqlx(rename = "Status")]
    pub status: FileStatus,
    #[sqlx(rename = "UpdatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DescriptProject {
    #[sqlx(rename = "ProjectID")]
    pub project_id: String,
    #[sqlx(rename = "ProjectName")]
    pub project_name: String,
    #[sqlx(rename = "DescriptID")]
    pub descript_id: Option<String>,
    #[sqlx(rename = "FileCount")]
    pub file_count: i32,
    #[sqlx(rename = "CreatedAt")]
    pub created_at: DateTime<Utc>,
    #[sqlx(rename = "UploadedAt")]
    pub uploaded_at: Option<DateTime<Utc>>,
    #[sqlx(rename = "Status")]
    pub status: ProjectStatus,
    #[sqlx(rename = "UpdatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ProjectFiles {
    #[sqlx(rename = "ProjectID")]
    pub project_id: String,
    #[sqlx(rename = "FileID")]
    pub file_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Transcript {
    #[sqlx(rename = "TranscriptID")]
    pub transcript_id: String,
    #[sqlx(rename = "FileID")]
    pub file_id: String,
    #[sqlx(rename = "Content")]
    pub content: String,
    #[sqlx(rename = "WordCount")]
    pub word_count: Option<i32>,
    #[sqlx(rename = "Language")]
    pub language: String,
    #[sqlx(rename = "ImportedAt")]
    pub imported_at: DateTime<Utc>,
    #[sqlx(rename = "AnalyzedAt")]
    pub analyzed_at: Option<DateTime<Utc>>,
    #[sqlx(rename = "ContentScore")]
    pub content_score: Option<f32>,
    #[sqlx(rename = "Summary")]
    pub summary: Option<String>,
    #[sqlx(rename = "UpdatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Tag {
    #[sqlx(rename = "TagID")]
    pub tag_id: String,
    #[sqlx(rename = "TagName")]
    pub tag_name: String,
    #[sqlx(rename = "Category")]
    pub category: Option<String>,
    #[sqlx(rename = "CreatedAt")]
    pub created_at: DateTime<Utc>,
    #[sqlx(rename = "UpdatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct TranscriptTags {
    #[sqlx(rename = "TranscriptID")]
    pub transcript_id: String,
    #[sqlx(rename = "TagID")]
    pub tag_id: String,
    #[sqlx(rename = "Relevance")]
    pub relevance: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Template {
    #[sqlx(rename = "TemplateID")]
    pub template_id: String,
    #[sqlx(rename = "TemplateName")]
    pub template_name: String,
    #[sqlx(rename = "TemplateType")]
    pub template_type: TemplateType,
    #[sqlx(rename = "Structure")]
    pub structure: String, // JSON
    #[sqlx(rename = "Constraints")]
    pub constraints: Option<String>, // JSON
    #[sqlx(rename = "CreatedAt")]
    pub created_at: DateTime<Utc>,
    #[sqlx(rename = "UpdatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct GeneratedContent {
    #[sqlx(rename = "ContentID")]
    pub content_id: String,
    #[sqlx(rename = "TemplateID")]
    pub template_id: String,
    #[sqlx(rename = "Title")]
    pub title: Option<String>,
    #[sqlx(rename = "ContentData")]
    pub content_data: String, // JSON
    #[sqlx(rename = "Status")]
    pub status: ContentStatus,
    #[sqlx(rename = "CreatedAt")]
    pub created_at: DateTime<Utc>,
    #[sqlx(rename = "UpdatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ContentSources {
    #[sqlx(rename = "ContentID")]
    pub content_id: String,
    #[sqlx(rename = "TranscriptID")]
    pub transcript_id: String,
    #[sqlx(rename = "OrderIndex")]
    pub order_index: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ContentVersion {
    #[sqlx(rename = "VersionID")]
    pub version_id: String,
    #[sqlx(rename = "ContentID")]
    pub content_id: String,
    #[sqlx(rename = "VersionNumber")]
    pub version_number: i32,
    #[sqlx(rename = "VersionData")]
    pub version_data: String, // JSON
    #[sqlx(rename = "ChangeSummary")]
    pub change_summary: Option<String>,
    #[sqlx(rename = "CreatedAt")]
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ExportHistory {
    #[sqlx(rename = "ExportID")]
    pub export_id: String,
    #[sqlx(rename = "ContentID")]
    pub content_id: String,
    #[sqlx(rename = "ExportFormat")]
    pub export_format: String,
    #[sqlx(rename = "ExportPath")]
    pub export_path: Option<String>,
    #[sqlx(rename = "ExportedAt")]
    pub exported_at: DateTime<Utc>,
    #[sqlx(rename = "Platform")]
    pub platform: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct APIKey {
    #[sqlx(rename = "KeyID")]
    pub key_id: String,
    #[sqlx(rename = "ServiceName")]
    pub service_name: String,
    #[sqlx(rename = "EncryptedKey")]
    pub encrypted_key: String,
    #[sqlx(rename = "IsActive")]
    pub is_active: bool,
    #[sqlx(rename = "LastUsed")]
    pub last_used: Option<DateTime<Utc>>,
    #[sqlx(rename = "CreatedAt")]
    pub created_at: DateTime<Utc>,
    #[sqlx(rename = "UpdatedAt")]
    pub updated_at: DateTime<Utc>,
}

// Helper functions for UUID generation
impl Default for Folder {
    fn default() -> Self {
        Self {
            folder_id: Uuid::new_v4().to_string(),
            path: String::new(),
            folder_type: FolderType::Custom,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}

impl Default for File {
    fn default() -> Self {
        Self {
            file_id: Uuid::new_v4().to_string(),
            folder_id: None,
            file_path: String::new(),
            original_name: String::new(),
            file_size: 0,
            duration: None,
            width: None,
            height: None,
            orientation: None,
            content_type: None,
            created_at: None,
            imported_at: Utc::now(),
            status: FileStatus::Imported,
            updated_at: Utc::now(),
        }
    }
}

impl Default for DescriptProject {
    fn default() -> Self {
        Self {
            project_id: Uuid::new_v4().to_string(),
            project_name: String::new(),
            descript_id: None,
            file_count: 0,
            created_at: Utc::now(),
            uploaded_at: None,
            status: ProjectStatus::Created,
            updated_at: Utc::now(),
        }
    }
}

impl Default for Transcript {
    fn default() -> Self {
        Self {
            transcript_id: Uuid::new_v4().to_string(),
            file_id: String::new(),
            content: String::new(),
            word_count: None,
            language: "en".to_string(),
            imported_at: Utc::now(),
            analyzed_at: None,
            content_score: None,
            summary: None,
            updated_at: Utc::now(),
        }
    }
}

impl Default for Tag {
    fn default() -> Self {
        Self {
            tag_id: Uuid::new_v4().to_string(),
            tag_name: String::new(),
            category: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}

impl Default for Template {
    fn default() -> Self {
        Self {
            template_id: Uuid::new_v4().to_string(),
            template_name: String::new(),
            template_type: TemplateType::Carousel,
            structure: "{}".to_string(),
            constraints: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}

impl Default for GeneratedContent {
    fn default() -> Self {
        Self {
            content_id: Uuid::new_v4().to_string(),
            template_id: String::new(),
            title: None,
            content_data: "{}".to_string(),
            status: ContentStatus::Draft,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}

impl Default for ContentVersion {
    fn default() -> Self {
        Self {
            version_id: Uuid::new_v4().to_string(),
            content_id: String::new(),
            version_number: 1,
            version_data: "{}".to_string(),
            change_summary: None,
            created_at: Utc::now(),
        }
    }
}

impl Default for ExportHistory {
    fn default() -> Self {
        Self {
            export_id: Uuid::new_v4().to_string(),
            content_id: String::new(),
            export_format: String::new(),
            export_path: None,
            exported_at: Utc::now(),
            platform: None,
        }
    }
}

impl Default for APIKey {
    fn default() -> Self {
        Self {
            key_id: Uuid::new_v4().to_string(),
            service_name: String::new(),
            encrypted_key: String::new(),
            is_active: true,
            last_used: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}