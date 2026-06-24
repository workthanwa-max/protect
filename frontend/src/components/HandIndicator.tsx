export type HandIndicatorProps = {
  leftReady: boolean
  rightReady: boolean
  handReady: boolean
  message: string
}

export function HandIndicator({ leftReady, rightReady, handReady, message }: HandIndicatorProps) {
  return (
    <div className="hand-readiness" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
      <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: 800, fontSize: '14px', transition: 'all 0.2s', background: leftReady ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)', color: leftReady ? '#000' : 'rgba(255,255,255,0.5)', boxShadow: leftReady ? '0 0 12px var(--color-secondary)' : 'none' }}>L</div>
      <span className={handReady ? 'hand-status ready' : 'hand-status missing'} style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>
      </span>
      <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: 800, fontSize: '14px', transition: 'all 0.2s', background: rightReady ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)', color: rightReady ? '#000' : 'rgba(255,255,255,0.5)', boxShadow: rightReady ? '0 0 12px var(--color-secondary)' : 'none' }}>R</div>
    </div>
  )
}
