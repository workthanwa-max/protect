import { useEffect, useRef } from 'react'
import { createGameEngine } from '../game/engine'
import type { ControlMode, GameSnapshot } from '../game/state'

type GameCanvasProps = {
  controlMode: ControlMode
  onSnapshot: (snapshot: GameSnapshot) => void
  onGameOver: (snapshot: GameSnapshot) => void
}

function GameCanvas({ controlMode, onSnapshot, onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const callbacksRef = useRef({ onSnapshot, onGameOver })

  useEffect(() => {
    callbacksRef.current = { onSnapshot, onGameOver }
  }, [onSnapshot, onGameOver])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const engine = createGameEngine({
      canvas,
      controlMode,
      onSnapshot: (snapshot) => callbacksRef.current.onSnapshot(snapshot),
      onGameOver: (snapshot) => callbacksRef.current.onGameOver(snapshot),
    })
    engine.start()

    return () => engine.dispose()
  }, [controlMode])

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Synapse Shield game canvas" />
}

export default GameCanvas
