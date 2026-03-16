import React, { CSSProperties } from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', style }) => (
  <div
    className={`glass-panel rounded-2xl border border-border shadow-glass p-4 ${className}`}
    style={style}
  >
    {children}
  </div>
)
