import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button } from '@atoms/Button'

function App() {
  const [greetMsg, setGreetMsg] = useState('')
  const [name, setName] = useState('')

  async function greet() {
    setGreetMsg(await invoke('greet', { name }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Welcome to ContentFlow!
        </h1>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          
          <Button
            onClick={greet}
            fullWidth
            variant="primary"
          >
            Greet
          </Button>
          
          {greetMsg && (
            <p className="text-center text-gray-700 mt-4 p-4 bg-gray-100 rounded-md">
              {greetMsg}
            </p>
          )}
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Built with Tauri + React + TypeScript + Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}

export default App