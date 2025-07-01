-- ContentFlow Initial Database Schema
-- Version: 1.0
-- Date: January 7, 2025

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Folder table
CREATE TABLE IF NOT EXISTS Folder (
    FolderID TEXT PRIMARY KEY,
    Path TEXT NOT NULL UNIQUE,
    FolderType TEXT NOT NULL CHECK(FolderType IN ('Root', 'ByDate', 'ByOrientation', 'ByContentType', 'Custom')),
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- File table
CREATE TABLE IF NOT EXISTS File (
    FileID TEXT PRIMARY KEY,
    FolderID TEXT,
    FilePath TEXT NOT NULL,
    OriginalName TEXT NOT NULL,
    FileSize INTEGER NOT NULL,
    Duration REAL,
    Width INTEGER,
    Height INTEGER,
    Orientation TEXT CHECK(Orientation IN ('Horizontal', 'Vertical', 'Square', 'Other')),
    ContentType TEXT CHECK(ContentType IN ('MainContent', 'BRoll', 'Tutorial', 'Unknown')),
    CreatedAt DATETIME,
    ImportedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status TEXT NOT NULL CHECK(Status IN ('Imported', 'Analyzing', 'Organized', 'Uploaded')),
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (FolderID) REFERENCES Folder(FolderID) ON DELETE SET NULL
);

-- DescriptProject table
CREATE TABLE IF NOT EXISTS DescriptProject (
    ProjectID TEXT PRIMARY KEY,
    ProjectName TEXT NOT NULL,
    DescriptID TEXT,
    FileCount INTEGER NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UploadedAt DATETIME,
    Status TEXT NOT NULL CHECK(Status IN ('Created', 'Uploading', 'Processing', 'Complete', 'Failed')),
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ProjectFiles junction table
CREATE TABLE IF NOT EXISTS ProjectFiles (
    ProjectID TEXT NOT NULL,
    FileID TEXT NOT NULL,
    PRIMARY KEY (ProjectID, FileID),
    FOREIGN KEY (ProjectID) REFERENCES DescriptProject(ProjectID) ON DELETE CASCADE,
    FOREIGN KEY (FileID) REFERENCES File(FileID) ON DELETE CASCADE
);

-- Transcript table
CREATE TABLE IF NOT EXISTS Transcript (
    TranscriptID TEXT PRIMARY KEY,
    FileID TEXT NOT NULL UNIQUE,
    Content TEXT NOT NULL,
    WordCount INTEGER,
    Language TEXT NOT NULL DEFAULT 'en',
    ImportedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    AnalyzedAt DATETIME,
    ContentScore REAL CHECK(ContentScore >= 0 AND ContentScore <= 1),
    Summary TEXT,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (FileID) REFERENCES File(FileID) ON DELETE CASCADE
);

-- Tag table
CREATE TABLE IF NOT EXISTS Tag (
    TagID TEXT PRIMARY KEY,
    TagName TEXT NOT NULL UNIQUE,
    Category TEXT,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TranscriptTags junction table
CREATE TABLE IF NOT EXISTS TranscriptTags (
    TranscriptID TEXT NOT NULL,
    TagID TEXT NOT NULL,
    Relevance REAL CHECK(Relevance >= 0 AND Relevance <= 1),
    PRIMARY KEY (TranscriptID, TagID),
    FOREIGN KEY (TranscriptID) REFERENCES Transcript(TranscriptID) ON DELETE CASCADE,
    FOREIGN KEY (TagID) REFERENCES Tag(TagID) ON DELETE CASCADE
);

-- Template table
CREATE TABLE IF NOT EXISTS Template (
    TemplateID TEXT PRIMARY KEY,
    TemplateName TEXT NOT NULL UNIQUE,
    TemplateType TEXT NOT NULL CHECK(TemplateType IN ('carousel', 'thread', 'article', 'script')),
    Structure TEXT NOT NULL, -- JSON
    Constraints TEXT, -- JSON
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- GeneratedContent table
CREATE TABLE IF NOT EXISTS GeneratedContent (
    ContentID TEXT PRIMARY KEY,
    TemplateID TEXT NOT NULL,
    Title TEXT,
    ContentData TEXT NOT NULL, -- JSON
    Status TEXT NOT NULL CHECK(Status IN ('Draft', 'Ready', 'Published')),
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TemplateID) REFERENCES Template(TemplateID) ON DELETE RESTRICT
);

-- ContentSources junction table
CREATE TABLE IF NOT EXISTS ContentSources (
    ContentID TEXT NOT NULL,
    TranscriptID TEXT NOT NULL,
    OrderIndex INTEGER NOT NULL,
    PRIMARY KEY (ContentID, TranscriptID),
    FOREIGN KEY (ContentID) REFERENCES GeneratedContent(ContentID) ON DELETE CASCADE,
    FOREIGN KEY (TranscriptID) REFERENCES Transcript(TranscriptID) ON DELETE CASCADE
);

-- ContentVersion table
CREATE TABLE IF NOT EXISTS ContentVersion (
    VersionID TEXT PRIMARY KEY,
    ContentID TEXT NOT NULL,
    VersionNumber INTEGER NOT NULL,
    VersionData TEXT NOT NULL, -- JSON
    ChangeSummary TEXT,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ContentID) REFERENCES GeneratedContent(ContentID) ON DELETE CASCADE,
    UNIQUE(ContentID, VersionNumber)
);

-- ExportHistory table
CREATE TABLE IF NOT EXISTS ExportHistory (
    ExportID TEXT PRIMARY KEY,
    ContentID TEXT NOT NULL,
    ExportFormat TEXT NOT NULL,
    ExportPath TEXT,
    ExportedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Platform TEXT,
    FOREIGN KEY (ContentID) REFERENCES GeneratedContent(ContentID) ON DELETE CASCADE
);

-- APIKey table
CREATE TABLE IF NOT EXISTS APIKey (
    KeyID TEXT PRIMARY KEY,
    ServiceName TEXT NOT NULL UNIQUE,
    EncryptedKey TEXT NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1,
    LastUsed DATETIME,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_folder ON File(FolderID);
CREATE INDEX IF NOT EXISTS idx_file_status ON File(Status);
CREATE INDEX IF NOT EXISTS idx_file_orientation ON File(Orientation);
CREATE INDEX IF NOT EXISTS idx_file_content_type ON File(ContentType);
CREATE INDEX IF NOT EXISTS idx_transcript_file ON Transcript(FileID);
CREATE INDEX IF NOT EXISTS idx_transcript_analyzed ON Transcript(AnalyzedAt);
CREATE INDEX IF NOT EXISTS idx_transcript_score ON Transcript(ContentScore);
CREATE INDEX IF NOT EXISTS idx_generated_content_template ON GeneratedContent(TemplateID);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON GeneratedContent(Status);
CREATE INDEX IF NOT EXISTS idx_content_version_content ON ContentVersion(ContentID);
CREATE INDEX IF NOT EXISTS idx_export_history_content ON ExportHistory(ContentID);
CREATE INDEX IF NOT EXISTS idx_api_key_service ON APIKey(ServiceName);

-- Create full-text search virtual table for transcripts
CREATE VIRTUAL TABLE IF NOT EXISTS TranscriptFTS USING fts5(
    TranscriptID UNINDEXED,
    Content,
    Summary,
    content=Transcript,
    content_rowid=rowid
);

-- Create triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS transcript_fts_insert AFTER INSERT ON Transcript
BEGIN
    INSERT INTO TranscriptFTS(TranscriptID, Content, Summary)
    VALUES (new.TranscriptID, new.Content, new.Summary);
END;

CREATE TRIGGER IF NOT EXISTS transcript_fts_update AFTER UPDATE ON Transcript
BEGIN
    UPDATE TranscriptFTS 
    SET Content = new.Content, Summary = new.Summary
    WHERE TranscriptID = new.TranscriptID;
END;

CREATE TRIGGER IF NOT EXISTS transcript_fts_delete AFTER DELETE ON Transcript
BEGIN
    DELETE FROM TranscriptFTS WHERE TranscriptID = old.TranscriptID;
END;

-- Create triggers for UpdatedAt timestamps
CREATE TRIGGER IF NOT EXISTS folder_updated_at AFTER UPDATE ON Folder
BEGIN
    UPDATE Folder SET UpdatedAt = CURRENT_TIMESTAMP WHERE FolderID = NEW.FolderID;
END;

CREATE TRIGGER IF NOT EXISTS file_updated_at AFTER UPDATE ON File
BEGIN
    UPDATE File SET UpdatedAt = CURRENT_TIMESTAMP WHERE FileID = NEW.FileID;
END;

CREATE TRIGGER IF NOT EXISTS descript_project_updated_at AFTER UPDATE ON DescriptProject
BEGIN
    UPDATE DescriptProject SET UpdatedAt = CURRENT_TIMESTAMP WHERE ProjectID = NEW.ProjectID;
END;

CREATE TRIGGER IF NOT EXISTS transcript_updated_at AFTER UPDATE ON Transcript
BEGIN
    UPDATE Transcript SET UpdatedAt = CURRENT_TIMESTAMP WHERE TranscriptID = NEW.TranscriptID;
END;

CREATE TRIGGER IF NOT EXISTS tag_updated_at AFTER UPDATE ON Tag
BEGIN
    UPDATE Tag SET UpdatedAt = CURRENT_TIMESTAMP WHERE TagID = NEW.TagID;
END;

CREATE TRIGGER IF NOT EXISTS template_updated_at AFTER UPDATE ON Template
BEGIN
    UPDATE Template SET UpdatedAt = CURRENT_TIMESTAMP WHERE TemplateID = NEW.TemplateID;
END;

CREATE TRIGGER IF NOT EXISTS generated_content_updated_at AFTER UPDATE ON GeneratedContent
BEGIN
    UPDATE GeneratedContent SET UpdatedAt = CURRENT_TIMESTAMP WHERE ContentID = NEW.ContentID;
END;

CREATE TRIGGER IF NOT EXISTS api_key_updated_at AFTER UPDATE ON APIKey
BEGIN
    UPDATE APIKey SET UpdatedAt = CURRENT_TIMESTAMP WHERE KeyID = NEW.KeyID;
END;