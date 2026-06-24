export function ItemLegend() {
  return (
    <div className="item-tables" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
      <div className="item-table good" style={{ background: 'rgba(20, 40, 20, 0.6)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(61, 220, 151, 0.3)', flex: 1 }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--color-good)', textAlign: 'center' }}>ของดี (เก็บ)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-good)', boxShadow: '0 0 8px var(--color-good)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>ยาเขียว +16 HP</span>
        </div>
      </div>
      <div className="item-table bad" style={{ background: 'rgba(40, 20, 20, 0.6)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255, 107, 107, 0.3)', flex: 1 }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--color-danger)', textAlign: 'center' }}>ของร้าย (หลบ)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-danger)', boxShadow: '0 0 8px var(--color-danger)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>ยาแดง -HP</span>
        </div>
      </div>
    </div>
  )
}
