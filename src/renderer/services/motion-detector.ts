/**
 * motion-detector.ts
 *
 * Browser-native motion analysis using the Canvas API + TensorFlow.js (WebGL).
 * Replaces the FFmpeg frame-extraction approach used in the mobile app.
 *
 * Strategy:
 *  - Seek a <video> element to 1-second intervals
 *  - Draw each frame to an offscreen <canvas>
 *  - Convert to a float32 tensor and compute mean absolute difference
 *  - Normalize scores to [0, 1]
 */

import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'

const FRAME_SIZE = 128

async function extractFrames(file: File, duration: number): Promise<ImageData[]> {
  const url = URL.createObjectURL(file)

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.playsInline = true

    const canvas = document.createElement('canvas')
    canvas.width = FRAME_SIZE
    canvas.height = FRAME_SIZE
    const ctx = canvas.getContext('2d')!

    const frames: ImageData[] = []
    const numFrames = Math.max(2, Math.ceil(duration))
    let frameIndex = 0

    const seekNext = () => {
      if (frameIndex >= numFrames) {
        URL.revokeObjectURL(url)
        resolve(frames)
        return
      }
      video.currentTime = frameIndex
    }

    video.addEventListener('loadedmetadata', () => seekNext())

    video.addEventListener('seeked', () => {
      ctx.drawImage(video, 0, 0, FRAME_SIZE, FRAME_SIZE)
      frames.push(ctx.getImageData(0, 0, FRAME_SIZE, FRAME_SIZE))
      frameIndex++
      seekNext()
    })

    video.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video for analysis'))
    })

    video.load()
  })
}

function imageDataToTensor(imageData: ImageData): tf.Tensor3D {
  const { data } = imageData
  const float32 = new Float32Array(FRAME_SIZE * FRAME_SIZE * 3)
  for (let i = 0; i < FRAME_SIZE * FRAME_SIZE; i++) {
    float32[i * 3]     = data[i * 4]     / 255
    float32[i * 3 + 1] = data[i * 4 + 1] / 255
    float32[i * 3 + 2] = data[i * 4 + 2] / 255
  }
  return tf.tensor3d(float32, [FRAME_SIZE, FRAME_SIZE, 3])
}

function frameDifference(a: tf.Tensor3D, b: tf.Tensor3D): number {
  return tf.tidy(() => (tf.abs(tf.sub(a, b)).mean().arraySync() as number))
}

function normalize(scores: number[]): number[] {
  const max = Math.max(...scores)
  const min = Math.min(...scores)
  const range = max - min || 1
  return scores.map((s) => (s - min) / range)
}

export async function analyzeVideo(file: File, duration: number): Promise<number[]> {
  await tf.setBackend('webgl')
  await tf.ready()

  const frames = await extractFrames(file, duration)

  if (frames.length < 2) {
    return Array(Math.max(1, Math.round(duration))).fill(0.5)
  }

  const scores: number[] = []
  let prev: tf.Tensor3D | null = null

  for (const frame of frames) {
    const current = imageDataToTensor(frame)
    if (prev) {
      scores.push(frameDifference(prev, current))
      prev.dispose()
    }
    prev = current
  }

  prev?.dispose()
  return normalize(scores)
}
