import React from 'react'
import { Dumbbell, UserPlus, Film, Star, TrendingUp } from 'lucide-react'
import { GlowingEffect } from './ui/GlowingEffect'
import { useCoachingStore } from '../store/coachingStore'
import { ActivityEvent } from '../types'

interface ActivityFeedProps {
  maxItems?: number
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

const iconMap: Record<ActivityEvent['type'], React.ReactNode> = {
  session_logged: <Dumbbell size={14} />,
  athlete_added: <UserPlus size={14} />,
  compilation_ready: <Film size={14} />,
  clip_tagged: <Star size={14} />,
  progress_logged: <TrendingUp size={14} />,
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ maxItems = 8 }) => {
  const { activityFeed } = useCoachingStore()
  const items = activityFeed.slice(0, maxItems)

  return (
    <div className="relative rounded-2xl border border-border bg-muted/80 backdrop-blur-[20px] p-5 flex flex-col h-full">
      <GlowingEffect spread={30} proximity={48} inactiveZone={0.01} borderWidth={1.5} disabled={false} />

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-base text-foreground">Activity Feed</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0 relative">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>
        )}
        {items.map((event, i) => (
          <div key={event.id} className="flex gap-3 relative">
            {/* Connecting line */}
            {i < items.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
            )}
            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 z-10 text-accent">
              {iconMap[event.type]}
            </div>
            {/* Content */}
            <div className="flex-1 pb-4 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground leading-tight">{event.title}</p>
                <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap mt-0.5">
                  {timeAgo(event.timestamp)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {activityFeed.length > maxItems && (
        <div className="pt-3 border-t border-border mt-2">
          <p className="text-xs text-muted-foreground text-center hover:text-accent transition-colors cursor-pointer">
            View all activity →
          </p>
        </div>
      )}
    </div>
  )
}
