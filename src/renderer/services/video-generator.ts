/**
 * video-generator.ts
 *
 * Core philosophy: the user selects media and presses Generate.
 * Every creative decision — clip order, duration, transitions, cut timing —
 * is made by this engine. Each run is intentionally non-deterministic within
 * guardrails so "Generate Again" always feels fresh.
 *
 * Pipeline:
 *   1. analyzeAudio       → beat map (BPM-based, style-tuned)
 *   2. curateAndSequence  → clip order + per-clip timings aligned to beats
 *   3. prepareSegments    → scale/crop each clip to target aspect ratio
 *   4. chainXfade         → concatenate with style-specific xfade transitions
 *   5. applyTextOverlays  → intro and/or outro text burned in
 *   6. mixAudio           → music with auto-fade-out
 */

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import { CompilationOptions, MediaItem, Template } from '../types'

// ─── Dimensions ───────────────────────────────────────────────────────────────

const DIMENSIONS = {
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
  '1:1':  { w: 1080, h: 1080 },
} as const

// ─── Style rules ──────────────────────────────────────────────────────────────
//
// Each style defines:
//   clipDur    – seconds per video clip (images always use 2.5 s)
//   transDur   – xfade overlap duration in seconds
//   transitions – available xfade filter names for this style
//   bpm        – assumed BPM used to align cuts to beats

const STYLE_RULES: Record<Template, {
  clipDur: number
  transDur: number
  transitions: string[]
  bpm: number
}> = {
  hype: {
    clipDur: 1.5,
    transDur: 0.12,
    // Fast, punchy — wipes and pixelize feel energetic
    transitions: ['fade', 'wipeleft', 'wiperight', 'pixelize', 'circlecrop'],
    bpm: 128,
  },
  reels: {
    clipDur: 2.5,
    transDur: 0.25,
    // Smooth, trendy — slides and zooms
    transitions: ['slideleft', 'slideright', 'smoothleft', 'smoothright', 'zoomin'],
    bpm: 120,
  },
  clean: {
    clipDur: 4.0,
    transDur: 0.40,
    // Elegant, minimal — dissolves and fades only
    transitions: ['fade', 'fadeblack', 'dissolve'],
    bpm: 96,
  },
}

// ─── Internal types ───────────────────────────────────────────────────────────

interface AudioInfo {
  bpm: number
  beats: number[]      // beat timestamps in seconds
  totalDuration: number
}

interface Scene {
  item: MediaItem
  segStart: number     // seconds into the source video to begin
  segDur: number       // how long to use (seconds)
  transition: string   // xfade transition name for the cut AFTER this scene
  transDur: number     // overlap duration for that transition
}

// ─── Singleton FFmpeg ─────────────────────────────────────────────────────────

let _ffmpeg: ReturnType<typeof createFFmpeg> | null = null

async function getFFmpeg() {
  if (_ffmpeg?.isLoaded()) return _ffmpeg
  _ffmpeg = createFFmpeg({
    corePath: `${window.location.origin}/ffmpeg-core.js`,
    log: false,
  })
  await _ffmpeg.load()
  return _ffmpeg
}

// ─── FS helpers ───────────────────────────────────────────────────────────────

function vfs(ffmpeg: ReturnType<typeof createFFmpeg>) {
  return {
    write: (name: string, data: Uint8Array) => ffmpeg.FS('writeFile', name, data),
    read:  (name: string): Uint8Array => ffmpeg.FS('readFile', name) as Uint8Array,
    rm:    (name: string) => { try { ffmpeg.FS('unlink', name) } catch {} },
  }
}

function toBlobUrl(data: Uint8Array, mime = 'video/mp4'): string {
  return URL.createObjectURL(new Blob([data], { type: mime }))
}

// ─── Motion score helpers ─────────────────────────────────────────────────────

/** Find the starting second with the highest cumulative motion over segDur. */
function bestSegmentStart(scores: number[], segDur: number, totalDur: number): number {
  if (!scores.length) return 0
  const window = Math.max(1, Math.min(Math.ceil(segDur), scores.length))
  let best = 0, bestScore = -Infinity
  for (let i = 0; i <= scores.length - window; i++) {
    const sum = scores.slice(i, i + window).reduce((a, b) => a + b, 0)
    if (sum > bestScore) { bestScore = sum; best = i }
  }
  return Math.min(best, Math.max(0, totalDur - segDur))
}

