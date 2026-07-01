// Firma visual: barra lateral de color en vez de fondo lleno
// Más sofisticado, menos "semáforo"
const styles: Record<string, React.CSSProperties> = {
  r: { borderLeft: '2px solid #E5484D', background: '#FFF5F5', color: '#C4183C' },
  a: { borderLeft: '2px solid #F59E0B', background: '#FFFBEB', color: '#B45309' },
  v: { borderLeft: '2px solid #00B87A', background: '#F0FDF8', color: '#047857' },
  g: { borderLeft: '2px solid #D0D0DC', background: '#F8F8FB', color: '#8B8FA8' },
  az: { borderLeft: '2px solid #6366F1', background: '#F5F5FF', color: '#4338CA' },
}
export default function Badge({ variant = 'g', children }: { variant?: string, children: React.ReactNode }) {
  return (
    <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px 2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', fontFamily: "'DM Mono', monospace", ...(styles[variant] || styles.g) }}>
      {children}
    </span>
  )
}
