import type { GameSnapshot } from '../game/state'
import type { SubmitState } from '../services/api'

type GameOverProps = {
  snapshot: GameSnapshot
  rewardNotice: string
  submitState: SubmitState
  onRestart: () => void
  onMenu: () => void
}

function GameOver({ snapshot, rewardNotice, submitState, onRestart, onMenu }: GameOverProps) {
  return (
    <section className="overlay-panel gameover-panel">
      <p className="eyebrow">สรุปผลภารกิจ</p>
      <h1>จบเกม</h1>
      <div className="reward-alert">{rewardNotice}</div>
      <div className="summary-grid">
        <div>
          <span>คะแนน</span>
          <strong>{snapshot.score.toLocaleString()}</strong>
        </div>
        <div>
          <span>เวลารอด</span>
          <strong>{snapshot.playtime.toFixed(1)}s</strong>
        </div>
        <div>
          <span>ปัดสิ่งเสพติด</span>
          <strong>{snapshot.deflects}</strong>
        </div>
        <div>
          <span>รับพลังสุขภาพ</span>
          <strong>{snapshot.nutrients}</strong>
        </div>
      </div>

      {/* render submit state (status + message) */}
      <p className={`submit-state ${submitState.status}`}>{submitState.message}</p>

      <div className="actions">
        <button type="button" onClick={onRestart}>
          เล่นอีกครั้ง
        </button>
        <button type="button" className="secondary" onClick={onMenu}>
          กลับหน้าแรก
        </button>
      </div>

    </section>
  )
}

export default GameOver
