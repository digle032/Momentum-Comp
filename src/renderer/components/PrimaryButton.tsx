import React, { CSSProperties } from 'react'

interface PrimaryButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'solid' | 'outline' | 'ghost'
  className?: string
  style?: CSSProperties
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label, onClick, disabled, loading, variant = 'solid', className = '', style,
}) => {
  const base = 'btn-primary'
  const outline = 'bg-transparent text-accent border border-accent hover:bg-accent/6 shadow-none active:shadow-none'
  const ghost = 'btn-ghost shadow-none active:shadow-none'

  const cls = variant === 'outline' ? `${base.replace('bg-accent text-white', '')} ${outline}` :
              variant === 'ghost'   ? ghost : base

  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`w-full ${cls} ${className}`}
      style={style}
    >
      {loading ? 'Working…' : label}
    </button>
  )
}
