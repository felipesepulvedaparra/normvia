'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'normvia-admin-2026'

const RUBROS = [
  'Construcción y obras', 'Retail y comercio', 'Restaurantes y gastronomía',
  'Servicios profesionales', 'Transporte y logística', 'Salud y clínicas',
  'Educación', 'Manufactura e industria', 'Tecnología', 'Inmobiliaria',
  'Agricultura', 'Minería', 'Otro'
]

const ESTADOS: Record<string, { label: string; color: string; badge: string }> = {
  nuevo: { label: 'Nuevo', color: '#8B8FA8', badge: 'g' },
  email_generado: { label: 'Email listo', color: '#6366F1', badge: 'az' },
  enviado: { label: 'Enviado', color: '#F59E0B', badge: 'a' },
  abierto: { label: 'Abrió el email', color: '#00B87A', badge: 'v' },
  respondio: { label: 'Respondió', color: '#00B87A', badge: 'v' },
  demo_agendada: { label: 'Demo agendada', color: '#00B87A', badge: 'v' },
  cliente: { label: '⭐ Cliente', color: '#C8A96E', badge: 'v' },
  descartado: { label: 'Descartado', color: '#E5484D', badge: 'r' },
  sin_email: { label: 'Sin email', color: '#8B8FA8', badge: 'g' },
}

const TAM = ['1-10', '11-20', '21-50', '51-100', '101-200', '200+']

