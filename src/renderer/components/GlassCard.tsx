import React, { CSSProperties } from 'react'
import { theme } from '../styles/theme'

interface GlassCardProps {
  children: React.ReactNode
  style?: CSSProperties
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => (
  <div
    style={{
      background: theme.colors.glass,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: theme.radii.lg,
      border: `1px solid ${theme.colors.border}`,
      padding: theme.spacing.md,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      ...style,
    }}
  >
    {children}
  </div>
)
