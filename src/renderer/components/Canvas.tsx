import React from 'react'
import { Film, Zap, AlertCircle } from 'lucide-react'
type AppView = 'idle' | 'generating' | 'done'
import { useCompilationStore } from '../store/compilationStore'
import { ProgressBar } from './ProgressBar'
import MomentumLogo from './MomentumLogo'
import { GlowingCard } from './ui/GlowingCard'

interface CanvasProps {
  view: AppView
  outputUrl: string
}

export const Canvas: React.FC<CanvasProps> = ({ view, outputUrl }) => {
  const { selectedMedia, aspectRatio, generation, resetGeneration } = useCompilationStore()

  // ── Done: show the video player ──────────────────────────────────────────
  if (view === 'done' && outputUrl) {
    return (
      <main className="flex-1 bg-[#1a1008] flex items-center justify-center p-8 overflow-hidden">
        <video
          src={outputUrl}
          controls
          autoPlay
          loop
          className="max-h-full max-w-full rounded-2xl shadow-2xl"
          style={{ aspectRatio: aspectRatio === '9:16' ? '9/16' : aspectRatio === '1:1' ? '1/1' : '16/9' }}
        />
      </main>
    )
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (generation.status === 'error') {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <GlowingCard className="max-w-[360px] w-full text-center" style={{ padding: '2rem' }}>
          <AlertCircle size={28} className="text-red-400 mx-auto mb-3" />
          <h2 className="font-serif text-xl text-umber">Generation failed</h2>
          <p className="font-sans text-xs text-umber/50 text-center mt-1">{generation.error}</p>
          <button className="btn-ghost mt-4" onClick={resetGeneration}>Try Again</button>
        </GlowingCard>
      </main>
    )
  }

  // ── Generating: show progress ─────────────────────────────────────────────
  if (view === 'generating') {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center max-w-sm w-full px-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Zap size={30} className="text-accent animate-pulse" />
          </div>
          <h2 className="font-serif text-2xl text-umber mb-2">Generating</h2>
          <p className="text-umber/50 font-sans text-sm mb-8">
            {generation.error ?? 'Processing your compilation…'}
          </p>
          <ProgressBar progress={generation.progress} label={generation.error ?? undefined} />
        </div>
      </main>
    )
  }

  // ── Idle with media: show aspect ratio preview frame ──────────────────────
  if (selectedMedia.length > 0) {
    const dims =
      aspectRatio === '9:16' ? { w: 220, h: 390 } :
      aspectRatio === '1:1'  ? { w: 320, h: 320 } :
                               { w: 400, h: 225 }

    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-background gap-6">
        <div
          className="rounded-2xl border-2 border-dashed border-umber/20 bg-umber/5 flex flex-col items-center justify-center gap-3 shadow-soft animate-breathe"
          style={{ width: dims.w, height: dims.h }}
        >
          <Film size={28} className="text-umber/25" />
          <span className="font-sans text-xs text-umber/35 font-medium">{aspectRatio}</span>
          <span className="font-sans text-xs text-umber/25">{selectedMedia.length} clip{selectedMedia.length !== 1 ? 's' : ''}</span>
        </div>
        <p className="font-sans text-xs text-umber/40">
          Adjust settings in the sidebar, then generate.
        </p>
      </main>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  return (
    <main className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-8">
        <div
          className="rounded-3xl border-2 border-dashed border-umber/20 flex flex-col items-center justify-center gap-6 py-12 px-8 mb-2 animate-breathe"
        >
          <div className="flex items-center justify-center">
            <MomentumLogo size={80} />
          </div>
          <div>
            <h1 className="font-serif text-4xl text-umber mb-3 leading-tight">
              Your cinematic<br />highlight reel
            </h1>
            <p className="font-sans text-umber/50 text-base leading-relaxed">
              Upload your photos and videos from the sidebar,
              choose a style, and let AI do the rest.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
