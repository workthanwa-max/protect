/* Worker for vision inference — simplified: mock emitter for now.
   Note: importing @mediapipe in a module worker requires bundler support; fallback to mock here to keep build stable.
*/

let fps = 15
let intervalId: ReturnType<typeof setInterval> | null = null

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function point(cx: number, cy: number, x: number, y: number, scale: number, side: number, jitter: number) {
  return {
    x: clamp01(cx + x * scale * side + jitter),
    y: clamp01(cy + y * scale - jitter * 0.7),
    z: 0,
    visibility: 1,
  }
}

function makeLandmarks(cx: number, cy: number, scale: number, openness: number, side = 1) {
  const curl = (1 - openness) * 0.42
  const spread = 0.7 + openness * 0.38
  const jitterSeed = Date.now() * 0.001
  const jitter = (i: number) => Math.sin(jitterSeed * 4.2 + i * 1.7) * 0.0018
  const p = (i: number, x: number, y: number) => point(cx, cy, x, y, scale, side, jitter(i))

  return [
    p(0, 0, 0.38),
    p(1, -0.24, 0.2),
    p(2, -0.48, -0.02),
    p(3, -0.7, -0.2 - openness * 0.06),
    p(4, -0.9, -0.36 - openness * 0.12),
    p(5, -0.28 * spread, -0.12),
    p(6, -0.36 * spread, -0.56 + curl),
    p(7, -0.4 * spread, -0.94 + curl * 1.2),
    p(8, -0.42 * spread, -1.28 + curl * 1.55),
    p(9, 0, -0.18),
    p(10, 0, -0.68 + curl),
    p(11, 0, -1.12 + curl * 1.2),
    p(12, 0, -1.5 + curl * 1.55),
    p(13, 0.28 * spread, -0.12),
    p(14, 0.34 * spread, -0.58 + curl),
    p(15, 0.38 * spread, -0.96 + curl * 1.2),
    p(16, 0.4 * spread, -1.28 + curl * 1.55),
    p(17, 0.54 * spread, 0.02),
    p(18, 0.66 * spread, -0.34 + curl),
    p(19, 0.72 * spread, -0.62 + curl * 1.15),
    p(20, 0.76 * spread, -0.88 + curl * 1.45),
  ]
}

self.addEventListener('message', async (ev) => {
  const data = ev.data
  if (!data || !data.cmd) return

  if (data.cmd === 'start') {
    fps = data.fps || 15
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(() => {
      const t = Date.now() / 1000
      const x = 0.5 + 0.22 * Math.sin(t * 1.8)
      const y = 0.5 + 0.18 * Math.cos(t * 1.6)
      const openness = 0.62 + 0.28 * Math.sin(t * 2.4)
      const scale = 0.105 + 0.012 * Math.sin(t * 1.2)

      const leftLandmarks = makeLandmarks(x - 0.1, y + 0.04, scale * 0.95, openness, -1)
      const rightLandmarks = makeLandmarks(x + 0.1, y, scale, openness, 1)

      const payload = {
        ts: Date.now(),
        left: {
          x: x - 0.1,
          y: y + 0.04,
          detected: true,
          visible: true,
          active: true,
          confidence: 0.9,
          size: scale,
          focus: 'ready',
          landmarks: leftLandmarks,
        },
        right: {
          x: x + 0.1,
          y,
          detected: true,
          visible: true,
          active: true,
          confidence: 0.92,
          size: scale,
          focus: 'ready',
          landmarks: rightLandmarks,
        },
        tracking: true,
        active: true,
        stats: { fps, inferenceMs: 4, drops: 0 },
      }
      self.postMessage(payload)
    }, Math.round(1000 / fps))
  }

  if (data.cmd === 'frame') {
    // placeholder: when real model is used, process ImageBitmap here
    const bitmap = data.bitmap
    if (bitmap && typeof bitmap.close === 'function') {
      try { bitmap.close() } catch { /* ignore */ }
    }
  }

  if (data.cmd === 'stop') {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
})