export default function ProspectosPage() {
  const [auth, setAuth] = useState(false)
  const [clave, setClave] = useState('')
  const [prospectos, setProspectos] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [tab, setTab] = useState('lista')
  const [loading, setLoading] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [rubroBusqueda, setRubroBusqueda] = useState('Todos los rubros por igual')
  const [cantidadBusqueda, setCantidadBusqueda] = useState(10)
  const [resultadoBusqueda, setResultadoBusqueda] = useState<any>(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')

  // Form nuevo prospecto
  const [form, setForm] = useState({ empresa_nombre: '', contacto_nombre: '', contacto_email: '', rubro: '', trabajadores_estimado: '21-50', sitio_web: '', linkedin_url: '', notas: '' })

  const inp: React.CSSProperties = { width: '100%', padding: '9px 13px', border: '1px solid #E2E2EC', borderRadius: '7px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', color: '#0A1628' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B6B6E', marginBottom: '4px', letterSpacing: '.04em', textTransform: 'uppercase' }

  function verificar(e: React.FormEvent) {
    e.preventDefault()
    if (clave === ADMIN_KEY) { setAuth(true); cargar() }
  }

  async function cargar() {
    const { data } = await supabase.from('prospectos').select('*').order('created_at', { ascending: false })
    setProspectos(data || [])
  }

  async function buscarEmpresas() {
    setBuscando(true); setResultadoBusqueda(null)
    try {
      const res = await fetch('/api/agente-buscar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubro: rubroBusqueda === 'Todos los rubros por igual' ? null : rubroBusqueda, cantidad: cantidadBusqueda, offset: prospectos.length * 137 })
      })
      const data = await res.json()
      if (data.ok) { setResultadoBusqueda(data); cargar() }
      else alert('Error: ' + data.error)
    } catch { alert('Error de conexión.') }
    setBuscando(false)
  }

  async function agregarProspecto(e: React.FormEvent) {
    e.preventDefault()
    if (!form.empresa_nombre || !form.contacto_email || !form.rubro) return
    setLoading(true)
    await supabase.from('prospectos').insert({ ...form, estado: 'nuevo' })
    setForm({ empresa_nombre: '', contacto_nombre: '', contacto_email: '', rubro: '', trabajadores_estimado: '21-50', sitio_web: '', linkedin_url: '', notas: '' })
    setLoading(false); cargar(); setTab('lista')
  }

  async function generarEmail(p: any) {
    setGenerando(true)
    const res = await fetch('/api/agente-prospeccion', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'generar', prospecto: p })
    })
    const data = await res.json()
    if (data.asunto) {
      await supabase.from('prospectos').update({ email_asunto: data.asunto, email_generado: data.cuerpo, estado: 'email_generado' }).eq('id', p.id)
      setSelected({ ...p, email_asunto: data.asunto, email_generado: data.cuerpo, estado: 'email_generado' })
      cargar()
    }
    setGenerando(false)
  }

  async function enviarEmail(p: any) {
    if (!confirm(`¿Enviar email a ${p.contacto_email}?`)) return
    setEnviando(true)
    const res = await fetch('/api/agente-prospeccion', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'enviar', prospecto: { contacto_email: p.contacto_email, cuerpo: p.email_generado, asunto: p.email_asunto } })
    })
    const data = await res.json()
    if (data.ok) {
      await supabase.from('prospectos').update({ estado: 'enviado', fecha_primer_envio: new Date().toISOString() }).eq('id', p.id)
      setSelected({ ...p, estado: 'enviado' }); cargar()
      alert('✓ Email enviado correctamente')
    } else { alert('Error: ' + data.error) }
    setEnviando(false)
  }

  async function enviarSeguimiento(p: any, numero: number) {
    if (!confirm(`¿Enviar email de seguimiento #${numero} a ${p.contacto_email}?`)) return
    setEnviando(true)
    const res = await fetch('/api/agente-prospeccion', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'seguimiento', prospecto: { ...p, numero_seguimiento: numero, asunto_original: p.email_asunto } })
    })
    const data = await res.json()
    if (data.ok) {
      const campo = numero === 2 ? 'fecha_segundo_envio' : 'fecha_tercer_envio'
      await supabase.from('prospectos').update({ [campo]: new Date().toISOString() }).eq('id', p.id)
      cargar(); alert(`✓ Seguimiento #${numero} enviado`)
    } else { alert('Error: ' + data.error) }
    setEnviando(false)
  }

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from('prospectos').update({ estado, updated_at: new Date().toISOString() }).eq('id', id)
    setSelected((p: any) => p ? { ...p, estado } : null); cargar()
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este prospecto?')) return
    await supabase.from('prospectos').delete().eq('id', id)
    setSelected(null); cargar()
  }

  const filtrados = prospectos.filter(p => filtroEstado === 'todos' || p.estado === filtroEstado)
  const stats = {
    total: prospectos.length,
    enviados: prospectos.filter(p => ['enviado', 'abierto', 'respondio', 'demo_agendada', 'cliente'].includes(p.estado)).length,
    activos: prospectos.filter(p => ['respondio', 'demo_agendada'].includes(p.estado)).length,
    clientes: prospectos.filter(p => p.estado === 'cliente').length,
  }

  if (!auth) return (
    <div style={{ minHeight: '100vh', background: '#0F1923', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '340px' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#0F1923', marginBottom: '4px' }}>Agente de Prospección</div>
        <div style={{ fontSize: '12px', color: '#8B8FA8', marginBottom: '24px' }}>Normvia · Acceso restringido</div>
        <form onSubmit={verificar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label style={lbl}>Clave de acceso</label><input type="password" value={clave} onChange={e => setClave(e.target.value)} style={inp} autoFocus /></div>
          <button type="submit" style={{ padding: '10px', background: '#0F1923', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Ingresar →</button>
        </form>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* Header */}
      <div style={{ background: '#0F1923', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#fff' }}>norm<span style={{ color: '#C8A96E' }}>via</span></div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.3)', fontFamily: 'inherit' }}>· Agente de Prospección</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="/admin" style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>← Panel Admin</a>
        </div>
      </div>

      <div style={{ padding: '1.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total prospectos', value: stats.total, color: '#0F1923' },
            { label: 'Emails enviados', value: stats.enviados, color: '#6366F1' },
            { label: 'En conversación', value: stats.activos, color: '#F59E0B' },
            { label: '⭐ Clientes', value: stats.clientes, color: '#C8A96E' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #EBEBF0' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '28px', fontWeight: 500, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #EBEBF0' }}>
          {[{ key: 'lista', label: `📋 Prospectos (${prospectos.length})` }, { key: 'agregar', label: '+ Agregar prospecto' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 16px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? '#0F1923' : '#8B8FA8', borderBottom: tab === t.key ? '2px solid #0F1923' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px', fontFamily: 'inherit' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'buscar' && (
          <div style={{ maxWidth: '640px' }}>
            <div style={{ background: '#0F1923', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #C8A96E, transparent)' }} />
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#C8A96E', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '8px' }}>🤖 Agente autónomo</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
                El agente consulta el Registro de Empresas de Chile (sre.cl), filtra por rubro y tamaño, 
                busca el sitio web de cada empresa y extrae el email de contacto automáticamente.
                Tú solo revisas y apruebas antes de enviar.
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #EBEBF0', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923', marginBottom: '1.25rem' }}>Configurar búsqueda</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><label style={lbl}>Rubro objetivo</label>
                  <select value={rubroBusqueda} onChange={e => setRubroBusqueda(e.target.value)} style={{ ...inp, appearance: 'none' as any }}>
                    <option>Todos los rubros por igual</option>
                    {RUBROS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Cantidad de empresas a buscar</label>
                  <select value={cantidadBusqueda} onChange={e => setCantidadBusqueda(parseInt(e.target.value))} style={{ ...inp, appearance: 'none' as any }}>
                    <option value={5}>5 empresas</option>
                    <option value={10}>10 empresas</option>
                    <option value={20}>20 empresas</option>
                    <option value={50}>50 empresas</option>
                  </select>
                </div>
                <button onClick={buscarEmpresas} disabled={buscando}
                  style={{ padding: '12px', background: buscando ? '#E2E2EC' : '#0F1923', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: buscando ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {buscando ? '🔍 Buscando empresas...' : '🚀 Iniciar búsqueda automática'}
                </button>
              </div>
            </div>

            {buscando && (
              <div style={{ background: '#F5F3FF', border: '1px solid #C4B5FD', borderRadius: '10px', padding: '16px 20px', fontSize: '13px', color: '#5B21B6', lineHeight: 1.8 }}>
                <div>🔍 Consultando Registro de Empresas de Chile...</div>
                <div>🌐 Buscando sitios web de cada empresa...</div>
                <div>📧 Extrayendo emails de contacto...</div>
                <div>💾 Agregando al pipeline de prospectos...</div>
              </div>
            )}

            {resultadoBusqueda && (
              <div style={{ background: '#F0FDF8', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '16px 20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#047857', marginBottom: '12px' }}>
                  ✓ Búsqueda completada — {resultadoBusqueda.encontradas} empresas agregadas
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ background: '#fff', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '20px', fontWeight: 500, color: '#00B87A' }}>{resultadoBusqueda.con_email}</div>
                    <div style={{ color: '#8B8FA8', marginTop: '2px' }}>Con email listo para contactar</div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '20px', fontWeight: 500, color: '#F59E0B' }}>{resultadoBusqueda.sin_email}</div>
                    <div style={{ color: '#8B8FA8', marginTop: '2px' }}>Sin email (requiere manual)</div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#047857', marginBottom: '8px', fontWeight: 600 }}>Empresas encontradas:</div>
                {(resultadoBusqueda.empresas || []).map((e: any, i: number) => (
                  <div key={i} style={{ fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #D1FAE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 500, color: '#0F1923' }}>{e.nombre}</span>
                      <span style={{ color: '#8B8FA8', marginLeft: '8px' }}>{e.rut}</span>
                    </div>
                    <span style={{ color: e.email === '(sin email)' ? '#F59E0B' : '#00B87A', fontFamily: "'DM Mono', monospace", fontSize: '11px' }}>{e.email}</span>
                  </div>
                ))}
                <button onClick={() => setTab('lista')} style={{ marginTop: '12px', padding: '8px 16px', background: '#0F1923', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Ver pipeline completo →
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'agregar' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #EBEBF0', padding: '1.5rem', maxWidth: '640px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923', marginBottom: '1.25rem' }}>Nuevo prospecto</div>
            <form onSubmit={agregarProspecto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={lbl}>Empresa *</label><input value={form.empresa_nombre} onChange={e => setForm(p => ({ ...p, empresa_nombre: e.target.value }))} placeholder="Mi Empresa SpA" style={inp} required /></div>
                <div><label style={lbl}>Contacto *</label><input value={form.contacto_nombre} onChange={e => setForm(p => ({ ...p, contacto_nombre: e.target.value }))} placeholder="Juan González" style={inp} /></div>
              </div>
              <div><label style={lbl}>Email *</label><input type="email" value={form.contacto_email} onChange={e => setForm(p => ({ ...p, contacto_email: e.target.value }))} placeholder="juan@empresa.cl" style={inp} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={lbl}>Rubro *</label>
                  <select value={form.rubro} onChange={e => setForm(p => ({ ...p, rubro: e.target.value }))} style={{ ...inp, appearance: 'none' as any }} required>
                    <option value="">Selecciona rubro</option>
                    {RUBROS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Trabajadores estimado</label>
                  <select value={form.trabajadores_estimado} onChange={e => setForm(p => ({ ...p, trabajadores_estimado: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {TAM.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={lbl}>Sitio web</label><input value={form.sitio_web} onChange={e => setForm(p => ({ ...p, sitio_web: e.target.value }))} placeholder="www.empresa.cl" style={inp} /></div>
                <div><label style={lbl}>LinkedIn</label><input value={form.linkedin_url} onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))} placeholder="linkedin.com/in/..." style={inp} /></div>
              </div>
              <div><label style={lbl}>Notas</label><textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} placeholder="Contexto adicional para personalizar el email..." /></div>
              <button type="submit" disabled={loading} style={{ padding: '10px', background: '#0F1923', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, fontFamily: 'inherit' }}>
                {loading ? 'Guardando...' : 'Agregar prospecto →'}
              </button>
            </form>
          </div>
        )}

        {tab === 'lista' && (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.6fr' : '1fr', gap: '1.5rem' }}>
            {/* Lista */}
            <div>
              {/* Filtro estado */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => setFiltroEstado('todos')} style={{ padding: '4px 12px', border: `1px solid ${filtroEstado === 'todos' ? '#0F1923' : '#E2E2EC'}`, borderRadius: '6px', background: filtroEstado === 'todos' ? '#0F1923' : '#fff', color: filtroEstado === 'todos' ? '#fff' : '#6B6B6E', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>Todos ({prospectos.length})</button>
                {Object.entries(ESTADOS).map(([k, v]) => {
                  const count = prospectos.filter(p => p.estado === k).length
                  if (!count) return null
                  return (
                    <button key={k} onClick={() => setFiltroEstado(k)}
                      style={{ padding: '4px 12px', border: `1px solid ${filtroEstado === k ? '#0F1923' : '#E2E2EC'}`, borderRadius: '6px', background: filtroEstado === k ? '#0F1923' : '#fff', color: filtroEstado === k ? '#fff' : '#6B6B6E', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {v.label} ({count})
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtrados.length === 0 ? (
                  <div style={{ background: '#F8F8FB', borderRadius: '10px', border: '1px solid #EBEBF0', padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#8B8FA8' }}>
                    Sin prospectos. <button onClick={() => setTab('agregar')} style={{ color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>Agrega el primero →</button>
                  </div>
                ) : filtrados.map(p => (
                  <div key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    style={{ background: selected?.id === p.id ? '#F5F3FF' : '#fff', borderRadius: '10px', border: `1px solid ${selected?.id === p.id ? '#C4B5FD' : '#EBEBF0'}`, padding: '12px 16px', cursor: 'pointer', transition: 'all .12s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F1923' }}>{p.empresa_nombre}</div>
                        <div style={{ fontSize: '11px', color: '#8B8FA8', marginTop: '2px' }}>{p.contacto_nombre} · {p.contacto_email}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: p.estado === 'cliente' ? '#FEF3C7' : p.estado === 'descartado' ? '#FFF5F5' : '#F0F0F5', color: ESTADOS[p.estado]?.color || '#8B8FA8', whiteSpace: 'nowrap' }}>
                        {ESTADOS[p.estado]?.label || p.estado}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', background: '#F0F0F5', padding: '2px 8px', borderRadius: '4px', color: '#6B6B6E' }}>{p.rubro}</span>
                      <span style={{ fontSize: '10px', color: '#B0B4C8' }}>{p.trabajadores_estimado} trabajadores</span>
                      {p.fecha_primer_envio && <span style={{ fontSize: '10px', color: '#B0B4C8' }}>📧 {new Date(p.fecha_primer_envio).toLocaleDateString('es-CL')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalle */}
            {selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Info + acciones */}
                <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0F0F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>{selected.empresa_nombre}</div>
                      <div style={{ fontSize: '12px', color: '#8B8FA8', marginTop: '2px' }}>{selected.rubro} · {selected.trabajadores_estimado} trabajadores</div>
                    </div>
                    <button onClick={() => eliminar(selected.id)} style={{ fontSize: '11px', padding: '4px 10px', background: '#FFF5F5', color: '#E5484D', border: '1px solid #FECDD3', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>Eliminar</button>
                  </div>
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem', fontSize: '12px' }}>
                      <div><span style={{ color: '#8B8FA8' }}>Contacto: </span><span style={{ color: '#0F1923', fontWeight: 500 }}>{selected.contacto_nombre}</span></div>
                      <div><span style={{ color: '#8B8FA8' }}>Email: </span><span style={{ color: '#0F1923' }}>{selected.contacto_email}</span></div>
                      {selected.sitio_web && <div><span style={{ color: '#8B8FA8' }}>Web: </span><a href={`https://${selected.sitio_web}`} target="_blank" rel="noopener noreferrer" style={{ color: '#6366F1' }}>{selected.sitio_web}</a></div>}
                      {selected.fecha_primer_envio && <div><span style={{ color: '#8B8FA8' }}>1er envío: </span><span>{new Date(selected.fecha_primer_envio).toLocaleDateString('es-CL')}</span></div>}
                      {selected.fecha_segundo_envio && <div><span style={{ color: '#8B8FA8' }}>2do envío: </span><span>{new Date(selected.fecha_segundo_envio).toLocaleDateString('es-CL')}</span></div>}
                    </div>

                    {/* Cambiar estado */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#8B8FA8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Estado</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {Object.entries(ESTADOS).map(([k, v]) => (
                          <button key={k} onClick={() => cambiarEstado(selected.id, k)}
                            style={{ padding: '4px 10px', border: `1px solid ${selected.estado === k ? '#0F1923' : '#E2E2EC'}`, borderRadius: '6px', background: selected.estado === k ? '#0F1923' : '#fff', color: selected.estado === k ? '#fff' : '#6B6B6E', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {!selected.email_generado && (
                        <button onClick={() => generarEmail(selected)} disabled={generando}
                          style={{ padding: '8px 16px', background: '#6366F1', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: generando ? 'not-allowed' : 'pointer', opacity: generando ? .6 : 1, fontFamily: 'inherit' }}>
                          {generando ? '🤖 Generando...' : '🤖 Generar email con IA'}
                        </button>
                      )}
                      {selected.email_generado && selected.estado === 'email_generado' && (
                        <button onClick={() => enviarEmail(selected)} disabled={enviando}
                          style={{ padding: '8px 16px', background: '#00B87A', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? .6 : 1, fontFamily: 'inherit' }}>
                          {enviando ? 'Enviando...' : '📧 Enviar email'}
                        </button>
                      )}
                      {selected.estado === 'enviado' && !selected.fecha_segundo_envio && (
                        <button onClick={() => enviarSeguimiento(selected, 2)} disabled={enviando}
                          style={{ padding: '8px 16px', background: '#F59E0B', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: enviando ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                          {enviando ? 'Enviando...' : '📧 Seguimiento #2 (día 3)'}
                        </button>
                      )}
                      {selected.fecha_segundo_envio && !selected.fecha_tercer_envio && (
                        <button onClick={() => enviarSeguimiento(selected, 3)} disabled={enviando}
                          style={{ padding: '8px 16px', background: '#E5484D', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: enviando ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                          {enviando ? 'Enviando...' : '📧 Seguimiento #3 (día 7)'}
                        </button>
                      )}
                      {selected.email_generado && (
                        <button onClick={() => generarEmail(selected)} disabled={generando}
                          style={{ padding: '8px 16px', background: '#F7F5F0', color: '#6366F1', border: '1px solid #C4B5FD', borderRadius: '7px', fontSize: '12px', cursor: generando ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                          {generando ? 'Regenerando...' : '↺ Regenerar email'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email generado */}
                {selected.email_generado && (
                  <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 1.25rem', borderBottom: '1px solid #F0F0F5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>📧 Email generado por IA</span>
                      <span style={{ fontSize: '11px', color: '#8B8FA8' }}>Revisa antes de enviar</span>
                    </div>
                    <div style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#8B8FA8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Asunto</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F1923', marginBottom: '1rem', padding: '8px 12px', background: '#F8F8FB', borderRadius: '6px' }}>{selected.email_asunto}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#8B8FA8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Cuerpo</div>
                      <div style={{ fontSize: '13px', color: '#0F1923', lineHeight: 1.7, whiteSpace: 'pre-wrap', padding: '12px', background: '#F8F8FB', borderRadius: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                        {selected.email_generado}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
