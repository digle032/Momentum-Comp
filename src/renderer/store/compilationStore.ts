import { create } from 'zustand'
import {
  CompilationOptions,
  GenerationState,
  MediaItem,
  Template,
  AspectRatio,
} from '../types'

interface CompilationStore {
  selectedMedia: MediaItem[]
  addMedia: (item: MediaItem) => void
  removeMedia: (uri: string) => void
  reorderMedia: (from: number, to: number) => void
  clearMedia: () => void

  template: Template
  setTemplate: (t: Template) => void

  musicFile: File | null
  setMusicFile: (file: File | null) => void

  introText: string
  setIntroText: (text: string) => void

  outroText: string
  setOutroText: (text: string) => void

  aspectRatio: AspectRatio
  setAspectRatio: (r: AspectRatio) => void

  targetDuration: number | undefined
  setTargetDuration: (d: number | undefined) => void

  generation: GenerationState
  setGeneration: (state: Partial<GenerationState>) => void
  resetGeneration: () => void

  buildOptions: () => CompilationOptions | null
}

const DEFAULT_GENERATION: GenerationState = { status: 'idle', progress: 0 }

export const useCompilationStore = create<CompilationStore>((set, get) => ({
  selectedMedia: [],
  addMedia: (item) => set((s) => ({ selectedMedia: [...s.selectedMedia, item] })),
  removeMedia: (uri) =>
    set((s) => ({ selectedMedia: s.selectedMedia.filter((m) => m.uri !== uri) })),
  reorderMedia: (from, to) =>
    set((s) => {
      const arr = [...s.selectedMedia]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return { selectedMedia: arr }
    }),
  clearMedia: () => set({ selectedMedia: [] }),

  template: 'reels',
  setTemplate: (template) => set({ template }),

  musicFile: null,
  setMusicFile: (musicFile) => set({ musicFile }),

  introText: '',
  setIntroText: (introText) => set({ introText }),

  outroText: '',
  setOutroText: (outroText) => set({ outroText }),

  aspectRatio: '9:16',
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),

  targetDuration: undefined,
  setTargetDuration: (targetDuration) => set({ targetDuration }),

  generation: DEFAULT_GENERATION,
  setGeneration: (partial) =>
    set((s) => ({ generation: { ...s.generation, ...partial } })),
  resetGeneration: () => set({ generation: DEFAULT_GENERATION }),

  buildOptions: () => {
    const s = get()
    if (!s.selectedMedia.length) return null
    return {
      media: s.selectedMedia,
      musicFile: s.musicFile,
      template: s.template,
      introText: s.introText || undefined,
      outroText: s.outroText || undefined,
      aspectRatio: s.aspectRatio,
      targetDuration: s.targetDuration,
    }
  },
}))
