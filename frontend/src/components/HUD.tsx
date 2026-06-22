import type { ControlMode, GameSnapshot } from '../game/state'
import type { VisionRef } from '../vision'

type HUDProps = {
  snapshot: GameSnapshot
  controlMode: ControlMode
  vision: VisionRef
}

function HUD({ snapshot, controlMode, vision }: HUDProps) {
  const healthPercent = Math.max(0, Math.min(100, (snapshot.health / snapshot.maxHealth) * 100))
  const trackingLabel = controlMode === 'mouse' ? 'เมาส์' : vision.tracking ? 'มือพร้อม' : 'หลุด'
  const statusClass = controlMode === 'mouse' ? 'idle' : vision.tracking ? 'tracking' : 'searching'

  return (
    <div className="hud">
      <div className="hud-card hud-score">
        <span>คะแนน</span>
        <strong>{snapshot.score.toLocaleString()}</strong>
      </div>
      <div className="hud-card hud-health">
        <span>พลังสมอง</span>
        <div className="health-track">
          <div className="health-fill" style={{ width: `${healthPercent}%` }} />
        </div>
      </div>
      <div className="hud-card">
        <span>ต่อเนื่อง</span>
        <strong>x{snapshot.combo}</strong>
      </div>
      <div className="hud-card">
        <span>เวลา</span>
        <strong>{snapshot.playtime.toFixed(1)}s</strong>
      </div>
      <div className={`hud-card vision-card ${statusClass}`}>
        <span>คุมโล่</span>
        <strong>{trackingLabel}</strong>
        <small>{controlMode === 'mouse' ? 'โหมดเมาส์' : vision.message}</small>
        {controlMode === 'body' && (
          <em>
            {vision.stats.fps}fps · {vision.stats.inferenceMs}ms
          </em>
        )}
      </div>
    </div>
  )
}

export default HUD
