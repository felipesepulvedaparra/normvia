'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { fmt, fmtF } from '@/lib/db'
import { Topbar, CardHeader, SectionLabel } from '@/components/ui/Layout'
import Badge from '@/components/ui/Badge'

const COLORS = ['#0A1628','#00B87A','#6366F1','#F59E0B','#E5484D','#8B5CF6','#EC4899','#14B8A6']

export default function SocietarioPage() {
  const [tab, setTab] = useState('resumen')
  const TABS = [
    { key: 'resumen', label: '📊 Resumen' },
    { key: 'accionistas', label: '👥 Accionistas' },
    { key: 'asambleas', label: '🏛️ Asambleas' },
    { key: 'estatutos', label: '📋 Estatutos' },
    { key: 'conflictos', label: '⚡ Resolución de conflictos' },
    { key: 'transferencias', label: '🔄 Transferencia de acciones' },
  ]
  return (
    <div>
      <Topbar title="🏛️ Derecho Societario" sub="Accionistas · Asambleas · Estatutos · Conflictos · Transferencias" />
      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #EBEBF0', marginBottom: '1.5rem', gap: '2px', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 14px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: tab === t.key ? '600' : '400', color: tab === t.key ? '#0A1628' : '#8B8FA8', borderBottom: tab === t.key ? '2px solid #0A1628' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px', fontFamily: 'inherit', whiteSpace: 'nowrap', letterSpacing: '-.01em' }}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'resumen' && <TabResumen />}
        {tab === 'accionistas' && <TabAccionistas />}
        {tab === 'asambleas' && <TabAsambleas />}
        {tab === 'estatutos' && <TabEstatutos />}
        {tab === 'conflictos' && <TabConflictos />}
        {tab === 'transferencias' && <TabTransferencias />}
      </div>
    </div>
  )
}

