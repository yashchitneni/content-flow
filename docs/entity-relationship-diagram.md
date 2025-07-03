Project: ContentFlow - AI-Powered Content Creation Studio
Version: 1.0
Date: January 7, 2025
Author: ContentFlow Database Design Team
1. Introduction
This Entity-Relationship Diagram (ERD) illustrates how entities such as videos, transcripts, projects, and generated content relate to each other within the ContentFlow system. This ERD provides a logical, technology-independent model of the data that will be translated into the SQLite database schema. The design supports the core workflow of importing videos, organizing them, transcribing through Descript, and generating social media content.
2. Key Components of the ERD
2.1. Entities
The ContentFlow system contains the following primary entities:

File: Video files imported into the system
Folder: Organized folder structure for files
DescriptProject: Projects created in Descript for batch transcription
Transcript: Transcribed content from video files
Tag: Topics and themes extracted from transcripts
Template: Content generation templates (carousel, thread, etc.)
GeneratedContent: Content created from transcripts using templates
ContentVersion: Version history for generated content
ExportHistory: Record of content exports
APIKey: Storage for external service credentials

2.2. Attributes
Each entity contains attributes that describe the data we store:
File Entity:

FileID (PK) - Unique identifier
FilePath - Current location on disk
OriginalName - Original filename
FileSize - Size in bytes
Duration - Video duration in seconds
Width - Video width in pixels
Height - Video height in pixels
Orientation - Calculated orientation (Horizontal/Vertical/Square)
ContentType - Estimated type (MainContent/BRoll/Tutorial)
CreatedAt - File creation timestamp
ImportedAt - When imported to ContentFlow
Status - Current status (Imported/Analyzing/Organized/Uploaded)

Transcript Entity:

TranscriptID (PK) - Unique identifier
FileID (FK) - Link to source video file
Content - Full transcript text
WordCount - Number of words
Language - Detected language
ImportedAt - When transcript was imported
AnalyzedAt - When AI analysis completed
ContentScore - AI-generated quality score
Summary - AI-generated summary

2.3. Relationships
Relationships describe how entities are associated:

A File belongs to one Folder (organization structure)
A File can be part of one DescriptProject
A File has zero or one Transcript
A Transcript can have many Tags
Many Transcripts can be used to create many GeneratedContent (many-to-many)
A GeneratedContent uses one Template
A GeneratedContent can have many ContentVersions
A GeneratedContent can have many ExportHistory records

3. Cardinality: Defining the Rules of Relationships
Using crow's foot notation to represent cardinality:

One-to-Many (1:N):

One Folder contains many Files
One DescriptProject contains many Files
One File has one Transcript
One Transcript has many TranscriptTags
One Template is used by many GeneratedContents
One GeneratedContent has many ContentVersions
One GeneratedContent has many ExportHistories


Many-to-Many (N:M):

Many Transcripts are used to create many GeneratedContents
Many Tags can be associated with many Transcripts



4. Complete ERD
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│     Folder      │          │ DescriptProject │          │  ProjectFiles   │
├─────────────────┤          ├─────────────────┤          ├─────────────────┤
│ FolderID (PK)   │          │ ProjectID (PK)  ├──<1--N>─┤ ProjectID (FK)  │
│ Path            │          │ ProjectName     │          │ FileID (FK)     │
│ FolderType      │          │ DescriptID      │          └───────┬─────────┘
│ CreatedAt       │          │ FileCount       │                  │N
└───────┬─────────┘          │ CreatedAt       │                  │
        │                    │ UploadedAt      │                  ▼1
        │1                   │ Status          │          ┌─────────────────┐
        │                    └─────────────────┘          │      File       │
        ▼N                                                 ├─────────────────┤
