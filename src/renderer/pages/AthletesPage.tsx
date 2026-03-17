import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, UserPlus } from 'lucide-react'
import { GlowingCard } from '../components/ui/GlowingCard'
import { useCoachingStore } from '../store/coachingStore'
import { Athlete } from '../types'

interface AthletesPageProps {
  onViewAthlete: (id: string) => void
  onAddAthlete: () => void
}

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.16, 1, 0.3, 1] as const

export const AthletesPage: React.FC<AthletesPageProps> = ({ onViewAthlete, onAddAthlete }) => {
  const { athletes } = useCoachingStore()
  const [query, setQuery] = useState('')

  const filtered = athletes.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.sport.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border shrink-0 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Athletes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{athletes.length} athlete{athletes.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="input pl-8 w-56"
              placeholder="Search athletes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={onAddAthlete}>
            <UserPlus size={15} />
            Add Athlete
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <p className="text-muted-foreground">
              {query ? `No athletes found for "${query}".` : 'No athletes yet.'}
            </p>
            {!query && (
              <button className="btn-primary" onClick={onAddAthlete}>
                <UserPlus size={15} />
                Add your first athlete
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {filtered.map((athlete, i) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                index={i}
                onView={() => onViewAthlete(athlete.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface AthleteCardProps {
  athlete: Athlete
  index: number
  onView: () => void
}

const AthleteCard: React.FC<AthleteCardProps> = ({ athlete, index, onView }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
  >
    <GlowingCard className="p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-4">
        <img
          src={athlete.avatarUrl}
          alt={athlete.name}
          className="w-14 h-14 rounded-full border-2 border-border object-cover shrink-0"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(athlete.name)}&background=1e2a3a&color=00f5d4`
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base text-foreground truncate">{athlete.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{athlete.sport}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="chip chip-active text-[10px] px-2 py-0.5">{athlete.level}</span>
        <span className="chip chip-inactive text-[10px] px-2 py-0.5">Age {athlete.age}</span>
      </div>
      <div className="mt-auto">
        <button className="btn-ghost w-full text-xs text-accent" onClick={onView}>
          View Profile →
        </button>
      </div>
    </GlowingCard>
  </motion.div>
)
