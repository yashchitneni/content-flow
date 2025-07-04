-- ContentFlow Custom Templates Migration
-- Version: 2.0
-- Date: January 3, 2025
-- Description: Update Template table to support user-created templates

-- First, drop tables that depend on Template
DROP TABLE IF EXISTS ContentSources;
DROP TABLE IF EXISTS ContentVersion;
DROP TABLE IF EXISTS ExportHistory;
DROP TABLE IF EXISTS GeneratedContent;

-- Drop the existing Template table to modify constraints
DROP TABLE IF EXISTS Template;

-- Recreate Template table with updated schema
CREATE TABLE IF NOT EXISTS Template (
    template_id TEXT PRIMARY KEY,
    template_name TEXT NOT NULL UNIQUE,
    template_type TEXT NOT NULL, -- Removed CHECK constraint to allow custom types
    description TEXT, -- New field for template description
    prompt TEXT NOT NULL, -- Renamed from Structure, changed to TEXT
    constraints TEXT, -- JSON for platform-specific constraints
    is_default BOOLEAN NOT NULL DEFAULT 0, -- New field to distinguish system vs user templates
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Recreate the trigger for updated_at
CREATE TRIGGER IF NOT EXISTS template_updated_at AFTER UPDATE ON Template
BEGIN
    UPDATE Template SET updated_at = CURRENT_TIMESTAMP WHERE template_id = NEW.template_id;
END;

-- Recreate GeneratedContent table with updated foreign key
CREATE TABLE IF NOT EXISTS GeneratedContent (
    content_id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    title TEXT,
    content_data TEXT NOT NULL, -- JSON
    status TEXT NOT NULL CHECK(status IN ('Draft', 'Ready', 'Published')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES Template(template_id) ON DELETE RESTRICT
);

-- Recreate ContentSources junction table
CREATE TABLE IF NOT EXISTS ContentSources (
    content_id TEXT NOT NULL,
    transcript_id TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    PRIMARY KEY (content_id, transcript_id),
    FOREIGN KEY (content_id) REFERENCES GeneratedContent(content_id) ON DELETE CASCADE,
    FOREIGN KEY (transcript_id) REFERENCES Transcript(TranscriptID) ON DELETE CASCADE
);

-- Recreate ContentVersion table
CREATE TABLE IF NOT EXISTS ContentVersion (
    version_id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    version_data TEXT NOT NULL, -- JSON
    change_summary TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES GeneratedContent(content_id) ON DELETE CASCADE,
    UNIQUE(content_id, version_number)
);

-- Recreate ExportHistory table
CREATE TABLE IF NOT EXISTS ExportHistory (
    export_id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    export_format TEXT NOT NULL,
    export_path TEXT,
    exported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    platform TEXT,
    FOREIGN KEY (content_id) REFERENCES GeneratedContent(content_id) ON DELETE CASCADE
);

-- Recreate indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_generated_content_template ON GeneratedContent(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON GeneratedContent(status);
CREATE INDEX IF NOT EXISTS idx_content_version_content ON ContentVersion(content_id);
CREATE INDEX IF NOT EXISTS idx_export_history_content ON ExportHistory(content_id);

-- Recreate trigger for GeneratedContent
CREATE TRIGGER IF NOT EXISTS generated_content_updated_at AFTER UPDATE ON GeneratedContent
BEGIN
    UPDATE GeneratedContent SET updated_at = CURRENT_TIMESTAMP WHERE content_id = NEW.content_id;
END;

-- Insert default system templates
INSERT INTO Template (template_id, template_name, template_type, description, prompt, constraints, is_default) VALUES
(
    'default-thread',
    'Twitter/X Thread',
    'thread',
    'Create an engaging Twitter/X thread from your transcript',
    'Create a Twitter/X thread based on the following transcript content. Extract the key insights and transform them into an engaging thread.

Use these placeholders in your content:
{{summary}} - The transcript summary
{{key_points}} - Main points from the transcript
{{content}} - The full transcript content

Thread Requirements:
- Start with a compelling hook
- Break down complex ideas into simple tweets
- Use numbered format (1/n)
- End with a clear call-to-action',
    '{"maxTweets": 10, "charsPerTweet": 280, "style": "conversational, engaging"}',
    1
),
(
    'default-carousel',
    'Instagram Carousel',
    'carousel',
    'Transform your content into a visual Instagram carousel',
    'Create an Instagram carousel post based on the following transcript content. Transform the key points into visually engaging slides.

Use these placeholders:
{{summary}} - The transcript summary
{{key_points}} - Main points from the transcript
{{content}} - The full transcript content

Carousel Requirements:
- Create compelling slide titles
- Keep text concise and punchy
- Suggest visual elements for each slide
- Include a strong caption',
    '{"maxSlides": 10, "charsPerSlide": 150, "captionLength": 2200, "style": "visual, punchy"}',
    1
),
(
    'default-article',
    'LinkedIn Article',
    'article',
    'Write a professional LinkedIn article from your content',
    'Create a LinkedIn article based on the following transcript content. Expand on the key themes and insights in a professional tone.

Use these placeholders:
{{summary}} - The transcript summary
{{key_points}} - Main points from the transcript
{{content}} - The full transcript content

Article Requirements:
- Professional yet conversational tone
- Include relevant industry insights
- Structure with clear sections
- End with thought-provoking questions',
    '{"minWords": 800, "maxWords": 2000, "style": "professional, insightful"}',
    1
),
(
    'default-script',
    'YouTube Script',
    'script',
    'Convert your transcript into an engaging YouTube script',
    'Create a YouTube video script based on the following transcript content. Structure it for engaging video delivery.

Use these placeholders:
{{summary}} - The transcript summary
{{key_points}} - Main points from the transcript
{{content}} - The full transcript content

Script Requirements:
- Attention-grabbing intro (first 15 seconds)
- Clear structure with timestamps
- Include b-roll suggestions
- Strong CTA and end screen prompts',
    '{"targetDuration": "5-10 minutes", "style": "conversational, structured"}',
    1
);