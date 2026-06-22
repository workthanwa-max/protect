import GameCanvas from '../components/GameCanvas'
import HUD from '../components/HUD'
import CameraPreview from '../components/CameraPreview'
import type { GameSnapshot, PlayLevel, ControlMode } from '../game/state'
import type { VisionRef } from '../vision'

type GamePageProps = {
  selectedLevel: PlayLevel
  controlMode: ControlMode
  snapshot: GameSnapshot
  setSnapshot: (snapshot: GameSnapshot) => void
  onGameOver: (snapshot: GameSnapshot) => void
  vision: VisionRef
}

export default function GamePage({
  selectedLevel,
  controlMode,
  snapshot,
  setSnapshot,
  onGameOver,
  vision,
}: GamePageProps) {
  return (
    <>
      <GameCanvas
        key={`${selectedLevel}-${controlMode}`}
        level={selectedLevel}
        controlMode={controlMode}
        onSnapshot={setSnapshot}
        onGameOver={onGameOver}
      />
      <HUD snapshot={snapshot} controlMode={controlMode} vision={vision} />
      {controlMode === 'body' && <CameraPreview vision={vision} compact holdProgress={1} />}
    </>
  )
}
