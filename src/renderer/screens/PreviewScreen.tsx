import React, { useCallback } from 'react'
import { theme } from '../styles/theme'
import { PrimaryButton } from '../components/PrimaryButton'
import { GlassCard } from '../components/GlassCard'

interface Props {
  outputUrl: string
  onCreateAnother: () => void
}

export const PreviewScreen: React.FC<Props> = ({ outputUrl, onCreateAnother }) => {
  const handleDownload = useCallback(() => {
    const a = document.createElement('a')
    a.href = outputUrl
    a.download = `momentum-compilation-${Date.now()}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [outputUrl])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        const res = await fetch(outputUrl)
        const blob = await res.blob()
        const file = new File([blob], 'momentum-compilation.mp4', { type: 'video/mp4' })
        await navigator.share({ files: [file], title: 'My Momentum Compilation' })
      } catch {
        // User cancelled or not supported
      }
    } else {
      // Fallback: copy URL
      navigator.clipboard.writeText(outputUrl).then(() => alert('Link copied!'))
    }
  }, [outputUrl])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Header */}
      <div style={{ padding: `${theme.spacing.lg}px`, alignSelf: 'stretch', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: theme.typography.fontFamily,
          fontSize: 22,
          fontWeight: 700,
          color: '#fff',
          margin: 0,
        }}>
          Your Compilation ⚡
        </h2>
      </div>

      {/* Video player */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md, width: '100%' }}>
        <video
          src={outputUrl}
          controls
          autoPlay
          loop
          style={{
            maxHeight: '60vh',
            maxWidth: '100%',
            borderRadius: theme.radii.lg,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ width: '100%', maxWidth: 480, padding: theme.spacing.lg }}>
        <GlassCard style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' }}>
          <PrimaryButton label="⬇ Download MP4" onClick={handleDownload} />
          <PrimaryButton
            label="Share"
            onClick={handleShare}
            variant="outline"
            style={{ marginTop: theme.spacing.sm, color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
          />
          <PrimaryButton
            label="Create Another"
            onClick={onCreateAnother}
            variant="outline"
            style={{ marginTop: theme.spacing.sm, color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
          />
        </GlassCard>
      </div>
    </div>
  )
}
