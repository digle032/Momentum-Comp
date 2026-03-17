import React from 'react'
import { LayoutDashboard, Users, Shield, Calendar, Camera, ChevronRight, Settings } from 'lucide-react'
import { cn } from '../lib/utils'
import { useSettingsStore } from '../store/settingsStore'
import { useTranslation } from '../lib/i18n'

export type AppPage = 'dashboard' | 'athletes' | 'teams' | 'calendar' | 'studio' | 'settings'

interface MainSidebarProps {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ activePage, onNavigate }) => {
  const language = useSettingsStore((s) => s.language)
  const t = useTranslation(language)

  const navItems: { id: AppPage; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard size={18} />, description: 'Overview & activity' },
    { id: 'athletes',  label: t('athletes'),  icon: <Users size={18} />,           description: 'Manage profiles' },
    { id: 'teams',     label: t('teams'),     icon: <Shield size={18} />,          description: 'Groups & rosters' },
    { id: 'calendar',  label: t('calendar'),  icon: <Calendar size={18} />,        description: 'Schedule sessions' },
    { id: 'studio',    label: t('studio'),    icon: <Camera size={18} />,          description: 'Create compilations' },
  ]

  return (
    <aside className="relative z-10 w-[240px] h-full flex flex-col border-r border-border bg-card/80 backdrop-blur-panel shrink-0">
      {/* Logo */}
      <div className="h-20 flex items-center gap-3 px-5 border-b border-border shrink-0">
        <img src="/assets/rabbit-logo.webp" alt="Momentum" className="h-16 w-auto object-contain" />
        <span className="font-serif text-xl text-foreground tracking-tight">Momentum</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn('nav-item w-full text-left group', activePage === item.id && 'nav-item-active')}
          >
            <span className={cn('shrink-0', activePage === item.id ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground')}>
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium leading-none', activePage === item.id ? 'text-accent' : '')}>
                {item.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.description}</p>
            </div>
            {activePage === item.id && <ChevronRight size={14} className="text-accent shrink-0" />}
          </button>
        ))}
      </nav>

      {/* Footer — Settings pinned above version */}
      <div className="px-3 py-4 border-t border-border shrink-0 space-y-1">
        <button
          onClick={() => onNavigate('settings')}
          className={cn('nav-item w-full text-left group', activePage === 'settings' && 'nav-item-active')}
        >
          <span className={cn('shrink-0', activePage === 'settings' ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground')}>
            <Settings size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-medium leading-none', activePage === 'settings' ? 'text-accent' : '')}>
              {t('settings')}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Preferences & profile</p>
          </div>
          {activePage === 'settings' && <ChevronRight size={14} className="text-accent shrink-0" />}
        </button>
        <p className="text-[11px] text-muted-foreground text-center pt-2">Momentum v1.0 — {t('coachEdition')}</p>
      </div>
    </aside>
  )
}
