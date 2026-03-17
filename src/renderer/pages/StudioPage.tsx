import React, { useState, useCallback } from 'react'
import { Download, Share2 } from 'lucide-react'
import { StudioSidebar, StudioView } from '../components/StudioSidebar'
import { StudioCanvas } from '../components/StudioCanvas'

export const StudioPage: React.FC = () => {
  const [view, setView] = useState<StudioView>('idle')
  const [outputUrl, setOutputUrl] = useState('')

  const handleDownload = useCallback(() => {
    if (!outputUrl) return
    const a = document.createElement('a')
    a.href = outputUrl
    a.download = `momentum-${Date.now()}.mp4`
    a.click()
  }, [outputUrl])

  const handleShare = useCallback(async () => {
    if (!outputUrl) return
    if (!navigator.share) { handleDownload(); return }
    try {
      const blob = await fetch(outputUrl).then((r) => r.blob())
      const file = new File([blob], 'momentum.mp4', { type: 'video/mp4' })
      await navigator.share({ files: [file], title: 'My Momentum Compilation' })
    } catch { /* cancelled */ }
  }, [outputUrl, handleDownload])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-border shrink-0 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Studio</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Create a compilation</p>
        </div>
        {outputUrl && (
          <div className="flex items-center gap-2">
            <button className="btn-ghost" onClick={handleShare}>
              <Share2 size={15} />
              Share
            </button>
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={15} />
              Export MP4
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <StudioSidebar
          view={view}
          onGenerating={() => setView('generating')}
          onDone={(url) => { setOutputUrl(url); setView('done') }}
          onReset={() => { setOutputUrl(''); setView('idle') }}
        />
        <StudioCanvas view={view} outputUrl={outputUrl} />
      </div>
    </div>
  )
}
