import React, { useState } from 'react'
import { Film, Star, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { useCoachingStore } from '../store/coachingStore'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/utils'
import { getAvatarUrl } from '../lib/utils'

interface SessionVideoLoggerProps {
  sessionId: string
  assignedAthleteIds: string[]
}

const DRILL_SUGGESTIONS = [
  'Sprint Drill',
  'Agility Ladder',
  'Shooting Form',
  'Strength Block',
  'Recovery Work',
  'Game Simulation',
]

function StarRating({
  value,
  onChange,
}: {
  value: 1 | 2 | 3
  onChange: (v: 1 | 2 | 3) => void
}) {
  return (
    <div className="flex gap-0.5">
      {([1, 2, 3] as const).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            'transition-colors',
            n <= value ? 'text-amber-400' : 'text-muted-foreground/30 hover:text-amber-400/60'
          )}
        >
          <Star size={14} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export const SessionVideoLogger: React.FC<SessionVideoLoggerProps> = ({
  sessionId,
  assignedAthleteIds,
}) => {
  const { athletes, sessions, addClipToSession, updateClipRating } = useCoachingStore()
  const { show } = useToast()
  const [open, setOpen] = useState(false)
  const [athleteId, setAthleteId] = useState(assignedAthleteIds[0] ?? '')
  const [drillName, setDrillName] = useState('')
  const [rating, setRating] = useState<1 | 2 | 3>(2)

  const session = sessions.find((s) => s.id === sessionId)
  const clips = session?.clips ?? []

  const availableAthletes = athletes.filter((a) => assignedAthleteIds.includes(a.id))

  const handleAddClip = (e: React.FormEvent) => {
    e.preventDefault()
    if (!drillName.trim() || !athleteId) return
    addClipToSession(sessionId, {
      id: `clip-${Date.now()}`,
      athleteId,
      drillName: drillName.trim(),
      rating,
      timestamp: new Date().toISOString(),
    })
    show(`Clip tagged: ${drillName}`)
    setDrillName('')
    setRating(2)
  }

  return (
    <div className="border-t border-border mt-4 pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Film size={14} className="text-accent" />
          <span className="text-sm font-medium text-foreground">Clip Logger</span>
          {clips.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-mono">
              {clips.length}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp size={14} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Clip grid */}
          {clips.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {clips.map((clip, i) => {
                const ath = athletes.find((a) => a.id === clip.athleteId)
                return (
                  <div
                    key={clip.id}
                    className={cn(
                      'relative p-3 rounded-xl border border-border bg-background/50',
                      'transition-all duration-200 hover:border-accent/30 hover:bg-background/80',
                      i % 2 === 1 && 'translate-y-1'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={ath?.avatarUrl ?? getAvatarUrl(ath?.name ?? 'A')}
                        alt={ath?.name}
                        className="w-6 h-6 rounded-full object-cover border border-border"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = getAvatarUrl(ath?.name ?? 'A')
                        }}
                      />
                      <span className="text-xs text-foreground font-medium truncate flex-1">
                        {ath?.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5 truncate">{clip.drillName}</p>
                    <StarRating
                      value={clip.rating}
                      onChange={(r) => updateClipRating(sessionId, clip.id, r)}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* Add clip form */}
          <form onSubmit={handleAddClip} className="space-y-3 p-3 rounded-xl bg-background/30 border border-border/60">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Add Clip</p>
            {availableAthletes.length > 1 && (
              <select
                className="input text-sm"
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
              >
                {availableAthletes.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}
            <div className="relative">
              <input
                className="input text-sm"
                placeholder="Drill name"
                value={drillName}
                onChange={(e) => setDrillName(e.target.value)}
                list="drill-suggestions"
                required
              />
              <datalist id="drill-suggestions">
                {DRILL_SUGGESTIONS.map((d) => <option key={d} value={d} />)}
              </datalist>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Rating</span>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <button type="submit" className="btn-outline w-full text-xs gap-1.5">
              <Plus size={13} />
              Tag Clip
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
