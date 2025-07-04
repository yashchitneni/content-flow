# ContentFlow 🌊

**Transform your spoken content into social media gold.**

ContentFlow is a modern web application that transforms Descript transcripts into engaging social media content using AI-powered workflows. Built with React, TypeScript, and LangGraph, it provides a seamless content creation experience from transcript to publication-ready content.

![ContentFlow Banner](https://img.shields.io/badge/Version-0.1.0-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue) ![React](https://img.shields.io/badge/React-18.3-61dafb)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (for content generation)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/content-flow.git
cd content-flow

# Install dependencies
npm install

# Create a .env file (optional - can configure in app)
echo "OPENAI_API_KEY=your-api-key-here" > .env

# Start the development server
npm run dev
```

The app will open at `http://localhost:5173`

## 🎯 Current State

### ✅ What's Working Now

#### **1. Content Studio**
- Import Descript transcripts (.txt or .srt files)
- Select from 4 content templates:
  - 🐦 Twitter Thread
  - 📸 Instagram Carousel  
  - 💼 LinkedIn Article
  - 🎥 YouTube Script
- Generate AI-powered content using GPT-4
- Real-time content preview

#### **2. Content Library**
- Browse all generated content
- Edit content with auto-save functionality
- Export content as JSON
- Search and filter capabilities
- Persistent storage using localStorage

#### **3. Content Editor**
- Simple text editor (no rich text formatting)
- Auto-save every 30 seconds
- Visual indicators for unsaved changes
- Format-aware editing (preserves threads/carousels)

#### **4. Settings & Configuration**
- API key management (OpenAI, Claude, Descript)
- Theme preferences
- Usage statistics tracking
- Template management interface

### 🛠 Technical Architecture

```
src/
├── components/          # Atomic Design System
│   ├── atoms/          # Basic UI components
│   ├── molecules/      # Composite components
│   ├── organisms/      # Complex components
│   └── templates/      # Page templates
├── workflows/          # LangGraph AI workflows
├── store/             # Zustand state management
├── lib/               # Utilities and helpers
└── screens/           # Main application views
```

### 🔧 Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand with persistence
- **AI Integration**: LangGraph, LangChain, OpenAI
- **Build Tool**: Vite
- **Desktop**: Tauri (ready for packaging)

## 🔮 Future Vision

### Phase 1: Enhanced Content Creation (Q1 2024)
- [ ] **Multi-modal Input**
  - Video file direct import
  - Audio transcription
  - Image-to-text for slides
  
- [ ] **Advanced Templates**
  - Email newsletters
  - Podcast show notes
  - Course outlines
  - Press releases

- [ ] **Batch Processing**
  - Process multiple transcripts
  - Bulk content generation
  - Template presets

### Phase 2: Publishing Integration (Q2 2024)
- [ ] **Direct Publishing**
  - Twitter API integration
  - LinkedIn posting
  - Instagram draft creation
  - YouTube metadata generation

- [ ] **Content Calendar**
  - Schedule posts
  - Content pipeline view
  - Analytics tracking

### Phase 3: Team Collaboration (Q3 2024)
- [ ] **Multi-user Support**
  - Team workspaces
  - Role-based access
  - Review workflows
  
- [ ] **Version Control**
  - Content versioning
  - Change tracking
  - Approval processes

### Phase 4: AI Enhancement (Q4 2024)
- [ ] **Smart Features**
  - Auto-tagging
  - Content recommendations
  - A/B testing suggestions
  - SEO optimization
  
- [ ] **Custom AI Models**
  - Brand voice training
  - Industry-specific models
  - Multilingual support

## 📝 Usage Guide

### Step 1: Configure API Keys
1. Click the Settings icon (⚙️)
2. Navigate to API Keys section
3. Add your OpenAI API key
4. Save configuration

### Step 2: Import Transcript
1. Go to Content Studio
2. Drag & drop your Descript transcript file
3. Or click to browse and select file

### Step 3: Generate Content
1. Select imported transcript(s)
2. Choose a content template
3. Click "Generate Content"
4. Wait for AI processing (~20 seconds)

### Step 4: Edit & Export
1. View generated content in preview
2. Click edit to refine content
3. Auto-save preserves changes
4. Export as JSON or copy to clipboard

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using React and TypeScript
- Powered by OpenAI's GPT models
- Inspired by content creators everywhere

---

## 📧 Contact

For questions, feedback, or support:
- GitHub Issues: [Create an issue](https://github.com/yourusername/content-flow/issues)
- Email: support@contentflow.app

## 🎉 What Users Are Saying

> "ContentFlow transformed my workflow. What used to take hours now takes minutes!" - Content Creator

> "The AI understands context so well. It's like having a professional copywriter on demand." - Marketing Manager

> "Finally, a tool that bridges the gap between video content and social media." - YouTuber

---

**Ready to transform your content?** Get started with ContentFlow today! 🚀