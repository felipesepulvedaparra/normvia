'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { fmtF, diasHasta } from '@/lib/db'
import { Topbar, CardHeader } from '@/components/ui/Layout'
import Badge from '@/components/ui/Badge'

export default function SubcontratacionPage() {
  const { empresaId } = useAuth()
  const [lista, setLista] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', rut: '', servicio: '', tipo_certificado: 'F30', fecha_vencimiento_f30: '', trabajadores_asignados: 0, verificado_dt: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('contratistas').select('*').eq('empresa_id', empresaId).eq('activo', true).order('nombre')
    setLista(data || [])
    await chequearVencidos(data || [])
  }

  // Revisa automáticamente al cargar la página si algún contratista ya vencido
  // no tiene todavía una alerta activa creada para él, y la crea sola.
  // Esto evita tener que entrar manualmente a la BD: el sistema se autovigila.
  async function chequearVencidos(contratistas: any[]) {
    const vencidosHoy = contratistas.filter(c => {
      const d = diasHasta(c.fecha_vencimiento_f30)
      return d !== null && d < 0
    })
    if (vencidosHoy.length === 0) return

    const { data: alertasActivas } = await supabase
      .from('alertas')
      .select('titulo')
      .eq('empresa_id', empresaId)
      .eq('tipo', 'subcontratacion')
      .eq('resuelta', false)

    const titulosExistentes = new Set((alertasActivas || []).map(a => a.titulo))

    for (const c of vencidosHoy) {
      const titulo = `F30 vencido: ${c.nombre}`
      if (!titulosExistentes.has(titulo)) {
        await supabase.from('alertas').insert({
          empresa_id: empresaId, tipo: 'subcontratacion', severidad: 'riesgo',
          titulo, descripcion: 'Certificado F30 vencido. Riesgo de responsabilidad solidaria.'
        })
      }
    }
  }

  async function guardar() {
    if (!form.nombre) { alert('Ingresa la razón social.'); return }
    setSaving(true)
    await supabase.from('contratistas').insert({ ...form, empresa_id: empresaId })
    if (form.fecha_vencimiento_f30) {
      const d = diasHasta(form.fecha_vencimiento_f30)
      if (d !== null && d < 0) {
        await supabase.from('alertas').insert({ empresa_id: empresaId, tipo: 'subcontratacion', severidad: 'riesgo', titulo: `F30 vencido: ${form.nombre}`, descripcion: 'Certificado F30 vencido. Riesgo de responsabilidad solidaria.' })
      }
    }
    setModal(false); setForm({ nombre: '', rut: '', servicio: '', tipo_certificado: 'F30', fecha_vencimiento_f30: '', trabajadores_asignados: 0, verificado_dt: false })
    setSaving(false); cargar()
  }

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return
    await supabase.from('contratistas').update({ activo: false }).eq('id', id)
    cargar()
  }

  const hoy = new Date()
  const vencidos = lista.filter(c => c.fecha_vencimiento_f30 && new Date(c.fecha_vencimiento_f30) < hoy)
  const proximos = lista.filter(c => { const d = diasHasta(c.fecha_vencimiento_f30); return d !== null && d >= 0 && d <= 30 })
  const ok = lista.filter(c => { const d = diasHasta(c.fecha_vencimiento_f30); return d !== null && d > 30 })

  const estadoF30 = (c: any) => {
    const d = diasHasta(c.fecha_vencimiento_f30)
    if (d === null) return { label: 'Sin fecha', badge: 'g' }
    if (d < 0) return { label: `Vencido hace ${Math.abs(d)}d`, badge: 'r' }
    if (d <= 30) return { label: `Vence en ${d}d`, badge: 'a' }
    return { label: 'Vigente', badge: 'v' }
  }

  return (
    <div>
      <Topbar title="🤝 Subcontratación" sub="Ley 20.123 · F30 y F30-1 · Responsabilidad solidaria"
        action={<button onClick={() => setModal(true)} style={{ padding: '7px 16px', background: '#0B3D6B', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>+ Agregar contratista</button>} />
      <div style={{ padding: '2rem' }}>
        <div style={{ background: '#E8F1FA', border: '1px solid #BDD4ED', borderRadius: '12px', padding: '12px 15px', fontSize: '12px', color: '#0B3D6B', marginBottom: '1.5rem' }}>
          ⚖️ <strong>Importante:</strong> La empresa principal es responsable solidaria por las deudas laborales de sus contratistas.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <Stat label="F30 vencidos" value={vencidos.length} color="#D94040" icon="🔴" desc="Renovación urgente" />
          <Stat label="Vencen pronto" value={proximos.length} color="#D97706" icon="🟡" desc="Próximos 30 días" />
          <Stat label="Al día" value={ok.length} color="#16A34A" icon="🟢" desc="Certificados vigentes" />
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>
          <CardHeader title={`Contratistas activos (${lista.length})`} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Razón social', 'RUT', 'Servicio', 'Vencimiento F30', 'Estado', ''].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6B6B6E', padding: '.625rem .875rem', textAlign: 'left', borderBottom: '1px solid #D1CFC7', background: '#F4F3EF' }}>{h}</th>)}</tr></thead>
              <tbody>
                {lista.map(c => {
                  const est = estadoF30(c)
                  return (
                    <tr key={c.id}>
                      <td style={{ padding: '.75rem .875rem', borderBottom: '1px solid #F4F3EF', fontSize: '13px', fontWeight: 500 }}>{c.nombre}</td>
                      <td style={{ padding: '.75rem .875rem', borderBottom: '1px solid #F4F3EF', fontSize: '12px', color: '#6B6B6E' }}>{c.rut || '—'}</td>
                      <td style={{ padding: '.75rem .875rem', borderBottom: '1px solid #F4F3EF', fontSize: '13px' }}>{c.servicio || '—'}</td>
                      <td style={{ padding: '.75rem .875rem', borderBottom: '1px solid #F4F3EF', fontSize: '13px' }}>{fmtF(c.fecha_vencimiento_f30)}</td>
                      <td style={{ padding: '.75rem .875rem', borderBottom: '1px solid #F4F3EF' }}><Badge variant={est.badge}>{est.label}</Badge></td>
                      <td style={{ padding: '.75rem .875rem', borderBottom: '1px solid #F4F3EF' }}>
                        <button onClick={() => eliminar(c.id, c.nombre)} style={{ fontSize: '11px', padding: '4px 10px', background: '#FDEAEA', color: '#D94040', border: '1px solid #FBBCBC', borderRadius: '6px', cursor: 'pointer' }}>Eliminar</button>
                      </td>
                    </tr>
                  )
                })}
                {lista.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6B6B6E', fontSize: '13px' }}>Sin contratistas registrados</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,12,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F4F3EF', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#0B3D6B' }}>Agregar contratista</div>
              <button onClick={() => setModal(false)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: '#F4F3EF', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[{ label: 'Razón social *', key: 'nombre', type: 'text', placeholder: 'Constructora Norte Ltda.' }, { label: 'RUT', key: 'rut', type: 'text', placeholder: '76.123.456-7' }, { label: 'Servicio', key: 'servicio', type: 'text', placeholder: 'Aseo y mantención' }, { label: 'Fecha vencimiento F30', key: 'fecha_vencimiento_f30', type: 'date', placeholder: '' }, { label: 'Trabajadores asignados', key: 'trabajadores_asignados', type: 'number', placeholder: '0' }].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>{f.label}</div>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))} placeholder={f.placeholder}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>Tipo de certificado</div>
                <select value={form.tipo_certificado} onChange={e => setForm(p => ({ ...p, tipo_certificado: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                  <option value="F30">F30 — Certificado de cumplimiento</option>
                  <option value="F30-1">F30-1 — Con detalle de trabajadores</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #F4F3EF', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={{ padding: '9px 20px', border: '1.5px solid #D1CFC7', borderRadius: '8px', background: '#fff', color: '#6B6B6E', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} disabled={saving} style={{ padding: '9px 20px', border: 'none', borderRadius: '8px', background: '#0B3D6B', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .6 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color, icon, desc }: any) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #D1CFC7' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.625rem' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B6B6E', letterSpacing: '.05em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '18px' }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'serif', fontSize: '2rem', fontWeight: 500, color, marginBottom: '.125rem' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#6B6B6E' }}>{desc}</div>
    </div>
  )
}
