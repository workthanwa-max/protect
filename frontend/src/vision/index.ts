import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision'

export type HandLandmark = { x: number; y: number; z?: number; visibility?: number }
export type HandFocus = 'ready' | 'too-small' | 'too-large' | 'edge' | 'low-confidence'
export type HandCoord = {
  x: number
  y: number
  detected: boolean
  visible: boolean
  active: boolean
  confidence: number
  size?: number
  focus: HandFocus
  landmarks: HandLandmark[]
}
export type VisionMode = 'idle' | 'loading' | 'camera' | 'mock' | 'error'
export type VisionRef = {
  left: HandCoord | null
  right: HandCoord | null
  tracking: boolean
  active: boolean
  mode: VisionMode
  message: string
  stats: { fps: number; inferenceMs: number; drops: number }
}

const wasmRoot = '/mediapipe/wasm'
const handModelPath = '/mediapipe/models/hand_landmarker.task'
const minimumHandSize = 0.06
const maximumHandSize = 0.5
const trackingGraceMs = 180
const predictionDamping = 0.45

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}
function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end
}

// ... internal state ...
const sharedRef: VisionRef = {
  left: null,
  right: null,
  tracking: false,
  active: false,
  mode: 'idle',
  message: 'ใช้เมาส์ควบคุม',
  stats: { fps: 0, inferenceMs: 0, drops: 0 },
}

const listeners = new Set<(ref: VisionRef) => void>()
let cameraStream: MediaStream | null = null
let videoEl: HTMLVideoElement | null = null
let handLandmarker: HandLandmarker | null = null
let timerId = 0
let videoFrameCallbackId = 0
let lastVideoTime = -1
let lastDetectionAt = 0
let targetFps = 20
const maxFps = 30
let frameMs = 1000 / targetFps
let minimumFrameMs = Math.max(16, frameMs)
let lastAdaptiveChange = 0
let droppedFrames = 0
let resultCount = 0
let fpsWindowStarted = 0

type TrackSide = 'left' | 'right'
type TrackMemory = {
  point: HandCoord
  seenAt: number
  velocityX: number
  velocityY: number
}

function createTrack(x: number): TrackMemory {
  return {
    point: { x, y: 0.5, detected: false, visible: false, active: false, confidence: 0, focus: 'too-small', landmarks: [] },
    seenAt: 0,
    velocityX: 0,
    velocityY: 0,
  }
}

let tracks: Record<TrackSide, TrackMemory> = {
  left: createTrack(0.38),
  right: createTrack(0.62),
}

function setVisionState(next: Partial<VisionRef>) {
  Object.assign(sharedRef, next)
  listeners.forEach((listener) => listener(sharedRef))
}

function getBounds(landmarks: NormalizedLandmark[]) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0
  for (const p of landmarks) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  return { width: maxX - minX, height: maxY - minY }
}

function createHandPoint(landmarks: NormalizedLandmark[]): HandCoord {
  const center = landmarks[9] ?? landmarks[0]
  const bounds = getBounds(landmarks)
  const size = Math.max(bounds.width, bounds.height)
  
  const x = 1 - center.x // mirror
  const y = center.y

  const inBounds = x >= 0.03 && x <= 0.97 && y >= 0.08 && y <= 0.96
  const visible = size >= minimumHandSize && size <= maximumHandSize && inBounds

  const focus: HandFocus = !inBounds ? 'edge' : size < minimumHandSize ? 'too-small' : size > maximumHandSize ? 'too-large' : 'ready'
  const active = visible

  return {
    x, y,
    detected: true, visible, active,
    confidence: clamp((size - minimumHandSize) / 0.16, 0, 1),
    size, focus,
    landmarks: landmarks.map(p => ({ x: 1 - p.x, y: p.y, z: p.z, visibility: p.visibility }))
  }
}

async function createHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(wasmRoot)
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: handModelPath,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.60,
    minHandPresenceConfidence: 0.60,
    minTrackingConfidence: 0.60,
  })
}

