-- ContentFlow Custom Templates Migration
-- Version: 2.0
-- Date: January 3, 2025
-- Description: Update Template table to support user-created templates

-- Drop the existing Template table to modify constraints
DROP TABLE IF EXISTS Template;

-- Recreate Template table with updated schema
CREATE TABLE IF NOT EXISTS Template (
    TemplateID TEXT PRIMARY KEY,
    TemplateName TEXT NOT NULL UNIQUE,
    TemplateType TEXT NOT NULL, -- Removed CHECK constraint to allow custom types
    Description TEXT, -- New field for template description
    Prompt TEXT NOT NULL, -- Renamed from Structure, changed to TEXT
    Constraints TEXT, -- JSON for platform-specific constraints
    IsDefault BOOLEAN NOT NULL DEFAULT 0, -- New field to distinguish system vs user templates
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Recreate the index
CREATE INDEX IF NOT EXISTS idx_generated_content_template ON GeneratedContent(TemplateID);

-- Recreate the trigger for UpdatedAt
CREATE TRIGGER IF NOT EXISTS template_updated_at AFTER UPDATE ON Template
BEGIN
    UPDATE Template SET UpdatedAt = CURRENT_TIMESTAMP WHERE TemplateID = NEW.TemplateID;
END;

-- Insert default system templates
INSERT INTO Template (TemplateID, TemplateName, TemplateType, Description, Prompt, Constraints, IsDefault) VALUES
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