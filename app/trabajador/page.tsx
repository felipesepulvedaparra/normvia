'use client'
import { useState, useEffect } from 'react'

const S = {
  page: { minHeight: '100vh', background: '#F7F5F0', fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
  nav: { background: '#0F1923', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  card: { background: '#fff', borderRadius: '12px', border: '1px solid #E8E4DC', overflow: 'hidden' } as React.CSSProperties,
  inp: { width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' } as React.CSSProperties,
  btn: { padding: '11px 24px', background: '#0F1923', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', width: '100%' } as React.CSSProperties,
  lbl: { display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px', letterSpacing: '.04em', textTransform: 'uppercase' } as React.CSSProperties,
}

type Session = { token: string; empresa: { id: string; nombre: string; pais: string }; trabajador: { nombre: string; rut: string } }

export default function PortalTrabajador() {
  const [session, setSession] = useState<Session | null>(null)
  const [tab, setTab] = useState('inicio')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const s = sessionStorage.getItem('nv_worker_session')
      if (s) setSession(JSON.parse(s))
    } catch {}
  }, [])

  function onLogin(s: Session) {
    try { sessionStorage.setItem('nv_worker_session', JSON.stringify(s)) } catch {}
    setSession(s)
  }
  function onLogout() {
    try { sessionStorage.removeItem('nv_worker_session') } catch {}
    setSession(null); setTab('inicio')
  }

  if (!mounted) return null

  const TABS = [
    { key: 'inicio', label: '🏠 Inicio' },
    { key: 'karin', label: '⚖️ Denuncias' },
    { key: 'teletrabajo', label: '🏡 Teletrabajo' },
    { key: 'arco', label: '🔐 Mis datos' },
    { key: 'asistente', label: '💬 Consultas' },
  ]

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <nav style={S.nav}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#fff' }}>
          norm<span style={{ color: '#C8A96E' }}>via</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)', fontFamily: 'inherit', marginLeft: '8px' }}>· Portal Trabajador</span>
        </div>
        {session && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)' }}>{session.trabajador.nombre}</span>
            <button onClick={onLogout} style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Salir</button>
          </div>
        )}
      </nav>

      {!session ? (
        <LoginTrabajador onLogin={onLogin} />
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ background: '#0F1923', borderRadius: '10px', padding: '14px 20px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Tu empresa</div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#fff' }}>{session.empresa.nombre}</div>
            </div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00B87A' }} />
          </div>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', overflowX: 'auto', borderBottom: '1px solid #E8E4DC' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: '8px 14px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? '#0F1923' : '#8B8FA8', borderBottom: tab === t.key ? '2px solid #0F1923' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'inicio' && <TabInicio session={session} setTab={setTab} />}
          {tab === 'karin' && <TabKarin session={session} />}
          {tab === 'teletrabajo' && <TabTeletrabajo session={session} />}
          {tab === 'arco' && <TabArco session={session} />}
          {tab === 'asistente' && <TabAsistente session={session} />}
        </div>
      )}
    </div>
  )
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginTrabajador({ onLogin }: { onLogin: (s: Session) => void }) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [rut, setRut] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo.trim() || !nombre.trim()) { setError('Ingresa tu código y nombre.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/trabajador-acceso', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo.trim().toUpperCase(), nombre: nombre.trim(), rut: rut.trim() })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Código inválido.'); return }
      onLogin(data)
    } catch { setError('Error de conexión. Intenta de nuevo.') }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: '#0F1923', marginBottom: '8px' }}>Portal Trabajador</div>
          <div style={{ fontSize: '14px', color: '#8B8FA8', lineHeight: 1.6 }}>Ingresa el código que te entregó tu empresa para acceder a tus derechos laborales.</div>
        </div>
        <div style={S.card}>
          <div style={{ padding: '2rem' }}>
            {error && <div style={{ background: '#FFF5F5', border: '1px solid #FECDD3', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#C4183C', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={S.lbl}>Código de acceso *</label>
                <input value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} placeholder="NV-XXXXXX"
                  style={{ ...S.inp, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.08em', fontSize: '16px' }} required />
                <div style={{ fontSize: '11px', color: '#B0B4C8', marginTop: '4px' }}>Tu empleador te entrega este código</div>
              </div>
              <div>
                <label style={S.lbl}>Tu nombre completo *</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Juan González Pérez" style={S.inp} required />
              </div>
              <div>
                <label style={S.lbl}>Tu RUT (opcional)</label>
                <input value={rut} onChange={e => setRut(e.target.value)} placeholder="12.345.678-9" style={S.inp} />
              </div>
              <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? .6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Verificando...' : 'Acceder →'}
              </button>
            </form>
          </div>
          <div style={{ padding: '1rem 2rem', borderTop: '1px solid #F0F0F5', background: '#F8F8FB', fontSize: '11px', color: '#B0B4C8', lineHeight: 1.6, textAlign: 'center' }}>
            🔒 Tu identidad es confidencial. Protegida por la Ley N° 21.719.
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '12px', color: '#B0B4C8' }}>
          ¿No tienes código? Solicítalo al área de RRHH de tu empresa.
        </div>
      </div>
    </div>
  )
}

