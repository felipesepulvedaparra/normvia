'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Topbar, CardHeader, SectionLabel } from '@/components/ui/Layout'
import Badge from '@/components/ui/Badge'

function genCodigo() {
  return 'NV-' + Math.random().toString(36).substring(2,8).toUpperCase()
}

export default function TrabajadoresPage() {
  const [tab, setTab] = useState('codigos')
  const TABS = [
    { key: 'codigos', label: '🔑 Códigos de acceso' },
    { key: 'teletrabajo', label: '🏡 Solicitudes teletrabajo' },
    { key: 'arco', label: '🔐 Solicitudes ARCO+' },
  ]
  return (
    <div>
      <Topbar title="👥 Portal Trabajador" sub="Gestión de accesos y solicitudes" />
      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={{ background: '#F5F3FF', border: '1px solid #C4B5FD', borderRadius: '10px', padding: '14px 18px', fontSize: '13px', color: '#5B21B6', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          💡 <strong>Portal Trabajador activo.</strong> Tus trabajadores acceden en <strong>normvia.cl/trabajador</strong> con el código que les generes aquí. Es gratis para ellos — es un beneficio laboral que incluye tu plan.
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #EBEBF0', marginBottom: '1.5rem', gap: '4px' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 16px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? '#0A1628' : '#8B8FA8', borderBottom: tab === t.key ? '2px solid #0A1628' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'codigos' && <TabCodigos />}
        {tab === 'teletrabajo' && <TabTeletrabajo />}
        {tab === 'arco' && <TabArco />}
      </div>
    </div>
  )
}

function TabCodigos() {
  const { empresaId } = useAuth()
  const [codigos, setCodigos] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [maxUsos, setMaxUsos] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('codigos_acceso').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false })
    setCodigos(data || [])
  }

  async function crear() {
    setLoading(true)
    const codigo = genCodigo()
    await supabase.from('codigos_acceso').insert({ empresa_id: empresaId, codigo, nombre_trabajador: nombre || null, max_usos: maxUsos, activo: true })
    setNombre(''); setLoading(false); cargar()
  }

  async function toggleActivo(id: string, activo: boolean) {
    await supabase.from('codigos_acceso').update({ activo: !activo }).eq('id', id); cargar()
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este código?')) return
    await supabase.from('codigos_acceso').delete().eq('id', id); cargar()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
      {/* Crear código */}
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', padding: '1.25rem' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0A1628', marginBottom: '1rem' }}>+ Generar código</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#8B8FA8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Para quién (opcional)</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan González"
              style={{ width: '100%', padding: '9px 13px', border: '1px solid #E2E2EC', borderRadius: '7px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#8B8FA8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Tipo de código</label>
            <select value={maxUsos} onChange={e => setMaxUsos(parseInt(e.target.value))}
              style={{ width: '100%', padding: '9px 13px', border: '1px solid #E2E2EC', borderRadius: '7px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', appearance: 'none' as any }}>
              <option value={1}>Uso único (1 persona)</option>
              <option value={0}>Uso múltiple (todo el equipo)</option>
            </select>
          </div>
          <button onClick={crear} disabled={loading}
            style={{ padding: '10px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, fontFamily: 'inherit' }}>
            {loading ? 'Generando...' : 'Generar código →'}
          </button>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #F0F0F5', fontSize: '12px', color: '#8B8FA8', lineHeight: 1.6 }}>
          <strong style={{ color: '#0A1628' }}>¿Cómo funciona?</strong><br />
          Genera un código y compártelo con tu trabajador. Él ingresa a <strong>normvia.cl/trabajador</strong> y puede hacer denuncias Karin, solicitar teletrabajo, ejercer sus derechos ARCO+ y consultar al asistente legal — sin costo adicional.
        </div>
      </div>

      {/* Lista de códigos */}
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
        <CardHeader title={`Códigos generados · ${codigos.length}`} />
        {codigos.length === 0
          ? <div style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#8B8FA8' }}>Sin códigos generados. Crea el primero.</div>
          : codigos.map(c => (
            <div key={c.id} style={{ padding: '12px 18px', borderBottom: '1px solid #F5F5F8', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', fontWeight: 600, color: '#0A1628', minWidth: '100px' }}>{c.codigo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: '#0A1628' }}>{c.nombre_trabajador || 'Sin asignar'}</div>
                <div style={{ fontSize: '11px', color: '#8B8FA8', marginTop: '2px' }}>
                  {c.max_usos === 0 ? 'Uso múltiple' : `Uso único · ${c.usos}/${c.max_usos} usos`} · {new Date(c.created_at).toLocaleDateString('es-CL')}
                </div>
              </div>
              <Badge variant={c.activo ? 'v' : 'g'}>{c.activo ? 'Activo' : 'Inactivo'}</Badge>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => toggleActivo(c.id, c.activo)}
                  style={{ padding: '4px 10px', border: '1px solid #E2E2EC', borderRadius: '6px', background: '#fff', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', color: '#6B6B6E' }}>
                  {c.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => eliminar(c.id)}
                  style={{ padding: '4px 10px', border: '1px solid #FECDD3', borderRadius: '6px', background: '#FFF5F5', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', color: '#E5484D' }}>
                  ×
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

function TabTeletrabajo() {
  const { empresaId } = useAuth()
  const [solic, setSolic] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [respuesta, setRespuesta] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('solicitudes_teletrabajo').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false })
    setSolic(data || [])
  }

  async function responder(id: string, estado: string) {
    setSaving(true)
    await supabase.from('solicitudes_teletrabajo').update({ estado, respuesta_empresa: respuesta }).eq('id', id)
    setSaving(false); setSelected(null); setRespuesta(''); cargar()
  }

  const MOTIVOS: Record<string, string> = { hijo_menor_14: 'Hijos menores de 14 años', persona_discapacidad: 'Persona con discapacidad a cargo', otro: 'Otro motivo' }
  const ESTADOS: Record<string, string> = { pendiente: 'a', en_revision: 'az', aprobada: 'v', rechazada: 'r' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
        <CardHeader title={`Solicitudes de teletrabajo · ${solic.length}`} />
        {solic.length === 0
          ? <div style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#8B8FA8' }}>Sin solicitudes</div>
          : solic.map(s => (
            <div key={s.id} onClick={() => { setSelected(s); setRespuesta(s.respuesta_empresa || '') }}
              style={{ padding: '12px 18px', borderBottom: '1px solid #F5F5F8', cursor: 'pointer', background: selected?.id === s.id ? '#F8F8FB' : '#fff', transition: 'background .1s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#0A1628' }}>{s.trabajador_nombre}</div>
                <Badge variant={ESTADOS[s.estado] || 'g'}>{s.estado}</Badge>
              </div>
              <div style={{ fontSize: '11px', color: '#8B8FA8' }}>{MOTIVOS[s.motivo]} · {new Date(s.created_at).toLocaleDateString('es-CL')}</div>
            </div>
          ))
        }
      </div>

      {selected ? (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', padding: '1.25rem' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A1628', marginBottom: '1rem' }}>{selected.trabajador_nombre}</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8B8FA8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Motivo</div>
          <div style={{ fontSize: '13px', color: '#0A1628', marginBottom: '1rem' }}>{MOTIVOS[selected.motivo]}</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8B8FA8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Modalidad solicitada</div>
          <div style={{ fontSize: '13px', color: '#0A1628', marginBottom: '1rem' }}>{selected.modalidad_solicitada?.replace(/_/g, ' ')}</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8B8FA8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Descripción</div>
          <div style={{ fontSize: '13px', color: '#0A1628', background: '#F8F8FB', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', lineHeight: 1.6 }}>{selected.descripcion}</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8B8FA8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Respuesta de la empresa</div>
          <textarea value={respuesta} onChange={e => setRespuesta(e.target.value)} rows={3} placeholder="Escribe tu respuesta al trabajador..."
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1rem' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => responder(selected.id, 'aprobada')} disabled={saving}
              style={{ flex: 1, padding: '9px', background: '#00B87A', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              ✓ Aprobar
            </button>
            <button onClick={() => responder(selected.id, 'rechazada')} disabled={saving}
              style={{ flex: 1, padding: '9px', background: '#FFF5F5', color: '#E5484D', border: '1px solid #FECDD3', borderRadius: '7px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              × Rechazar
            </button>
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#B0B4C8', lineHeight: 1.5 }}>
            ⚖️ Ley N° 21.645: la empresa debe evaluar la solicitud y responder dentro de los plazos razonables. La negativa debe ser justificada.
          </div>
        </div>
      ) : (
        <div style={{ background: '#F8F8FB', borderRadius: '10px', border: '1px solid #EBEBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ textAlign: 'center', color: '#B0B4C8', fontSize: '13px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏡</div>
            Selecciona una solicitud para responderla
          </div>
        </div>
      )}
    </div>
  )
}

function TabArco() {
  const { empresaId } = useAuth()
  const [solic, setSolic] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [respuesta, setRespuesta] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('solicitudes_arco').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false })
    setSolic(data || [])
  }

  async function responder(id: string, estado: string) {
    setSaving(true)
    await supabase.from('solicitudes_arco').update({ estado, respuesta }).eq('id', id)
    setSaving(false); setSelected(null); setRespuesta(''); cargar()
  }

  const TIPOS: Record<string, string> = { acceso: 'Acceso', rectificacion: 'Rectificación', cancelacion: 'Cancelación', oposicion: 'Oposición', portabilidad: 'Portabilidad', bloqueo: 'Bloqueo' }
  const ESTADOS: Record<string, string> = { recibida: 'az', en_proceso: 'a', resuelta: 'v', rechazada: 'r' }

  const diasRestantes = (fecha: string) => {
    const diff = 30 - Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
        <CardHeader title={`Solicitudes ARCO+ · ${solic.length}`} />
        {solic.length === 0
          ? <div style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#8B8FA8' }}>Sin solicitudes ARCO+</div>
          : solic.map(s => {
            const dias = diasRestantes(s.created_at)
            return (
              <div key={s.id} onClick={() => { setSelected(s); setRespuesta(s.respuesta || '') }}
                style={{ padding: '12px 18px', borderBottom: '1px solid #F5F5F8', cursor: 'pointer', background: selected?.id === s.id ? '#F8F8FB' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#0A1628' }}>{s.trabajador_nombre}</div>
                  <Badge variant={ESTADOS[s.estado] || 'g'}>{TIPOS[s.tipo]}</Badge>
                </div>
                <div style={{ fontSize: '11px', color: dias <= 5 ? '#E5484D' : '#8B8FA8' }}>
                  {dias > 0 ? `${dias} días para responder` : 'Plazo vencido'} · {new Date(s.created_at).toLocaleDateString('es-CL')}
                </div>
              </div>
            )
          })
        }
      </div>

      {selected ? (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A1628' }}>{selected.trabajador_nombre}</div>
            <Badge variant={ESTADOS[selected.estado] || 'g'}>{TIPOS[selected.tipo]}</Badge>
          </div>
          {selected.trabajador_rut && <div style={{ fontSize: '12px', color: '#8B8FA8', marginBottom: '8px' }}>RUT: {selected.trabajador_rut}</div>}
          {selected.trabajador_email && <div style={{ fontSize: '12px', color: '#8B8FA8', marginBottom: '8px' }}>Email: {selected.trabajador_email}</div>}
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8B8FA8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Solicitud</div>
          <div style={{ fontSize: '13px', color: '#0A1628', background: '#F8F8FB', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', lineHeight: 1.6 }}>{selected.descripcion}</div>
          <div style={{ background: diasRestantes(selected.created_at) <= 5 ? '#FFF5F5' : '#FFF8E7', border: `1px solid ${diasRestantes(selected.created_at) <= 5 ? '#FECDD3' : '#FCD34D'}`, borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: diasRestantes(selected.created_at) <= 5 ? '#C4183C' : '#92400E', marginBottom: '1rem' }}>
            ⏱️ Plazo legal: {diasRestantes(selected.created_at)} días restantes para responder (Ley N° 21.719 — 30 días corridos)
          </div>
          <textarea value={respuesta} onChange={e => setRespuesta(e.target.value)} rows={3} placeholder="Escribe tu respuesta..."
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1rem' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => responder(selected.id, 'resuelta')} disabled={saving}
              style={{ flex: 1, padding: '9px', background: '#00B87A', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              ✓ Resolver
            </button>
            <button onClick={() => responder(selected.id, 'en_proceso')} disabled={saving}
              style={{ flex: 1, padding: '9px', background: '#F5F3FF', color: '#6366F1', border: '1px solid #C4B5FD', borderRadius: '7px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              En proceso
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#F8F8FB', borderRadius: '10px', border: '1px solid #EBEBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ textAlign: 'center', color: '#B0B4C8', fontSize: '13px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔐</div>
            Selecciona una solicitud para gestionarla
          </div>
        </div>
      )}
    </div>
  )
}
