import React, { useState } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Canvas } from './components/Canvas'

export type AppView = 'idle' | 'generating' | 'done'

export default function App() {
  const [view, setView] = useState<AppView>('idle')
  const [outputUrl, setOutputUrl] = useState('')

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header outputUrl={outputUrl} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          view={view}
          onGenerating={() => setView('generating')}
          onDone={(url) => { setOutputUrl(url); setView('done') }}
          onReset={() => { setOutputUrl(''); setView('idle') }}
        />
        <Canvas view={view} outputUrl={outputUrl} />
      </div>
    </div>
  )
}
