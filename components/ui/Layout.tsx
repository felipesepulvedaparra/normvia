export function Topbar({ title, sub, action }: { title: string, sub?: string, action?: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #EBEBF0', padding: '0 28px',
      height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#0A1628', letterSpacing: '-.01em' }}>{title}</span>
        {sub && <>
          <span style={{ color: '#D0D0DC' }}>/</span>
          <span style={{ fontSize: '13px', color: '#8B8FA8' }}>{sub}</span>
        </>}
      </div>
      {action}
    </div>
  )
}

export function CardHeader({ title, action }: { title: string, action?: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0A1628', letterSpacing: '-.01em' }}>{title}</div>
      {action}
    </div>
  )
}

export function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '.08em', textTransform: 'uppercase', color: '#8B8FA8', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
      {text}<div style={{ flex: 1, height: '1px', background: '#EBEBF0' }} />
    </div>
  )
}
