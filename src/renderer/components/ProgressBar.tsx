import React from 'react'

interface ProgressBarProps {
  progress: number
  label?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => (
  <div className="w-full">
    {label && (
      <p className="text-xs text-umber/50 font-sans mb-2 text-center">{label}</p>
    )}
    <div className="h-1.5 bg-umber/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
    <p className="text-xs text-umber/40 font-sans mt-2 text-right tabular-nums">
      {Math.round(progress)}%
    </p>
  </div>
)
