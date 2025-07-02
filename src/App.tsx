import { useState } from 'react';
import { Settings } from './screens/Settings';
import { ContentStudio } from './screens/ContentStudio';
import { Button } from './components/atoms/Button';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'settings' | 'content-studio'>('content-studio');

  return (
    <div className="App">
      {/* Quick navigation for demo */}
      <div className="fixed top-4 right-4 z-50 space-x-2">
        <Button 
          variant={currentScreen === 'settings' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setCurrentScreen('settings')}
        >
          Settings
        </Button>
        <Button 
          variant={currentScreen === 'content-studio' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setCurrentScreen('content-studio')}
        >
          Templates
        </Button>
      </div>

      {currentScreen === 'settings' && <Settings />}
      {currentScreen === 'content-studio' && <ContentStudio />}
    </div>
  );
}

export default App