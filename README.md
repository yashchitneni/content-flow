# ContentFlow - AI-Powered Content Generation from Video Transcripts

A desktop application that transforms video transcripts into engaging social media content using AI.

## 🚀 Quick Start (For Instructors)

### Prerequisites
- **Node.js 18+** and npm installed
- **Git** installed
- **OpenAI API Key** (for AI content generation)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yashchitneni/content-flow.git
   cd content-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the app**
   - Navigate to http://localhost:5173 in your browser

### 🔑 Setting Up API Keys

1. Click **"Settings"** button in the app
2. Go to **"API Keys"** tab
3. Enter your **OpenAI API key**
4. Click **"Save"**
5. You should see a success alert and "Configured" badge

## 📋 Demo Features

### 1. **Content Studio** - AI Content Generation
- Import transcript files (.txt, .srt, .vtt)
- Select content template (Instagram, Twitter, LinkedIn, YouTube)
- Generate AI-powered content using LangGraph + GPT-4

### 2. **File Organizer** - Smart Video Organization
- Demonstrates automatic video organization by orientation
- Separates vertical (TikTok/Reels) from horizontal (YouTube) content
- Shows folder structure: `Year/Month/Orientation/`

### 3. **Settings** - Configuration
- Manage API keys
- View preferences and usage stats
- Configure file organization settings

## 🏗️ Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Tauri (Rust)
- **AI Workflow**: LangGraph (LangChain)
- **Database**: SQLite
- **Design System**: Atomic Design Pattern

## 📁 Project Structure

```
content-flow/
├── src/                    # React frontend
│   ├── components/         # UI components (atoms, molecules, organisms)
│   ├── screens/           # Main app screens
│   ├── workflows/         # LangGraph AI workflows
│   └── lib/              # Utilities and hooks
├── src-tauri/            # Rust backend
│   └── src/
│       ├── commands/     # Tauri IPC commands
│       └── db/          # Database schema
└── docs/                # Project documentation
```

## 🎯 Key Features Demonstrated

1. **Drag & Drop File Import** - Import video transcripts easily
2. **AI Content Generation** - Real GPT-4 powered content creation
3. **Multi-Platform Templates** - Instagram, Twitter, LinkedIn, YouTube
4. **Smart File Organization** - Automatic video categorization
5. **Secure API Key Storage** - Encrypted key management (production-ready)

## 🧪 Testing the Demo

1. **Test File Import**:
   - Click "Browse Files" or drag a .txt file
   - File should appear with green checkmark

2. **Test AI Generation**:
   - Select a template (e.g., Instagram)
   - Click "Generate Content"
   - Real AI-generated content appears in ~5 seconds

3. **Test File Organization**:
   - Click "File Organizer" tab
   - Click "Analyze Videos"
   - See smart categorization by orientation

## 🐛 Troubleshooting

- **Port 5173 in use**: Kill the process or use a different port
- **API Key not saving**: Check browser console for errors
- **No content generated**: Verify OpenAI API key is valid

## 📝 Notes for Instructors

- The app uses **LangGraph** for AI workflow orchestration (not n8n)
- API keys are stored in localStorage for demo (production uses encryption)
- File organization is currently demo-only (no actual file movement)
- All AI generation makes real API calls to OpenAI

## 🤝 Support

For issues or questions:
- GitHub Issues: https://github.com/yashchitneni/content-flow/issues
- Email: yashchitneni@gmail.com

---

Built with ❤️ for content creators who want to maximize their video content across all social platforms.