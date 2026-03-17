import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LanguageId = 'en' | 'es' | 'fr' | 'pt'
export type TimeFormat = '12h' | '24h'
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY'

export interface UserProfile {
  name: string
  title: string
  sport: string
  avatarUrl: string
}

interface SettingsStore {
  language: LanguageId
  timeFormat: TimeFormat
  dateFormat: DateFormat
  profile: UserProfile
  setLanguage: (lang: LanguageId) => void
  setTimeFormat: (fmt: TimeFormat) => void
  setDateFormat: (fmt: DateFormat) => void
  updateProfile: (updates: Partial<UserProfile>) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'en',
      timeFormat: '12h',
      dateFormat: 'MM/DD/YYYY',
      profile: {
        name: 'Coach',
        title: 'Head Coach',
        sport: 'Multi-sport',
        avatarUrl: '',
      },
      setLanguage: (language) => set({ language }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),
    }),
    { name: 'momentum-settings' }
  )
)
