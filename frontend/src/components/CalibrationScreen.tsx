type CalibrationScreenProps = {
  handReady: boolean
  readyProgress: number
  onBack: () => void
}

export function CalibrationScreen({
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
        <div className="hand-readiness" style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
          <span className={handReady ? 'hand-status ready' : 'hand-status missing'} style={{ padding: '8px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{handReady ? 'ตรวจพบมือแล้ว' : 'กำลังค้นหามือ...'}</span>
          </span>
        </div>
        <div className="ready-progress" style={{ width: '100%', height: '6px', borderRadius: '4px', overflow: 'hidden', marginTop: '16px', marginBottom: '16px' }}>
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
