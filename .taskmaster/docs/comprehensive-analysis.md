# ContentFlow Documentation Analysis

## 1. Functional Requirements Analysis (FR-001 to FR-060)

### File Manager Requirements (FR-001 to FR-010)
- **FR-001**: Drag-drop zone accepting .mp4, .mov, .avi, .mkv
- **FR-002**: Visual feedback on valid file drag (highlight effect)
- **FR-003**: Reject non-video files with error message
- **FR-004**: File browser dialog filtered for video formats
- **FR-005**: Auto-detect SD card and import from DCIM
- **FR-006**: Display imported files with metadata
- **FR-007**: Import history showing last 10 batches
- **FR-008**: Watch folder for automatic import
- **FR-009**: FFmpeg validation for file integrity
- **FR-010**: Progress bar showing "X of Y files imported"

### Organization Hub Requirements (FR-011 to FR-020)
- **FR-011**: FFmpeg analysis for metadata extraction
- **FR-012**: Categorize by orientation (16:9, 9:16, 1:1, Other)
- **FR-013**: Content type estimation (Main Content, B-Roll, Tutorial, Unknown)
- **FR-014**: Create folder structure ~/ContentFlow/[YYYY]/[MM]/[Orientation]/
- **FR-015**: Real-time analysis progress indicators
- **FR-016**: Generate Descript project groupings
- **FR-017**: Allow modification of organization plan
- **FR-018**: Move files maintaining metadata
- **FR-019**: Create batch upload configurations
- **FR-020**: Display summary with file counts

### Descript Integration Requirements (FR-021 to FR-030)
- **FR-021**: OAuth 2.0 authentication
- **FR-022**: Project naming "[Month] [Year] - [Type]"
- **FR-023**: Batch upload (max 20 files)
- **FR-024**: Upload progress percentage display
- **FR-025**: Store Descript project IDs
- **FR-026**: Monitor export folder for transcripts
- **FR-027**: Auto-import .txt/.srt files
- **FR-028**: Match transcripts to videos by filename
- **FR-029**: Retry failed uploads (3x, exponential backoff)
- **FR-030**: Notify on transcript detection/import

### Transcript Library Requirements (FR-031 to FR-040)
- **FR-031**: Searchable list with title, date, duration
- **FR-032**: Full-text search with highlighting
- **FR-033**: Auto-extract tags from frequent topics
- **FR-034**: Filter by date, tags, duration, rating
- **FR-035**: Tag cloud visualization
- **FR-036**: Content potential analysis (Thread/Carousel/Blog ratings)
- **FR-037**: Show related transcripts with similarity %
- **FR-038**: 1-5 star rating system
- **FR-039**: Extract key points and quotable moments
- **FR-040**: Multi-selection for batch operations

### Content Studio Requirements (FR-041 to FR-050)
- **FR-041**: Select multiple transcripts as source
- **FR-042**: Template options (Carousel, Thread, Article, Script)
- **FR-043**: LangGraph analysis and generation
- **FR-044**: Editable preview matching template
- **FR-045**: Template-specific editing tools
- **FR-046**: Enforce platform constraints
- **FR-047**: Regenerate with different parameters
- **FR-048**: Auto-save drafts every 30 seconds
- **FR-049**: AI suggestions for engagement
- **FR-050**: Edit history with undo/redo

### Export & Settings Requirements (FR-051 to FR-060)
- **FR-051**: Export carousels as PNG images
- **FR-052**: Export threads with formatting preserved
- **FR-053**: Copy to clipboard with platform formatting
- **FR-054**: ZIP package for all assets
- **FR-055**: Track content status (Draft/Ready/Published)
- **FR-056**: Store/validate API keys
- **FR-057**: Configure default templates
- **FR-058**: Brand settings (colors, fonts, logos)
- **FR-059**: File organization patterns
- **FR-060**: API usage statistics and quotas

## 2. User Flow Analysis (UF-001 to UF-007)

### Core User Flows
- **UF-001**: Video Import Flow - Drag/drop to successful import
- **UF-002**: Automatic Video Organization - Analysis and folder structure
- **UF-003**: Batch Upload to Descript - Project creation and upload
- **UF-004**: Transcript Import - Detection and import process
- **UF-005**: Search and Discovery - Finding relevant transcripts
- **UF-006**: Multi-Transcript Content Creation - Generation workflow
- **UF-007**: Export Generated Content - Format selection and export

### Key Decision Points
- File type validation on import
- API authentication checks before operations
- Content length limits for templates
- Export format selection based on assets