export function bindVideoElement(video: HTMLVideoElement | null) {
  videoEl = video
  if (videoEl && handLandmarker && sharedRef.mode === 'camera') {
    if (videoEl.readyState >= 2) {
      scheduleRealFrame()
    } else {
      videoEl.onloadeddata = () => scheduleRealFrame()
    }
  }
}

function scheduleRealFrame() {
  if (!videoEl || !handLandmarker) return

  if ('requestVideoFrameCallback' in videoEl) {
    videoFrameCallbackId = (videoEl as any).requestVideoFrameCallback(() => {
      videoFrameCallbackId = 0
      detectVideoFrame()
      if (sharedRef.mode === 'camera' && handLandmarker) {
        scheduleRealFrame()
      }
    })
    return
  }

  timerId = window.setTimeout(() => {
    timerId = 0
    detectVideoFrame()
    if (sharedRef.mode === 'camera' && handLandmarker) {
      scheduleRealFrame()
    }
  }, 33)
}

// Adaptive FPS logic is applied below in detectVideoFrame

// Adaptive FPS logic is applied below in detectVideoFrame

function detectVideoFrame() {
  if (!videoEl || !handLandmarker || videoEl.readyState < 2) return

  try {
    const now = performance.now()
    if (videoEl.currentTime === lastVideoTime) {
      droppedFrames++
      return
    }
    
    if (now - lastDetectionAt < minimumFrameMs) {
      droppedFrames++
      return
    }

    lastVideoTime = videoEl.currentTime
    lastDetectionAt = now

    const start = performance.now()
    const results = handLandmarker.detectForVideo(videoEl, now)
    const inferenceMs = performance.now() - start

    if (inferenceMs > 40 && now - lastAdaptiveChange > 500) {
      targetFps = Math.max(10, Math.floor(targetFps * 0.8))
      frameMs = 1000 / targetFps
      minimumFrameMs = Math.max(16, frameMs)
      lastAdaptiveChange = now
    } else if (inferenceMs < 20 && targetFps < maxFps && now - lastAdaptiveChange > 800) {
      targetFps = Math.min(maxFps, Math.ceil(targetFps * 1.12))
      frameMs = 1000 / targetFps
      minimumFrameMs = Math.max(16, frameMs)
      lastAdaptiveChange = now
    }

    const candidates = results.landmarks.map(createHandPoint)
    
    // Simplistic assignment (like The-Game, but adapted for 1-hand flexibility)
    let leftCandidate = candidates.find(c => c.x < 0.5) || null
    let rightCandidate = candidates.find(c => c.x >= 0.5) || null

    if (candidates.length === 1) {
      const c = candidates[0]
      if (tracks.left.point.visible && now - tracks.left.seenAt < 300) { leftCandidate = c; rightCandidate = null; }
      else if (tracks.right.point.visible && now - tracks.right.seenAt < 300) { rightCandidate = c; leftCandidate = null; }
      else if (c.x < 0.5) { leftCandidate = c; rightCandidate = null; }
      else { rightCandidate = c; leftCandidate = null; }
    }

    const smoothedLeft = stabilizeTrack('left', leftCandidate, now)
    const smoothedRight = stabilizeTrack('right', rightCandidate, now)

    resultCount++
    if (!fpsWindowStarted) fpsWindowStarted = now
    const elapsed = now - fpsWindowStarted
    const fps = elapsed >= 1000 ? Math.round((resultCount * 1000) / elapsed) : sharedRef.stats.fps
    if (elapsed >= 1000) {
      resultCount = 0
      fpsWindowStarted = now
    }

    const tracking = Boolean(smoothedLeft?.active || smoothedRight?.active)

    setVisionState({
      left: smoothedLeft,
      right: smoothedRight,
      tracking,
      active: true,
      mode: 'camera',
      message: tracking ? 'พร้อม' : 'กำลังค้นหามือ',
      stats: { fps, inferenceMs: Math.round(inferenceMs), drops: droppedFrames },
    })

  } catch (e) {
    console.error(e)
  }
}

