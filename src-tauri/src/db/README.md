# ContentFlow Database Schema

This directory contains the SQLite database schema implementation for ContentFlow.

## Structure

- `schema.rs` - Rust structs and enums representing database entities
- `connection.rs` - Database connection management and initialization
- `migrations.rs` - Migration runner for applying database schema updates
- `migrations/` - SQL migration files
  - `001_initial_schema.sql` - Initial database schema with all tables

## Key Features

1. **UUID Primary Keys**: All tables use TEXT UUID primary keys for better distributed compatibility
2. **Temporal Tracking**: All tables have `CreatedAt` and `UpdatedAt` fields that auto-populate
3. **Foreign Key Constraints**: Enforced relationships between tables
4. **Full-Text Search**: FTS5 virtual table for transcript search
5. **JSON Storage**: Flexible storage for templates and content data

## Tables

### Core Entities
- `File` - Video files imported into the system
- `Folder` - Organization structure for files
- `Transcript` - Transcribed content from videos
- `GeneratedContent` - AI-generated content from transcripts

### Supporting Tables
- `DescriptProject` - Batch transcription projects
- `Tag` - Topics extracted from transcripts
- `Template` - Content generation templates
- `ContentVersion` - Version history for content
- `ExportHistory` - Record of content exports
- `APIKey` - Encrypted storage for service credentials

### Junction Tables
- `ProjectFiles` - Links projects to files
- `TranscriptTags` - Links transcripts to tags
- `ContentSources` - Links generated content to source transcripts

## Testing

The schema has been validated to ensure:
- All tables create successfully
- Foreign key constraints work properly
- Triggers fire correctly for timestamp updates
- FTS5 indexes are created for search functionality

## Usage

The database is automatically initialized when the Tauri app starts:
1. Creates the app data directory if needed
2. Connects to SQLite database
3. Runs any pending migrations
4. Makes the database connection available to commands