# ContentFlow

AI-Powered Content Creation Studio built with Tauri, React, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Rust (latest stable)
- macOS 10.15 or higher

### Installation
```bash
npm install
```

### Development
```bash
# Run the Tauri development server
npm run tauri:dev

# Run only the web development server
npm run dev
```

### Build
```bash
# Build for production
npm run tauri:build
```

## Project Structure

```
contentflow/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   └── main.rs     # Main Tauri application
│   ├── Cargo.toml      # Rust dependencies
│   └── tauri.conf.json # Tauri configuration
├── src/                # React frontend
│   ├── components/     # Atomic design structure
│   │   ├── atoms/      # Basic UI elements
│   │   ├── molecules/  # Composite components
│   │   ├── organisms/  # Complex components
│   │   └── templates/  # Page layouts
│   ├── screens/        # Page components
│   ├── tokens/         # Design tokens
│   ├── workflows/      # LangGraph implementations
│   └── lib/            # Utilities and helpers
└── docs/               # Project documentation
```

## Atomic Design System

The project follows atomic design principles with a comprehensive design token system:

- **Design Tokens**: Located in `src/tokens/`
- **Components**: Organized in `src/components/` following atomic hierarchy
- **Type Safety**: Full TypeScript support throughout

## Available Scripts

- `npm run dev`: Start Vite development server
- `npm run build`: Build the frontend
- `npm run tauri:dev`: Start Tauri development environment
- `npm run tauri:build`: Build the production application

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri
- **Build Tool**: Vite
- **State Management**: Zustand (installed, ready to use)
- **Package Manager**: npm