┌─────────────────────────────────────────────────────────┤ FileID (PK)     │
│                                                          │ FolderID (FK)   │◀┘
│                                                          │ FilePath        │
│                                                          │ OriginalName    │
│                                                          │ FileSize        │
│                                                          │ Duration        │
│                                                          │ Width           │
│                                                          │ Height          │
│                                                          │ Orientation     │
│                                                          │ ContentType     │
│                                                          │ CreatedAt       │
│                                                          │ ImportedAt      │
│                                                          │ Status          │
│                                                          └────────┬────────┘
│                                                                   │1
│                                                                   ▼0..1
│                                                          ┌─────────────────┐
│                                                          │   Transcript    │
│                                                          ├─────────────────┤
│                                                          │ TranscriptID(PK)│
│                                                          │ FileID (FK)     │
│                                                          │ Content         │
│                                                          │ WordCount       │
│                                                          │ Language        │
│                                                          │ ImportedAt      │
│                                                          │ AnalyzedAt      │
│                                                          │ ContentScore    │
│                                                          │ Summary         │
│                                                          └────────┬────────┘
│                                                                   │1
│                                                                   ▼N
│                             ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                             │ TranscriptTags  │         │      Tag        │         │                 │
│                             ├─────────────────┤         ├─────────────────┤         │                 │
│                             │TranscriptID(FK) ├─N>------┤ TagID (PK)      │         │                 │
│                             │ TagID (FK)      │         │ TagName         │         │                 │
│                             │ Relevance       │         │ Category        │         │                 │
│                             └─────────────────┘         └─────────────────┘         │                 │
│                                                                                      │                 │
│                             ┌─────────────────┐                                     │                 │
│                             │ ContentSources  │                                     │                 │
│                             ├─────────────────┤                                     │                 │
│                             │ ContentID (FK)  ├─────────────────────────────────N>──┤                 │
│                             │TranscriptID(FK) ├─N>──────────────────────────────────┘                 │
│                             │ OrderIndex      │                                                        │
│                             └─────────────────┘                                                        │
│                                                                                                        │
│        ┌─────────────────┐         ┌─────────────────┐                                               │
│        │GeneratedContent │         │    Template     │                                               │
│        ├─────────────────┤         ├─────────────────┤                                               │
│        │ ContentID (PK)  ├─N>──────┤ TemplateID (PK) │                                               │
│        │ TemplateID (FK) │         │ TemplateName    │                                               │
│        │ Title           │         │ TemplateType    │                                               │
│        │ ContentData     │         │ Structure       │                                               │
│        │ Status          │         │ Constraints     │                                               │
│        │ CreatedAt       │         │ CreatedAt       │                                               │
│        │ UpdatedAt       │         └─────────────────┘                                               │
│        └────────┬────────┘◀───────────────────────────────────────────────────────────────────────────┘
│                 │1
│                 ▼N
│        ┌─────────────────┐         ┌─────────────────┐
│        │ ContentVersion  │         │  ExportHistory  │
│        ├─────────────────┤         ├─────────────────┤
│        │ VersionID (PK)  │         │ ExportID (PK)   │
│        │ ContentID (FK)  ├─1>──────┤ ContentID (FK)  │
│        │ VersionNumber   │         │ ExportFormat    │
│        │ VersionData     │         │ ExportPath      │
│        │ ChangeSummary   │         │ ExportedAt      │
│        │ CreatedAt       │         │ Platform        │
│        └─────────────────┘         └─────────────────┘
│
│        ┌─────────────────┐
│        │     APIKey      │
│        ├─────────────────┤
│        │ KeyID (PK)      │
│        │ ServiceName     │
│        │ EncryptedKey    │
│        │ IsActive        │
│        │ LastUsed        │
│        │ CreatedAt       │
└────────┴─────────────────┘
5. Resolved Many-to-Many Relationships
TranscriptTags (Junction Table)

Resolves the many-to-many relationship between Transcripts and Tags
Primary Key: Composite of TranscriptID + TagID
Additional attribute: Relevance (score indicating tag importance)

ContentSources (Junction Table)

Resolves the many-to-many relationship between Transcripts and GeneratedContent
Primary Key: Composite of ContentID + TranscriptID
Additional attribute: OrderIndex (order of transcripts used)

ProjectFiles (Junction Table)

Resolves the relationship between DescriptProjects and Files
Primary Key: Composite of ProjectID + FileID

6. Complete Attribute Definitions
File
FileID          TEXT PRIMARY KEY (UUID)
FolderID        TEXT (FK)
FilePath        TEXT NOT NULL
OriginalName    TEXT NOT NULL
FileSize        INTEGER NOT NULL
Duration        REAL
Width           INTEGER
Height          INTEGER
Orientation     TEXT CHECK(Orientation IN ('Horizontal','Vertical','Square','Other'))
ContentType     TEXT CHECK(ContentType IN ('MainContent','BRoll','Tutorial','Unknown'))
CreatedAt       DATETIME
ImportedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
Status          TEXT CHECK(Status IN ('Imported','Analyzing','Organized','Uploaded'))
Transcript
TranscriptID    TEXT PRIMARY KEY (UUID)
FileID          TEXT NOT NULL (FK)
Content         TEXT NOT NULL
WordCount       INTEGER
Language        TEXT DEFAULT 'en'
ImportedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
AnalyzedAt      DATETIME
ContentScore    REAL CHECK(ContentScore >= 0 AND ContentScore <= 1)
Summary         TEXT
GeneratedContent
ContentID       TEXT PRIMARY KEY (UUID)
TemplateID      TEXT NOT NULL (FK)
Title           TEXT
ContentData     TEXT NOT NULL (JSON)
Status          TEXT CHECK(Status IN ('Draft','Ready','Published'))
CreatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
UpdatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
Template
TemplateID      TEXT PRIMARY KEY (UUID)
TemplateName    TEXT NOT NULL UNIQUE
TemplateType    TEXT CHECK(TemplateType IN ('carousel','thread','article','script'))
Structure       TEXT NOT NULL (JSON)
Constraints     TEXT (JSON)
CreatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
7. Key Design Decisions

UUID Primary Keys: Using TEXT UUIDs instead of INTEGER for better distributed system compatibility
JSON Storage: ContentData and Structure stored as JSON for flexibility in template formats
Soft Relationships: File paths stored rather than binary data for efficient storage
Temporal Tracking: Multiple timestamp fields to track workflow progression
Flexible Tagging: Many-to-many tags allow rich categorization
Version Control: ContentVersion table maintains edit history
Security: APIKey table uses encrypted storage for sensitive credentials

This ERD provides a robust foundation for the ContentFlow database, supporting all identified workflows while maintaining flexibility for future enhancements.RetryClaude can make mistakes. Please double-check responses.