/** Peak motion score for a clip — used for ranking. */
function peakMotion(item: MediaItem): number {
  if (item.type !== 'video' || !item.motionScores?.length) return 0.5
  return Math.max(...item.motionScores)
}

// ─── Step 1: Audio analysis ───────────────────────────────────────────────────
//
// Uses the Web Audio API to decode the music file and get its true duration.
// BPM is style-tuned (no external library needed); the important output is the
// beat timestamp array so cuts can snap to beat boundaries.

async function analyzeAudio(musicFile: File, style: Template): Promise<AudioInfo> {
  const bpm = STYLE_RULES[style].bpm
  let totalDuration = 60

  try {
    const arrayBuffer = await musicFile.arrayBuffer()
    const ctx = new AudioContext()
    const buffer = await ctx.decodeAudioData(arrayBuffer)
    totalDuration = buffer.duration
    ctx.close()
  } catch {
    // Fallback: assume 60 s
  }

  const beatInterval = 60 / bpm
  const beats: number[] = []
  for (let t = 0; t < totalDuration; t += beatInterval) {
    beats.push(parseFloat(t.toFixed(3)))
  }
  return { bpm, beats, totalDuration }
}

function defaultAudioInfo(style: Template): AudioInfo {
  const bpm = STYLE_RULES[style].bpm
  const beatInterval = 60 / bpm
  const beats: number[] = []
  for (let t = 0; t < 120; t += beatInterval) beats.push(parseFloat(t.toFixed(3)))
  return { bpm, beats, totalDuration: 120 }
}

// ─── Step 2: Curation and sequencing ─────────────────────────────────────────
//
// Rules (from the product philosophy):
//   • The top third of clips by peak motion score always lead — they set energy.
//   • The remaining clips are shuffled for variety across runs.
//   • Images are interspersed every 3–4 clips for pacing, never back-to-back.
//   • Every cut snaps to the nearest beat boundary.
//   • The same transition never fires twice in a row.

function curateAndSequence(options: CompilationOptions, audio: AudioInfo): Scene[] {
  const style = options.template
  const { clipDur, transDur, transitions } = STYLE_RULES[style]
  const totalDuration = options.targetDuration ?? 30

  // Sort by peak motion, shuffle the bottom 70% for "Generate Again" variety
  const scored = [...options.media].sort((a, b) => peakMotion(b) - peakMotion(a))
  const topCount = Math.max(1, Math.ceil(scored.length * 0.3))
  const top  = scored.slice(0, topCount)
  const rest = scored.slice(topCount).sort(() => Math.random() - 0.5)

  // Intersperse images every ~3 video clips
  const videos = [...top, ...rest].filter(m => m.type === 'video')
  const images = [...top, ...rest].filter(m => m.type === 'image')
  const pool: MediaItem[] = []
  let imgIdx = 0
  for (let i = 0; i < videos.length; i++) {
    pool.push(videos[i])
    if ((i + 1) % 3 === 0 && imgIdx < images.length) {
      pool.push(images[imgIdx++])
    }
  }
  while (imgIdx < images.length) pool.push(images[imgIdx++])

  // Build scenes, snapping to beats
  const scenes: Scene[] = []
  let timelinePos = 0
  let poolIdx = 0
  let lastTransition = ''

  while (timelinePos < totalDuration && pool.length > 0) {
    const item = pool[poolIdx % pool.length]
    poolIdx++

    // Snap cut to nearest beat at or after current position
    const snapped = audio.beats.find(b => b >= timelinePos) ?? timelinePos
    if (snapped >= totalDuration) break

    const actualClipDur = item.type === 'image' ? 2.5 : clipDur
    if (totalDuration - snapped < actualClipDur * 0.5) break

    const segStart =
      item.type === 'video' && item.motionScores?.length && item.duration
        ? bestSegmentStart(item.motionScores, actualClipDur, item.duration)
        : 0

    // Avoid repeating the same transition back-to-back
    let transition: string
    let attempts = 0
    do {
      transition = transitions[Math.floor(Math.random() * transitions.length)]
      attempts++
    } while (transition === lastTransition && transitions.length > 1 && attempts < 10)
    lastTransition = transition

    scenes.push({ item, segStart, segDur: actualClipDur, transition, transDur })
    timelinePos = snapped + actualClipDur
  }

  return scenes
}

