import React from 'react'
import { Film, Zap, AlertCircle } from 'lucide-react'
import { StudioView } from './StudioSidebar'
import { useCompilationStore } from '../store/compilationStore'
import { ProgressBar } from './ProgressBar'
import rabbitLogo from '../assets/rabbit-logo.png'
import { GlowingCard } from './ui/GlowingCard'
import { ContainerScroll } from './ui/ContainerScroll'

interface StudioCanvasProps {
  view: StudioView
  outputUrl: string
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({ view, outputUrl }) => {
  const { selectedMedia, aspectRatio, generation, resetGeneration } = useCompilationStore()

  // Done: show video player
  if (view === 'done' && outputUrl) {
    return (
      <main className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-transparent">
        <video
          src={outputUrl}
          controls
          autoPlay
          loop
          className="max-h-full max-w-full rounded-2xl shadow-2xl border border-border"
          style={{
            aspectRatio:
              aspectRatio === '9:16' ? '9/16' : aspectRatio === '1:1' ? '1/1' : '16/9',
          }}
        />
      </main>
    )
  }

  // Error state
  if (generation.status === 'error') {
    return (
      <main className="flex-1 flex items-center justify-center bg-transparent">
        <GlowingCard className="max-w-[360px] w-full text-center p-8">
          <AlertCircle size={28} className="text-destructive mx-auto mb-3" />
          <h2 className="font-serif text-xl text-foreground">Generation failed</h2>
          <p className="text-xs text-muted-foreground text-center mt-1">{generation.error}</p>
          <button className="btn-ghost mt-4" onClick={resetGeneration}>
            Try Again
          </button>
        </GlowingCard>
      </main>
    )
  }

  // Generating: show progress
  if (view === 'generating') {
    return (
      <main className="flex-1 flex items-center justify-center bg-transparent">
        <div className="text-center max-w-sm w-full px-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Zap size={30} className="text-accent animate-pulse" />
          </div>
          <h2 className="font-serif text-2xl text-foreground mb-2">Generating</h2>
          <p className="text-muted-foreground font-sans text-sm mb-8">
            {generation.error ?? 'Processing your compilation…'}
          </p>
          <ProgressBar progress={generation.progress} label={generation.error ?? undefined} />
        </div>
      </main>
    )
  }

  // Idle with media: show aspect ratio preview frame
  if (selectedMedia.length > 0) {
    const dims =
      aspectRatio === '9:16' ? { w: 220, h: 390 } :
      aspectRatio === '1:1'  ? { w: 320, h: 320 } :
                               { w: 400, h: 225 }

    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-transparent gap-6">
        <div
          className="rounded-2xl border-2 border-dashed border-border bg-muted/60 backdrop-blur-panel flex flex-col items-center justify-center gap-3 shadow-card animate-breathe"
          style={{ width: dims.w, height: dims.h }}
        >
          <Film size={28} className="text-accent/50" />
          <span className="font-sans text-xs text-muted-foreground font-medium">{aspectRatio}</span>
          <span className="font-sans text-xs text-muted-foreground">
            {selectedMedia.length} clip{selectedMedia.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="font-sans text-xs text-muted-foreground">
          Adjust settings in the sidebar, then generate.
        </p>
      </main>
    )
  }

  // Empty state with ContainerScroll
  return (
    <main className="flex-1 flex items-center justify-center bg-transparent overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="text-center">
            <p className="text-sm text-accent font-mono uppercase tracking-widest mb-3">AI-Powered</p>
            <h1 className="font-serif text-5xl text-foreground leading-tight">
              Your cinematic<br />highlight reel
            </h1>
            <p className="text-muted-foreground text-base mt-4">
              Upload media from the sidebar, choose a style, and let AI do the rest.
            </p>
          </div>
        }
      >
        <div className="w-full h-full bg-muted/60 backdrop-blur-panel rounded-2xl flex items-center justify-center">
          <img src={rabbitLogo} alt="Momentum" style={{ height: 80, width: 'auto' }} />
        </div>
      </ContainerScroll>
    </main>
  )
}
