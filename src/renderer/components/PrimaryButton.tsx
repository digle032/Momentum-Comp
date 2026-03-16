import React, { CSSProperties } from 'react'
import { theme } from '../styles/theme'

interface PrimaryButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'solid' | 'outline'
  style?: CSSProperties
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onClick,
  disabled,
  loading,
  variant = 'solid',
  style,
}) => {
  const isDisabled = disabled || loading

  const base: CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '14px 24px',
    borderRadius: theme.radii.md,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: theme.typography.fontFamily,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'opacity 0.15s, transform 0.1s',
    border: 'none',
    outline: 'none',
  }

  const solid: CSSProperties = {
    background: theme.colors.primary,
    color: '#fff',
    boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
  }

  const outline: CSSProperties = {
    background: 'transparent',
    color: theme.colors.primary,
    border: `1.5px solid ${theme.colors.primary}`,
    boxShadow: 'none',
  }

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      style={{ ...base, ...(variant === 'solid' ? solid : outline), ...style }}
    >
      {loading ? 'Working…' : label}
    </button>
  )
}
