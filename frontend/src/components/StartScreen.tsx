type StartScreenProps = {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <section className="flow-panel flow-panel-start">
      <div className="panel-top-actions">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="corner-action right icon-only"
          aria-label="Toggle fullscreen"
        >
          ⛶
        </button>
      </div>

      <div>
        <p className="eyebrow">AI GUARD</p>
        <h1>ขยับมือ ปกป้องร่างกาย</h1>
        <p className="panel-copy">
          เก็บสัญลักษณ์ดี หลบภัยคุกคามสีแดง รักษาเวลาให้ยาวที่สุด
        </p>
      </div>

      <div className="demo-container" aria-hidden="true">
        <div className="demo-emoji shield">🛡️</div>
        <div className="demo-emoji skull">💀</div>
        <div className="demo-emoji hand">✋</div>
      </div>

      <div className="panel-primary-action">
        <button type="button" className="primary-action" onClick={onStart}>
          เริ่มเล่น
        </button>
      </div>
    </section>
  )
}
