import { getHandMessage, type HandCoord, type VisionRef } from '../vision'
import type { ControlMode } from '../game/state'

type HandStatusPanelProps = {
  controlMode: ControlMode
  vision: VisionRef
  holdProgress?: number
  countdown?: number | null
  setup?: boolean
}

const HAND_LINES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
] as const

function pickHand(vision: VisionRef): HandCoord | null {
  if (vision.right?.visible && vision.left?.visible) {
    return vision.right.confidence >= vision.left.confidence ? vision.right : vision.left
  }
  return vision.right?.visible ? vision.right : vision.left?.visible ? vision.left : null
}

function renderSkeleton(hand: HandCoord | null) {
  if (!hand || hand.landmarks.length < 21) {
    return <div className="hand-empty">ยกมือขึ้น</div>
  }

  return (
    <svg className={`hand-skeleton focus-${hand.focus}`} viewBox="0 0 100 100" role="img" aria-label="โครงมือ" preserveAspectRatio="none">
      {HAND_LINES.map(([start, end]) => {
        const a = hand.landmarks[start]
        const b = hand.landmarks[end]
        if (!a || !b) return null
        return (
          <line
            key={`${start}-${end}`}
            x1={a.x * 100}
            y1={a.y * 100}
            x2={b.x * 100}
            y2={b.y * 100}
          />
        )
      })}
      {hand.landmarks.map((point, index) => (
        <circle key={index} cx={point.x * 100} cy={point.y * 100} r={index === 9 ? 3.2 : index === 0 ? 2.2 : 1.45} />
      ))}
    </svg>
  )
}

function HandStatusPanel({ controlMode, vision, holdProgress = 0, countdown = null, setup = false }: HandStatusPanelProps) {
  const hand = pickHand(vision)
  const isBody = controlMode === 'body'
  const handType = hand === vision.left ? 'มือซ้าย' : hand === vision.right ? 'มือขวา' : ''
  const status = !isBody ? 'เมาส์' : countdown ? 'เริ่มใน' : hand?.active ? `พร้อม (${handType})` : hand ? `ปรับมือ (${handType})` : 'หามือ'
  const progress = Math.max(0, Math.min(1, holdProgress))

  return (
    <aside className={`hand-panel ${setup ? 'setup' : 'compact'} ${vision.tracking ? 'tracking' : ''}`}>
      <div className="hand-panel-top">
        <span>{status}</span>
        <strong>{countdown ?? (isBody ? `${Math.round(progress * 100)}%` : 'พร้อม')}</strong>
      </div>
      {!setup && (
        <div className="hand-stage">{isBody ? renderSkeleton(hand) : <div className="hand-empty">ใช้เมาส์</div>}</div>
      )}
      {isBody && (
        <>
          <div className="hold-track">
            <div style={{ width: `${progress * 100}%` }} />
          </div>
          <small>{getHandMessage(hand)}</small>
        </>
      )}
    </aside>
  )
}

export default HandStatusPanel
