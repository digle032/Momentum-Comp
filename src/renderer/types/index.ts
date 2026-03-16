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
  error?: string  // doubles as status label during rendering
}
