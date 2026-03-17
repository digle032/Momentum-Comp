import React from 'react'

import { PrimaryButton } from '../components/PrimaryButton'
import { useCompilationStore } from '../store/compilationStore'

interface Props {
  onStart: () => void
}

export const HomeScreen: React.FC<Props> = ({ onStart }) => {
  const clearMedia = useCompilationStore((s) => s.clearMedia)
  const resetGeneration = useCompilationStore((s) => s.resetGeneration)

  const handleStart = () => {
    clearMedia()
    resetGeneration()
    onStart()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${theme.spacing.xxl}px ${theme.spacing.xl}px`,
    }}>
      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <div style={{
          width: 80, height: 80,
          borderRadius: 24,
          background: theme.colors.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
          fontSize: 40,
        }}>
          ⚡
        </div>
        <h1 style={{
          fontFamily: theme.typography.fontFamily,
          fontSize: 42,
          fontWeight: 700,
          color: theme.colors.text,
          letterSpacing: -1,
          margin: 0,
        }}>
          Momentum
        </h1>
        <p style={{
          fontFamily: theme.typography.fontFamily,
          fontSize: 17,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          lineHeight: 1.6,
          maxWidth: 380,
          margin: 0,
        }}>
          Turn your best moments into cinematic highlight reels — instantly.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap', justifyContent: 'center', marginTop: theme.spacing.md }}>
          {['One-tap generation', 'On-device AI', 'Beat-synced edits', 'No uploads ever'].map((f) => (
            <span key={f} style={{
              borderRadius: theme.radii.full,
              padding: '6px 14px',
              background: theme.colors.primaryLight,
              border: `1px solid ${theme.colors.primaryBorder}`,
              fontSize: 13,
              fontWeight: 600,
              color: theme.colors.primary,
              fontFamily: theme.typography.fontFamily,
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ width: '100%', maxWidth: 400 }}>
        <PrimaryButton label="Create New Compilation" onClick={handleStart} />
        <p style={{
          fontFamily: theme.typography.fontFamily,
          fontSize: 12,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing.md,
        }}>
          All processing happens in your browser. Nothing is uploaded.
        </p>
      </div>
    </div>
  )
}