// ── RESUMEN ───────────────────────────────────────────────────────────────────
function TabResumen() {
  const { empresaId, empresa } = useAuth()
  const [acc, setAcc] = useState<any[]>([])
  const [asam, setAsam] = useState<any[]>([])
  const [est, setEst] = useState<any>(null)
  const [conflictos, setConflictos] = useState<any[]>([])
  useEffect(() => {
    if (!empresaId) return
    supabase.from('accionistas').select('*').eq('empresa_id', empresaId).eq('activo', true).then(r => setAcc(r.data || []))
    supabase.from('asambleas').select('*').eq('empresa_id', empresaId).order('fecha', { ascending: false }).limit(3).then(r => setAsam(r.data || []))
    supabase.from('estatutos').select('*').eq('empresa_id', empresaId).maybeSingle().then(r => setEst(r.data))
    supabase.from('conflictos_societarios').select('estado').eq('empresa_id', empresaId).then(r => setConflictos(r.data || []))
  }, [empresaId])
  const e: any = empresa || {}
  const activos = conflictos.filter(c => c.estado === 'abierto' || c.estado === 'en_mediacion').length
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Accionistas', value: acc.length, color: '#0A1628' },
          { label: 'Asambleas', value: asam.length, color: '#6366F1' },
          { label: 'Estatutos', value: `v${est?.version || 1}`, color: '#00B87A' },
          { label: 'Conflictos activos', value: activos, color: activos > 0 ? '#E5484D' : '#00B87A' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #EBEBF0' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '26px', fontWeight: '500', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0' }}>
          <CardHeader title="Datos de la sociedad" />
          <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {[['Razón social', e.nombre || '—'], ['RUT', e.rut || '—'], ['Tipo', e.tipo || '—'], ['Capital', fmt(e.capital || 0)], ['Rep. legal', e.rep_legal || '—']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #F5F5F8', paddingBottom: '.5rem' }}>
                <span style={{ color: '#8B8FA8' }}>{k}</span><span style={{ fontWeight: '500' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0' }}>
          <CardHeader title="Últimas asambleas" />
          {asam.length === 0 ? <div style={{ padding: '1.5rem', fontSize: '13px', color: '#8B8FA8', textAlign: 'center' }}>Sin asambleas</div>
            : asam.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1.25rem', borderBottom: '1px solid #F5F5F8', fontSize: '13px' }}>
                <div><div style={{ fontWeight: '500' }}>{a.titulo}</div><div style={{ fontSize: '11px', color: '#8B8FA8' }}>{fmtF(a.fecha)}</div></div>
                <Badge variant="v">{a.tipo}</Badge>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// ── ACCIONISTAS ───────────────────────────────────────────────────────────────
function TabAccionistas() {
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
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', marginBottom: '12px' }}>
        <CardHeader title="Distribución accionaria" />
        <div style={{ padding: '1.25rem' }}>
          <div style={{ background: '#F8F8FB', border: '1px solid #EBEBF0', borderRadius: '10px', padding: '.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '13px', color: '#0A1628' }}>Total asignado</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.2rem', color: pct > 100 ? '#E5484D' : pct === 100 ? '#00B87A' : '#F59E0B' }}>{totalUsado.toLocaleString()} / {totalEmit.toLocaleString()} ({pct}%)</span>
          </div>
          {acc.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: '13px', flex: 1 }}>{a.nombre || 'Sin nombre'}</span>
              <span style={{ fontSize: '12px', color: '#8B8FA8', fontFamily: "'DM Mono', monospace" }}>{a.acciones.toLocaleString()} acc.</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', fontWeight: '600', color: '#0A1628', minWidth: '40px', textAlign: 'right' }}>{totalEmit > 0 ? Math.round(a.acciones / totalEmit * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0' }}>
        <CardHeader title="Libro de accionistas" action={<button onClick={agregar} style={{ padding: '5px 12px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Agregar</button>} />
        <div style={{ padding: '.5rem 1.25rem' }}>
          {acc.map((a, i) => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 110px auto', gap: '8px', alignItems: 'center', padding: '.625rem 0', borderBottom: '1px solid #F5F5F8' }}>
              <input defaultValue={a.nombre} onBlur={e => update(a.id, 'nombre', e.target.value)} style={{ padding: '7px 10px', border: '1px solid #E2E2EC', borderRadius: '7px', fontSize: '13px' }} />
              <input defaultValue={a.rut || ''} onBlur={e => update(a.id, 'rut', e.target.value)} placeholder="RUT" style={{ padding: '7px 10px', border: '1px solid #E2E2EC', borderRadius: '7px', fontSize: '13px' }} />
              <input defaultValue={a.email || ''} onBlur={e => update(a.id, 'email', e.target.value)} placeholder="email" style={{ padding: '7px 10px', border: '1px solid #E2E2EC', borderRadius: '7px', fontSize: '13px' }} />
              <input type="number" defaultValue={a.acciones} onBlur={e => update(a.id, 'acciones', parseInt(e.target.value) || 0)} style={{ padding: '7px 10px', border: '1px solid #E2E2EC', borderRadius: '7px', fontSize: '13px' }} />
              <button onClick={() => eliminar(a.id, a.nombre)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#FFF5F5', color: '#E5484D', cursor: 'pointer', fontSize: '14px' }}>×</button>
            </div>
          ))}
          {acc.length === 0 && <div style={{ padding: '1.5rem', fontSize: '13px', color: '#8B8FA8', textAlign: 'center' }}>Sin accionistas. Agrega el primero.</div>}
        </div>
      </div>
    </div>
  )
}

// ── ASAMBLEAS ─────────────────────────────────────────────────────────────────
function TabAsambleas() {
  const { empresaId, empresa } = useAuth()
  const [asam, setAsam] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ tipo: 'ordinaria', fecha: '', hora: '10:00', titulo: '', lugar: '', acta: '', acuerdos: '' })
  const [saving, setSaving] = useState(false)
  const [notif, setNotif] = useState<string | null>(null)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() { const { data } = await supabase.from('asambleas').select('*').eq('empresa_id', empresaId).order('fecha', { ascending: false }); setAsam(data || []) }

  async function guardar() {
    if (!form.fecha || !form.titulo) { alert('Completa fecha y título.'); return }
    setSaving(true)
    const { data: nueva } = await supabase.from('asambleas').insert({ empresa_id: empresaId, tipo: form.tipo, fecha: form.fecha, hora: form.hora, titulo: form.titulo, lugar: form.lugar, acta: form.acta, acuerdos: form.acuerdos.split('\n').filter(a => a.trim()), asistentes: [], quorum_pct: 0, estado: 'aprobada' }).select().single()
    if (nueva) {
      try {
        const { data: acc } = await supabase.from('accionistas').select('email').eq('empresa_id', empresaId).eq('activo', true)
        const destinatarios = (acc || []).map((a: any) => a.email).filter(Boolean)
        if (destinatarios.length > 0) {
          const res = await fetch('/api/notificar-asamblea', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ destinatarios, asamblea: nueva, empresaNombre: (empresa as any)?.nombre || '' }) })
          const json = await res.json()
          setNotif(json.enviados > 0 ? `✓ Notificación enviada a ${json.enviados} accionista(s)` : null)
        }
      } catch { }
    }
    setModal(false); setForm({ tipo: 'ordinaria', fecha: '', hora: '10:00', titulo: '', lugar: '', acta: '', acuerdos: '' }); setSaving(false); cargar()
    setTimeout(() => setNotif(null), 5000)
  }

  async function eliminar(id: string) { if (!confirm('¿Eliminar?')) return; await supabase.from('asambleas').delete().eq('id', id); cargar() }

  return (
    <div>
      {notif && <div style={{ background: '#F0FDF8', border: '1px solid #00B87A', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: '#047857', marginBottom: '1rem' }}>{notif}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ fontSize: '13px', color: '#8B8FA8' }}>{asam.length} asambleas</div>
        <button onClick={() => setModal(true)} style={{ padding: '7px 16px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>+ Nueva asamblea</button>
      </div>
      {asam.map(a => (
        <div key={a.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', marginBottom: '.875rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: a.tipo === 'ordinaria' ? '#E8F1FA' : '#F5F3FF', color: a.tipo === 'ordinaria' ? '#0A1628' : '#6366F1' }}>{a.tipo}</span>
                <span style={{ fontSize: '12px', color: '#8B8FA8' }}>📅 {fmtF(a.fecha)} · {a.hora}</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#0A1628' }}>{a.titulo}</div>
            </div>
            <button onClick={() => eliminar(a.id)} style={{ fontSize: '11px', padding: '4px 10px', background: '#FFF5F5', color: '#E5484D', border: '1px solid #FECDD3', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>Eliminar</button>
          </div>
          {(a.acuerdos || []).length > 0 && (
            <div style={{ marginTop: '.75rem', paddingTop: '.75rem', borderTop: '1px solid #F5F5F8' }}>
              {a.acuerdos.map((ac: string, i: number) => <div key={i} style={{ fontSize: '12px', color: '#8B8FA8', padding: '3px 0' }}>→ {ac}</div>)}
            </div>
          )}
        </div>
      ))}
      {asam.length === 0 && <div style={{ background: '#F8F8FB', borderRadius: '10px', border: '1px solid #EBEBF0', padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#8B8FA8' }}>Sin asambleas registradas</div>}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,12,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F0F0F5', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#0A1628' }}>Nueva asamblea</div>
              <button onClick={() => setModal(false)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#F5F5F8', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Tipo</div>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', background: '#fff' }}>
                  <option value="ordinaria">Ordinaria</option><option value="extraordinaria">Extraordinaria</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Fecha *</div><input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px' }} /></div>
                <div><div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Hora</div><input type="time" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px' }} /></div>
              </div>
              <div><div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Título *</div><input type="text" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Asamblea Ordinaria 2026" style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px' }} /></div>
              <div><div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Lugar</div><input type="text" value={form.lugar} onChange={e => setForm(p => ({ ...p, lugar: e.target.value }))} placeholder="Dirección" style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px' }} /></div>
              <div><div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Acuerdos (uno por línea)</div><textarea value={form.acuerdos} onChange={e => setForm(p => ({ ...p, acuerdos: e.target.value }))} rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit' }} /></div>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #F0F0F5', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={{ padding: '9px 18px', border: '1px solid #E2E2EC', borderRadius: '8px', background: '#fff', color: '#6B6B6E', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={guardar} disabled={saving} style={{ padding: '9px 18px', border: 'none', borderRadius: '8px', background: '#0A1628', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .6 : 1, fontFamily: 'inherit' }}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ESTATUTOS ─────────────────────────────────────────────────────────────────
function TabEstatutos() {
  const { empresaId } = useAuth()
  const [est, setEst] = useState<any>(null)
  const [vals, setVals] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const ARTS = [
    { k: 'art1_nombre', t: 'Artículo 1° — Nombre' }, { k: 'art2_duracion', t: 'Artículo 2° — Duración' },
    { k: 'art3_objeto', t: 'Artículo 3° — Objeto social' }, { k: 'art4_capital', t: 'Artículo 4° — Capital' },
    { k: 'art5_admin', t: 'Artículo 5° — Administración' }, { k: 'art6_junta', t: 'Artículo 6° — Juntas' },
    { k: 'art7_dividendos', t: 'Artículo 7° — Dividendos' }, { k: 'art8_disolucion', t: 'Artículo 8° — Disolución' },
  ]
  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('estatutos').select('*').eq('empresa_id', empresaId).maybeSingle()
    setEst(data); if (data) { const v: any = {}; ARTS.forEach(a => { v[a.k] = data[a.k] || '' }); setVals(v) }
  }
  async function guardar(campo: string) {
    if (!est) return; setSaving(campo)
    await supabase.from('estatutos').update({ [campo]: vals[campo], ultima_modificacion: new Date().toISOString().split('T')[0] }).eq('id', est.id)
    setSaving(null)
  }
  if (!est) return <div style={{ padding: '2rem', fontSize: '13px', color: '#8B8FA8', textAlign: 'center' }}>Cargando estatutos...</div>
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#8B8FA8', marginBottom: '1rem' }}>Versión {est.version} · Última modificación: {est.ultima_modificacion || '—'}</div>
      {ARTS.map(s => (
        <div key={s.k} style={{ background: '#fff', border: '1px solid #EBEBF0', borderRadius: '10px', marginBottom: '10px', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0A1628', marginBottom: '8px' }}>{s.t}</div>
          <textarea value={vals[s.k] || ''} onChange={e => setVals(p => ({ ...p, [s.k]: e.target.value }))} rows={3}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit' }} />
          <button onClick={() => guardar(s.k)} disabled={saving === s.k}
            style={{ marginTop: '8px', padding: '7px 14px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', opacity: saving === s.k ? .6 : 1 }}>
            {saving === s.k ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ── CONFLICTOS ────────────────────────────────────────────────────────────────
function TabConflictos() {
  const { empresaId } = useAuth()
  const [conflictos, setConflictos] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ titulo: '', descripcion: '', partes: '', tipo: 'desacuerdo_societario' })
  const [chatMsg, setChatMsg] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('conflictos_societarios').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false })
    setConflictos(data || [])
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault(); if (!form.titulo || !form.descripcion) return
    setSaving(true)
    await supabase.from('conflictos_societarios').insert({ empresa_id: empresaId, ...form, estado: 'abierto' })
    setModal(false); setForm({ titulo: '', descripcion: '', partes: '', tipo: 'desacuerdo_societario' }); setSaving(false); cargar()
  }

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from('conflictos_societarios').update({ estado }).eq('id', id); cargar()
    if (selected?.id === id) setSelected((p: any) => ({ ...p, estado }))
  }

  async function preguntarIA() {
    if (!chatMsg.trim() || !selected) return
    const msgs = [...chatHistory, { role: 'user', content: chatMsg }]
    setChatHistory(msgs); setChatMsg(''); setChatLoading(true)
    try {
      const contexto = `Eres un especialista en derecho societario chileno y colombiano. Estás ayudando a resolver un conflicto societario con las siguientes características:\n\nTítulo: ${selected.titulo}\nTipo: ${selected.tipo}\nPartes involucradas: ${selected.partes || 'No especificadas'}\nDescripción: ${selected.descripcion}\nEstado actual: ${selected.estado}\n\nTu rol es ayudar a encontrar una solución mediada, antes de ir a juicio. Sugiere opciones de resolución, cita el Código de Comercio o normas societarias cuando corresponda, y siempre recomienda involucrar a un abogado especialista si el conflicto es complejo. Sé concreto y práctico.`
      const res = await fetch('/api/asistente-legal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: [{ role: 'user', content: contexto + '\n\nPregunta del usuario: ' + chatMsg }] })
      })
      const data = await res.json()
      setChatHistory([...msgs, { role: 'assistant', content: data.respuesta || data.error || 'No pude generar una respuesta.' }])
    } catch { setChatHistory([...msgs, { role: 'assistant', content: 'Error al conectar con el asistente.' }]) }
    setChatLoading(false)
  }

  const TIPOS = [
    { v: 'desacuerdo_societario', l: 'Desacuerdo societario' },
    { v: 'disputa_dividendos', l: 'Disputa de dividendos' },
    { v: 'exclusion_socio', l: 'Exclusión de socio' },
    { v: 'impugnacion_acuerdo', l: 'Impugnación de acuerdo' },
    { v: 'conflicto_administracion', l: 'Conflicto de administración' },
    { v: 'otro', l: 'Otro' },
  ]
  const ESTADOS: Record<string, { label: string, badge: string }> = {
    abierto: { label: 'Abierto', badge: 'r' },
    en_mediacion: { label: 'En mediación', badge: 'a' },
    resuelto: { label: 'Resuelto', badge: 'v' },
    derivado_abogado: { label: 'Derivado a abogado', badge: 'az' },
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', color: '#0A1628', background: '#fff', outline: 'none', fontFamily: 'inherit' }
  const lbl: React.CSSProperties = { fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '5px', display: 'block', letterSpacing: '.04em', textTransform: 'uppercase' }

  return (
    <div>
      <div style={{ background: '#F5F3FF', border: '1px solid #C4B5FD', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#5B21B6', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        ⚡ <strong>Resolución de conflictos antes del juicio.</strong> La mediación societaria ahorra tiempo y dinero. El asistente IA ayuda a encontrar caminos de acuerdo; para casos complejos, derivamos a un abogado especialista.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        {/* Lista */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '13px', color: '#8B8FA8' }}>{conflictos.length} caso(s)</div>
            <button onClick={() => setModal(true)} style={{ padding: '6px 14px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>+ Nuevo caso</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {conflictos.map(c => (
              <div key={c.id} onClick={() => { setSelected(c); setChatHistory([]) }}
                style={{ background: selected?.id === c.id ? '#F5F3FF' : '#fff', borderRadius: '10px', border: `1px solid ${selected?.id === c.id ? '#C4B5FD' : '#EBEBF0'}`, padding: '12px 16px', cursor: 'pointer', transition: 'all .1s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628' }}>{c.titulo}</div>
                  <Badge variant={ESTADOS[c.estado]?.badge || 'g'}>{ESTADOS[c.estado]?.label || c.estado}</Badge>
                </div>
                <div style={{ fontSize: '11px', color: '#8B8FA8' }}>{TIPOS.find(t => t.v === c.tipo)?.l} · {new Date(c.created_at).toLocaleDateString('es-CL')}</div>
              </div>
            ))}
            {conflictos.length === 0 && <div style={{ background: '#F8F8FB', borderRadius: '10px', border: '1px solid #EBEBF0', padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#8B8FA8' }}>Sin conflictos registrados</div>}
          </div>
        </div>

        {/* Detalle + Chat IA */}
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Info */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', padding: '1.25rem' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#0A1628', marginBottom: '4px' }}>{selected.titulo}</div>
              <div style={{ fontSize: '12px', color: '#8B8FA8', marginBottom: '1rem' }}>{TIPOS.find(t => t.v === selected.tipo)?.l}</div>
              {selected.partes && <div style={{ fontSize: '13px', color: '#0A1628', marginBottom: '8px' }}><strong>Partes:</strong> {selected.partes}</div>}
              <div style={{ fontSize: '13px', color: '#0A1628', lineHeight: 1.6, background: '#F8F8FB', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem' }}>{selected.descripcion}</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(ESTADOS).map(([k, v]) => (
                  <button key={k} onClick={() => cambiarEstado(selected.id, k)}
                    style={{ padding: '6px 12px', border: `1px solid ${selected.estado === k ? '#0A1628' : '#E2E2EC'}`, borderRadius: '7px', background: selected.estado === k ? '#0A1628' : '#fff', color: selected.estado === k ? '#fff' : '#6B6B6E', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: selected.estado === k ? '600' : '400' }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat IA */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>⚡</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0A1628' }}>Asistente de mediación</div>
                  <div style={{ fontSize: '10px', color: '#8B8FA8' }}>IA especializada en conflictos societarios · Casos complejos → abogado</div>
                </div>
              </div>
              <div style={{ padding: '12px 16px', height: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', background: '#FAFAF8' }}>
                {chatHistory.length === 0 && (
                  <div style={{ fontSize: '12px', color: '#8B8FA8', lineHeight: 1.6 }}>
                    Puedo ayudarte a encontrar opciones de resolución para este conflicto antes de ir a juicio. ¿Qué necesitas saber?
                  </div>
                )}
                {chatHistory.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '85%', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', lineHeight: 1.6, background: m.role === 'user' ? '#0A1628' : '#fff', color: m.role === 'user' ? '#fff' : '#0A1628', border: m.role === 'user' ? 'none' : '1px solid #EBEBF0', whiteSpace: 'pre-wrap' }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && <div style={{ background: '#fff', border: '1px solid #EBEBF0', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', color: '#8B8FA8' }}>Analizando el caso...</div>}
              </div>
              <div style={{ padding: '10px 12px', borderTop: '1px solid #EBEBF0', display: 'flex', gap: '8px' }}>
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') preguntarIA() }} placeholder="¿Qué opciones tenemos para resolver esto?" style={{ flex: 1, padding: '9px 12px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '12px', outline: 'none', fontFamily: 'inherit' }} />
                <button onClick={preguntarIA} disabled={chatLoading || !chatMsg.trim()} style={{ padding: '9px 14px', background: chatLoading || !chatMsg.trim() ? '#E2E2EC' : '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>→</button>
              </div>
              <div style={{ padding: '6px 12px 10px', fontSize: '10px', color: '#B0B4C8', textAlign: 'center' }}>
                Casos complejos requieren asesoría de un abogado especialista · <a href="mailto:contacto@normvia.cl" style={{ color: '#6366F1' }}>Contactar especialista</a>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#F8F8FB', borderRadius: '10px', border: '1px solid #EBEBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div style={{ textAlign: 'center', color: '#B0B4C8', fontSize: '13px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚡</div>
              Selecciona un caso para ver el detalle y usar el asistente de mediación
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,12,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '520px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F0F0F5', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#0A1628' }}>Registrar conflicto societario</div>
              <button onClick={() => setModal(false)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#F5F5F8', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={crear} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={lbl}>Título del conflicto *</label><input type="text" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Ej: Desacuerdo sobre distribución de dividendos" style={inp} required /></div>
              <div><label style={lbl}>Tipo de conflicto</label>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                  {TIPOS.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Partes involucradas</label><input type="text" value={form.partes} onChange={e => setForm(p => ({ ...p, partes: e.target.value }))} placeholder="Ej: Socio A vs Socio B" style={inp} /></div>
              <div><label style={lbl}>Descripción del conflicto *</label><textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={4} placeholder="Describe el conflicto con el mayor detalle posible..." style={{ ...inp, resize: 'vertical' }} required /></div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '.5rem' }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding: '9px 18px', border: '1px solid #E2E2EC', borderRadius: '8px', background: '#fff', color: '#6B6B6E', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ padding: '9px 18px', border: 'none', borderRadius: '8px', background: '#0A1628', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .6 : 1, fontFamily: 'inherit' }}>{saving ? 'Guardando...' : 'Registrar caso'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── TRANSFERENCIAS ────────────────────────────────────────────────────────────
function TabTransferencias() {
  const { empresaId, empresa } = useAuth()
  const [acc, setAcc] = useState<any[]>([])
  const [transferencias, setTransferencias] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ vendedor_id: '', comprador_nombre: '', comprador_rut: '', acciones: 0, precio_accion: 0, motivo: '', fecha: new Date().toISOString().split('T')[0] })
  const [restriccion, setRestriccion] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const [a, t] = await Promise.all([
      supabase.from('accionistas').select('*').eq('empresa_id', empresaId).eq('activo', true),
      supabase.from('transferencias_acciones').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false }),
    ])
    setAcc(a.data || []); setTransferencias(t.data || [])
  }

  function verificarRestricciones() {
    const vendedor = acc.find(a => a.id === form.vendedor_id)
    if (!vendedor) { setRestriccion(null); return }
    const e: any = empresa || {}
    const tipo = e.tipo || ''
    const accVendedor = vendedor.acciones || 0
    const msgs: string[] = []
    if (form.acciones > accVendedor) msgs.push(`El vendedor solo tiene ${accVendedor} acciones disponibles.`)
    if (tipo.includes('SpA')) msgs.push('En una SpA, el estatuto puede establecer derecho de preferencia para los demás accionistas. Verifica el Artículo 6° de los estatutos.')
    if (tipo.includes('Ltda') || tipo.includes('Limitada')) msgs.push('En una SRL, toda cesión de derechos requiere modificación de estatutos ante notario y publicación en el Diario Oficial.')
    if (tipo.includes('Anónima') || tipo.includes('SA')) msgs.push('En una SA cerrada, las acciones solo pueden transferirse a los accionistas existentes salvo que el estatuto diga lo contrario.')
    setRestriccion(msgs.length > 0 ? msgs.join(' ') : null)
  }

  useEffect(() => { verificarRestricciones() }, [form.vendedor_id, form.acciones])

  async function ejecutar(e: React.FormEvent) {
    e.preventDefault()
    const vendedor = acc.find(a => a.id === form.vendedor_id)
    if (!vendedor) return
    if (form.acciones > vendedor.acciones) { alert('El vendedor no tiene suficientes acciones.'); return }
    if (!confirm(`¿Confirmas la transferencia de ${form.acciones} acciones de ${vendedor.nombre} a ${form.comprador_nombre}?`)) return
    setSaving(true)
    const totalPrecio = form.acciones * form.precio_accion
    await supabase.from('transferencias_acciones').insert({ empresa_id: empresaId, vendedor_nombre: vendedor.nombre, vendedor_id: form.vendedor_id, comprador_nombre: form.comprador_nombre, comprador_rut: form.comprador_rut, acciones: form.acciones, precio_accion: form.precio_accion, precio_total: totalPrecio, fecha: form.fecha, motivo: form.motivo, estado: 'pendiente_notaria' })
    await supabase.from('accionistas').update({ acciones: vendedor.acciones - form.acciones }).eq('id', form.vendedor_id)
    const existente = acc.find(a => a.nombre === form.comprador_nombre)
    if (existente) { await supabase.from('accionistas').update({ acciones: existente.acciones + form.acciones }).eq('id', existente.id) }
    else { await supabase.from('accionistas').insert({ empresa_id: empresaId, nombre: form.comprador_nombre, rut: form.comprador_rut, acciones: form.acciones, activo: true }) }
    await supabase.from('alertas').insert({ empresa_id: empresaId, tipo: 'societario', severidad: 'atencion', titulo: `Transferencia de acciones registrada — pendiente de escritura`, descripcion: `${form.acciones} acciones de ${vendedor.nombre} a ${form.comprador_nombre}. Formalizar ante notario.` })
    setModal(false); setSaving(false); cargar()
  }

  const totalEmit = (empresa as any)?.acciones_total || 1000
  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', color: '#0A1628', background: '#fff', outline: 'none', fontFamily: 'inherit' }
  const lbl: React.CSSProperties = { fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '5px', display: 'block', letterSpacing: '.04em', textTransform: 'uppercase' }

  return (
    <div>
      <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#92400E', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        ⚠️ <strong>Importante:</strong> Toda transferencia de acciones debe formalizarse ante notario y, según el tipo societario, puede requerir modificación de estatutos. Este módulo registra y valida la operación, pero no reemplaza el proceso legal formal.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
        {/* Estado actual */}
        <div>
          <SectionLabel text="Distribución actual" />
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', marginBottom: '12px' }}>
            {acc.map((a, i) => (
              <div key={a.id} style={{ padding: '10px 16px', borderBottom: '1px solid #F5F5F8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628' }}>{a.nombre}</div>
                  <div style={{ fontSize: '11px', color: '#8B8FA8', fontFamily: "'DM Mono', monospace" }}>{a.acciones.toLocaleString()} acc. · {totalEmit > 0 ? Math.round(a.acciones / totalEmit * 100) : 0}%</div>
                </div>
              </div>
            ))}
            {acc.length === 0 && <div style={{ padding: '1.5rem', fontSize: '13px', color: '#8B8FA8', textAlign: 'center' }}>Sin accionistas registrados</div>}
          </div>

          <SectionLabel text="Historial de transferencias" />
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0' }}>
            {transferencias.length === 0
              ? <div style={{ padding: '1.5rem', fontSize: '13px', color: '#8B8FA8', textAlign: 'center' }}>Sin transferencias registradas</div>
              : transferencias.map(t => (
                <div key={t.id} style={{ padding: '10px 16px', borderBottom: '1px solid #F5F5F8', fontSize: '13px' }}>
                  <div style={{ fontWeight: '500', color: '#0A1628', marginBottom: '2px' }}>{t.vendedor_nombre} → {t.comprador_nombre}</div>
                  <div style={{ fontSize: '11px', color: '#8B8FA8', fontFamily: "'DM Mono', monospace" }}>{t.acciones.toLocaleString()} acc. · {fmt(t.precio_total)} · {new Date(t.created_at).toLocaleDateString('es-CL')}</div>
                  <Badge variant={t.estado === 'completada' ? 'v' : t.estado === 'rechazada' ? 'r' : 'a'}>{t.estado?.replace(/_/g, ' ')}</Badge>
                </div>
              ))
            }
          </div>
        </div>

        {/* Formulario */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', padding: '1.5rem' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0A1628', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #F0F0F5' }}>
            🔄 Registrar transferencia de acciones
          </div>
          <form onSubmit={ejecutar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={lbl}>Vendedor (accionista actual) *</label>
              <select value={form.vendedor_id} onChange={e => setForm(p => ({ ...p, vendedor_id: e.target.value }))} style={{ ...inp, appearance: 'none' as any }} required>
                <option value="">Selecciona accionista</option>
                {acc.map(a => <option key={a.id} value={a.id}>{a.nombre} — {a.acciones.toLocaleString()} acciones</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={lbl}>Comprador *</label><input type="text" value={form.comprador_nombre} onChange={e => setForm(p => ({ ...p, comprador_nombre: e.target.value }))} placeholder="Nombre completo" style={inp} required /></div>
              <div><label style={lbl}>RUT comprador</label><input type="text" value={form.comprador_rut} onChange={e => setForm(p => ({ ...p, comprador_rut: e.target.value }))} placeholder="12.345.678-9" style={inp} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={lbl}>N° de acciones *</label><input type="number" value={form.acciones || ''} onChange={e => setForm(p => ({ ...p, acciones: parseInt(e.target.value) || 0 }))} min={1} style={inp} required /></div>
              <div><label style={lbl}>Precio por acción</label><input type="number" value={form.precio_accion || ''} onChange={e => setForm(p => ({ ...p, precio_accion: parseFloat(e.target.value) || 0 }))} placeholder="0" style={inp} /></div>
            </div>
            <div><label style={lbl}>Fecha de transferencia</label><input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} style={inp} /></div>
            <div><label style={lbl}>Motivo / observaciones</label><textarea value={form.motivo} onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} /></div>

            {form.acciones > 0 && form.precio_accion > 0 && (
              <div style={{ background: '#F0FDF8', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#047857' }}>
                💰 Precio total estimado: <strong>{fmt(form.acciones * form.precio_accion)}</strong>
                {totalEmit > 0 && <div style={{ fontSize: '11px', marginTop: '4px', color: '#6EE7B7' }}>Representa el {Math.round(form.acciones / totalEmit * 100)}% del capital total</div>}
              </div>
            )}

            {restriccion && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#92400E', lineHeight: 1.6 }}>
                ⚠️ <strong>Restricciones detectadas:</strong> {restriccion}
              </div>
            )}

            <button type="submit" disabled={saving} style={{ padding: '11px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .6 : 1, fontFamily: 'inherit', marginTop: '.25rem' }}>
              {saving ? 'Registrando...' : 'Registrar transferencia →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
