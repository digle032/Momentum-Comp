import React, { useState, useRef } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { useTranslation, languageOptions } from '../lib/i18n'
import rabbitLogo from '../assets/rabbit-logo.png'
import {
  User, Globe, Clock, LogOut, Check,
  Camera, ChevronRight, Save
} from 'lucide-react'

interface SettingsPageProps {
  onLogout: () => void
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const store = useSettingsStore()
  const t = useTranslation(store.language)
  const [activeSection, setActiveSection] = useState<'profile' | 'language' | 'timedate'>('profile')
  const [saved, setSaved] = useState(false)
  const [localProfile, setLocalProfile] = useState({ ...store.profile })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveProfile = () => {
    store.updateProfile(localProfile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      setLocalProfile(p => ({ ...p, avatarUrl: url }))
    }
    reader.readAsDataURL(file)
  }

  const sections = [
    { id: 'profile'  as const, icon: User,  label: t('profile') },
    { id: 'language' as const, icon: Globe, label: t('language') },
    { id: 'timedate' as const, icon: Clock, label: t('timeDate') },
  ]

  return (
    <div className="flex h-full bg-background text-foreground">

      {/* Settings sidebar */}
      <aside className="w-56 border-r border-border flex flex-col shrink-0 bg-card">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
          <img src={rabbitLogo} alt="Momentum" style={{ height: 36, width: 'auto' }} />
          <span className="font-serif text-base text-foreground">{t('settings')}</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {sections.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeSection === id
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
              {activeSection === id && <ChevronRight size={12} className="ml-auto text-accent" />}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={16} />
            {t('logout')}
          </button>
          <p className="text-[11px] text-muted-foreground text-center px-2">
            Momentum v1.0 — {t('coachEdition')}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">

        {/* ── PROFILE ── */}
        {activeSection === 'profile' && (
          <div className="max-w-lg space-y-8">
            <div>
              <h2 className="font-serif text-2xl text-foreground mb-1">{t('profile')}</h2>
              <p className="text-sm text-muted-foreground">{t('editProfile')}</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                  {localProfile.avatarUrl
                    ? <img src={localProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    : <User size={32} className="text-muted-foreground" />
                  }
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera size={12} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{localProfile.name || 'Coach'}</p>
                <p className="text-xs text-muted-foreground">{localProfile.title}</p>
                <button onClick={() => fileInputRef.current?.click()} className="text-xs text-accent hover:underline mt-1">
                  {t('changePhoto')}
                </button>
              </div>
            </div>

            {/* Form fields */}
            {([
              { key: 'name'  as const, label: t('name'),  placeholder: 'Your full name' },
              { key: 'title' as const, label: t('title'), placeholder: 'e.g. Head Coach, Strength Coach' },
              { key: 'sport' as const, label: t('sport'), placeholder: 'e.g. Basketball, Multi-sport' },
            ]).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
                <input
                  type="text"
                  value={localProfile[key]}
                  onChange={e => setLocalProfile(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
                />
              </div>
            ))}

            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {saved ? <><Check size={15} /> {t('saved')}</> : <><Save size={15} /> {t('save')}</>}
            </button>
          </div>
        )}

        {/* ── LANGUAGE ── */}
        {activeSection === 'language' && (
          <div className="max-w-md space-y-8">
            <div>
              <h2 className="font-serif text-2xl text-foreground mb-1">{t('language')}</h2>
              <p className="text-sm text-muted-foreground">{t('languageLabel')}</p>
            </div>

            <div className="space-y-2">
              {languageOptions.map((lang) => {
                const isActive = store.language === lang.id
                return (
                  <button
                    key={lang.id}
                    onClick={() => store.setLanguage(lang.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-150 ${
                      isActive ? 'border-accent bg-accent/10' : 'border-border bg-muted hover:border-accent/30 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className={`text-sm font-medium flex-1 text-left ${isActive ? 'text-accent' : 'text-foreground'}`}>{lang.label}</span>
                    {isActive && <Check size={16} className="text-accent" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── TIME & DATE ── */}
        {activeSection === 'timedate' && (
          <div className="max-w-md space-y-8">
            <div>
              <h2 className="font-serif text-2xl text-foreground mb-1">{t('timeDate')}</h2>
              <p className="text-sm text-muted-foreground">Choose how times and dates display across the app</p>
            </div>

            {/* Time format */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">{t('timeFormat')}</label>
              <div className="grid grid-cols-2 gap-3">
                {(['12h', '24h'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => store.setTimeFormat(fmt)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${
                      store.timeFormat === fmt ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-muted text-muted-foreground hover:border-accent/30'
                    }`}
                  >
                    {fmt === '12h' ? t('h12') : t('h24')}
                  </button>
                ))}
              </div>
            </div>

            {/* Date format */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">{t('dateFormat')}</label>
              <div className="grid grid-cols-2 gap-3">
                {(['MM/DD/YYYY', 'DD/MM/YYYY'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => store.setDateFormat(fmt)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${
                      store.dateFormat === fmt ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-muted text-muted-foreground hover:border-accent/30'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-80 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="font-serif text-lg text-foreground mb-2">{t('logout')}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t('logoutConfirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-sm text-red-400 hover:bg-red-500/30 transition-all font-medium"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
