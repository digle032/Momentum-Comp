import React, { useCallback } from 'react'
import { Download, Share2 } from 'lucide-react'
import rabbitLogo from '../assets/rabbit-logo.png'

interface HeaderProps {
  outputUrl: string
}

export const Header: React.FC<HeaderProps> = ({ outputUrl }) => {
  const handleDownload = useCallback(() => {
    const a = document.createElement('a')
    a.href = outputUrl
    a.download = `momentum-${Date.now()}.mp4`
    a.click()
  }, [outputUrl])

  const handleShare = useCallback(async () => {
    if (!navigator.share) { handleDownload(); return }
    try {
      const blob = await fetch(outputUrl).then(r => r.blob())
      const file = new File([blob], 'momentum.mp4', { type: 'video/mp4' })
      await navigator.share({ files: [file], title: 'My Momentum Compilation' })
    } catch { /* cancelled */ }
  }, [outputUrl, handleDownload])

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border glass-panel shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <img src={rabbitLogo} alt="Momentum" style={{ height: 36, width: 'auto' }} />
        <span className="font-serif text-xl text-umber tracking-tight">Momentum</span>
      </div>

      {/* Actions — only shown when a video is ready */}
      {outputUrl && (
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="btn-ghost flex items-center gap-1.5 text-sm">
            <Share2 size={15} />
            Share
          </button>
          <button onClick={handleDownload} className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4">
            <Download size={15} />
            Export MP4
          </button>
        </div>
      )}
    </header>
  )
}