function stabilizeTrack(side: TrackSide, candidate: HandCoord | null, now: number) {
  const track = tracks[side]
  const previous = track.point
  const timeSinceSeen = now - track.seenAt

  if (!candidate) {
    if (previous.visible && timeSinceSeen < trackingGraceMs) {
      // dead reckoning
      const dt = timeSinceSeen / 1000
      const predicted = {
        ...previous,
        x: clamp(previous.x + track.velocityX * dt * predictionDamping, 0, 1),
        y: clamp(previous.y + track.velocityY * dt * predictionDamping, 0, 1),
      }
      track.point = predicted
      return predicted
    }
    const reset = createTrack(side === 'left' ? 0.38 : 0.62).point
    track.point = reset
    return reset
  }

  const dt = Math.max(0.001, (now - track.seenAt) / 1000)
  const velocityX = (candidate.x - previous.x) / dt
  const velocityY = (candidate.y - previous.y) / dt

  const smoothing = previous.visible ? 0.3 : 1
  const stable: HandCoord = previous.visible ? {
    ...candidate,
    x: lerp(previous.x, candidate.x, smoothing),
    y: lerp(previous.y, candidate.y, smoothing),
  } : candidate

  track.velocityX = lerp(track.velocityX, velocityX, previous.visible ? 0.4 : 1)
  track.velocityY = lerp(track.velocityY, velocityY, previous.visible ? 0.4 : 1)
  track.seenAt = now
  track.point = stable
  return stable
}

export async function startMediaPipeWorker() {
  if (sharedRef.mode === 'camera') return sharedRef

  stopMediaPipeWorker()
  setVisionState({ active: true, mode: 'loading', message: 'กำลังขอสิทธิ์กล้อง' })

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('ไม่รองรับการเปิดกล้อง (ต้องใช้ HTTPS หรือ localhost)')
    }

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
      audio: false,
    })

    setVisionState({ mode: 'camera', message: 'กำลังโหลดตัวจับมือ' })

    handLandmarker = await createHandLandmarker()
    
    if (videoEl) {
      scheduleRealFrame()
    }
  } catch (error: any) {
    stopMediaPipeWorker()
    let errorMessage = 'เปิดกล้องไม่ได้'
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = 'กรุณาอนุญาตการใช้งานกล้องในเบราว์เซอร์'
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = 'ไม่พบกล้องในอุปกรณ์นี้'
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = 'กล้องกำลังถูกใช้งานโดยแอปพลิเคชันอื่น'
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    setVisionState({
      mode: 'error',
      message: errorMessage,
    })
  }

  return sharedRef
}

export function stopMediaPipeWorker() {
  if (timerId) clearTimeout(timerId)
  if (videoFrameCallbackId && videoEl && 'cancelVideoFrameCallback' in videoEl) {
    (videoEl as any).cancelVideoFrameCallback(videoFrameCallbackId)
  }
  timerId = 0
  videoFrameCallbackId = 0

  if (handLandmarker) {
    handLandmarker.close()
    handLandmarker = null
  }
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop())
    cameraStream = null
  }
  
  tracks = { left: createTrack(0.38), right: createTrack(0.62) }
  setVisionState({ left: null, right: null, tracking: false, active: false, mode: 'idle' })
}

export function stopMockVision() { stopMediaPipeWorker() }
export function getVisionRef() { return sharedRef }
export function getCameraStream() { return cameraStream }
export function subscribeVision(listener: (ref: VisionRef) => void): () => void {
  listeners.add(listener)
  listener(sharedRef)
  return () => {
    listeners.delete(listener)
  }
}
export function getHandMessage(hand: HandCoord | null) {
  if (!hand) return 'กำลังค้นหามือ'
  if (!hand.visible) return 'ขยับเข้ามาในกล้อง'
  switch (hand.focus) {
    case 'too-small': return 'มือเล็กไป ใกล้เข้ามาหน่อย'
    case 'too-large': return 'มือใหญ่ไป ถอยออกไปนิด'
    case 'edge': return 'มืออยู่ขอบจอ ให้อยู่ตรงกลาง'
    case 'low-confidence': return 'เห็นมือไม่ชัด'
    case 'ready': return 'ตรวจพบมือแล้ว'
  }
}
