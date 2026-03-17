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

// ── Coaching Hub types ─────────────────────────────────────────────────────────
export interface AthleteNote {
  id: string
  date: string
  content: string
}

// ── Progress tracking ──────────────────────────────────────────────────────────
export interface ProgressEntry {
  id: string
  date: string          // ISO date string
  metric: string        // e.g. "Vertical Jump", "40m Sprint", "Bench Press"
  value: number
  unit: string          // e.g. "inches", "seconds", "lbs"
  notes?: string
}

// ── Session clip tagging ───────────────────────────────────────────────────────
export interface SessionClip {
  id: string
  athleteId: string
  drillName: string
  rating: 1 | 2 | 3     // 1=ok, 2=good, 3=highlight
  filePath?: string
  thumbnailUrl?: string
  timestamp: string     // ISO datetime
}

// ── Activity feed ─────────────────────────────────────────────────────────────
export interface ActivityEvent {
  id: string
  type: 'session_logged' | 'athlete_added' | 'compilation_ready' | 'clip_tagged' | 'progress_logged'
  title: string
  subtitle: string
  timestamp: string     // ISO datetime
  athleteId?: string
  icon: string          // lucide icon name as string
}

// ── Coach profile ─────────────────────────────────────────────────────────────
export interface CoachProfile {
  name: string
  title: string
  sport: string
  bio: string
  avatarUrl: string
  publicHandle: string  // e.g. "coach-marcus"
  instagram?: string
}

// ── Onboarding ────────────────────────────────────────────────────────────────
export interface OnboardingState {
  completed: boolean
  step: number          // 0=sport, 1=first athlete, 2=first session
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
  progressEntries: ProgressEntry[]
  sessionClips: SessionClip[]
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
  clips: SessionClip[]
  videoLoggerOpen?: boolean
}
