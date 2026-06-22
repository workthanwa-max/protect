import type { VisionMode } from '../vision'

type PermissionScreenProps = {
  status: VisionMode
  errorMessage: string
  onRequestCamera: () => void
  onBack: () => void
}

export default function PermissionScreen({
  status,
  errorMessage,
  onRequestCamera,
  onBack,
}: PermissionScreenProps) {
  return (
    <section className="permission-wrapper">
      <div className="flow-panel" role="dialog" aria-modal="true" aria-label="Permission">
        <p className="eyebrow">สิทธิ์</p>
        <h1>อนุญาตกล้อง</h1>
        <p className="panel-copy">เปิดเว็บแคมเพื่อให้ระบบตรวจจับตำแหน่งมือ</p>
        {errorMessage ? <p className="error-copy">{errorMessage}</p> : null}
        <div className="permission-actions">
          <button type="button" className="primary-action" onClick={onRequestCamera} disabled={status === 'loading'}>
            {status === 'loading' ? 'กำลังเปิดกล้อง...' : 'เปิดกล้อง'}
          </button>
          <button type="button" className="secondary-action" onClick={onBack}>
            กลับ
          </button>
        </div>
      </div>
    </section>
  )
}
