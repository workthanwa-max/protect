import type { ControlMode, GameState } from './state'
import { getVisionRef, type HandCoord } from '../vision'

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function pickActiveHand(right: HandCoord | null, left: HandCoord | null): HandCoord | null {
  const candidates = [right, left].filter((hand): hand is HandCoord => Boolean(hand?.visible && hand.active))
  if (candidates.length === 0) return null
  return candidates.sort((a, b) => b.confidence - a.confidence)[0]
}

export function bindPointerInput(canvas: HTMLCanvasElement, state: GameState, controlMode: ControlMode): () => void {
  function updatePointer(event: PointerEvent): void {
    if (controlMode !== 'mouse') return
    const rect = canvas.getBoundingClientRect()
    const scaleX = state.width / rect.width
    const scaleY = state.height / rect.height
    state.input.targetX = (event.clientX - rect.left) * scaleX
    state.input.targetY = (event.clientY - rect.top) * scaleY
    state.input.pointerActive = true
  }

  function clearPointer(): void {
    state.input.pointerActive = false
  }

  let rafId = 0
  function pollVision(): void {
    try {
      const vr = getVisionRef()
      if (controlMode === 'body' && vr.active && vr.tracking && vr.mode === 'camera') {
        const hand = pickActiveHand(vr.right, vr.left)
        if (hand) {
          state.input.targetX = clamp01(hand.x) * state.width
          state.input.targetY = clamp01(hand.y) * state.height
          state.input.pointerActive = true
          state.input.activeHand = hand
          state.input.activeHandSide = hand === vr.left ? 'L' : 'R'
        } else {
          state.input.activeHand = undefined
          state.input.activeHandSide = undefined
        }
      }
    } catch {
      // ignore
    }
    rafId = requestAnimationFrame(pollVision)
  }

  canvas.addEventListener('pointermove', updatePointer)
  canvas.addEventListener('pointerdown', updatePointer)
  canvas.addEventListener('pointerleave', clearPointer)
  rafId = requestAnimationFrame(pollVision)

  return () => {
    canvas.removeEventListener('pointermove', updatePointer)
    canvas.removeEventListener('pointerdown', updatePointer)
    canvas.removeEventListener('pointerleave', clearPointer)
    cancelAnimationFrame(rafId)
  }
}
