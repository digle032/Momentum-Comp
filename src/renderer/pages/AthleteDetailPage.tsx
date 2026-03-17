import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, Film, Camera, Plus } from 'lucide-react'
import { GlowingCard } from '../components/ui/GlowingCard'
import { GlowingEffect } from '../components/ui/GlowingEffect'
import { AthleteProgressTracker } from '../components/AthleteProgressTracker'
import { useCoachingStore } from '../store/coachingStore'
import { TrainingSession } from '../types'
import { AppPage } from '../components/MainSidebar'
import { getAvatarUrl } from '../lib/utils'
import { cn } from '../lib/utils'

interface AthleteDetailPageProps {
  athleteId: string
  onBack: () => void
  onNavigate: (page: AppPage) => void
  onOpenSession: (session: TrainingSession) => void
}

const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }
const ease = [0.16, 1, 0.3, 1] as const

type Tab = 'overview' | 'notes' | 'progress'

export const AthleteDetailPage: React.FC<AthleteDetailPageProps> = ({
  athleteId,
  onBack,
  onNavigate,
  onOpenSession,
}) => {
  const { athletes, sessions, addNote } = useCoachingStore()
  const athlete = athletes.find((a) => a.id === athleteId)
  const [noteText, setNoteText] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (!athlete) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Athlete not found.</p>
      </div>
    )
  }

  const athleteSessions = sessions.filter(
    (s) => s.assignedTo.type === 'athlete' && s.assignedTo.id === athleteId
  )

  const handleAddNote = () => {
    if (!noteText.trim()) return
    addNote(athlete.id, {
      id: `note-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      content: noteText.trim(),
    })
    setNoteText('')
  }

  const heightFt = Math.floor(athlete.height / 12)
  const heightIn = athlete.height % 12

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'notes', label: 'Notes' },
    { id: 'progress', label: 'Progress' },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Back + Header */}
      <div className="px-6 py-5 border-b border-border shrink-0">
        <button className="btn-ghost text-xs gap-1.5 mb-3 -ml-2" onClick={onBack}>
          <ArrowLeft size={14} />
          Back to Athletes
        </button>
        <div className="flex items-center gap-5">
          <img
            src={athlete.avatarUrl}
            alt={athlete.name}
            className="w-16 h-16 rounded-full border-2 border-accent/30 object-cover shrink-0"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = getAvatarUrl(athlete.name)
            }}
          />
          <div className="flex-1">
            <h1 className="font-serif text-2xl text-foreground">{athlete.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-muted-foreground">{athlete.sport}</span>
              <span className="chip chip-active text-[10px] px-2 py-0.5">{athlete.level}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Stats row — always visible */}
        <motion.div {...fade} transition={{ duration: 0.3, ease }}>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Age', value: `${athlete.age} yrs` },
              { label: 'Height', value: `${heightFt}′${heightIn}″` },
              { label: 'Weight', value: `${athlete.weight} lbs` },
              { label: 'Level', value: athlete.level },
            ].map((stat) => (
              <div key={stat.label} className="relative rounded-xl border border-border bg-muted/80 backdrop-blur-[20px] p-4 text-center">
                <GlowingEffect spread={30} proximity={48} inactiveZone={0.01} borderWidth={1.5} disabled={false} />
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Two columns — session history + goals */}
            <div className="grid grid-cols-2 gap-6">
              <motion.div {...fade} transition={{ duration: 0.3, delay: 0.05, ease }}>
                <GlowingCard className="p-5 h-full">
                  <h2 className="font-serif text-lg text-foreground mb-4">Session History</h2>
                  {athleteSessions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No sessions assigned yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {athleteSessions
                        .slice()
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border cursor-pointer hover:border-accent/30 transition-colors"
                            onClick={() => onOpenSession(s)}
                          >
                            {s.isCompleted ? (
                              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                            ) : (
                              <Clock size={14} className="text-amber-400 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(s.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </GlowingCard>
              </motion.div>

              <motion.div {...fade} transition={{ duration: 0.3, delay: 0.1, ease }}>
                <GlowingCard className="p-5 h-full">
                  <h2 className="font-serif text-lg text-foreground mb-3">Goals</h2>
                  {athlete.goals ? (
                    <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <p className="text-sm text-foreground leading-relaxed">{athlete.goals}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No goals set.</p>
                  )}
                </GlowingCard>
              </motion.div>
            </div>

            {/* Compilations */}
            <motion.div {...fade} transition={{ duration: 0.3, delay: 0.15, ease }}>
              <GlowingCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-lg text-foreground">Compilations</h2>
                </div>
                {athlete.compilationUrls.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                    <Film size={28} className="text-muted-foreground animate-breathe" />
                    <p className="text-muted-foreground text-sm">No compilations for this athlete yet.</p>
                    <button className="btn-primary text-xs" onClick={() => onNavigate('studio')}>
                      <Camera size={13} />
                      Create Compilation in Studio
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {athlete.compilationUrls.map((url, i) => (
                      <div key={i} className="aspect-video rounded-lg bg-muted border border-border flex items-center justify-center">
                        <video src={url} className="w-full h-full object-cover rounded-lg" />
                      </div>
                    ))}
                  </div>
                )}
              </GlowingCard>
            </motion.div>
          </>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <motion.div {...fade} transition={{ duration: 0.3, ease }}>
            <GlowingCard className="p-5 flex flex-col">
              <h2 className="font-serif text-lg text-foreground mb-3">Coach Notes</h2>

              {athlete.goals && (
                <div className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-[10px] text-accent font-mono uppercase tracking-widest mb-1">Goals</p>
                  <p className="text-sm text-foreground leading-relaxed">{athlete.goals}</p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {athlete.notes.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No notes yet.</p>
                ) : (
                  athlete.notes
                    .slice()
                    .reverse()
                    .map((note) => (
                      <div key={note.id} className="p-3 rounded-lg bg-background/50 border border-border">
                        <p className="text-[10px] text-muted-foreground mb-1">{note.date}</p>
                        <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                      </div>
                    ))
                )}
              </div>

              <div className="space-y-2">
                <textarea
                  className="input resize-none text-sm"
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a coaching note…"
                />
                <button
                  className="btn-outline w-full text-xs gap-1.5"
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                >
                  <Plus size={13} />
                  Add Note
                </button>
              </div>
            </GlowingCard>
          </motion.div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <motion.div {...fade} transition={{ duration: 0.3, ease }}>
            <AthleteProgressTracker athleteId={athleteId} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
