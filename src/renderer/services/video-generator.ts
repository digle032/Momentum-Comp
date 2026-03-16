/**
 * video-generator.ts
 *
 * Browser-based video compilation engine using FFmpeg.wasm v0.11.
 * Runs entirely in the main thread — no Web Workers, no Vite complications.
 *
 * Pipeline:
 *  1. Trim best segment from each clip (using motion scores)
 *  2. Resize all clips to target aspect ratio
 *  3. Concatenate with xfade transitions
 *  4. Overlay intro text (optional)
 *  5. Mix in music track (optional)
 *  6. Return a blob URL for the final MP4
 */

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import { CompilationOptions, MediaItem } from '../types'

const DIMENSIONS = {
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
  '1:1':  { w: 1080, h: 1080 },
} as const

const PREVIEW_SCALE = 0.25
const DEFAULT_SEGMENT_DURATION = 3

// ── Singleton FFmpeg instance ─────────────────────────────────────────────────

let _ffmpeg: ReturnType<typeof createFFmpeg> | null = null

async function getFFmpeg() {
  if (_ffmpeg?.isLoaded()) return _ffmpeg

  _ffmpeg = createFFmpeg({
    // corePath must be a full URL; served from src/renderer/public/
    corePath: `${window.location.origin}/ffmpeg-core.js`,
    log: true,
  })

  await _ffmpeg.load()
  return _ffmpeg
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function run(ffmpeg: ReturnType<typeof createFFmpeg>, args: string[]): Promise<void> {
  await ffmpeg.run(...args)
}

function fs(ffmpeg: ReturnType<typeof createFFmpeg>) {
  return {
    write: (name: string, data: Uint8Array) => ffmpeg.FS('writeFile', name, data),
    read:  (name: string): Uint8Array => ffmpeg.FS('readFile', name) as Uint8Array,
    rm:    (name: string) => { try { ffmpeg.FS('unlink', name) } catch {} },
  }
}

function bestStartTime(scores: number[], segDur: number, totalDur: number): number {
  if (!scores.length) return 0
  const window = Math.min(Math.ceil(segDur), scores.length)
  let bestSum = -Infinity
  let bestStart = 0
  for (let i = 0; i <= scores.length - window; i++) {
    const sum = scores.slice(i, i + window).reduce((a, b) => a + b, 0)
    if (sum > bestSum) { bestSum = sum; bestStart = i }
  }
  return Math.min(bestStart, Math.max(0, totalDur - segDur))
}

function toBlobUrl(data: Uint8Array, mime = 'video/mp4'): string {
  return URL.createObjectURL(new Blob([data], { type: mime }))
}

// ── Pipeline steps ────────────────────────────────────────────────────────────

async function prepareSegment(
  ffmpeg: ReturnType<typeof createFFmpeg>,
  item: MediaItem,
  index: number,
  dims: { w: number; h: number },
  segDur: number,
): Promise<string> {
  const ext    = item.type === 'image' ? 'jpg' : 'mp4'
  const inName = `in_${index}.${ext}`
  const outName = `seg_${index}.mp4`
  const { write, rm } = fs(ffmpeg)
  const scale = `scale=${dims.w}:${dims.h}:force_original_aspect_ratio=decrease,` +
                `pad=${dims.w}:${dims.h}:(ow-iw)/2:(oh-ih)/2`

  write(inName, await fetchFile(item.file))

  if (item.type === 'image') {
    await run(ffmpeg, [
      '-loop', '1', '-i', inName,
      '-vf', scale,
      '-t', String(segDur), '-r', '30', '-pix_fmt', 'yuv420p',
      outName,
    ])
  } else {
    const totalDur = item.duration ?? segDur
    const start = bestStartTime(item.motionScores ?? [], segDur, totalDur)
    await run(ffmpeg, [
      '-ss', String(start), '-i', inName,
      '-t', String(segDur),
      '-vf', scale,
      '-an', '-r', '30', '-pix_fmt', 'yuv420p',
      outName,
    ])
  }

  rm(inName)
  return outName
}

async function concatenate(
  ffmpeg: ReturnType<typeof createFFmpeg>,
  segments: string[],
  template: CompilationOptions['template'],
  outName: string,
): Promise<void> {
  const { read, write, rm } = fs(ffmpeg)

  if (segments.length === 1) {
    write(outName, read(segments[0]))
    return
  }

  const transDur = template === 'hype' ? 0.1 : 0.3
  const inputs = segments.flatMap((s) => ['-i', s])
  let filter = ''
  let last = '[0:v]'

  for (let i = 1; i < segments.length; i++) {
    const label = i === segments.length - 1 ? '[vout]' : `[v${i}]`
    const offset = i * DEFAULT_SEGMENT_DURATION - transDur * i
    filter += `${last}[${i}:v]xfade=transition=fade:duration=${transDur}:offset=${offset}${label};`
    last = label
  }

  await run(ffmpeg, [
    ...inputs,
    '-filter_complex', filter.replace(/;$/, ''),
    '-map', '[vout]',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26',
    outName,
  ])

  for (const s of segments) rm(s)
}

async function addIntroText(
  ffmpeg: ReturnType<typeof createFFmpeg>,
  videoName: string,
  introText: string | undefined,
  outName: string,
): Promise<void> {
  const { read, write, rm } = fs(ffmpeg)

  if (!introText) {
    write(outName, read(videoName))
    return
  }

  const filter = `drawtext=text='${introText.replace(/'/g, "\\'")}':` +
    `fontcolor=white:fontsize=64:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,2)'`

  await run(ffmpeg, [
    '-i', videoName,
    '-vf', filter,
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26', '-c:a', 'copy',
    outName,
  ])
  rm(videoName)
}

async function addAudio(
  ffmpeg: ReturnType<typeof createFFmpeg>,
  videoName: string,
  musicFile: File,
  estimatedDuration: number,
  outName: string,
): Promise<void> {
  const { write, rm } = fs(ffmpeg)
  write('music', await fetchFile(musicFile))

  const fadeStart = Math.max(0, estimatedDuration - 1)
  await run(ffmpeg, [
    '-i', videoName,
    '-stream_loop', '-1', '-i', 'music',
    '-filter_complex',
    `[1:a]aloop=loop=-1:size=2e+09,atrim=duration=${estimatedDuration},` +
    `afade=t=out:st=${fadeStart}:d=1[a]`,
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'copy', '-c:a', 'aac', '-shortest',
    outName,
  ])

  rm(videoName)
  rm('music')
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generatePreview(
  options: CompilationOptions,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const ffmpeg = await getFFmpeg()
  const fullDims = DIMENSIONS[options.aspectRatio]
  const dims = {
    w: Math.round(fullDims.w * PREVIEW_SCALE),
    h: Math.round(fullDims.h * PREVIEW_SCALE),
  }

  const segments: string[] = []
  for (let i = 0; i < options.media.length; i++) {
    segments.push(await prepareSegment(ffmpeg, options.media[i], i, dims, DEFAULT_SEGMENT_DURATION))
    onProgress?.(Math.round(((i + 1) / options.media.length) * 80))
  }

  await concatenate(ffmpeg, segments, options.template, 'preview.mp4')

  const data = fs(ffmpeg).read('preview.mp4')
  fs(ffmpeg).rm('preview.mp4')
  onProgress?.(100)
  return toBlobUrl(data)
}

export async function generateCompilation(
  options: CompilationOptions,
  onProgress?: (pct: number, label: string) => void,
): Promise<string> {
  const ffmpeg = await getFFmpeg()
  const dims = DIMENSIONS[options.aspectRatio]
  const segDur = options.targetDuration
    ? Math.max(1, Math.floor(options.targetDuration / options.media.length))
    : DEFAULT_SEGMENT_DURATION

  // Step 1 — prepare segments
  onProgress?.(5, 'Preparing clips…')
  const segments: string[] = []
  for (let i = 0; i < options.media.length; i++) {
    segments.push(await prepareSegment(ffmpeg, options.media[i], i, dims, segDur))
    onProgress?.(5 + Math.round(((i + 1) / options.media.length) * 35), `Preparing clip ${i + 1}…`)
  }

  // Step 2 — concatenate
  onProgress?.(45, 'Assembling compilation…')
  await concatenate(ffmpeg, segments, options.template, 'concat.mp4')

  // Step 3 — intro text
  onProgress?.(65, 'Adding text overlays…')
  await addIntroText(ffmpeg, 'concat.mp4', options.introText, 'titled.mp4')

  // Step 4 — audio (optional)
  if (options.musicFile) {
    onProgress?.(75, 'Mixing audio…')
    const estimatedDur = segDur * options.media.length
    await addAudio(ffmpeg, 'titled.mp4', options.musicFile, estimatedDur, 'output.mp4')
  } else {
    fs(ffmpeg).write('output.mp4', fs(ffmpeg).read('titled.mp4'))
    fs(ffmpeg).rm('titled.mp4')
  }

  // Step 5 — read output
  onProgress?.(95, 'Finishing up…')
  const data = fs(ffmpeg).read('output.mp4')
  fs(ffmpeg).rm('output.mp4')

  onProgress?.(100, 'Done!')
  return toBlobUrl(data)
}
