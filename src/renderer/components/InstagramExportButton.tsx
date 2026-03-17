import React, { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Share2, Copy, Download, Instagram } from 'lucide-react'
import { InteractiveHoverButton } from './ui/InteractiveHoverButton'
import { GlowingCard } from './ui/GlowingCard'
import { useToast } from '../context/ToastContext'

interface InstagramExportButtonProps {
  compilationUrl?: string
  athleteNames: string[]
  onDownload?: () => void
}

export const InstagramExportButton: React.FC<InstagramExportButtonProps> = ({
  compilationUrl,
  athleteNames,
  onDownload,
}) => {
  const [open, setOpen] = useState(false)
  const { show } = useToast()
  const defaultCaption = `🔥 New training compilation — ${athleteNames.join(', ')}. Built with Momentum. #coaching #athlete #performance`
  const [caption, setCaption] = useState(defaultCaption)

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption).then(() => show('Caption copied to clipboard!'))
  }

  const handleConnect = () => {
    show('Instagram Business API coming soon. Download your video and upload manually.')
  }

  return (
    <>
      <InteractiveHoverButton
        text="Share to Instagram"
        variant="ghost"
        onClick={() => setOpen(true)}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              className="relative z-10 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlowingCard className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Instagram size={18} className="text-pink-400" />
                    <h2 className="font-serif text-lg text-foreground">Share to Instagram</h2>
                  </div>
                  <button className="btn-ghost p-1.5 rounded-lg" onClick={() => setOpen(false)}>
                    <X size={15} />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="w-full aspect-video rounded-xl mb-5 overflow-hidden border border-border">
                  {compilationUrl ? (
                    <video src={compilationUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: 'linear-gradient(135deg, hsl(170,80%,20%) 0%, hsl(260,60%,20%) 100%)',
                      }}
                    />
                  )}
                </div>

                {/* Caption */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Caption</label>
                  <textarea
                    className="input resize-none text-sm"
                    rows={4}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <button
                    className="btn-ghost mt-2 text-xs gap-1.5 w-full"
                    onClick={handleCopyCaption}
                  >
                    <Copy size={12} />
                    Copy Caption
                  </button>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button className="btn-primary w-full gap-2" onClick={handleConnect}>
                    <Instagram size={15} />
                    Connect Instagram
                  </button>
                  {onDownload && (
                    <button className="btn-outline w-full gap-2" onClick={() => { onDownload(); setOpen(false) }}>
                      <Download size={15} />
                      Download MP4
                    </button>
                  )}
                </div>
              </GlowingCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
