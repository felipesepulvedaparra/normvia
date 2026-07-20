import Badge from './Badge'

export type Item = { t: string, s: 'r' | 'a' | 'v', d: string }

export default function ResultadoView({ items, titulo, onReset }: { items: Item[], titulo: string, onReset: () => void }) {
  const ok = items.filter(i => i.s === 'v').length
  const warn = items.filter(i => i.s === 'a').length
  const risk = items.filter(i => i.s === 'r').length
  const score = Math.round(ok / items.length * 100)

  return (
    <div style={{ maxWidth: '600px' }}>
      {/* Score header */}
      <div style={{ background: '#0A1628', borderRadius: '12px', padding: '24px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '3px', width: '100%', background: 'linear-gradient(90deg, #00B87A, #6366F1)' }} />
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,.5)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '16px' }}>{titulo}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '48px', fontWeight: '500', color: score >= 70 ? '#00B87A' : score >= 40 ? '#F59E0B' : '#E5484D', lineHeight: 1, letterSpacing: '-.04em' }}>{score}%</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.3)', marginTop: '4px' }}>Score de cumplimiento</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', paddingBottom: '8px' }}>
            {[{ n: risk, l: 'Riesgo', c: '#E5484D' }, { n: warn, l: 'Atención', c: '#F59E0B' }, { n: ok, l: 'OK', c: '#00B87A' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '22px', fontWeight: '500', color: s.c, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.3)', marginTop: '3px', letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.25)' }}>
          {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })} · Guardado en base de datos
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #EBEBF0', borderLeft: `3px solid ${item.s === 'r' ? '#E5484D' : item.s === 'a' ? '#F59E0B' : '#00B87A'}`, borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628', marginBottom: '3px', letterSpacing: '-.01em' }}>{item.t}</div>
              <div style={{ fontSize: '12px', color: '#8B8FA8', lineHeight: '1.5' }}>{item.d}</div>
            </div>
            <Badge variant={item.s}>{item.s === 'r' ? 'Riesgo' : item.s === 'a' ? 'Atención' : 'OK'}</Badge>
          </div>
        ))}
      </div>

      {/* CTA especialista */}
      {risk > 0 && (
        <div style={{ background: '#0A1628', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff', marginBottom: '2px' }}>¿Necesitas apoyo jurídico?</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)' }}>Te conectamos con un abogado especialista</div>
          </div>
          <button onClick={() => alert('Escríbenos a contacto@normvia.cl')}
            style={{ padding: '8px 16px', background: '#00B87A', color: '#0A1628', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit', letterSpacing: '-.01em' }}>
            Contactar →
          </button>
        </div>
      )}

      <button onClick={onReset} style={{ display: 'block', fontSize: '12px', color: '#8B8FA8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0' }}>
        ← Hacer nuevo diagnóstico
      </button>
    </div>
  )
}
