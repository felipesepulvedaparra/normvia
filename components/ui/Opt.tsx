'use client'
// Componente reutilizable de "opción seleccionable" tipo radio button.
// CORRECCIÓN: el onClick va en el <label> contenedor (que SÍ recibe clicks),
// y el <input type="radio"> es solo visual (readOnly) para no duplicar el evento.
// El bug anterior tenía onChange en el label (nunca se dispara) e inputs readOnly
// sin ningún manejador — por eso no respondía al hacer clic.
export default function Opt({ name, val, curr, label, onSelect }: { name: string, val: string, curr: string, label: string, onSelect: (v: string) => void }) {
  const selected = curr === val
  return (
    <label
      onClick={() => onSelect(val)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
        border: `1.5px solid ${selected ? '#0B3D6B' : '#D1CFC7'}`, borderRadius: '10px',
        cursor: 'pointer', fontSize: '14px', color: selected ? '#0B3D6B' : '#18181A',
        background: selected ? '#E8F1FA' : '#fff', fontWeight: selected ? 500 : 400,
        marginBottom: '7px', userSelect: 'none', transition: 'all .15s',
      }}>
      <input type="radio" name={name} checked={selected} onChange={() => onSelect(val)} style={{ width: '16px', height: '16px', accentColor: '#0B3D6B', flexShrink: 0 }} />
      {label}
    </label>
  )
}
