import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Calendar, CheckCircle2, Clock, User, Film } from 'lucide-react'

export interface OrbitalItem {
  id: string
  title: string
  date: string
  type: 'session' | 'compilation' | 'milestone'
  isCompleted?: boolean
  assignedTo?: string
}

interface OrbitalTimelineProps {
  items: OrbitalItem[]
  className?: string
}

export const OrbitalTimeline: React.FC<OrbitalTimelineProps> = ({ items, className }) => {
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id ?? '')
  const [rotation, setRotation] = useState(0)

  const displayItems = items.slice(0, 10)
  const selectedItem = displayItems.find((i) => i.id === selectedId)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => r + 0.05)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const radius = 160
  const centerX = 220
  const centerY = 220

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: 440, height: 440 }}
    >
      {/* Rings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 440 440">
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="hsl(216, 34%, 17%)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.6}
          fill="none"
          stroke="hsl(216, 34%, 17%)"
          strokeWidth="1"
          opacity="0.5"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.3}
          fill="none"
          stroke="hsl(216, 34%, 17%)"
          strokeWidth="1"
          opacity="0.25"
        />
      </svg>

      {/* Orbital nodes */}
      {displayItems.map((item, i) => {
        const angle = ((i / displayItems.length) * 360 + rotation) * (Math.PI / 180)
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        const isSelected = item.id === selectedId

        return (
          <motion.button
            key={item.id}
            className={cn(
              'absolute w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors duration-300 cursor-pointer',
              isSelected
                ? 'border-accent bg-accent/20 shadow-glow scale-125'
                : 'border-border bg-muted hover:border-accent/50 hover:bg-accent/5'
            )}
            style={{ left: x - 18, top: y - 18 }}
            onClick={() => setSelectedId(item.id)}
            whileHover={{ scale: isSelected ? 1.25 : 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            {item.type === 'session' && (
              <Calendar size={13} className={isSelected ? 'text-accent' : 'text-muted-foreground'} />
            )}
            {item.type === 'compilation' && (
              <Film size={13} className={isSelected ? 'text-accent' : 'text-muted-foreground'} />
            )}
            {item.type === 'milestone' && (
              <Clock size={13} className={isSelected ? 'text-accent' : 'text-muted-foreground'} />
            )}
            {item.isCompleted && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-positive flex items-center justify-center">
                <CheckCircle2 size={8} className="text-background" />
              </span>
            )}
          </motion.button>
        )
      })}

      {/* Center hub */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {selectedItem && (
            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-40 h-40 rounded-full bg-muted border border-border flex flex-col items-center justify-center text-center p-4 shadow-card"
            >
              <span className="text-[10px] text-accent font-mono uppercase tracking-widest mb-1">
                {selectedItem.type}
              </span>
              <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
                {selectedItem.title}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(selectedItem.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              {selectedItem.assignedTo && (
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <User size={8} />
                  {selectedItem.assignedTo}
                </p>
              )}
              {selectedItem.isCompleted && (
                <span className="mt-1.5 text-[9px] text-accent font-mono uppercase tracking-widest">
                  ✓ Done
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
