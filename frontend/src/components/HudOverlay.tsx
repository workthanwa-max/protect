import type { VisionRef } from '../vision'
import type { GameSnapshot } from '../game/state'

type HudOverlayProps = {
  snapshot: GameSnapshot
  vision: VisionRef
}

export default function HudOverlay({ snapshot, vision }: HudOverlayProps) {
  return (
    <>
      <div className="hud-overlay" aria-label="สถานะเกม">
        <div className="hud-stat">
          <span>คะแนน</span>
          <strong id="game-score">{snapshot.score.toLocaleString()}</strong>
        </div>
        <div className="hud-stat">
          <span>พลัง</span>
          <strong id="game-health">{snapshot.health}</strong>
        </div>
        <div className="hud-stat">
          <span>คอมโบ</span>
          <strong id="game-combo">{snapshot.combo}</strong>
        </div>
        <div className="hud-stat">
          <span>ติดตาม</span>
          <strong id="game-tracking">{vision.tracking ? 'พร้อม' : 'หลุด'}</strong>
        </div>
      </div>
      <div id="game-perf" className="perf-badge" aria-hidden="true">
        R-- V-- --ms
      </div>
      <div id="game-feedback" className="game-feedback" aria-hidden="true" />
    </>
  )
}
