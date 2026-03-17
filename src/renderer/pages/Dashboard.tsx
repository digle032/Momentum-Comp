import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, UserPlus, Camera, CheckCircle2, Clock, Users, Calendar, Film, TrendingUp } from 'lucide-react'
import { GlowingCard } from '../components/ui/GlowingCard'
import { OrbitalTimeline, OrbitalItem } from '../components/ui/OrbitalTimeline'
import { useCoachingStore } from '../store/coachingStore'
import { AppPage } from '../components/MainSidebar'

interface DashboardProps {
  onNavigate: (page: AppPage) => void
  onAddAthlete: () => void
  onNewSession: () => void
}

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
const ease = [0.16, 1, 0.3, 1] as const

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onAddAthlete, onNewSession }) => {
  const { athletes, teams, sessions } = useCoachingStore()

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const todaySessions = sessions.filter((s) => s.date.startsWith(todayStr))

  const thisMonthSessions = sessions.filter((s) => {
    const d = new Date(s.date)
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()
  })

  const recentAthlete = athletes[athletes.length - 1]

  const orbitalItems: OrbitalItem[] = sessions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map((s) => {
      const assigned =
        s.assignedTo.type === 'athlete'
          ? athletes.find((a) => a.id === s.assignedTo.id)?.name
          : teams.find((t) => t.id === s.assignedTo.id)?.name
      return {
        id: s.id,
        title: s.title,
        date: s.date,
        type: 'session' as const,
        isCompleted: s.isCompleted,
        assignedTo: assigned,
      }
    })

  const greetingHour = today.getHours()
  const greeting =
    greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-6">
      {/* Welcome Header */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.4, ease }}
      >
        <GlowingCard className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-serif text-3xl text-foreground">{greeting}, Coach.</h1>
              <p className="text-muted-foreground text-sm mt-1">{dateLabel}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="btn-primary" onClick={onNewSession}>
                <Zap size={15} />
                New Session
              </button>
              <button className="btn-outline" onClick={onAddAthlete}>
                <UserPlus size={15} />
                Add Athlete
              </button>
              <button className="btn-ghost" onClick={() => onNavigate('studio')}>
                <Camera size={15} />
                Open Studio
              </button>
            </div>
          </div>
        </GlowingCard>
      </motion.div>

      {/* Row 1: Today + Orbital */}
      <div className="grid grid-cols-12 gap-6">
        {/* Today's Schedule — 5 cols */}
        <motion.div
          className="col-span-5"
          {...fadeIn}
          transition={{ duration: 0.4, delay: 0.05, ease }}
        >
          <GlowingCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg text-foreground">Today</h2>
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                {todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {todaySessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <Calendar size={28} className="text-muted-foreground animate-breathe" />
                <p className="text-muted-foreground text-sm">No sessions scheduled today.</p>
                <button className="btn-outline text-xs" onClick={onNewSession}>
                  Schedule a session
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {todaySessions.map((s) => {
                  const assignedName =
                    s.assignedTo.type === 'athlete'
                      ? athletes.find((a) => a.id === s.assignedTo.id)?.name
                      : teams.find((t) => t.id === s.assignedTo.id)?.name
                  return (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border"
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          s.isCompleted ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{assignedName}</p>
                      </div>
                      {s.isCompleted ? (
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Clock size={14} className="text-amber-400 shrink-0" />
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </GlowingCard>
        </motion.div>

        {/* Orbital Timeline — 7 cols */}
        <motion.div
          className="col-span-7"
          {...fadeIn}
          transition={{ duration: 0.4, delay: 0.1, ease }}
        >
          <GlowingCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif text-lg text-foreground">Activity Timeline</h2>
            </div>
            <div className="flex flex-col items-center">
              {orbitalItems.length > 0 ? (
                <>
                  <OrbitalTimeline items={orbitalItems} />
                  <div className="flex items-center gap-5 mt-2">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-border border border-border" />
                      Upcoming
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-accent/30 border border-accent/50" />
                      Selected
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent flex items-center justify-center">
                        <CheckCircle2 size={6} className="text-accent-foreground" />
                      </span>
                      Completed
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <Clock size={28} className="text-muted-foreground animate-breathe" />
                  <p className="text-muted-foreground text-sm">No sessions yet. Create your first session to get started.</p>
                </div>
              )}
            </div>
          </GlowingCard>
        </motion.div>
      </div>

      {/* Row 2: Athlete Spotlight + Recent Compilations + Quick Stats */}
      <div className="grid grid-cols-12 gap-6">
        {/* Athlete Spotlight — 4 cols */}
        <motion.div
          className="col-span-4"
          {...fadeIn}
          transition={{ duration: 0.4, delay: 0.15, ease }}
        >
          <GlowingCard className="p-5 h-full">
            <h2 className="font-serif text-lg text-foreground mb-4">Athlete Spotlight</h2>
            {recentAthlete ? (
              <div className="flex flex-col items-center text-center gap-3">
                <img
                  src={recentAthlete.avatarUrl}
                  alt={recentAthlete.name}
                  className="w-16 h-16 rounded-full border-2 border-accent/30 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(recentAthlete.name)}&background=1e2a3a&color=00f5d4` }}
                />
                <div>
                  <p className="font-serif text-base text-foreground">{recentAthlete.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{recentAthlete.sport}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-[10px] font-medium">
                    {recentAthlete.level}
                  </span>
                </div>
                <button className="btn-outline text-xs w-full" onClick={() => onNavigate('athletes')}>
                  View Profile →
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <Users size={24} className="text-muted-foreground" />
                <p className="text-muted-foreground text-sm">No athletes yet.</p>
                <button className="btn-outline text-xs" onClick={onAddAthlete}>
                  Add your first athlete
                </button>
              </div>
            )}
          </GlowingCard>
        </motion.div>

        {/* Recent Compilations — 5 cols */}
        <motion.div
          className="col-span-5"
          {...fadeIn}
          transition={{ duration: 0.4, delay: 0.2, ease }}
        >
          <GlowingCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg text-foreground">Recent Compilations</h2>
              <button className="btn-ghost text-xs" onClick={() => onNavigate('studio')}>
                Open Studio →
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <Film size={28} className="text-muted-foreground animate-breathe" />
              <p className="text-muted-foreground text-sm">No compilations generated yet.</p>
              <button className="btn-primary text-xs" onClick={() => onNavigate('studio')}>
                <Camera size={13} />
                Create First Compilation
              </button>
            </div>
          </GlowingCard>
        </motion.div>

        {/* Quick Stats — 3 cols */}
        <motion.div
          className="col-span-3"
          {...fadeIn}
          transition={{ duration: 0.4, delay: 0.25, ease }}
        >
          <GlowingCard className="p-5 h-full">
            <h2 className="font-serif text-lg text-foreground mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Users size={15} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{athletes.length}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Total Athletes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Calendar size={15} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{thisMonthSessions.length}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Sessions This Month</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <TrendingUp size={15} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">0</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Compilations</p>
                </div>
              </div>
            </div>
          </GlowingCard>
        </motion.div>
      </div>
    </div>
  )
}
