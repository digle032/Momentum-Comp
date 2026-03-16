import React, { useRef, useCallback } from 'react'
import {
  Upload, Play, Music, X, RotateCcw, Zap, Image as ImageIcon,
} from 'lucide-react'
import { AppView } from '../App'
import { useCompilationStore } from '../store/compilationStore'
import { analyzeVideo } from '../services/motion-detector'
import { generatePreview, generateCompilation } from '../services/video-generator'
import { MediaItem, Template, AspectRatio } from '../types'

interface SidebarProps {
  view: AppView
  onGenerating: () => void
  onDone: (url: string) => void
  onReset: () => void
}

const TEMPLATES: { id: Template; label: string }[] = [
  { id: 'hype',  label: 'Hype'  },
  { id: 'reels', label: 'Reels' },
  { id: 'clean', label: 'Clean' },
]

const RATIOS: { id: AspectRatio; label: string }[] = [
  { id: '9:16', label: '9:16' },
  { id: '1:1',  label: '1:1'  },
  { id: '16:9', label: '16:9' },
]

const DURATIONS = [
  { label: 'Auto', value: undefined },
  { label: '15s',  value: 15 },
  { label: '30s',  value: 30 },
  { label: '60s',  value: 60 },
]

export const Sidebar: React.FC<SidebarProps> = ({ view, onGenerating, onDone, onReset }) => {
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const musicInputRef = useRef<HTMLInputElement>(null)

  const {
    selectedMedia, addMedia, removeMedia,
    template, setTemplate,
    musicFile, setMusicFile,
    introText, setIntroText,
    outroText, setOutroText,
    aspectRatio, setAspectRatio,
    targetDuration, setTargetDuration,
    generation, setGeneration, resetGeneration,
    buildOptions, clearMedia,
  } = useCompilationStore()

  // ── Media picking ────────────────────────────────────────────────────────

  const handleMediaFiles = useCallback(async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/')
      const uri = URL.createObjectURL(file)
      let duration: number | undefined
      if (isVideo) {
        duration = await new Promise<number>((resolve) => {
          const v = document.createElement('video')
          v.src = uri
          v.addEventListener('loadedmetadata', () => resolve(v.duration), { once: true })
          v.load()
        })
      }
      addMedia({ file, uri, type: isVideo ? 'video' : 'image', duration })
    }
  }, [addMedia])

  // ── Generate ─────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    const options = buildOptions()
    if (!options) { alert('Please add at least one photo or video.'); return }

    onGenerating()
    setGeneration({ status: 'analyzing', progress: 0 })

    try {
      const enrichedMedia = await Promise.all(
        options.media.map(async (item: MediaItem) => {
          if (item.type === 'video' && item.duration) {
            const scores = await analyzeVideo(item.file, item.duration)
            return { ...item, motionScores: scores }
          }
          return item
        })
      )
      const enrichedOptions = { ...options, media: enrichedMedia }

      setGeneration({ status: 'rendering', progress: 30 })
      await generatePreview(enrichedOptions, (p) =>
        setGeneration({ progress: 30 + Math.round(p * 0.3) })
      )
      setGeneration({ progress: 60 })

      const outputUrl = await generateCompilation(enrichedOptions, (progress, label) =>
        setGeneration({ progress: 60 + Math.round(progress * 0.4), error: label })
      )

      setGeneration({ status: 'done', progress: 100 })
      onDone(outputUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setGeneration({ status: 'error', error: msg })
      alert(`Generation failed: ${msg}`)
    }
  }, [buildOptions, onGenerating, onDone, setGeneration])

  const handleReset = () => {
    clearMedia()
    setMusicFile(null)
    resetGeneration()
    onReset()
  }

  const isGenerating = ['analyzing', 'rendering'].includes(generation.status)
  const isDone = view === 'done'

  // ── Label helper ─────────────────────────────────────────────────────────

  const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="font-sans text-[10px] font-semibold text-umber/40 uppercase tracking-widest mb-2 mt-5 first:mt-0">
      {children}
    </p>
  )

  return (
    <aside className="w-72 shrink-0 h-full glass-panel border-r border-border flex flex-col overflow-hidden shadow-glass">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">

        {/* ── Media section ─────────────────────────────────────────────── */}
        <SectionLabel>Media</SectionLabel>

        <input
          ref={mediaInputRef}
          type="file"
          accept="video/*,image/*"
          multiple
          className="hidden"
          onChange={(e) => handleMediaFiles(e.target.files)}
        />

        <button
          onClick={() => mediaInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-accent/30 text-accent text-sm font-medium font-sans hover:border-accent/60 hover:bg-accent/5 transition-colors"
        >
          <Upload size={15} />
          Add photos &amp; videos
        </button>

        {/* Thumbnail grid */}
        {selectedMedia.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 pt-2">
            {selectedMedia.map((item) => (
              <div key={item.uri} className="media-thumb aspect-square group">
                {item.type === 'image' ? (
                  <img src={item.uri} className="w-full h-full object-cover" alt="" />
                ) : (
                  <video src={item.uri} className="w-full h-full object-cover" muted />
                )}
                {/* Video badge */}
                {item.type === 'video' && (
                  <div className="absolute bottom-1 left-1 bg-black/50 rounded-md px-1 py-0.5">
                    <Play size={8} className="text-white" fill="white" />
                  </div>
                )}
                {/* Remove button */}
                <button
                  onClick={() => removeMedia(item.uri)}
                  className="absolute top-1 right-1 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={8} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Template ──────────────────────────────────────────────────── */}
        <SectionLabel>Style</SectionLabel>
        <div className="flex gap-1.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`chip flex-1 ${template === t.id ? 'chip-active' : 'chip-inactive'}`}
            >
              <span className={t.id === 'hype' ? 'font-script text-base leading-none' :
                               t.id === 'reels' ? 'font-script text-base leading-none' : ''}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Aspect ratio ──────────────────────────────────────────────── */}
        <SectionLabel>Aspect ratio</SectionLabel>
        <div className="flex gap-1.5">
          {RATIOS.map((r) => (
            <button
              key={r.id}
              onClick={() => setAspectRatio(r.id)}
              className={`chip flex-1 ${aspectRatio === r.id ? 'chip-active' : 'chip-inactive'}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* ── Duration ──────────────────────────────────────────────────── */}
        <SectionLabel>Duration</SectionLabel>
        <div className="flex gap-1.5 flex-wrap">
          {DURATIONS.map((d) => (
            <button
              key={String(d.value)}
              onClick={() => setTargetDuration(d.value)}
              className={`chip ${targetDuration === d.value ? 'chip-active' : 'chip-inactive'}`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* ── Music ─────────────────────────────────────────────────────── */}
        <SectionLabel>Music</SectionLabel>
        <input
          ref={musicInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => setMusicFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex gap-1.5">
          <button
            onClick={() => musicInputRef.current?.click()}
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/60 border border-border text-sm font-sans hover:bg-white/90 transition-colors overflow-hidden"
          >
            <Music size={13} className="text-accent shrink-0" />
            <span className="truncate text-umber/70 text-xs">
              {musicFile ? musicFile.name : 'Choose audio…'}
            </span>
          </button>
          {musicFile && (
            <button
              onClick={() => setMusicFile(null)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white/60 hover:bg-white/90 transition-colors"
            >
              <X size={13} className="text-umber/50" />
            </button>
          )}
        </div>
        {!musicFile && (
          <p className="text-[11px] text-umber/35 font-sans mt-1">No audio — compilation will be silent.</p>
        )}

        {/* ── Text overlays ─────────────────────────────────────────────── */}
        <SectionLabel>Text overlays</SectionLabel>
        <input
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          placeholder="Intro text…"
          maxLength={60}
          className="w-full px-3 py-2 rounded-xl border border-border bg-white/60 text-sm font-sans text-umber placeholder:text-umber/30 outline-none focus:border-accent/50 transition-colors"
        />
        <input
          value={outroText}
          onChange={(e) => setOutroText(e.target.value)}
          placeholder="Outro text…"
          maxLength={60}
          className="w-full px-3 py-2 mt-1.5 rounded-xl border border-border bg-white/60 text-sm font-sans text-umber placeholder:text-umber/30 outline-none focus:border-accent/50 transition-colors"
        />

      </div>

      {/* ── Bottom actions ───────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-border space-y-2 shrink-0">
        {isDone ? (
          <button onClick={handleReset} className="w-full btn-ghost flex items-center justify-center gap-2 text-sm">
            <RotateCcw size={14} />
            Start over
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedMedia.length === 0}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Zap size={16} fill="white" />
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>
        )}
      </div>
    </aside>
  )
}
