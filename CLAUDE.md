Project Overview
ContentFlow is a macOS desktop application that automates the content creation workflow from video file ingestion to social media-ready content. Built with Tauri (Rust + React), it integrates with Descript for transcription and uses LangGraph for AI-powered content generation.
Core Documentation Reference
This project uses a comprehensive documentation system. Claude Task Master should reference these docs based on task context:
Architecture & Database

System Architecture: /docs/system-architecture.md - Reference for all architectural decisions, component interactions, and deployment
Entity Relationships: /docs/entity-relationship-diagram.md - Reference for database schema, relationships, and data modeling tasks

Features & Workflows

Functional Requirements: /docs/functional-requirements.md - Reference for all feature implementations and business logic
User Flows: /docs/user-flow.md - Reference for user interactions, state management, and navigation patterns

UI Development

Atomic Design System: /docs/atomic-design-system.md - CRITICAL: Reference for ALL UI component development, styling, and design tokens

Task Context Mapping
When creating tasks, apply these context rules:
UI/Frontend Tasks

MUST reference atomic-design-system.md for:

Component creation (atoms, molecules, organisms)
Design token usage (colors, spacing, typography)
State definitions and interactions
File organization structure



Backend/Database Tasks

MUST reference entity-relationship-diagram.md for:

Database operations
Schema modifications
Data relationships
Query optimization



Feature Implementation Tasks

MUST reference functional-requirements.md AND user-flow.md for:

New feature development
User interaction implementation
State management
Error handling



Full-Stack Tasks

Reference ALL relevant docs in order:

system-architecture.md - Overall structure
user-flow.md - User journey
functional-requirements.md - Specific requirements
entity-relationship-diagram.md - Data layer
atomic-design-system.md - UI implementation



Project Structure
contentflow/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── commands/   # Tauri command handlers
│   │   ├── db/         # Database operations
│   │   └── services/   # External integrations
├── src/                # React frontend
│   ├── components/     # Atomic design structure
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   ├── screens/        # Page components
│   ├── workflows/      # LangGraph implementations
│   └── lib/            # Utilities and helpers
└── docs/               # Project documentation
Tech Stack Reference

Frontend: React + TypeScript + Tailwind CSS
Backend: Rust + Tauri
Database: SQLite
AI/Workflows: LangGraph
External APIs: Descript, OpenAI/Claude
Package Manager: npm/pnpm

Development Workflow
For New Features

Check functional requirements for FR-XXX references
Review user flow for UF-XXX patterns
Check ERD for data implications
Follow atomic design for UI components

For UI Components

ALWAYS use design tokens from atomic-design-system.md
Follow the component hierarchy (atoms → molecules → organisms)
Include all required states (default, hover, focus, disabled, error)
Use the file structure defined in section 8

For Database Operations

Reference the ERD for table relationships
Use the defined cardinalities (1:N, N:M)
Follow the UUID primary key pattern
Maintain temporal tracking fields

Task Master Configuration
CRITICAL Task Management Rules
Task Status Updates: ALWAYS use Task Master to update task statuses when completing work
Task References: EVERY code change MUST reference the relevant task ID from Task Master
Status Flow: pending → in-progress → done (or blocked/deferred if issues arise)
Completion Criteria: A task is ONLY marked as done when ALL acceptance criteria are met

PRD Generation Rules
When generating PRDs, the task master should:

Cross-reference existing requirements: Check if the task relates to existing FR-XXX or UF-XXX items
Include design system references: For UI tasks, specify which atoms/molecules/organisms to use
Specify data implications: Reference relevant entities from the ERD
Define success criteria: Based on the functional requirements' success metrics
Update task status: Mark tasks as in-progress when starting, done when completed

Task Templates
UI Component Task Template
Task: [Component Name]
Type: UI Component
Level: [Atom|Molecule|Organism]
References: 
- Design System: Section X.X from atomic-design-system.md
- User Flow: UF-XXX
- Functional Req: FR-XXX

Requirements:
- [ ] Follow design token system
- [ ] Implement all visual states
- [ ] Include responsive behavior
- [ ] Add to Storybook
- [ ] Write unit tests
Feature Implementation Task Template
Task: [Feature Name]
References:
- User Flow: UF-XXX
- Functional Requirements: FR-XXX through FR-XXX
- Database Tables: [List from ERD]
- UI Components: [List from design system]

Implementation Steps:
1. Backend: [Rust commands/services needed]
2. Database: [Schema updates if any]
3. Frontend: [Components and screens]
4. Integration: [API connections]
Code Conventions
File Naming

Components: PascalCase (e.g., TranscriptCard.tsx)
Utilities: camelCase (e.g., formatDuration.ts)
Types: PascalCase with .types.ts suffix
Styles: .styles.ts suffix for styled components

Component Structure
typescript// Follow atomic design component structure
interface ComponentProps {
  // Props with proper TypeScript types
}

export const ComponentName: React.FC<ComponentProps> = (props) => {
  // Implementation following design system patterns
};
State Management

Use Zustand for global state
Keep component state local when possible
Follow the state management rules from atomic design doc

Current Development Phase
Building MVP for 4-day timeline focusing on:

File import and organization (FR-001 to FR-020)
Descript integration (FR-021 to FR-030)
Basic transcript library (FR-031 to FR-040)
Simple content generation (FR-041 to FR-050)

Important Notes

This is a macOS-only application
Requires internet connection (no offline mode initially)
4-day development timeline - focus on core features
Personal productivity tool - optimize for single user

Task Master Integration
When using Claude Task Master:

It should read this file first for context
Reference the appropriate documentation based on task type
Generate PRDs that align with existing requirements
Maintain consistency with the established patterns
Update this file when new patterns emerge

Remember: Every task should reference at least one documentation file for context.

Task Master Integration Rules

BEFORE starting any development work:
- Check task status in Task Master (mcp__task-master-ai__get_task)
- Update task status to "in-progress" (mcp__task-master-ai__set_task_status)
- Reference the task ID in all commits and code comments

DURING development:
- Add comments referencing task ID (e.g., // Task #1: Initialize project)
- Update task details if new information discovered (mcp__task-master-ai__update_task)
- Create subtasks if task needs breakdown (mcp__task-master-ai__add_subtask)

AFTER completing work:
- Verify ALL acceptance criteria are met
- Update task status to "done" (mcp__task-master-ai__set_task_status)
- Document any deviations or additional work done

Git Commit Messages:
- Format: "Task #[ID]: [Brief description]"
- Example: "Task #1: Initialize Tauri + React project structure"

Task Master Discovery Notes:
- Task Master can successfully read task lists using mcp__task-master-ai__get_tasks
- Individual task retrieval with mcp__task-master-ai__get_task requires exact task ID string match
- When Task Master initialization creates tasks, use mcp__task-master-ai__get_tasks to view all tasks
- If mcp__task-master-ai__get_task fails for a visible task ID, work directly from task data from get_tasks
- mcp__task-master-ai__next_task provides best task to work on next based on dependencies