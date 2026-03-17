import React, { useRef, useCallback, useState } from 'react'
import {
  Upload, Play, Music, X, RotateCcw, Zap, GripVertical,
} from 'lucide-react'
import {
  DndContext, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCompilationStore } from '../store/compilationStore'
import { analyzeVideo } from '../services/motion-detector'
import { generatePreview, generateCompilation } from '../services/video-generator'
import { MediaItem, Template, AspectRatio } from '../types'

export type StudioView = 'idle' | 'generating' | 'done'

interface StudioSidebarProps {
  view: StudioView
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

// ── Sortable thumbnail ────────────────────────────────────────────────────────

interface SortableThumbnailProps {
  item: MediaItem
  analyzing: Set<string>
  onRemove: (uri: string) => void
}

const SortableThumbnail: React.FC<SortableThumbnailProps> = ({ item, analyzing, onRemove }) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: item.uri })

  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`media-thumb aspect-square group${isDragging ? ' opacity-50 scale-95 z-50' : ''}`}
      {...attributes}
    >
      <div
        className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab"
        {...listeners}
      >
        <GripVertical size={10} className="text-white drop-shadow" />
      </div>

      {item.type === 'image' ? (
        <img src={item.uri} className="w-full h-full object-cover" alt="" />
      ) : (
        <video src={item.uri} className="w-full h-full object-cover" muted />
      )}

      {item.type === 'video' && analyzing.has(item.uri) && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse group-hover:hidden" />
      )}

      {item.type === 'video' && (
        <div className="absolute bottom-1 left-1 bg-black/50 rounded-md px-1 py-0.5">
          <Play size={8} className="text-white" fill="white" />
        </div>
      )}

      <button
        onClick={() => onRemove(item.uri)}
        className="absolute top-1 right-1 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={8} className="text-white" />
      </button>
    </div>
  )
}

// ── SectionLabel ─────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 mt-5 first:mt-0 font-sans">
    {children}
  </p>
)

// ── StudioSidebar ─────────────────────────────────────────────────────────────

export const StudioSidebar: React.FC<StudioSidebarProps> = ({ view, onGenerating, onDone, onReset }) => {
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const musicInputRef = useRef<HTMLInputElement>(null)
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set())

  const {
    selectedMedia, addMedia, removeMedia, reorderMedia,
    updateMotionScores,
    template, setTemplate,
    musicFile, setMusicFile,
    introText, setIntroText,
    outroText, setOutroText,
    aspectRatio, setAspectRatio,
    targetDuration, setTargetDuration,
    generation, setGeneration, resetGeneration,
    buildOptions, clearMedia,
  } = useCompilationStore()

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
      const item: MediaItem = { file, uri, type: isVideo ? 'video' : 'image', duration }
      addMedia(item)

      if (isVideo && duration !== undefined) {
        setAnalyzing((prev) => new Set(prev).add(uri))
        analyzeVideo(file, duration)
          .then((scores) => {
            updateMotionScores(uri, scores)
            setAnalyzing((prev) => { const n = new Set(prev); n.delete(uri); return n })
          })
          .catch(() => {
            updateMotionScores(uri, [0.5])
            setAnalyzing((prev) => { const n = new Set(prev); n.delete(uri); return n })
          })
      }
    }
  }, [addMedia, updateMotionScores])

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = selectedMedia.findIndex((m) => m.uri === active.id)
    const newIndex = selectedMedia.findIndex((m) => m.uri === over.id)
    if (oldIndex !== -1 && newIndex !== -1) reorderMedia(oldIndex, newIndex)
  }, [selectedMedia, reorderMedia])

  const handleGenerate = useCallback(async () => {
    const options = buildOptions()
    if (!options) return

    onGenerating()
    setGeneration({ status: 'rendering', progress: 0 })

    try {
      await generatePreview(options, (p) => setGeneration({ progress: Math.round(p * 0.3) }))
      setGeneration({ progress: 30 })
      const outputUrl = await generateCompilation(options, (progress, label) =>
        setGeneration({ progress: 30 + Math.round(progress * 0.7), error: label })
      )
      setGeneration({ status: 'done', progress: 100 })
      onDone(outputUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setGeneration({ status: 'error', error: msg })
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

  return (
    <aside className="w-72 shrink-0 h-full border-r border-border bg-card flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">

        {/* Media */}
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

        {selectedMedia.length > 0 && (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedMedia.map((m) => m.uri)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 gap-1.5 pt-2">
                {selectedMedia.map((item) => (
                  <SortableThumbnail
                    key={item.uri}
                    item={item}
                    analyzing={analyzing}
                    onRemove={removeMedia}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Style */}
        <SectionLabel>Style</SectionLabel>
        <div className="flex gap-1.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`chip flex-1 ${template === t.id ? 'chip-active' : 'chip-inactive'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Aspect Ratio */}
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

        {/* Duration */}
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

        {/* Music */}
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
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm font-sans hover:border-accent/40 transition-colors overflow-hidden"
          >
            <Music size={13} className="text-accent shrink-0" />
            <span className="truncate text-muted-foreground text-xs">
              {musicFile ? musicFile.name : 'Choose audio…'}
            </span>
          </button>
          {musicFile && (
            <button
              onClick={() => setMusicFile(null)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-muted hover:border-accent/40 transition-colors"
            >
              <X size={13} className="text-muted-foreground" />
            </button>
          )}
        </div>
        {!musicFile && (
          <p className="text-[11px] text-muted-foreground font-sans mt-1">No audio — compilation will be silent.</p>
        )}

        {/* Text overlays */}
        <SectionLabel>Text overlays</SectionLabel>
        <input
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          placeholder="Intro text…"
          maxLength={60}
          className="input"
        />
        <input
          value={outroText}
          onChange={(e) => setOutroText(e.target.value)}
          placeholder="Outro text…"
          maxLength={60}
          className="input mt-1.5"
        />
      </div>

      {/* Bottom actions */}
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
            className="w-full btn-primary"
          >
            <Zap size={16} fill="currentColor" />
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>
        )}
      </div>
    </aside>
  )
}