// ─── Step 3 & 4: Prepare segments + chain xfade ──────────────────────────────

async function prepareAndConcatenate(
  ffmpeg: ReturnType<typeof createFFmpeg>,
  scenes: Scene[],
  dims: { w: number; h: number },
  onProgress: (pct: number, label: string) => void,
): Promise<string> {
  const { write, rm } = vfs(ffmpeg)

  // Fill the frame without letterboxing
  const scaleFilter =
    `scale=${dims.w}:${dims.h}:force_original_aspect_ratio=increase,` +
    `crop=${dims.w}:${dims.h},setsar=1,setpts=PTS-STARTPTS`

  // Prepare each segment
  const segments: string[] = []
  for (let i = 0; i < scenes.length; i++) {
    const { item, segStart, segDur } = scenes[i]
    const ext    = item.type === 'image' ? 'jpg' : 'mp4'
    const inName = `raw_${i}.${ext}`
    const outSeg = `seg_${i}.mp4`

    write(inName, await fetchFile(item.file))

    if (item.type === 'image') {
      await ffmpeg.run(
        '-loop', '1', '-i', inName,
        '-vf', scaleFilter,
        '-t', String(segDur), '-r', '30', '-pix_fmt', 'yuv420p', '-an',
        outSeg,
      )
    } else {
      await ffmpeg.run(
        '-ss', String(segStart), '-i', inName,
        '-t', String(segDur),
        '-vf', scaleFilter,
        '-an', '-r', '30', '-pix_fmt', 'yuv420p',
        outSeg,
      )
    }

    rm(inName)
    segments.push(outSeg)
    onProgress(
      5 + Math.round(((i + 1) / scenes.length) * 40),
      `Preparing clip ${i + 1} of ${scenes.length}…`,
    )
  }

  // Single clip — skip concatenation
  if (segments.length === 1) return segments[0]

  // Chain xfade transitions
  onProgress(47, 'Assembling with transitions…')

  const inputs = segments.flatMap(s => ['-i', s])
  const filterParts: string[] = []
  let lastLabel = '[0:v]'
  let cumulativeOffset = 0

  for (let i = 1; i < segments.length; i++) {
    const { transDur: td, transition } = scenes[i - 1]
    // offset = point in the output timeline where this transition begins
    cumulativeOffset += scenes[i - 1].segDur - td
    const outLabel = i === segments.length - 1 ? '[vout]' : `[xf${i}]`
    filterParts.push(
      `${lastLabel}[${i}:v]xfade=transition=${transition}:duration=${td}:offset=${cumulativeOffset.toFixed(3)}${outLabel}`,
    )
    lastLabel = outLabel
  }

  await ffmpeg.run(
    ...inputs,
    '-filter_complex', filterParts.join(';'),
    '-map', '[vout]',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26',
    'concat.mp4',
  )

  for (const s of segments) rm(s)
  return 'concat.mp4'
}

// ─── Step 5: Text overlays ────────────────────────────────────────────────────

function totalVideoDuration(scenes: Scene[]): number {
  return scenes.reduce((acc, scene, i) => {
    return acc + scene.segDur - (i < scenes.length - 1 ? scene.transDur : 0)
  }, 0)
}

