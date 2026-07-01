'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { fmt, fmtF } from '@/lib/db'
import { Topbar, CardHeader } from '@/components/ui/Layout'
import Badge from '@/components/ui/Badge'

const COLORS = ['#0B3D6B', '#00C896', '#1A5F9E', '#D97706', '#16A34A', '#D94040', '#7C3AED', '#DB2777']

export default function SocietarioPage() {
  const [tab, setTab] = useState('resumen')
  return (
    <div>
      <Topbar title="🏛️ Derecho Societario" sub="Accionistas · Asambleas · Estatutos" />
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #D1CFC7', marginBottom: '1.5rem' }}>
          {['resumen', 'accionistas', 'asambleas', 'estatutos'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '.75rem 1.25rem', fontSize: '13px', fontWeight: 500, color: tab === t ? '#0B3D6B' : '#6B6B6E', border: 'none', background: 'transparent', borderBottom: tab === t ? '2px solid #0B3D6B' : '2px solid transparent', marginBottom: '-2px', cursor: 'pointer', textTransform: 'capitalize' }}>
              {t === 'resumen' ? '📊 Resumen' : t === 'accionistas' ? '👥 Accionistas' : t === 'asambleas' ? '🏛️ Asambleas' : '📋 Estatutos'}
            </button>
          ))}
        </div>
        {tab === 'resumen' && <Resumen />}
        {tab === 'accionistas' && <Accionistas />}
        {tab === 'asambleas' && <Asambleas />}
        {tab === 'estatutos' && <Estatutos />}
      </div>
    </div>
  )
}

function Resumen() {
  const { empresaId, empresa } = useAuth()
  const [acc, setAcc] = useState<any[]>([])
  const [asam, setAsam] = useState<any[]>([])
  const [est, setEst] = useState<any>(null)
  useEffect(() => {
    if (!empresaId) return
    supabase.from('accionistas').select('*').eq('empresa_id', empresaId).eq('activo', true).then(r => setAcc(r.data || []))
    supabase.from('asambleas').select('*').eq('empresa_id', empresaId).order('fecha', { ascending: false }).then(r => setAsam(r.data || []))
    supabase.from('estatutos').select('*').eq('empresa_id', empresaId).maybeSingle().then(r => setEst(r.data))
  }, [empresaId])
  const e: any = empresa || {}
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <Stat label="Accionistas" value={acc.length} color="#0B3D6B" />
        <Stat label="Acciones emitidas" value={(e.acciones_total || 1000).toLocaleString('es-CL')} color="#0B3D6B" />
        <Stat label="Asambleas" value={asam.length} color="#16A34A" />
        <Stat label="Estatutos" value={`v${est?.version || 1}`} color="#0B3D6B" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>
          <CardHeader title="Datos de la sociedad" />
          <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {[['Razón social', e.nombre || '—'], ['RUT', e.rut || '—'], ['Tipo', e.tipo || '—'], ['Capital', fmt(e.capital || 0)], ['Rep. legal', e.rep_legal || '—']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #F4F3EF', paddingBottom: '.5rem' }}><span style={{ color: '#6B6B6E' }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>
          <CardHeader title="Últimas asambleas" />
          {asam.slice(0, 3).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.625rem 1.25rem', borderBottom: '1px solid #F4F3EF', fontSize: '13px' }}>
              <div><div style={{ fontWeight: 500 }}>{a.titulo}</div><div style={{ fontSize: '11px', color: '#6B6B6E' }}>{fmtF(a.fecha)} · {a.tipo}</div></div>
              <Badge variant="v">{a.estado}</Badge>
            </div>
          ))}
          {asam.length === 0 && <div style={{ padding: '1.25rem', fontSize: '13px', color: '#6B6B6E', textAlign: 'center' }}>Sin asambleas registradas</div>}
        </div>
      </div>
    </div>
  )
}

