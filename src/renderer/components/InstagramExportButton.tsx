import React, { useState } from 'react'
import { Instagram, Sparkles, Copy, Download, Send } from 'lucide-react'
import { InteractiveHoverButton } from './ui/InteractiveHoverButton'
import { Modal } from './ui/Modal'
import { useCoachingStore } from '../store/coachingStore'
import { useToast } from '../context/ToastContext'
import { generateInstagramPost, CaptionTone, PostContext } from '../services/ai'
import { cn } from '../lib/utils'

interface InstagramExportButtonProps {
  compilationUrl: string
  athleteIds: string[]
  drillNames: string[]
  compilationDuration: number
  onDownload?: () => void
}

export function InstagramExportButton({
  compilationUrl,
  athleteIds,
  drillNames,
  compilationDuration,
  onDownload,
}: InstagramExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [tone, setTone] = useState<CaptionTone>('hype')
  const [isGenerating, setIsGenerating] = useState(false)

  const { show } = useToast()
  const athletes = useCoachingStore((s) =>
    athleteIds.length > 0
      ? s.athletes.filter((a) => athleteIds.includes(a.id))
      : s.athletes
  )

  const handleGenerate = async () => {
    setIsGenerating(true)
    const context: PostContext = {
      athleteNames: athletes.map((a) => a.name),
      sport: athletes[0]?.sport || 'performance',
      drillNames: drillNames.filter(Boolean),
      compilationDuration,
    }
    const result = await generateInstagramPost(context, tone)
    setCaption(result.caption)
    setHashtags(result.hashtags)
    setIsGenerating(false)
  }

  const handleCopy = () => {
    const fullText = `${caption}\n\n${hashtags.join(' ')}`
    navigator.clipboard.writeText(fullText).then(() => show('Caption copied to clipboard!'))
  }

  const handleDownload = () => {
    if (onDownload) { onDownload(); return }
    const link = document.createElement('a')
    link.href = compilationUrl
    link.download = `momentum_compilation_${Date.now()}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <InteractiveHoverButton
        text="Share to Instagram"
        variant="ghost"
        onClick={() => setIsOpen(true)}
      />

      <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} title="AI Instagram Assistant">
        <div className="flex flex-col gap-5">

          {/* Tone selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              1. Select a tone
            </label>
            <div className="flex gap-2">
              {(['hype', 'professional', 'coach'] as CaptionTone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-1.5 text-sm capitalize transition-all',
                    tone === t
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              2. Generate with AI
            </label>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-all hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={15} className={isGenerating ? 'animate-spin' : ''} />
              {isGenerating ? 'Generating…' : 'Generate Caption & Hashtags'}
            </button>
          </div>

          {/* Editable output */}
          {caption && (
            <div className="space-y-4 border-t border-border pt-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                3. Edit & Finalize
              </label>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="input resize-none text-sm w-full"
                placeholder="Edit your caption…"
              />
              <input
                value={hashtags.join(' ')}
                onChange={(e) => setHashtags(e.target.value.split(' ').filter(Boolean))}
                className="input text-sm w-full"
                placeholder="#edit #your #hashtags"
              />

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Copy size={14} /> Copy Caption
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Download size={14} /> Download Video
                </button>
              </div>

              {/* Direct publish — coming soon */}
              <div className="relative rounded-lg border border-dashed border-border/50 p-3 text-center">
                <button
                  disabled
                  className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground opacity-50 cursor-not-allowed"
                >
                  <Send size={14} /> Direct Publish to Instagram
                </button>
                <span className="absolute -top-2.5 right-3 rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] font-bold text-yellow-300 uppercase tracking-wider">
                  Soon
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
