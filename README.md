# ContentFlow - AI-Powered Desktop App for Content Creation

A native macOS desktop application that transforms video transcripts into engaging social media content using AI.

## 🚀 Quick Start (For Instructors)

### Prerequisites
- **macOS 10.15+** (Catalina or newer)
- **Node.js 18+** and npm installed
- **Rust** (will be installed automatically if needed)
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

3. **Run the desktop app**
   ```bash
   npm run tauri dev
   ```
   
   This will:
   - Build the Rust backend (first run takes ~2-3 minutes)
   - Launch the ContentFlow desktop application
   - Open as a native macOS window (not in browser)

### 🔑 Setting Up API Keys

1. In the desktop app, click **"Settings"** button
2. Go to **"API Keys"** tab
3. Enter your **OpenAI API key**
4. Click **"Save"**
5. You should see a success alert and "Configured" badge

## 📋 Demo Features

### 1. **Content Studio** - AI Content Generation
- Import transcript files (.txt, .srt, .vtt) from your Mac
- Select content template (Instagram, Twitter, LinkedIn, YouTube)
- Generate AI-powered content using LangGraph + GPT-4
- Export content for each platform

### 2. **File Organizer** - Smart Video Organization
- Demonstrates automatic video organization by orientation
- Separates vertical (TikTok/Reels) from horizontal (YouTube) content
- Shows folder structure: `~/ContentFlow/2025/01/Orientation/`
- Simulates how videos would be organized on your Mac

### 3. **Settings** - Configuration
- Manage API keys (stored securely on your Mac)
- View preferences and usage stats
- Configure file organization settings

## 🏗️ Technology Stack

- **Desktop Framework**: Tauri (Rust + WebView)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust (native macOS performance)
- **AI Workflow**: LangGraph (LangChain)
- **Database**: SQLite (local storage)
- **Platform**: macOS native application

## 📁 Project Structure

```
content-flow/
├── src/                    # React frontend
│   ├── components/         # UI components (atoms, molecules, organisms)
│   ├── screens/           # Main app screens
│   ├── workflows/         # LangGraph AI workflows
│   └── lib/              # Utilities and hooks
├── src-tauri/            # Rust backend (desktop app logic)
│   └── src/
│       ├── commands/     # Native OS commands
│       └── db/          # Local SQLite database
└── docs/                # Project documentation
```

## 🎯 Key Features Demonstrated

1. **Native File Access** - Direct access to Mac file system
2. **Drag & Drop** - Native macOS drag & drop support
3. **AI Content Generation** - Real GPT-4 powered content creation
4. **Local Database** - All data stored locally on your Mac
5. **Secure Storage** - API keys encrypted in local storage

## 🧪 Testing the Demo

1. **Test Native File Import**:
   - Drag a .txt file from Finder into the app
   - Or click "Browse Files" to use native file picker
   - File should appear with green checkmark

2. **Test AI Generation**:
   - Import a transcript file
   - Select a template (e.g., Instagram)
   - Click "Generate Content"
   - Real AI-generated content appears in ~5 seconds

3. **Test File Organization**:
   - Click "File Organizer" tab
   - Click "Analyze Videos"
   - See smart categorization preview (demo mode)

## 🐛 Troubleshooting

- **App won't start**: Make sure you're using `npm run tauri dev` not just `npm run dev`
- **Rust compilation errors**: Run `rustup update` to update Rust
- **"Tauri not found"**: The first run installs Tauri CLI automatically
- **API Key not saving**: Check Console.app for any errors
- **White screen**: Wait for Rust compilation to complete (first run only)

## 🏃‍♂️ Alternative: Web Preview Mode

If you have issues with the desktop app, you can preview the UI in a browser:
```bash
npm run dev
```
Then open http://localhost:5173 (Note: Some native features won't work in browser mode)

## 📝 Notes for Instructors

- This is a **native macOS desktop app**, not a web application
- Uses **Tauri** for native OS integration (like Electron but faster/smaller)
- The app uses **LangGraph** for AI workflow orchestration
- All data is stored locally on the user's Mac
- File organization is currently demo-only (no actual file movement)
- Real API calls to OpenAI when API key is provided

## 🚀 Building for Distribution

To create a distributable .app file:
```bash
npm run tauri build
```
The .app file will be in `src-tauri/target/release/bundle/macos/`

## 🤝 Support

For issues or questions:
- GitHub Issues: https://github.com/yashchitneni/content-flow/issues
- Email: yashchitneni@gmail.com

---

Built with ❤️ for content creators who want to maximize their video content across all social platforms, with the power and performance of a native macOS app.