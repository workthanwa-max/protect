import { useEffect, useRef } from 'react'
import { createGameEngine } from '../game/engine'
import type { ControlMode, GameSnapshot, PlayLevel } from '../game/state'

type GameCanvasProps = {
  level: PlayLevel
  controlMode: ControlMode
  onSnapshot: (snapshot: GameSnapshot) => void
  onGameOver: (snapshot: GameSnapshot) => void
}

function GameCanvas({ level, controlMode, onSnapshot, onGameOver }: GameCanvasProps) {
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
      level,
      controlMode,
      onSnapshot: (snapshot) => callbacksRef.current.onSnapshot(snapshot),
      onGameOver: (snapshot) => callbacksRef.current.onGameOver(snapshot),
    })
    engine.start()

    return () => engine.dispose()
  }, [level, controlMode])

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Synapse Shield game canvas" />
}

export default GameCanvas
