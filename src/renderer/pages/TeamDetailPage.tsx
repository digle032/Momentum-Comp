import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, UserPlus, X, CheckCircle2, Clock, Camera, CalendarPlus } from 'lucide-react'
import { GlowingCard } from '../components/ui/GlowingCard'
import { useCoachingStore } from '../store/coachingStore'
import { TrainingSession } from '../types'
import { AppPage } from '../components/MainSidebar'

interface TeamDetailPageProps {
  teamId: string
  onBack: () => void
  onNavigate: (page: AppPage) => void
  onOpenSession: (session?: TrainingSession) => void
}

const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }
const ease = [0.16, 1, 0.3, 1] as const

export const TeamDetailPage: React.FC<TeamDetailPageProps> = ({
  teamId,
  onBack,
  onNavigate,
  onOpenSession,
}) => {
  const { teams, athletes, sessions, updateTeam } = useCoachingStore()
  const team = teams.find((t) => t.id === teamId)

  if (!team) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Team not found.</p>
      </div>
    )
  }

  const members = athletes.filter((a) => team.athleteIds.includes(a.id))
  const nonMembers = athletes.filter((a) => !team.athleteIds.includes(a.id))
  const teamSessions = sessions.filter(
    (s) => s.assignedTo.type === 'team' && s.assignedTo.id === teamId
  )

  const addMember = (athleteId: string) => {
    updateTeam(team.id, { athleteIds: [...team.athleteIds, athleteId] })
  }

  const removeMember = (athleteId: string) => {
    updateTeam(team.id, { athleteIds: team.athleteIds.filter((id) => id !== athleteId) })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border shrink-0">
        <button className="btn-ghost text-xs gap-1.5 mb-3 -ml-2" onClick={onBack}>
          <ArrowLeft size={14} />
          Back to Teams
        </button>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl text-foreground">{team.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {team.sport} · {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Roster */}
          <motion.div {...fade} transition={{ duration: 0.3, ease }}>
            <GlowingCard className="p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-foreground">Roster</h2>
                {nonMembers.length > 0 && (
                  <div className="relative group">
                    <button className="btn-outline text-xs gap-1.5">
                      <UserPlus size={13} />
                      Add Member
                    </button>
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-card py-1 z-20 hidden group-focus-within:block group-hover:block">
                      {nonMembers.map((a) => (
                        <button
                          key={a.id}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted text-left"
                          onClick={() => addMember(a.id)}
                        >
                          <img
                            src={a.avatarUrl}
                            className="w-5 h-5 rounded-full object-cover border border-border"
                            alt=""
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=1e2a3a&color=00f5d4&size=20`
                            }}
                          />
                          <span className="truncate">{a.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {members.length === 0 ? (
                <p className="text-muted-foreground text-sm">No members yet. Add athletes to get started.</p>
              ) : (
                <ul className="space-y-2">
                  {members.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-background/50 border border-border"
                    >
                      <img
                        src={a.avatarUrl}
                        alt={a.name}
                        className="w-8 h-8 rounded-full border border-border object-cover shrink-0"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=1e2a3a&color=00f5d4&size=32`
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.level}</p>
                      </div>
                      <button
                        className="btn-ghost p-1 text-muted-foreground hover:text-red-400"
                        onClick={() => removeMember(a.id)}
                        title="Remove from team"
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </GlowingCard>
          </motion.div>

          {/* Team Sessions */}
          <motion.div {...fade} transition={{ duration: 0.3, delay: 0.05, ease }}>
            <GlowingCard className="p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-foreground">Sessions</h2>
                <button className="btn-outline text-xs gap-1.5" onClick={() => onOpenSession()}>
                  <CalendarPlus size={13} />
                  Assign Session
                </button>
              </div>

              {teamSessions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No sessions assigned to this team.</p>
              ) : (
                <ul className="space-y-2">
                  {teamSessions
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
                            })}
                          </p>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </GlowingCard>
          </motion.div>
        </div>

        {/* Generate Compilation CTA */}
        <motion.div {...fade} transition={{ duration: 0.3, delay: 0.1, ease }}>
          <GlowingCard className="p-6 flex items-center justify-between gap-6">
            <div>
              <h2 className="font-serif text-lg text-foreground">Team Compilation</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Generate a highlight reel featuring all athletes in this team.
              </p>
            </div>
            <button className="btn-primary shrink-0" onClick={() => onNavigate('studio')}>
              <Camera size={15} />
              Generate Team Compilation
            </button>
          </GlowingCard>
        </motion.div>
      </div>
    </div>
  )
}
