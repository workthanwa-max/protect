import { HandIndicator } from './HandIndicator'
import { ItemLegend } from './ItemLegend'

type CalibrationScreenProps = {
  leftReady?: boolean
  rightReady?: boolean
  handReady: boolean
  readyProgress: number
  onBack: () => void
}

export function CalibrationScreen({
  leftReady = false,
  rightReady = false,
  handReady,
  readyProgress,
  onBack,
}: CalibrationScreenProps) {
  return (
    <section className="calibration-wrapper">
      <div className="calibration-card" role="dialog" aria-modal="true" aria-label="Calibration">
        <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-high)', textAlign: 'center' }}>
          ยกมือข้างใดก็ได้ค้าง 3 วินาที
        </h2>
        <HandIndicator 
          leftReady={leftReady} 
          rightReady={rightReady} 
          handReady={handReady} 
          message={handReady ? 'ตรวจพบมือแล้ว' : 'กำลังค้นหามือ...'}
        />
        <ItemLegend />

        <div className="ready-progress" style={{ width: '100%', height: '6px', borderRadius: '4px', overflow: 'hidden', marginTop: '20px', marginBottom: '16px' }}>
          <span style={{ display: 'block', height: '100%', background: 'var(--color-secondary)', width: `${Math.round(readyProgress * 100)}%`, transition: 'width 0.12s linear' }} />
        </div>


        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
          <button type="button" className="corner-action left icon-only" onClick={onBack} aria-label="ย้อนกลับ">
            ←
          </button>
        </div>
      </div>
    </section>
  )
}
