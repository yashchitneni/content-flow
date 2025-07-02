import { useState } from 'react';
import { Settings } from './screens/Settings';
import { ContentStudio } from './screens/ContentStudio';
import { FileOrganizer } from './screens/FileOrganizer';
import { DatabaseStatus } from './screens/DatabaseStatus';
import { VideoImport } from './screens/VideoImport';
import { Button } from './components/atoms/Button';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'settings' | 'content-studio' | 'file-organizer' | 'database' | 'video-import'>('content-studio');

  return (
    <div className="App">
      {/* Quick navigation for demo */}
      <div className="fixed top-4 right-4 z-50 space-x-2">
        <Button 
          variant={currentScreen === 'file-organizer' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setCurrentScreen('file-organizer')}
        >
          File Organizer
        </Button>
        <Button 
          variant={currentScreen === 'content-studio' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setCurrentScreen('content-studio')}
        >
          Content Studio
        </Button>
                  <Button 
            variant={currentScreen === 'settings' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setCurrentScreen('settings')}
          >
            Settings
          </Button>
          <Button 
            variant={currentScreen === 'database' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setCurrentScreen('database')}
          >
            Database
          </Button>
          <Button 
            variant={currentScreen === 'video-import' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setCurrentScreen('video-import')}
          >
            Video Import
          </Button>
        </div>

        {currentScreen === 'settings' && <Settings />}
        {currentScreen === 'content-studio' && <ContentStudio />}
        {currentScreen === 'file-organizer' && <FileOrganizer />}
        {currentScreen === 'database' && <DatabaseStatus />}
        {currentScreen === 'video-import' && <VideoImport />}
    </div>
  );
}

export default App