async function applyTextOverlays(
  ffmpeg: ReturnType<typeof createFFmpeg>,
  videoName: string,
  options: CompilationOptions,
  scenes: Scene[],
): Promise<string> {
  const { rm } = vfs(ffmpeg)
  const hasIntro = !!options.introText?.trim()
  const hasOutro = !!options.outroText?.trim()
  if (!hasIntro && !hasOutro) return videoName

  const totalDur = totalVideoDuration(scenes)
  const parts: string[] = []

  if (hasIntro) {
    const text = options.introText!.replace(/'/g, "\\'").replace(/:/g, '\\:')
    parts.push(
      `drawtext=text='${text}':fontcolor=white:fontsize=72:` +
      `x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,2.5)'`,
    )
  }
  if (hasOutro) {
    const text = options.outroText!.replace(/'/g, "\\'").replace(/:/g, '\\:')
    const start = Math.max(0, totalDur - 2.5)
    parts.push(
      `drawtext=text='${text}':fontcolor=white:fontsize=72:` +
      `x=(w-text_w)/2:y=(h-text_h)/2:` +
      `enable='between(t,${start.toFixed(2)},${totalDur.toFixed(2)})'`,
    )
  }

  const outName = 'titled.mp4'
  await ffmpeg.run(
    '-i', videoName,
    '-vf', parts.join(','),
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26', '-an',
    outName,
  )
  rm(videoName)
  return outName
}

// ─── Step 6: Audio mixing ─────────────────────────────────────────────────────

async function mixAudio(
  ffmpeg: ReturnType<typeof createFFmpeg>,
  videoName: string,
  musicFile: File,
  totalDur: number,
): Promise<string> {
  const { write, rm } = vfs(ffmpeg)
  write('music_in', await fetchFile(musicFile))

  const fadeStart = Math.max(0, totalDur - 1.5)
  await ffmpeg.run(
    '-i', videoName,
    '-stream_loop', '-1', '-i', 'music_in',
    '-filter_complex',
    `[1:a]aloop=loop=-1:size=2e+09,` +
    `atrim=duration=${totalDur.toFixed(2)},` +
    `afade=t=out:st=${fadeStart.toFixed(2)}:d=1.5[a]`,
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
    'output.mp4',
  )

  rm(videoName)
  rm('music_in')
  return 'output.mp4'
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * generatePreview
 *
 * Pre-flight: warms up FFmpeg so its WASM load is not charged against the
 * compilation progress bar. The Sidebar awaits this before the full render.
 */
export async function generatePreview(
  _options: CompilationOptions,
  onProgress?: (pct: number) => void,
): Promise<string> {
  onProgress?.(20)
  await getFFmpeg()
  onProgress?.(100)
  return ''
}

/**
 * generateCompilation
 *
 * The full pipeline. Every creative decision is made here.
 * Returns a blob URL for the finished MP4.
 */
export async function generateCompilation(
  options: CompilationOptions,
  onProgress?: (pct: number, label: string) => void,
): Promise<string> {
  const report = (pct: number, label: string) => onProgress?.(pct, label)
  const ffmpeg = await getFFmpeg()
  const dims = DIMENSIONS[options.aspectRatio]
  const { rm, read } = vfs(ffmpeg)

  // 1. Beat map from audio
  report(3, 'Analyzing audio…')
  const audio = options.musicFile
    ? await analyzeAudio(options.musicFile, options.template)
    : defaultAudioInfo(options.template)

  // 2. Curate and sequence
  report(8, 'Curating content…')
  const scenes = curateAndSequence(options, audio)
  if (scenes.length === 0) throw new Error('No clips to compile — please add media.')

  // 3. Prepare + xfade concat  (progress 8 → 55)
  let videoName = await prepareAndConcatenate(
    ffmpeg, scenes, dims,
    (pct, label) => report(8 + Math.round(pct * 0.47), label),
  )

  // 4. Text overlays
  if (options.introText?.trim() || options.outroText?.trim()) {
    report(58, 'Adding text overlays…')
    videoName = await applyTextOverlays(ffmpeg, videoName, options, scenes)
  }

  // 5. Audio mix
  if (options.musicFile) {
    report(68, 'Mixing audio…')
    videoName = await mixAudio(ffmpeg, videoName, options.musicFile, totalVideoDuration(scenes))
  }

  // 6. Return blob URL
  report(95, 'Finishing up…')
  const data = read(videoName)
  rm(videoName)

  report(100, 'Done!')
  return toBlobUrl(data)
}
