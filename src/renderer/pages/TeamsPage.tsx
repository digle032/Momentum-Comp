import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Shield } from 'lucide-react'
import { GlowingCard } from '../components/ui/GlowingCard'
import { useCoachingStore } from '../store/coachingStore'
import { Team } from '../types'

interface TeamsPageProps {
  onViewTeam: (id: string) => void
}

const ease = [0.16, 1, 0.3, 1] as const

export const TeamsPage: React.FC<TeamsPageProps> = ({ onViewTeam }) => {
  const { teams, athletes, addTeam } = useCoachingStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSport, setNewSport] = useState('')

  let addCounter = 300
  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    const team: Team = {
      id: `team-new-${++addCounter}-${Date.now()}`,
      name: newName.trim(),
      sport: newSport.trim() || 'Multi-sport',
      athleteIds: [],
    }
    addTeam(team)
    setNewName('')
    setNewSport('')
    setShowAdd(false)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border shrink-0 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Teams</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{teams.length} team{teams.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} />
          Add Team
        </button>
      </div>

      {/* Add Team Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAdd(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease }}
            >
              <GlowingCard className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-xl text-foreground">New Team</h2>
                  <button className="btn-ghost p-1.5" onClick={() => setShowAdd(false)}>
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleAddTeam} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Team Name *</label>
                    <input
                      className="input"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Varsity Sprint Group"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Sport</label>
                    <input
                      className="input"
                      value={newSport}
                      onChange={(e) => setNewSport(e.target.value)}
                      placeholder="e.g. Track & Field"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" className="btn-ghost flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
                    <button type="submit" className="btn-primary flex-1">Create Team</button>
                  </div>
                </form>
              </GlowingCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <Shield size={32} className="text-muted-foreground animate-breathe" />
            <p className="text-muted-foreground">No teams yet.</p>
            <button className="btn-primary" onClick={() => setShowAdd(true)}>
              <Plus size={15} />
              Create your first team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {teams.map((team, i) => {
              const members = athletes.filter((a) => team.athleteIds.includes(a.id))
              const visible = members.slice(0, 5)
              const extra = members.length - visible.length
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06, ease }}
                >
                  <GlowingCard className="p-5 flex flex-col gap-4 h-full">
                    <div>
                      <p className="font-serif text-base text-foreground">{team.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{team.sport}</p>
                    </div>

                    {/* Avatars */}
                    <div className="flex items-center gap-1.5">
                      {members.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No members yet</span>
                      ) : (
                        <>
                          {visible.map((a) => (
                            <img
                              key={a.id}
                              src={a.avatarUrl}
                              alt={a.name}
                              title={a.name}
                              className="w-7 h-7 rounded-full border border-border object-cover -ml-1 first:ml-0"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=1e2a3a&color=00f5d4&size=28`
                              }}
                            />
                          ))}
                          {extra > 0 && (
                            <span className="w-7 h-7 rounded-full border border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground -ml-1">
                              +{extra}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mt-auto">
                      <button
                        className="btn-ghost w-full text-xs text-accent"
                        onClick={() => onViewTeam(team.id)}
                      >
                        View Roster →
                      </button>
                    </div>
                  </GlowingCard>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
