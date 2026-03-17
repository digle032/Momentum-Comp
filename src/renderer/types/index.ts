// ── Compilation types (existing) ──────────────────────────────────────────────
export type Template = 'hype' | 'reels' | 'clean'
export type AspectRatio = '9:16' | '16:9' | '1:1'
export type MediaType = 'image' | 'video'

export interface MediaItem {
  file: File
  uri: string        // object URL for preview
  type: MediaType
  duration?: number  // seconds, for video
  motionScores?: number[]
}

export interface CompilationOptions {
  media: MediaItem[]
  musicFile: File | null
  template: Template
  introText?: string
  outroText?: string
  aspectRatio: AspectRatio
  targetDuration?: number
}

export interface GenerationState {
  status: 'idle' | 'analyzing' | 'rendering' | 'done' | 'error'
  progress: number
  error?: string
}

// ── Coaching Hub types (new) ───────────────────────────────────────────────────
export interface AthleteNote {
  id: string
  date: string
  content: string
}

export interface Athlete {
  id: string
  name: string
  avatarUrl: string
  age: number
  weight: number    // in lbs
  height: number    // in inches
  sport: string
  level: string
  goals: string
  notes: AthleteNote[]
  compilationUrls: string[]
  teamIds: string[]
}

export interface Team {
  id: string
  name: string
  sport: string
  athleteIds: string[]
}

export interface Exercise {
  name: string
  sets: number
  reps: string
  notes?: string
}

export interface TrainingSession {
  id: string
  date: string
  title: string
  mode: 'structured' | 'freeform'
  freeformNotes?: string
  exercises?: Exercise[]
  referenceVideoUrl?: string
  isCompleted: boolean
  postSessionNotes?: string
  assignedTo: { type: 'team' | 'athlete'; id: string }
}
