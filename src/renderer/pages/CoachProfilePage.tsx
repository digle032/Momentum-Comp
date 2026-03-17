import React from 'react'
import { motion } from 'framer-motion'
import { Instagram, Copy, ExternalLink } from 'lucide-react'
import { GlowingCard } from '../components/ui/GlowingCard'
import { GlowingEffect } from '../components/ui/GlowingEffect'
import { InteractiveHoverButton } from '../components/ui/InteractiveHoverButton'
import { useCoachingStore } from '../store/coachingStore'
import { useToast } from '../context/ToastContext'
import { getAvatarUrl } from '../lib/utils'

const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }
const ease = [0.16, 1, 0.3, 1] as const

export const CoachProfilePage: React.FC = () => {
  const { coachProfile, athletes, sessions, activityFeed } = useCoachingStore()
  const { show } = useToast()

  const profileUrl = `momentum.app/coach/${coachProfile.publicHandle}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl).then(() => show('Profile link copied!'))
  }

  const recentEvents = activityFeed.slice(0, 3)

  return (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-6">
      <motion.div {...fade} transition={{ duration: 0.3, ease }}>
        <h1 className="font-serif text-2xl text-foreground mb-1">Coach Profile</h1>
        <p className="text-sm text-muted-foreground">Your public coaching identity</p>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left — identity */}
        <motion.div
          className="col-span-4"
          {...fade}
          transition={{ duration: 0.3, delay: 0.05, ease }}
        >
          <GlowingCard className="p-6 flex flex-col items-center text-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={coachProfile.avatarUrl}
                alt={coachProfile.name}
                className="w-24 h-24 rounded-full border-2 border-accent/40 object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = getAvatarUrl(coachProfile.name, 96)
                }}
              />
              <div className="absolute inset-0 rounded-full ring-2 ring-accent/20 ring-offset-2 ring-offset-transparent" />
            </div>

            <div>
              <h2 className="font-serif text-2xl text-foreground">{coachProfile.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{coachProfile.title}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium">
                {coachProfile.sport}
              </span>
            </div>

            {coachProfile.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed">{coachProfile.bio}</p>
            )}

            {coachProfile.instagram && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Instagram size={12} />
                <span>@{coachProfile.instagram}</span>
              </div>
            )}

            <InteractiveHoverButton text="Edit Profile" variant="ghost" className="w-full text-xs" />
          </GlowingCard>
        </motion.div>

        {/* Right — stats + highlights */}
        <div className="col-span-8 flex flex-col gap-6">
          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-4"
            {...fade}
            transition={{ duration: 0.3, delay: 0.1, ease }}
          >
            {[
              { label: 'Total Athletes', value: athletes.length },
              { label: 'Sessions Logged', value: sessions.filter((s) => s.isCompleted).length },
              { label: 'Compilations', value: 0 },
            ].map((stat) => (
              <div key={stat.label} className="relative rounded-xl border border-border bg-muted/80 backdrop-blur-[20px] p-5 text-center">
                <GlowingEffect spread={30} proximity={48} inactiveZone={0.01} borderWidth={1.5} disabled={false} />
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Recent Highlights */}
          <motion.div {...fade} transition={{ duration: 0.3, delay: 0.15, ease }}>
            <GlowingCard className="p-5">
              <h3 className="font-serif text-base text-foreground mb-4">Recent Highlights</h3>
              <div className="space-y-2">
                {recentEvents.map((event, i) => (
                  <div
                    key={event.id}
                    className="relative p-3 rounded-xl border border-border bg-background/50 transition-all duration-200 hover:border-accent/30 hover:bg-background/80"
                    style={{
                      transform: `translateX(${i * 4}px) translateY(${i * 2}px)`,
                      zIndex: 3 - i,
                      filter: i > 0 ? `grayscale(${i * 30}%)` : undefined,
                    }}
                  >
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.subtitle}</p>
                  </div>
                ))}
                {recentEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                )}
              </div>
            </GlowingCard>
          </motion.div>
        </div>
      </div>

      {/* Public profile link */}
      <motion.div {...fade} transition={{ duration: 0.3, delay: 0.2, ease }}>
        <GlowingCard className="p-5">
          <h3 className="font-serif text-base text-foreground mb-3">Public Profile Link</h3>
          <div className="flex items-center gap-3">
            <code className="flex-1 px-3 py-2 rounded-lg bg-background/60 border border-border text-sm text-accent font-mono truncate">
              {profileUrl}
            </code>
            <button className="btn-outline gap-1.5 shrink-0 text-xs" onClick={handleCopyLink}>
              <Copy size={13} />
              Copy Link
            </button>
            <button className="btn-ghost gap-1.5 shrink-0 text-xs">
              <ExternalLink size={13} />
              Preview
            </button>
          </div>
        </GlowingCard>
      </motion.div>
    </div>
  )
}