function Accionistas() {
  const { empresaId, empresa } = useAuth()
  const [acc, setAcc] = useState<any[]>([])
  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() { const { data } = await supabase.from('accionistas').select('*').eq('empresa_id', empresaId).eq('activo', true); setAcc(data || []) }
  async function agregar() { await supabase.from('accionistas').insert({ empresa_id: empresaId, nombre: 'Nuevo accionista', acciones: 0, activo: true }); cargar() }
  async function update(id: string, field: string, val: any) { await supabase.from('accionistas').update({ [field]: val }).eq('id', id); cargar() }
  async function eliminar(id: string, nombre: string) { if (!confirm(`¿Eliminar a ${nombre}?`)) return; await supabase.from('accionistas').update({ activo: false }).eq('id', id); cargar() }

  const totalEmit = (empresa as any)?.acciones_total || 1000
  const totalUsado = acc.reduce((s, a) => s + (a.acciones || 0), 0)
  const pct = totalEmit > 0 ? Math.round(totalUsado / totalEmit * 100) : 0

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7', marginBottom: '1rem' }}>
        <CardHeader title="Distribución accionaria" />
        <div style={{ padding: '1.25rem' }}>
          <div style={{ background: '#E8F1FA', border: '1px solid #BDD4ED', borderRadius: '10px', padding: '.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '13px', color: '#0B3D6B' }}>Total asignado</span>
            <span style={{ fontFamily: 'serif', fontSize: '1.2rem', color: pct > 100 ? '#D94040' : pct === 100 ? '#16A34A' : '#D97706' }}>{totalUsado.toLocaleString()} / {totalEmit.toLocaleString()} acc. ({pct}%)</span>
          </div>
          {acc.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', marginBottom: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{a.nombre}</span>
              <span style={{ fontWeight: 600, color: '#0B3D6B' }}>{totalEmit > 0 ? Math.round(a.acciones / totalEmit * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>
        <CardHeader title="Libro de accionistas" action={<button onClick={agregar} style={{ padding: '6px 14px', background: '#0B3D6B', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>+ Agregar</button>} />
        <div style={{ padding: '.5rem 1.25rem' }}>
          {acc.map((a, i) => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 110px auto', gap: '8px', alignItems: 'center', padding: '.625rem 0', borderBottom: '1px solid #F4F3EF' }}>
              <input defaultValue={a.nombre} onBlur={e => update(a.id, 'nombre', e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #D1CFC7', borderRadius: '8px', fontSize: '13px' }} />
              <input defaultValue={a.rut || ''} onBlur={e => update(a.id, 'rut', e.target.value)} placeholder="RUT" style={{ padding: '7px 10px', border: '1.5px solid #D1CFC7', borderRadius: '8px', fontSize: '13px' }} />
              <input defaultValue={a.email || ''} onBlur={e => update(a.id, 'email', e.target.value)} placeholder="email@empresa.cl" style={{ padding: '7px 10px', border: '1.5px solid #D1CFC7', borderRadius: '8px', fontSize: '13px' }} />
              <input type="number" defaultValue={a.acciones} onBlur={e => update(a.id, 'acciones', parseInt(e.target.value) || 0)} style={{ padding: '7px 10px', border: '1.5px solid #D1CFC7', borderRadius: '8px', fontSize: '13px' }} />
              <button onClick={() => eliminar(a.id, a.nombre)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: 'none', background: '#FDEAEA', color: '#D94040', cursor: 'pointer' }}>×</button>
            </div>
          ))}
          {acc.length === 0 && <div style={{ padding: '1.25rem', fontSize: '13px', color: '#6B6B6E', textAlign: 'center' }}>Sin accionistas. Agrega el primero.</div>}
        </div>
      </div>
    </div>
  )
}

function Asambleas() {
  const { empresaId, empresa } = useAuth()
  const [asam, setAsam] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ tipo: 'ordinaria', fecha: '', hora: '10:00', titulo: '', lugar: '', acta: '', acuerdos: '' })
  const [saving, setSaving] = useState(false)
  const [notifEstado, setNotifEstado] = useState<string | null>(null)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() { const { data } = await supabase.from('asambleas').select('*').eq('empresa_id', empresaId).order('fecha', { ascending: false }); setAsam(data || []) }

  async function guardar() {
    if (!form.fecha || !form.titulo) { alert('Completa fecha y título.'); return }
    setSaving(true)
    const { data: nuevaAsamblea } = await supabase.from('asambleas').insert({ empresa_id: empresaId, tipo: form.tipo, fecha: form.fecha, hora: form.hora, titulo: form.titulo, lugar: form.lugar, acta: form.acta, acuerdos: form.acuerdos.split('\n').filter(a => a.trim()), asistentes: [], quorum_pct: 0, estado: 'aprobada' }).select().single()

    // Notificar por correo a los accionistas que tengan email registrado.
    // No bloquea el guardado: si falla el envío, la asamblea igual queda creada.
    if (nuevaAsamblea) {
      setNotifEstado('enviando')
      try {
        const { data: accionistas } = await supabase.from('accionistas').select('email').eq('empresa_id', empresaId).eq('activo', true)
        const destinatarios = (accionistas || []).map(a => a.email).filter(Boolean)
        if (destinatarios.length > 0) {
          const res = await fetch('/api/notificar-asamblea', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destinatarios, asamblea: nuevaAsamblea, empresaNombre: (empresa as any)?.nombre || 'tu empresa' })
          })
          const json = await res.json()
          setNotifEstado(json.enviados > 0 ? `✓ Notificación enviada a ${json.enviados} accionista(s)` : 'No se pudo notificar')
        } else {
          setNotifEstado('Sin accionistas con email registrado — no se envió notificación')
        }
      } catch {
        setNotifEstado('No se pudo enviar la notificación, pero la asamblea quedó guardada')
      }
    }

    setModal(false); setForm({ tipo: 'ordinaria', fecha: '', hora: '10:00', titulo: '', lugar: '', acta: '', acuerdos: '' }); setSaving(false); cargar()
    setTimeout(() => setNotifEstado(null), 6000)
  }
  async function eliminar(id: string) { if (!confirm('¿Eliminar?')) return; await supabase.from('asambleas').delete().eq('id', id); cargar() }

  return (
    <div>
      {notifEstado && (
        <div style={{ background: notifEstado.startsWith('✓') ? '#DCFCE7' : '#FEF3C7', border: `1px solid ${notifEstado.startsWith('✓') ? '#86EFAC' : '#FCD34D'}`, borderRadius: '10px', padding: '10px 16px', fontSize: '13px', color: notifEstado.startsWith('✓') ? '#16A34A' : '#633806', marginBottom: '1rem' }}>
          {notifEstado === 'enviando' ? '📧 Enviando notificación a accionistas...' : notifEstado}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ fontSize: '13px', color: '#6B6B6E' }}>{asam.length} asambleas registradas</div>
        <button onClick={() => setModal(true)} style={{ padding: '7px 16px', background: '#0B3D6B', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>+ Nueva asamblea</button>
      </div>
      {asam.map(a => (
        <div key={a.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7', marginBottom: '.875rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: a.tipo === 'ordinaria' ? '#E8F1FA' : '#FEF3C7', color: a.tipo === 'ordinaria' ? '#0B3D6B' : '#633806' }}>{a.tipo}</span>
                <span style={{ fontSize: '12px', color: '#6B6B6E' }}>📅 {fmtF(a.fecha)} · {a.hora} hrs</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{a.titulo}</div>
            </div>
            <button onClick={() => eliminar(a.id)} style={{ fontSize: '11px', padding: '4px 10px', background: '#FDEAEA', color: '#D94040', border: '1px solid #FBBCBC', borderRadius: '6px', cursor: 'pointer' }}>Eliminar</button>
          </div>
          {a.acuerdos?.length > 0 && (
            <div style={{ marginTop: '.75rem' }}>
              {a.acuerdos.map((ac: string, i: number) => <div key={i} style={{ fontSize: '13px', padding: '.375rem 0', borderTop: '1px solid #F4F3EF' }}>→ {ac}</div>)}
            </div>
          )}
        </div>
      ))}
      {asam.length === 0 && <div style={{ background: '#E8F1FA', border: '1px solid #BDD4ED', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '13px', color: '#0B3D6B' }}>ℹ️ Sin asambleas registradas.</div>}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,12,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F4F3EF', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#0B3D6B' }}>Nueva asamblea</div>
              <button onClick={() => setModal(false)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: '#F4F3EF', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>Tipo</div>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                  <option value="ordinaria">Ordinaria</option><option value="extraordinaria">Extraordinaria</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>Fecha *</div><input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px' }} /></div>
                <div><div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>Hora</div><input type="time" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px' }} /></div>
              </div>
              <div><div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>Título *</div><input type="text" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Asamblea Ordinaria 2026" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px' }} /></div>
              <div><div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>Acuerdos (uno por línea)</div><textarea value={form.acuerdos} onChange={e => setForm(p => ({ ...p, acuerdos: e.target.value }))} rows={4} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px', resize: 'vertical' }} /></div>
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

function Estatutos() {
  const { empresaId } = useAuth()
  const [est, setEst] = useState<any>(null)
  const [vals, setVals] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('estatutos').select('*').eq('empresa_id', empresaId).maybeSingle()
    setEst(data)
    if (data) setVals({ art1_nombre: data.art1_nombre || '', art2_duracion: data.art2_duracion || '', art3_objeto: data.art3_objeto || '', art4_capital: data.art4_capital || '', art5_admin: data.art5_admin || '', art6_junta: data.art6_junta || '', art7_dividendos: data.art7_dividendos || '', art8_disolucion: data.art8_disolucion || '' })
  }
  async function guardarArt(campo: string) {
    if (!est) return
    setSaving(campo)
    await supabase.from('estatutos').update({ [campo]: vals[campo], ultima_modificacion: new Date().toISOString().split('T')[0] }).eq('id', est.id)
    setSaving(null); cargar()
  }

  const SECCIONES = [
    { k: 'art1_nombre', t: 'Artículo 1° — Nombre' }, { k: 'art2_duracion', t: 'Artículo 2° — Duración' },
    { k: 'art3_objeto', t: 'Artículo 3° — Objeto social' }, { k: 'art4_capital', t: 'Artículo 4° — Capital social' },
    { k: 'art5_admin', t: 'Artículo 5° — Administración' }, { k: 'art6_junta', t: 'Artículo 6° — Juntas' },
    { k: 'art7_dividendos', t: 'Artículo 7° — Dividendos' }, { k: 'art8_disolucion', t: 'Artículo 8° — Disolución' },
  ]

  if (!est) return <div style={{ fontSize: '13px', color: '#6B6B6E' }}>Cargando estatutos...</div>

  return (
    <div>
      <div style={{ marginBottom: '1rem', fontSize: '12px', color: '#6B6B6E' }}>Versión {est.version} · Última mod: {est.ultima_modificacion || '—'}</div>
      {SECCIONES.map(s => (
        <div key={s.k} style={{ border: '1px solid #D1CFC7', borderRadius: '12px', marginBottom: '1rem', padding: '1rem 1.25rem', background: '#fff' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{s.t}</div>
          <textarea value={vals[s.k] || ''} onChange={e => setVals(p => ({ ...p, [s.k]: e.target.value }))} rows={3}
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1CFC7', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }} />
          <button onClick={() => guardarArt(s.k)} disabled={saving === s.k} style={{ marginTop: '10px', padding: '8px 16px', background: '#0B3D6B', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', opacity: saving === s.k ? .6 : 1 }}>
            {saving === s.k ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      ))}
    </div>
  )
}

function Stat({ label, value, color }: any) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #D1CFC7' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B6B6E', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '.625rem' }}>{label}</div>
      <div style={{ fontFamily: 'serif', fontSize: '2rem', fontWeight: 500, color }}>{value}</div>
    </div>
  )
}