// ── INICIO ────────────────────────────────────────────────────────────────────
function TabInicio({ session, setTab }: { session: Session, setTab: (t: string) => void }) {
  const pais = session.empresa.pais || 'CL'
  const OPCIONES = [
    { key: 'karin', icon: '⚖️', title: 'Hacer una denuncia', desc: pais === 'CO' ? 'Canal confidencial Ley 1010 de acoso laboral' : 'Canal confidencial Ley Karin de acoso laboral', color: '#E5484D' },
    { key: 'teletrabajo', icon: '🏡', title: 'Solicitar teletrabajo', desc: 'Derecho a teletrabajo por hijos o cargas (Ley 21.645)', color: '#6366F1' },
    { key: 'arco', icon: '🔐', title: 'Ejercer mis derechos ARCO+', desc: 'Acceso, rectificación o eliminación de mis datos personales', color: '#00B87A' },
    { key: 'asistente', icon: '💬', title: 'Consultar al asistente legal', desc: 'Preguntas sobre tus derechos laborales, jornada, finiquitos', color: '#F59E0B' },
  ]
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#0F1923', marginBottom: '4px' }}>Hola, {session.trabajador.nombre.split(' ')[0]} 👋</div>
        <div style={{ fontSize: '14px', color: '#8B8FA8' }}>¿En qué podemos ayudarte hoy?</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
        {OPCIONES.map(o => (
          <div key={o.key} onClick={() => setTab(o.key)}
            style={{ ...S.card, padding: '1.25rem', cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = o.color; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8E4DC'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{o.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#0F1923', marginBottom: '4px' }}>{o.title}</div>
            <div style={{ fontSize: '12px', color: '#8B8FA8', lineHeight: 1.5 }}>{o.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#F0FDF8', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '14px 18px', fontSize: '12px', color: '#047857', lineHeight: 1.6 }}>
        🔒 <strong>Tu privacidad está protegida.</strong> Las denuncias anónimas no registran tu identidad. Normvia opera bajo la Ley N° 21.719.
      </div>
    </div>
  )
}

// ── KARIN ─────────────────────────────────────────────────────────────────────
function TabKarin({ session }: { session: Session }) {
  const [tipo, setTipo] = useState('')
  const [desc, setDesc] = useState('')
  const [anonima, setAnonima] = useState(true)
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState<string | null>(null)
  const [error, setError] = useState('')
  const pais = session.empresa.pais || 'CL'

  const TIPOS_CL = ['Acoso laboral', 'Acoso sexual', 'Maltrato laboral', 'Discriminación', 'Represalia por denuncia', 'Otro']
  const TIPOS_CO = ['Acoso laboral (Ley 1010)', 'Acoso sexual', 'Maltrato laboral', 'Discriminación', 'Abuso de autoridad', 'Entorpecimiento laboral', 'Otro']
  const TIPOS = pais === 'CO' ? TIPOS_CO : TIPOS_CL

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!tipo || desc.length < 20) { setError('Describe el caso con al menos 20 caracteres.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/trabajador-denuncia', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: session.empresa.id, tipo, descripcion: desc, anonima })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al enviar.'); return }
      setEnviado(data.codigo)
    } catch { setError('Error de conexión. Intenta de nuevo.') }
    setLoading(false)
  }

  if (enviado) return (
    <div style={{ ...S.card, padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F0FDF8', border: '2px solid #00B87A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 1rem' }}>✓</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#0F1923', marginBottom: '.5rem' }}>Denuncia recibida</div>
      <div style={{ fontSize: '13px', color: '#8B8FA8', marginBottom: '1.5rem', lineHeight: 1.6 }}>Tu denuncia fue registrada de forma confidencial. Guarda este código para hacer seguimiento.</div>
      <div style={{ background: '#0F1923', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginBottom: '6px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.08em' }}>CÓDIGO DE SEGUIMIENTO</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', color: '#C8A96E', fontWeight: 600 }}>{enviado}</div>
      </div>
      <div style={{ fontSize: '12px', color: '#8B8FA8', lineHeight: 1.6 }}>El equipo responsable debe iniciar la investigación dentro de los próximos 5 días hábiles.</div>
      <button onClick={() => { setEnviado(null); setTipo(''); setDesc('') }} style={{ ...S.btn, marginTop: '1.5rem', background: '#F7F5F0', color: '#0F1923', border: '1px solid #E8E4DC' }}>
        Registrar otra denuncia
      </button>
    </div>
  )

  return (
    <div>
      <div style={{ background: '#FFF5F5', border: '1px solid #FECDD3', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#C4183C', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        🔒 <strong>Canal confidencial.</strong> Si marcas anónima, no se registrará ningún dato tuyo.
      </div>
      <div style={S.card}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F0F0F5' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>⚖️ {pais === 'CO' ? 'Denuncia — Ley 1010' : 'Denuncia Ley Karin — N° 21.643'}</div>
        </div>
        <form onSubmit={enviar} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div style={{ background: '#FFF5F5', border: '1px solid #FECDD3', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#C4183C' }}>{error}</div>}
          <div>
            <label style={S.lbl}>Tipo de conducta *</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} required style={{ ...S.inp, appearance: 'none' as any }}>
              <option value="">Selecciona una categoría</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={S.lbl}>Descripción *</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows={5}
              placeholder="Describe los hechos: qué ocurrió, cuándo, dónde, quién estuvo involucrado."
              style={{ ...S.inp, resize: 'vertical', lineHeight: 1.6 }} />
            <div style={{ fontSize: '11px', color: '#B0B4C8', marginTop: '4px' }}>{desc.length} caracteres · mínimo 20</div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#0F1923' }}>
            <input type="checkbox" checked={anonima} onChange={e => setAnonima(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0F1923' }} />
            <div><div style={{ fontWeight: 500 }}>Enviar de forma anónima</div><div style={{ fontSize: '11px', color: '#8B8FA8' }}>No se registrará ningún dato tuyo</div></div>
          </label>
          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? .6 : 1 }}>
            {loading ? 'Enviando...' : 'Enviar denuncia →'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── TELETRABAJO ───────────────────────────────────────────────────────────────
function TabTeletrabajo({ session }: { session: Session }) {
  const [motivo, setMotivo] = useState('')
  const [desc, setDesc] = useState('')
  const [modalidad, setModalidad] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!motivo || !desc || !modalidad) { setError('Completa todos los campos.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/trabajador-teletrabajo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: session.empresa.id, trabajador_nombre: session.trabajador.nombre, trabajador_rut: session.trabajador.rut, motivo, descripcion: desc, modalidad_solicitada: modalidad })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al enviar.'); return }
      setEnviado(true)
    } catch { setError('Error de conexión. Intenta de nuevo.') }
    setLoading(false)
  }

  if (enviado) return (
    <div style={{ ...S.card, padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏡</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#0F1923', marginBottom: '.5rem' }}>Solicitud enviada</div>
      <div style={{ fontSize: '13px', color: '#8B8FA8', lineHeight: 1.6, marginBottom: '1.5rem' }}>Tu solicitud fue recibida por RRHH. Deben responderte dentro de los plazos de la Ley N° 21.645.</div>
      <button onClick={() => setEnviado(false)} style={{ ...S.btn, background: '#F7F5F0', color: '#0F1923', border: '1px solid #E8E4DC' }}>Volver</button>
    </div>
  )

  return (
    <div>
      <div style={{ background: '#F5F3FF', border: '1px solid #C4B5FD', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#5B21B6', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        📋 <strong>Ley N° 21.645.</strong> Tienes derecho a solicitar teletrabajo si tienes hijos menores de 14 años o personas con discapacidad a tu cargo.
      </div>
      <div style={S.card}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F0F0F5' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>🏡 Solicitud de Teletrabajo — Ley 21.645</div>
        </div>
        <form onSubmit={enviar} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div style={{ background: '#FFF5F5', border: '1px solid #FECDD3', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#C4183C' }}>{error}</div>}
          <div>
            <label style={S.lbl}>Motivo *</label>
            <select value={motivo} onChange={e => setMotivo(e.target.value)} required style={{ ...S.inp, appearance: 'none' as any }}>
              <option value="">Selecciona el motivo</option>
              <option value="hijo_menor_14">Hijos menores de 14 años</option>
              <option value="persona_discapacidad">Persona con discapacidad a mi cargo</option>
              <option value="otro">Otro motivo justificado</option>
            </select>
          </div>
          <div>
            <label style={S.lbl}>Modalidad solicitada *</label>
            <select value={modalidad} onChange={e => setModalidad(e.target.value)} required style={{ ...S.inp, appearance: 'none' as any }}>
              <option value="">Selecciona la modalidad</option>
              <option value="teletrabajo_total">Teletrabajo total (100% remoto)</option>
              <option value="teletrabajo_parcial">Teletrabajo parcial (algunos días)</option>
              <option value="horario_flexible">Horario flexible presencial</option>
            </select>
          </div>
          <div>
            <label style={S.lbl}>Descripción y justificación *</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows={4}
              placeholder="Explica tu situación y por qué solicitas esta modalidad..."
              style={{ ...S.inp, resize: 'vertical', lineHeight: 1.6 }} />
          </div>
          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? .6 : 1 }}>
            {loading ? 'Enviando...' : 'Enviar solicitud →'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── ARCO+ ─────────────────────────────────────────────────────────────────────
function TabArco({ session }: { session: Session }) {
  const [tipo, setTipo] = useState('')
  const [desc, setDesc] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const TIPOS = [
    { v: 'acceso', l: 'Acceso — quiero saber qué datos tienen de mí' },
    { v: 'rectificacion', l: 'Rectificación — quiero corregir datos incorrectos' },
    { v: 'cancelacion', l: 'Cancelación — quiero que eliminen mis datos' },
    { v: 'oposicion', l: 'Oposición — quiero oponerme al tratamiento' },
    { v: 'portabilidad', l: 'Portabilidad — quiero recibir mis datos digitalmente' },
    { v: 'bloqueo', l: 'Bloqueo — quiero suspender el uso de mis datos' },
  ]

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!tipo || !desc) { setError('Completa todos los campos.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/trabajador-arco', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: session.empresa.id, trabajador_nombre: session.trabajador.nombre, trabajador_rut: session.trabajador.rut, trabajador_email: email, tipo, descripcion: desc })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al enviar.'); return }
      setEnviado(true)
    } catch { setError('Error de conexión. Intenta de nuevo.') }
    setLoading(false)
  }

  if (enviado) return (
    <div style={{ ...S.card, padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#0F1923', marginBottom: '.5rem' }}>Solicitud ARCO+ registrada</div>
      <div style={{ fontSize: '13px', color: '#8B8FA8', lineHeight: 1.6, marginBottom: '1.5rem' }}>Tu solicitud fue recibida. La empresa tiene <strong>30 días corridos</strong> para responderte según la Ley N° 21.719.</div>
      <button onClick={() => setEnviado(false)} style={{ ...S.btn, background: '#F7F5F0', color: '#0F1923', border: '1px solid #E8E4DC' }}>Volver</button>
    </div>
  )

  return (
    <div>
      <div style={{ background: '#F0FDF8', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#047857', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        🔐 <strong>Ley N° 21.719.</strong> Tienes derecho a saber qué datos tiene tu empresa, corregirlos o eliminarlos. La empresa tiene 30 días para responder.
      </div>
      <div style={S.card}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F0F0F5' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>🔐 Ejercer Derechos ARCO+ — Ley 21.719</div>
        </div>
        <form onSubmit={enviar} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div style={{ background: '#FFF5F5', border: '1px solid #FECDD3', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#C4183C' }}>{error}</div>}
          <div>
            <label style={S.lbl}>Tipo de derecho *</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} required style={{ ...S.inp, appearance: 'none' as any }}>
              <option value="">Selecciona el tipo</option>
              {TIPOS.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
          <div>
            <label style={S.lbl}>Descripción *</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows={4}
              placeholder="Describe qué datos te preocupan y qué acción deseas que tome la empresa..."
              style={{ ...S.inp, resize: 'vertical', lineHeight: 1.6 }} />
          </div>
          <div>
            <label style={S.lbl}>Tu email (para recibir la respuesta)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@email.com" style={S.inp} />
          </div>
          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? .6 : 1 }}>
            {loading ? 'Enviando...' : 'Enviar solicitud →'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── ASISTENTE ─────────────────────────────────────────────────────────────────
function TabAsistente({ session }: { session: Session }) {
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const pais = session.empresa.pais || 'CL'

  const SUGERENCIAS = pais === 'CO'
    ? ['¿Cuánto me corresponde en mi liquidación?', '¿Qué es el Comité de Convivencia?', '¿Puedo pedir teletrabajo?']
    : ['¿Cómo calculo mi finiquito?', '¿Cuántas horas puedo trabajar por semana?', '¿Qué es la Ley Karin?']

  async function enviar(texto?: string) {
    const msg = (texto || input).trim()
    if (!msg || loading) return
    const nuevos = [...msgs, { role: 'user', content: msg }]
    setMsgs(nuevos); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/asistente-legal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: nuevos })
      })
      const data = await res.json()
      const respuesta = data.respuesta || data.error || 'No pude responder.'
      setMsgs(m => [...m, { role: 'assistant', content: respuesta }])
      // Guardar consulta en el servidor
      await fetch('/api/trabajador-consulta', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: session.empresa.id, trabajador_nombre: session.trabajador.nombre, pregunta: msg, respuesta })
      })
    } catch { setMsgs(m => [...m, { role: 'assistant', content: 'Error al conectar. Intenta de nuevo.' }]) }
    setLoading(false)
  }

  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', height: '520px' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0F0F5', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💬</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F1923' }}>Asistente Legal</div>
          <div style={{ fontSize: '11px', color: '#8B8FA8' }}>Derecho laboral {pais === 'CO' ? 'colombiano' : 'chileno'} · Respuestas 24/7</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', background: '#FAFAF8' }}>
        {msgs.length === 0 && (
          <div>
            <div style={{ fontSize: '13px', color: '#8B8FA8', lineHeight: 1.6, marginBottom: '1rem' }}>Puedo ayudarte con tus derechos laborales: jornada, finiquito, teletrabajo, acoso y más. ¿En qué te ayudo?</div>
            {SUGERENCIAS.map(s => (
              <button key={s} onClick={() => enviar(s)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: '#fff', border: '1px solid #EBEBF0', borderRadius: '7px', fontSize: '12px', color: '#0F1923', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '6px' }}>
                {s}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '85%', padding: '9px 13px', borderRadius: '10px', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: m.role === 'user' ? '#0F1923' : '#fff', color: m.role === 'user' ? '#fff' : '#0F1923', border: m.role === 'user' ? 'none' : '1px solid #EBEBF0' }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ display: 'flex', justifyContent: 'flex-start' }}><div style={{ padding: '9px 13px', borderRadius: '10px', background: '#fff', border: '1px solid #EBEBF0', fontSize: '12px', color: '#8B8FA8' }}>Escribiendo...</div></div>}
      </div>
      <div style={{ padding: '10px 12px', borderTop: '1px solid #EBEBF0', display: 'flex', gap: '8px' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') enviar() }}
          placeholder="Escribe tu pregunta..."
          style={{ flex: 1, padding: '9px 12px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
        <button onClick={() => enviar()} disabled={loading || !input.trim()}
          style={{ padding: '9px 16px', background: !input.trim() || loading ? '#E2E2EC' : '#0F1923', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}>→</button>
      </div>
      <div style={{ padding: '6px 12px 10px', fontSize: '10px', color: '#B0B4C8', textAlign: 'center' }}>No reemplaza asesoría legal en casos complejos</div>
    </div>
  )
}