### Error Flows (UF-ERR-001 to UF-ERR-009)
- Invalid file types rejected with clear messaging
- Auth failures redirect to settings
- Generation timeouts offer retry options
- Upload failures trigger automatic retry

### Performance Requirements
- File import: < 500ms per file
- FFmpeg analysis: < 2s per file
- Descript upload: < 30s per file
- Content generation: < 30s
- Search results: < 200ms

## 3. Database Entity Analysis

### Primary Entities
1. **File**
   - UUID primary key
   - Metadata: path, size, duration, dimensions
   - Status tracking through workflow
   - Relationships: Folder (N:1), DescriptProject (N:1), Transcript (1:1)

2. **Transcript**
   - Links to single file
   - Full text content with word count
   - AI-generated scores and summaries
   - Many-to-many with tags

3. **GeneratedContent**
   - Template-based structure
   - JSON storage for flexible content
   - Version history tracking
   - Many-to-many with source transcripts

### Junction Tables
- **TranscriptTags**: Links transcripts to tags with relevance scores
- **ContentSources**: Links generated content to source transcripts
- **ProjectFiles**: Links Descript projects to files

### Key Design Decisions
- UUID primary keys for distributed compatibility
- JSON fields for flexible content storage
- Temporal tracking on all major entities
- Encrypted storage for API credentials

## 4. UI Component Analysis

### Design Token Foundation
- **Colors**: Primary blue (#0066FF), semantic colors for states
- **Typography**: Inter font family, 8-level scale (12px to 36px)
- **Spacing**: 4px base unit, consistent multipliers
- **Shadows**: 5 elevation levels
- **Animation**: 3 duration presets (150ms, 300ms, 500ms)

### Component Hierarchy
1. **Atoms**: Button, Input, Badge, Icon, etc.
2. **Molecules**: FormField, SearchBar, FileItem, DropZone
3. **Organisms**: Navigation, FileList, TranscriptCard, ContentEditor
4. **Templates**: SidebarLayout, SplitView, FullScreenWizard
5. **Pages**: FileManager, TranscriptLibrary, ContentStudio

### Critical UI Patterns
- **DropZone**: Dashed border → Highlight on hover → Pulsing on active
- **Buttons**: 6 variants with consistent state handling
- **FileItem**: Icon + metadata + status indicators
- **TranscriptCard**: Preview + tags + action buttons

### Implementation Rules
- ALL styles must use design tokens
- Components follow strict state hierarchy
- Responsive behavior required
- Minimum 44px touch targets

## 5. System Architecture Analysis

### Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri
- **Database**: SQLite
- **Workflows**: LangGraph
- **APIs**: Descript, OpenAI/Claude

### Architecture Pattern
- Event-driven with clear separation
- Tauri IPC bridge for frontend/backend communication
- Local-first with external API integrations

### Key Components
1. **File Manager**: FFmpeg analysis, smart organization
2. **Descript Integration**: OAuth, batch uploads, monitoring
3. **LangGraph Orchestration**: Content analysis and generation
4. **Content Studio**: Interactive editing with templates

### Deployment Structure
```
ContentFlow.app/
├── Tauri Runtime (WKWebView)
├── React UI
└── Rust Backend

~/Library/Application Support/ContentFlow/
├── contentflow.db
├── organized/
└── exports/
```

## Task Implementation Priorities

### Critical Path (Must Have - 4 day timeline)
1. Basic file import and display (FR-001, FR-006)
2. FFmpeg analysis and organization (FR-011, FR-014)
3. Descript authentication and upload (FR-021, FR-023)
4. Transcript import and storage (FR-027, FR-028)
5. Basic content generation with one template (FR-041, FR-043)
6. Simple export functionality (FR-051 or FR-052)

### High Priority (Should Have)
- Full search functionality (FR-032)
- Multiple template support (FR-042)
- Auto-save and version history (FR-048, FR-050)
- Progress indicators for all operations

### Medium Priority (Nice to Have)
- Tag extraction and filtering (FR-033, FR-034)
- Content quality scoring (FR-036)
- Advanced organization options (FR-017)
- Brand customization (FR-058)

### Implementation Dependencies
1. Database schema must be implemented before any data operations
2. Tauri command structure needed before UI can communicate
3. Design tokens must be set up before any UI components
4. FFmpeg integration required for video analysis
5. API clients needed before external integrations

## Success Criteria
- Import and organize 100 files in < 5 minutes
- Search response < 200ms
- Content generation < 30 seconds
- Zero data loss guaranteed
- Native macOS experience

This analysis provides the foundation for creating detailed, cross-referenced tasks that follow the ContentFlow documentation structure and requirements.