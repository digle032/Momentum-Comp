import React from 'react'
import { theme } from '../styles/theme'

interface ProgressBarProps {
  progress: number
  label?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => (
  <div>
    {label && (
      <p style={{
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: 8,
        fontFamily: theme.typography.fontFamily,
      }}>
        {label}
      </p>
    )}
    <div style={{
      height: 6,
      borderRadius: theme.radii.full,
      background: theme.colors.border,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${Math.min(100, Math.max(0, progress))}%`,
        background: theme.colors.primary,
        borderRadius: theme.radii.full,
        transition: 'width 0.3s ease',
      }} />
    </div>
    <p style={{
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      textAlign: 'right',
      fontFamily: theme.typography.fontFamily,
    }}>
      {Math.round(progress)}%
    </p>
  </div>
)
