import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Settings } from './screens/Settings';
import { ContentStudio } from './screens/ContentStudio';
import { DatabaseStatus } from './screens/DatabaseStatus';
import { MediaHub } from './screens/MediaHub';
import { TranscriptLibrary } from './screens/TranscriptLibrary';
import { Button } from './components/atoms/Button';
import { ThemeToggle } from './components/atoms/ThemeToggle';
import { NotificationContainer } from './components/molecules/NotificationContainer';
import { DebugPanel } from './components/molecules/DebugPanel';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'settings' | 'content-studio' | 'media-hub' | 'database' | 'transcript-library'>('media-hub');

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="App min-h-screen bg-theme-primary text-theme-primary">
        {/* Premium glass navigation bar */}
        <div className="fixed top-0 left-0 right-0 z-50 glass-ultra border-b border-theme backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo/Title with gradient */}
            <h1 className="text-2xl font-bold bg-gradient-text bg-clip-text text-transparent">
              ContentFlow
            </h1>
            
            {/* Navigation buttons with glass effect - ordered by workflow */}
            <div className="flex items-center space-x-3">
              {/* Step 1: Media Hub */}
              <Button 
                variant={currentScreen === 'media-hub' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentScreen('media-hub')}
                className={`transition-all duration-300 ${currentScreen === 'media-hub' ? 'shadow-glow' : 'hover:shadow-glow-subtle'}`}
              >
                Media Hub
              </Button>
              
              {/* Step 2: Transcript Library */}
              <Button 
                variant={currentScreen === 'transcript-library' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentScreen('transcript-library')}
                className={`transition-all duration-300 ${currentScreen === 'transcript-library' ? 'shadow-glow' : 'hover:shadow-glow-subtle'}`}
              >
                Transcripts
              </Button>
              
              {/* Step 3: Content Studio */}
              <Button 
                variant={currentScreen === 'content-studio' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentScreen('content-studio')}
                className={`transition-all duration-300 ${currentScreen === 'content-studio' ? 'shadow-glow' : 'hover:shadow-glow-subtle'}`}
              >
                Content Studio
              </Button>
              
              {/* Step 4: Settings */}
              <Button 
                variant={currentScreen === 'settings' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentScreen('settings')}
                className={`transition-all duration-300 ${currentScreen === 'settings' ? 'shadow-glow' : 'hover:shadow-glow-subtle'}`}
              >
                Settings
              </Button>
              
              {/* Theme toggle with glass separator */}
              <div className="ml-4 pl-4 border-l border-theme">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Main content area with padding for fixed header and fade animation */}
        <div className="pt-20 animate-fade-in">
          {currentScreen === 'media-hub' && <MediaHub />}
          {currentScreen === 'transcript-library' && <TranscriptLibrary />}
          {currentScreen === 'content-studio' && <ContentStudio />}
          {currentScreen === 'settings' && <Settings />}
          {currentScreen === 'database' && <DatabaseStatus />}
        </div>
        
        {/* Global notification container */}
        <NotificationContainer />
        
        {/* Debug panel for development */}
        <DebugPanel />
      </div>
    </ThemeProvider>
  );
}

export default App