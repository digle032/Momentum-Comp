import React, { useState } from 'react'
import { HomeScreen } from './screens/HomeScreen'
import { EditorScreen } from './screens/EditorScreen'
import { PreviewScreen } from './screens/PreviewScreen'

type Screen = 'home' | 'editor' | 'preview'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [outputUrl, setOutputUrl] = useState<string>('')

  return (
    <>
      {screen === 'home' && (
        <HomeScreen onStart={() => setScreen('editor')} />
      )}
      {screen === 'editor' && (
        <EditorScreen
          onBack={() => setScreen('home')}
          onDone={(url) => { setOutputUrl(url); setScreen('preview') }}
        />
      )}
      {screen === 'preview' && (
        <PreviewScreen
          outputUrl={outputUrl}
          onCreateAnother={() => setScreen('home')}
        />
      )}
    </>
  )
}
