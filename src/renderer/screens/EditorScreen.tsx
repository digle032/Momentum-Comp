import React, { useState, useCallback, useRef } from 'react'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProgressBar } from '../components/ProgressBar'
import { useCompilationStore } from '../store/compilationStore'
import { analyzeVideo } from '../services/motion-detector'
import { generatePreview, generateCompilation } from '../services/video-generator'
import { MediaItem, Template, AspectRatio } from '../types'

interface Props {
  onBack: () => void
  onDone: (outputUrl: string) => void
}

type Step = 'select' | 'customize'

const TEMPLATES: { id: Template; label: string; emoji: string }[] = [
  { id: 'hype',  label: 'Hype',  emoji: '⚡' },
  { id: 'reels', label: 'Reels', emoji: '🎬' },
  { id: 'clean', label: 'Clean', emoji: '✨' },
]

const RATIOS: { id: AspectRatio; label: string }[] = [
  { id: '9:16', label: '9:16' },
  { id: '1:1',  label: '1:1' },
  { id: '16:9', label: '16:9' },
]

const DURATIONS = [
  { label: 'AI Decides', value: undefined },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
]

export const EditorScreen: React.FC<Props> = ({ onBack, onDone }) => {
  const [step, setStep] = useState<Step>('select')
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
    generation, setGeneration,
    buildOptions,
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

      const item: MediaItem = { file, uri, type: isVideo ? 'video' : 'image', duration }
      addMedia(item)
    }
  }, [addMedia])

  // ── Generation ───────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    const options = buildOptions()
    if (!options) {
      alert('Please select media and a music track.')
      return
    }

    setGeneration({ status: 'analyzing', progress: 0 })

    try {
      // Motion analysis
      const enrichedMedia = await Promise.all(
        options.media.map(async (item) => {
          if (item.type === 'video' && item.duration) {
            const scores = await analyzeVideo(item.file, item.duration)
            return { ...item, motionScores: scores }
          }
          return item
        })
      )
      const enrichedOptions = { ...options, media: enrichedMedia }

      // Preview render (fast, low-res)
      setGeneration({ status: 'rendering', progress: 30 })
      await generatePreview(enrichedOptions, (p) =>
        setGeneration({ progress: 30 + Math.round(p * 0.3) })
      )
      setGeneration({ progress: 60 })

      // Full quality render
      const outputUrl = await generateCompilation(enrichedOptions, (progress, label) =>
        setGeneration({ progress: 60 + Math.round(progress * 0.4), error: undefined })
      )

      setGeneration({ status: 'done', progress: 100, outputUrl })
      onDone(outputUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setGeneration({ status: 'error', error: msg })
      alert(`Generation failed: ${msg}`)
    }
  }, [buildOptions, setGeneration, onDone])

  const isGenerating = ['analyzing', 'rendering'].includes(generation.status)

  // ── Shared styles ────────────────────────────────────────────────────────

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily,
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
        borderBottom: `1px solid ${theme.colors.border}`,
        background: theme.colors.glass,
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 4 }}>←</button>
        <h2 style={{ fontFamily: theme.typography.fontFamily, fontWeight: 700, fontSize: 18, color: theme.colors.text, margin: 0 }}>
          {step === 'select' ? 'Select Media' : 'Customize'}
        </h2>
        <div style={{ width: 32 }} />
      </div>

      {step === 'select' ? (
        // ── Step 1: Media grid ─────────────────────────────────────────────
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <input
            ref={mediaInputRef}
            type="file"
            accept="video/*,image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleMediaFiles(e.target.files)}
          />

          <div style={{ flex: 1, padding: theme.spacing.md, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: theme.spacing.sm, alignContent: 'start' }}>
            {/* Add tile */}
            <div
              onClick={() => mediaInputRef.current?.click()}
              style={{
                height: 110, borderRadius: theme.radii.md,
                border: `2px dashed ${theme.colors.primary}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', gap: 4,
              }}
            >
              <span style={{ fontSize: 28, color: theme.colors.primary }}>+</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}>Add Media</span>
            </div>

            {/* Media tiles */}
            {selectedMedia.map((item) => (
              <div key={item.uri} style={{ height: 110, borderRadius: theme.radii.md, overflow: 'hidden', position: 'relative' }}>
                {item.type === 'image' ? (
                  <img src={item.uri} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                ) : (
                  <video src={item.uri} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                )}
                {item.type === 'video' && (
                  <span style={{
                    position: 'absolute', bottom: 4, left: 4,
                    background: 'rgba(0,0,0,0.55)', borderRadius: 4,
                    padding: '2px 5px', color: '#fff', fontSize: 10,
                  }}>▶</span>
                )}
                <button
                  onClick={() => removeMedia(item.uri)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 10,
                    width: 20, height: 20, color: '#fff', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
            borderTop: `1px solid ${theme.colors.border}`,
          }}>
            <span style={{ fontFamily: theme.typography.fontFamily, fontSize: 14, color: theme.colors.textSecondary }}>
              {selectedMedia.length} item{selectedMedia.length !== 1 ? 's' : ''} selected
            </span>
            <div style={{ width: 160 }}>
              <PrimaryButton label="Next →" onClick={() => setStep('customize')} disabled={selectedMedia.length === 0} />
            </div>
          </div>
        </div>
      ) : (
        // ── Step 2: Customize ──────────────────────────────────────────────
        <div style={{ flex: 1, overflowY: 'auto', padding: `${theme.spacing.md}px ${theme.spacing.lg}px`, maxWidth: 600, margin: '0 auto', width: '100%' }}>

          {/* Template */}
          <p style={sectionLabel}>Template</p>
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            {TEMPLATES.map((t) => (
              <div
                key={t.id}
                onClick={() => setTemplate(t.id)}
                style={{
                  flex: 1, borderRadius: theme.radii.md, padding: `${theme.spacing.md}px 0`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: template === t.id ? 'rgba(124,58,237,0.06)' : theme.colors.white,
                  border: `1.5px solid ${template === t.id ? theme.colors.primary : theme.colors.border}`,
                  cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 22 }}>{t.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: theme.typography.fontFamily, color: template === t.id ? theme.colors.primary : theme.colors.textSecondary }}>{t.label}</span>
              </div>
            ))}
          </div>

          {/* Aspect ratio */}
          <p style={sectionLabel}>Aspect Ratio</p>
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            {RATIOS.map((r) => (
              <div
                key={r.id}
                onClick={() => setAspectRatio(r.id)}
                style={{
                  padding: '8px 18px', borderRadius: theme.radii.full, cursor: 'pointer',
                  background: aspectRatio === r.id ? 'rgba(124,58,237,0.08)' : theme.colors.white,
                  border: `1.5px solid ${aspectRatio === r.id ? theme.colors.primary : theme.colors.border}`,
                  fontSize: 13, fontWeight: 600, fontFamily: theme.typography.fontFamily,
                  color: aspectRatio === r.id ? theme.colors.primary : theme.colors.textSecondary,
                }}
              >
                {r.label}
              </div>
            ))}
          </div>

          {/* Duration */}
          <p style={sectionLabel}>Duration</p>
          <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            {DURATIONS.map((d) => (
              <div
                key={String(d.value)}
                onClick={() => setTargetDuration(d.value)}
                style={{
                  padding: '8px 18px', borderRadius: theme.radii.full, cursor: 'pointer',
                  background: targetDuration === d.value ? 'rgba(124,58,237,0.08)' : theme.colors.white,
                  border: `1.5px solid ${targetDuration === d.value ? theme.colors.primary : theme.colors.border}`,
                  fontSize: 13, fontWeight: 600, fontFamily: theme.typography.fontFamily,
                  color: targetDuration === d.value ? theme.colors.primary : theme.colors.textSecondary,
                }}
              >
                {d.label}
              </div>
            ))}
          </div>

          {/* Music */}
          <p style={sectionLabel}>Music</p>
          <input
            ref={musicInputRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={(e) => setMusicFile(e.target.files?.[0] ?? null)}
          />
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <GlassCard style={{ flex: 1, cursor: 'pointer' }}>
              <div onClick={() => musicInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                <span style={{ fontSize: 20 }}>🎵</span>
                <span style={{
                  flex: 1, fontFamily: theme.typography.fontFamily, fontSize: 14,
                  color: musicFile ? theme.colors.text : theme.colors.textSecondary,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {musicFile ? musicFile.name : 'Choose audio track…'}
                </span>
              </div>
            </GlassCard>
            {musicFile && (
              <button
                onClick={() => setMusicFile(null)}
                title="Remove audio"
                style={{
                  background: theme.colors.white,
                  border: `1.5px solid ${theme.colors.border}`,
                  borderRadius: theme.radii.md,
                  padding: '0 14px',
                  cursor: 'pointer',
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                }}
              >✕</button>
            )}
          </div>
          {!musicFile && (
            <p style={{ fontFamily: theme.typography.fontFamily, fontSize: 12, color: theme.colors.textSecondary, marginTop: 6 }}>
              No audio selected — compilation will be silent.
            </p>
          )}

          {/* Intro text */}
          <p style={sectionLabel}>Intro Text (optional)</p>
          <input
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            placeholder="e.g. Summer Training 2026"
            maxLength={60}
            style={{
              width: '100%', borderRadius: theme.radii.md,
              border: `1.5px solid ${theme.colors.border}`,
              padding: '12px 16px', fontSize: 15,
              fontFamily: theme.typography.fontFamily, color: theme.colors.text,
              background: theme.colors.white, outline: 'none',
            }}
          />

          {/* Outro text */}
          <p style={sectionLabel}>Outro Text (optional)</p>
          <input
            value={outroText}
            onChange={(e) => setOutroText(e.target.value)}
            placeholder="e.g. @yourhandle"
            maxLength={60}
            style={{
              width: '100%', borderRadius: theme.radii.md,
              border: `1.5px solid ${theme.colors.border}`,
              padding: '12px 16px', fontSize: 15,
              fontFamily: theme.typography.fontFamily, color: theme.colors.text,
              background: theme.colors.white, outline: 'none',
            }}
          />

          {/* Progress */}
          {isGenerating && (
            <GlassCard style={{ marginTop: theme.spacing.lg }}>
              <ProgressBar progress={generation.progress} label={generation.error ?? 'Generating…'} />
            </GlassCard>
          )}

          {/* Generate button */}
          <div style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.xxl }}>
            <PrimaryButton
              label="Generate Compilation ⚡"
              onClick={handleGenerate}
              loading={isGenerating}
              disabled={selectedMedia.length === 0}
            />
          </div>
        </div>
      )}
    </div>
  )
}
