'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Topbar, SectionLabel, CardHeader } from '@/components/ui/Layout'
import Badge from '@/components/ui/Badge'
import Opt from '@/components/ui/Opt'
import ResultadoView, { Item } from '@/components/ui/ResultadoView'
import { getPaisConfig } from '@/lib/paises'

// ─── TIPOS ───────────────────────────────────────────────────────────────────
type Denuncia = {
  id: string; codigo: string; tipo: string; descripcion: string
  fecha: string; estado: 'recibida' | 'en_investigacion' | 'resuelta' | 'cerrada'
  anonima: boolean; created_at: string; empresa_id: string
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function genCodigo() {
  return 'KRN-' + Date.now().toString(36).toUpperCase().slice(-6)
}

function calcItems(resp: Record<string, string>, pais: string): Item[] {
  const items: Item[] = []
  if (pais === 'CO') {
    items.push(resp.reglamento === 'no' ? { t: 'Reglamento interno', s: 'r', d: 'El reglamento debe incluir el procedimiento de acoso según Art. 9 Ley 1010.' } : resp.reglamento === 'proceso' ? { t: 'Reglamento interno', s: 'a', d: 'En proceso. Priorizar actualización.' } : { t: 'Reglamento interno', s: 'v', d: 'Reglamento actualizado correctamente.' })
    items.push(resp.comite === 'no' ? { t: 'Comité de Convivencia', s: 'r', d: 'Obligatorio para más de 10 trabajadores. Resolución 652 de 2012.' } : resp.comite === 'existe' ? { t: 'Comité de Convivencia', s: 'a', d: 'Existe pero no funciona regularmente.' } : { t: 'Comité de Convivencia', s: 'v', d: 'Comité activo con actas.' })
    items.push(resp.cap === 'no' ? { t: 'Capacitaciones', s: 'r', d: 'No se realizan. Obligación de prevención.' } : resp.cap === 'parcial' ? { t: 'Capacitaciones', s: 'a', d: 'Deben ser periódicas para todos.' } : { t: 'Capacitaciones', s: 'v', d: 'Capacitaciones periódicas realizadas.' })
    items.push(resp.canal === 'no' ? { t: 'Mecanismo de denuncia', s: 'r', d: 'No existe. Debe ser conocido por todos.' } : resp.canal === 'informal' ? { t: 'Mecanismo de denuncia', s: 'a', d: 'Solo informal. Debe formalizarse.' } : { t: 'Mecanismo de denuncia', s: 'v', d: 'Mecanismo formal conocido por todos.' })
  } else {
    items.push(resp.proto === 'no' ? { t: 'Protocolo de prevención', s: 'r', d: 'No implementado. Obligatorio desde agosto 2024.' } : resp.proto === 'proceso' ? { t: 'Protocolo de prevención', s: 'a', d: 'En proceso. La ley ya está vigente.' } : { t: 'Protocolo de prevención', s: 'v', d: 'Implementado y comunicado correctamente.' })
    items.push(resp.canal === 'no' ? { t: 'Canal de denuncia', s: 'r', d: 'No existe. La Ley Karin exige canal formal y confidencial.' } : resp.canal === 'informal' ? { t: 'Canal de denuncia', s: 'a', d: 'Canal informal no cumple el estándar legal.' } : { t: 'Canal de denuncia', s: 'v', d: 'Canal formal correctamente implementado.' })
    items.push(resp.cap === 'no' ? { t: 'Capacitación', s: 'r', d: 'No realizada. Obligación de prevención.' } : resp.cap === 'parcial' ? { t: 'Capacitación', s: 'a', d: 'Solo algunos. Debe llegar a todos.' } : { t: 'Capacitación', s: 'v', d: 'Capacitación realizada para todos.' })
    items.push(resp.sem === 'no' ? { t: 'Comunicación semestral', s: 'r', d: 'No se realiza. Obligación formal semestral.' } : resp.sem === 'aveces' ? { t: 'Comunicación semestral', s: 'a', d: 'No sistemática. Debe ser periódica.' } : { t: 'Comunicación semestral', s: 'v', d: 'Comunicación semestral realizada.' })
  }
  return items
}

const ESTADO_COLORS: Record<string, string> = {
  recibida: 'az', en_investigacion: 'a', resuelta: 'v', cerrada: 'g'
}
const ESTADO_LABELS: Record<string, string> = {
  recibida: 'Recibida', en_investigacion: 'En investigación', resuelta: 'Resuelta', cerrada: 'Cerrada'
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function KarinPage() {
  const { empresaId, pais } = useAuth()
  const config = getPaisConfig(pais)
  const karinConfig = config.karin
  const [tab, setTab] = useState<'diagnostico' | 'canal' | 'seguimiento' | 'reporte'>('diagnostico')

  return (
    <div>
      <Topbar title={`⚖️ ${karinConfig.nombre}`} sub={`${karinConfig.ley} · ${karinConfig.vigencia}`} />
      <div style={{ padding: '1.5rem 2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #EBEBF0', marginBottom: '1.5rem', gap: '4px' }}>
          {[
            { key: 'diagnostico', label: '📊 Diagnóstico' },
            { key: 'canal', label: '📥 Canal de denuncias' },
            { key: 'seguimiento', label: '🔍 Seguimiento de casos' },
            { key: 'reporte', label: '📋 Reporte de cumplimiento' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              style={{ padding: '8px 16px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: tab === t.key ? '600' : '400', color: tab === t.key ? '#0A1628' : '#8B8FA8', borderBottom: tab === t.key ? '2px solid #0A1628' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'diagnostico' && <TabDiagnostico empresaId={empresaId} pais={pais} karinConfig={karinConfig} />}
        {tab === 'canal' && <TabCanal empresaId={empresaId} pais={pais} />}
        {tab === 'seguimiento' && <TabSeguimiento empresaId={empresaId} />}
        {tab === 'reporte' && <TabReporte empresaId={empresaId} pais={pais} karinConfig={karinConfig} />}
      </div>
    </div>
  )
}

// ─── TAB: DIAGNÓSTICO ─────────────────────────────────────────────────────────
function TabDiagnostico({ empresaId, pais, karinConfig }: any) {
  const [diags, setDiags] = useState<any[]>([])
  const [resp, setResp] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  const [resultado, setResultado] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('diagnosticos').select('*').eq('empresa_id', empresaId).eq('modulo', 'karin').order('created_at', { ascending: false }).limit(5)
    setDiags(data || [])
  }

  async function handleSubmit() {
    if (Object.keys(resp).length < karinConfig.preguntas.length) { alert('Responde todas las preguntas.'); return }
    setLoading(true)
    const items = calcItems(resp, pais)
    const ok = items.filter(i => i.s === 'v').length, warn = items.filter(i => i.s === 'a').length, risk = items.filter(i => i.s === 'r').length
    await supabase.from('diagnosticos').insert({ empresa_id: empresaId, modulo: 'karin', score: Math.round(ok / items.length * 100), items_ok: ok, items_warn: warn, items_risk: risk, respuestas: resp, resultados: items })
    if (risk > 0) await supabase.from('alertas').insert({ empresa_id: empresaId, tipo: 'karin', severidad: 'riesgo', titulo: `${karinConfig.nombre}: ${risk} obligaciones sin cumplir`, descripcion: 'Diagnóstico detectó incumplimientos críticos.' })
    setResultado(items); setStep(1); setLoading(false); cargar()
  }

  const ultimo = diags[0]
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Último score', value: ultimo ? ultimo.score + '%' : '—', color: ultimo ? (ultimo.score < 40 ? '#E5484D' : ultimo.score < 70 ? '#F59E0B' : '#00B87A') : '#0A1628', desc: 'Diagnóstico más reciente' },
          { label: 'Diagnósticos', value: diags.length, color: '#0A1628', desc: 'Realizados en total' },
          { label: 'Riesgo alto', value: ultimo?.items_risk || 0, color: '#E5484D', desc: 'Items críticos' },
          { label: 'Cumpliendo', value: ultimo?.items_ok || 0, color: '#00B87A', desc: 'Sin problemas' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #EBEBF0' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '26px', fontWeight: '500', color: s.color, lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#B0B4C8' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {step === 0 ? (
        <div style={{ maxWidth: '640px' }}>
          <SectionLabel text={`Diagnóstico ${karinConfig.nombre}`} />
          <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '12px 16px', fontSize: '12px', color: '#075985', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            ℹ️ Responde sobre el estado actual de tu empresa. El resultado se guarda en el historial y alimenta el Reporte de Cumplimiento.
          </div>
          {karinConfig.preguntas.map((q: any) => (
            <div key={q.key} style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#0A1628', marginBottom: '4px' }}>{q.label}</div>
              {q.hint && <div style={{ fontSize: '12px', color: '#6B6B6E', marginBottom: '8px', padding: '8px 12px', background: '#F0F9FF', borderRadius: '8px', borderLeft: '3px solid #0EA5E9' }}>{q.hint}</div>}
              <div>{q.opts.map((o: any) => <Opt key={o.v} name={q.key} val={o.v} curr={resp[q.key] || ''} label={o.l} onSelect={(v: string) => setResp(r => ({ ...r, [q.key]: v }))} />)}</div>
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: '#0A1628', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1 }}>
            {loading ? 'Guardando...' : 'Ver diagnóstico →'}
          </button>
        </div>
      ) : (
        <ResultadoView items={resultado} titulo={`Diagnóstico ${karinConfig.nombre}`} onReset={() => { setStep(0); setResp({}) }} />
      )}

      {diags.length > 0 && (
        <div style={{ marginTop: '2rem', maxWidth: '640px' }}>
          <SectionLabel text="Historial de diagnósticos" />
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0' }}>
            {diags.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1px solid #F5F5F8', fontSize: '13px' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{new Date(d.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div style={{ fontSize: '11px', color: '#8B8FA8', marginTop: '2px' }}>{d.items_risk} riesgo · {d.items_warn} atención · {d.items_ok} ok</div>
                </div>
                <Badge variant={d.score < 40 ? 'r' : d.score < 70 ? 'a' : 'v'}>{d.score}%</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: CANAL DE DENUNCIAS ──────────────────────────────────────────────────
function TabCanal({ empresaId, pais }: any) {
  const [tipo, setTipo] = useState('')
  const [desc, setDesc] = useState('')
  const [anonima, setAnonima] = useState(true)
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState<string | null>(null)

  const TIPOS_CL = ['Acoso laboral', 'Acoso sexual', 'Maltrato laboral', 'Discriminación', 'Represalia por denuncia', 'Otro']
  const TIPOS_CO = ['Acoso laboral (Ley 1010)', 'Acoso sexual', 'Maltrato laboral', 'Discriminación', 'Abuso de autoridad', 'Entorpecimiento laboral', 'Otro']
  const TIPOS = pais === 'CO' ? TIPOS_CO : TIPOS_CL

  async function enviarDenuncia(e: React.FormEvent) {
    e.preventDefault()
    if (!tipo || !desc || desc.length < 20) { alert('Describe el caso con al menos 20 caracteres.'); return }
    setLoading(true)
    const codigo = genCodigo()
    await supabase.from('denuncias_karin').insert({
      empresa_id: empresaId, codigo, tipo, descripcion: desc,
      anonima, estado: 'recibida', fecha: new Date().toISOString().split('T')[0]
    })
    await supabase.from('alertas').insert({
      empresa_id: empresaId, tipo: 'karin', severidad: 'riesgo',
      titulo: `Nueva denuncia Ley Karin — ${tipo}`,
      descripcion: `Código ${codigo}. Requiere investigación en los próximos 5 días hábiles.`
    })
    setEnviado(codigo); setTipo(''); setDesc(''); setLoading(false)
  }

  if (enviado) return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ background: '#0A1628', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓</div>
        <div style={{ fontFamily: 'serif', fontSize: '1.3rem', color: '#fff', marginBottom: '.5rem' }}>Denuncia recibida</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.5)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Tu denuncia fue registrada de forma confidencial. Guarda este código para hacer seguimiento.
        </div>
        <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginBottom: '6px', letterSpacing: '.08em', textTransform: 'uppercase' }}>Código de seguimiento</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.5rem', color: '#00B87A', fontWeight: '600' }}>{enviado}</div>
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.35)', lineHeight: 1.6 }}>
          El equipo responsable debe iniciar la investigación dentro de los próximos 5 días hábiles.
        </div>
      </div>
      <button onClick={() => setEnviado(null)} style={{ marginTop: '1rem', width: '100%', padding: '10px', background: '#fff', border: '1px solid #EBEBF0', borderRadius: '8px', fontSize: '13px', color: '#0A1628', cursor: 'pointer', fontFamily: 'inherit' }}>
        Registrar otra denuncia
      </button>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div style={{ maxWidth: '520px' }}>
        <div style={{ background: '#F0FDF8', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '12px 16px', fontSize: '12px', color: '#047857', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          🔒 <strong>Canal confidencial.</strong> Las denuncias anónimas no registran datos del denunciante.
          El código de seguimiento es la única forma de rastrear el caso.
        </div>

        <form onSubmit={enviarDenuncia} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B6B6E', marginBottom: '6px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Tipo de conducta *</div>
            <select value={tipo} onChange={e => setTipo(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', color: '#0A1628', background: '#fff', outline: 'none' }}>
              <option value="">Selecciona una categoría</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B6B6E', marginBottom: '6px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Descripción del caso *</div>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows={5}
              placeholder="Describe los hechos con el mayor detalle posible: qué ocurrió, cuándo, quién estuvo involucrado (sin necesidad de identificarte), en qué lugar..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', color: '#0A1628', background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
            <div style={{ fontSize: '11px', color: '#B0B4C8', marginTop: '4px' }}>{desc.length} caracteres · mínimo 20</div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#0A1628' }}>
            <input type="checkbox" checked={anonima} onChange={e => setAnonima(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#0A1628' }} />
            <div>
              <div style={{ fontWeight: '500' }}>Enviar de forma anónima</div>
              <div style={{ fontSize: '11px', color: '#8B8FA8' }}>No se registrará ningún dato tuyo en el sistema</div>
            </div>
          </label>

          <button type="submit" disabled={loading}
            style={{ padding: '12px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, fontFamily: 'inherit' }}>
            {loading ? 'Registrando...' : 'Enviar denuncia →'}
          </button>
        </form>
      </div>

      <div>
        <SectionLabel text="¿Cómo funciona?" />
        {[
          { n: '01', t: 'Envías la denuncia', d: 'Con o sin tu identidad. El sistema registra el caso y genera un código único.' },
          { n: '02', t: 'Se notifica automáticamente', d: 'El responsable de cumplimiento recibe una alerta para iniciar la investigación dentro de los plazos legales.' },
          { n: '03', t: 'Seguimiento transparente', d: 'Con tu código puedes revisar el estado del caso en cualquier momento desde la pestaña Seguimiento.' },
          { n: '04', t: 'Resolución documentada', d: 'Cada caso queda registrado en el historial para el Reporte de Cumplimiento y eventuales auditorías.' },
        ].map(s => (
          <div key={s.n} style={{ display: 'flex', gap: '14px', marginBottom: '1.25rem' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: '600', color: '#00B87A', minWidth: '28px', paddingTop: '2px' }}>{s.n}</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628', marginBottom: '3px' }}>{s.t}</div>
              <div style={{ fontSize: '12px', color: '#8B8FA8', lineHeight: 1.5 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TAB: SEGUIMIENTO ─────────────────────────────────────────────────────────
function TabSeguimiento({ empresaId }: any) {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [selected, setSelected] = useState<Denuncia | null>(null)
  const [loading, setLoading] = useState(true)
  const [actualizando, setActualizando] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    setLoading(true)
    const { data } = await supabase.from('denuncias_karin').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false })
    setDenuncias(data || [])
    setLoading(false)
  }

  async function cambiarEstado(id: string, nuevoEstado: string) {
    setActualizando(true)
    await supabase.from('denuncias_karin').update({ estado: nuevoEstado }).eq('id', id)
    if (nuevoEstado === 'resuelta') {
      await supabase.from('alertas').insert({ empresa_id: empresaId, tipo: 'karin', severidad: 'info', titulo: 'Caso Ley Karin resuelto', descripcion: `Denuncia ${selected?.codigo} marcada como resuelta.` })
    }
    await cargar()
    setSelected(prev => prev ? { ...prev, estado: nuevoEstado as any } : null)
    setActualizando(false)
  }

  const filtradas = denuncias.filter(d =>
    d.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.tipo?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const stats = {
    total: denuncias.length,
    activas: denuncias.filter(d => d.estado === 'recibida' || d.estado === 'en_investigacion').length,
    resueltas: denuncias.filter(d => d.estado === 'resuelta').length,
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #EBEBF0' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Total casos</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '26px', fontWeight: '500', color: '#0A1628' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #EBEBF0' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '8px' }}>En curso</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '26px', fontWeight: '500', color: stats.activas > 0 ? '#E5484D' : '#00B87A' }}>{stats.activas}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #EBEBF0' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Resueltos</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '26px', fontWeight: '500', color: '#00B87A' }}>{stats.resueltas}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>
        {/* Lista */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por código o tipo..."
              style={{ width: '100%', padding: '9px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#0A1628' }} />
          </div>
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
            {loading ? <div style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#8B8FA8' }}>Cargando...</div>
              : filtradas.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#8B8FA8' }}>Sin denuncias registradas</div>
              : filtradas.map(d => (
                <div key={d.id} onClick={() => setSelected(d)}
                  style={{ padding: '12px 18px', borderBottom: '1px solid #F5F5F8', cursor: 'pointer', background: selected?.id === d.id ? '#F8F8FB' : '#fff', transition: 'background .1s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: '600', color: '#0A1628' }}>{d.codigo}</span>
                    <Badge variant={ESTADO_COLORS[d.estado]}>{ESTADO_LABELS[d.estado]}</Badge>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8B8FA8' }}>{d.tipo} · {d.anonima ? '🔒 Anónima' : '👤 Identificada'}</div>
                  <div style={{ fontSize: '11px', color: '#B0B4C8', marginTop: '2px' }}>{new Date(d.created_at).toLocaleDateString('es-CL')}</div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Detalle */}
        {selected ? (
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '18px', fontWeight: '600', color: '#0A1628' }}>{selected.codigo}</div>
                <div style={{ fontSize: '12px', color: '#8B8FA8', marginTop: '2px' }}>Recibida el {new Date(selected.created_at).toLocaleDateString('es-CL')}</div>
              </div>
              <Badge variant={ESTADO_COLORS[selected.estado]}>{ESTADO_LABELS[selected.estado]}</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Tipo de conducta</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#0A1628' }}>{selected.tipo}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Modalidad</div>
                <div style={{ fontSize: '13px', color: '#0A1628' }}>{selected.anonima ? '🔒 Denuncia anónima' : '👤 Denuncia identificada'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Descripción del caso</div>
                <div style={{ fontSize: '13px', color: '#0A1628', lineHeight: 1.7, background: '#F8F8FB', borderRadius: '8px', padding: '12px', border: '1px solid #EBEBF0' }}>{selected.descripcion}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B6B6E', marginBottom: '8px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Actualizar estado</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { v: 'recibida', l: 'Recibida' },
                  { v: 'en_investigacion', l: 'En investigación' },
                  { v: 'resuelta', l: 'Resuelta' },
                  { v: 'cerrada', l: 'Cerrada' },
                ].map(s => (
                  <button key={s.v} onClick={() => cambiarEstado(selected.id, s.v)} disabled={actualizando}
                    style={{ padding: '7px 14px', border: `1px solid ${selected.estado === s.v ? '#0A1628' : '#E2E2EC'}`, borderRadius: '7px', background: selected.estado === s.v ? '#0A1628' : '#fff', color: selected.estado === s.v ? '#fff' : '#6B6B6E', fontSize: '12px', fontWeight: selected.estado === s.v ? '600' : '400', cursor: 'pointer', fontFamily: 'inherit', opacity: actualizando ? .6 : 1 }}>
                    {s.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#F8F8FB', borderRadius: '10px', border: '1px solid #EBEBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div style={{ textAlign: 'center', color: '#B0B4C8', fontSize: '13px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
              Selecciona un caso para ver el detalle
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── TAB: REPORTE ─────────────────────────────────────────────────────────────
function TabReporte({ empresaId, pais, karinConfig }: any) {
  const [datos, setDatos] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    setLoading(true)
    const [diags, denuncias] = await Promise.all([
      supabase.from('diagnosticos').select('*').eq('empresa_id', empresaId).eq('modulo', 'karin').order('created_at', { ascending: false }),
      supabase.from('denuncias_karin').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false }),
    ])
    setDatos({ diags: diags.data || [], denuncias: denuncias.data || [] })
    setLoading(false)
  }

  function imprimir() {
    if (!datos) return
    const ultimo = datos.diags[0]
    const score = ultimo?.score || 0
    const fecha = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    const denActivas = datos.denuncias.filter((d: any) => d.estado === 'recibida' || d.estado === 'en_investigacion').length
    const denResueltas = datos.denuncias.filter((d: any) => d.estado === 'resuelta').length

    const w = window.open('', '_blank')!
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte de Cumplimiento — ${karinConfig.nombre}</title>
    <style>
      body { font-family: Georgia, serif; max-width: 760px; margin: 60px auto; color: #0A0A0C; line-height: 1.7; }
      h1 { font-size: 1.5rem; margin-bottom: 4px; }
      h2 { font-size: 1rem; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-top: 32px; font-family: sans-serif; letter-spacing: .04em; text-transform: uppercase; font-size: 11px; color: #666; }
      .meta { font-size: 13px; color: #666; margin-bottom: 32px; }
      .score { font-size: 3rem; font-weight: 700; color: ${score >= 70 ? '#16A34A' : score >= 40 ? '#D97706' : '#D94040'}; }
      .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin: 16px 0; }
      .stat { border: 1px solid #eee; border-radius: 8px; padding: 16px; text-align: center; }
      .stat-num { font-size: 1.8rem; font-weight: 700; }
      .stat-lbl { font-size: 11px; color: #666; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
      th { text-align: left; border-bottom: 2px solid #eee; padding: 8px; font-family: sans-serif; font-size: 11px; letter-spacing: .04em; color: #666; }
      td { padding: 8px; border-bottom: 1px solid #f4f4f4; }
      .firma { display: flex; justify-content: space-around; margin-top: 64px; }
      .firma-box { text-align: center; width: 200px; }
      .firma-line { border-top: 1px solid #333; margin-bottom: 6px; }
      .footer { margin-top: 48px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
      @media print { body { margin: 40px; } }
    </style></head><body>
    <h1>Reporte de Cumplimiento — ${karinConfig.nombre}</h1>
    <div class="meta">${karinConfig.ley} · Generado el ${fecha}</div>
    <h2>Resumen ejecutivo</h2>
    <div class="score">${score}%</div>
    <p style="font-size:13px;color:#666">Score de cumplimiento basado en el diagnóstico más reciente (${ultimo ? new Date(ultimo.created_at).toLocaleDateString('es-CL') : 'sin diagnóstico'}).</p>
    <div class="grid">
      <div class="stat"><div class="stat-num">${datos.diags.length}</div><div class="stat-lbl">Diagnósticos realizados</div></div>
      <div class="stat"><div class="stat-num" style="color:${denActivas > 0 ? '#D94040' : '#16A34A'}">${denActivas}</div><div class="stat-lbl">Denuncias activas</div></div>
      <div class="stat"><div class="stat-num">${denResueltas}</div><div class="stat-lbl">Casos resueltos</div></div>
    </div>
    ${ultimo ? `
    <h2>Detalle del último diagnóstico</h2>
    <table>
      <thead><tr><th>Obligación legal</th><th>Estado</th><th>Observación</th></tr></thead>
      <tbody>
        ${(ultimo.resultados || []).map((r: any) => `
          <tr>
            <td>${r.t}</td>
            <td style="color:${r.s === 'r' ? '#D94040' : r.s === 'a' ? '#D97706' : '#16A34A'};font-weight:600">${r.s === 'r' ? 'Incumplimiento' : r.s === 'a' ? 'Atención' : 'Cumpliendo'}</td>
            <td style="font-size:12px;color:#555">${r.d}</td>
          </tr>`).join('')}
      </tbody>
    </table>` : '<p>Sin diagnósticos registrados.</p>'}
    ${datos.denuncias.length > 0 ? `
    <h2>Historial de denuncias</h2>
    <table>
      <thead><tr><th>Código</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Modalidad</th></tr></thead>
      <tbody>
        ${datos.denuncias.map((d: any) => `
          <tr>
            <td style="font-family:monospace">${d.codigo}</td>
            <td>${d.tipo}</td>
            <td>${new Date(d.created_at).toLocaleDateString('es-CL')}</td>
            <td>${{ recibida: 'Recibida', en_investigacion: 'En investigación', resuelta: 'Resuelta', cerrada: 'Cerrada' }[d.estado as string] || d.estado}</td>
            <td>${d.anonima ? 'Anónima' : 'Identificada'}</td>
          </tr>`).join('')}
      </tbody>
    </table>` : ''}
    <div class="firma">
      <div class="firma-box"><div class="firma-line"></div>Responsable de cumplimiento</div>
      <div class="firma-box"><div class="firma-line"></div>Representante legal</div>
    </div>
    <div class="footer">Generado automáticamente por Normvia · normvia.cl · ${fecha}</div>
    </body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  if (loading) return <div style={{ padding: '2rem', color: '#8B8FA8', fontSize: '13px' }}>Generando reporte...</div>

  const ultimo = datos?.diags[0]
  const denuncias: Denuncia[] = datos?.denuncias || []
  const score = ultimo?.score || 0
  const denActivas = denuncias.filter(d => d.estado === 'recibida' || d.estado === 'en_investigacion').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0A1628' }}>Reporte de cumplimiento</div>
          <div style={{ fontSize: '12px', color: '#8B8FA8', marginTop: '2px' }}>{karinConfig.ley} · {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <button onClick={imprimir} style={{ padding: '8px 18px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🖨️ Imprimir / Exportar PDF
        </button>
      </div>

      {/* Score visual */}
      <div style={{ background: '#0A1628', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 90% 10%,rgba(0,184,122,.12),transparent 60%)' }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '3.5rem', fontWeight: '600', color: score >= 70 ? '#00B87A' : score >= 40 ? '#F59E0B' : '#E5484D', lineHeight: 1 }}>{score}%</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginTop: '6px', letterSpacing: '.06em', textTransform: 'uppercase' }}>Score global</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { n: datos.diags.length, l: 'Diagnósticos', c: '#fff' },
              { n: denActivas, l: 'Denuncias activas', c: denActivas > 0 ? '#E5484D' : '#00B87A' },
              { n: denuncias.filter((d: any) => d.estado === 'resuelta').length, l: 'Casos resueltos', c: '#00B87A' },
            ].map(s => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,.06)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.5rem', fontWeight: '500', color: s.c }}>{s.n}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.35)', marginTop: '4px', letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items del último diagnóstico */}
      {ultimo ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <SectionLabel text={`Último diagnóstico · ${new Date(ultimo.created_at).toLocaleDateString('es-CL')}`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(ultimo.resultados || []).map((r: any, i: number) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #EBEBF0', borderLeft: `3px solid ${r.s === 'r' ? '#E5484D' : r.s === 'a' ? '#F59E0B' : '#00B87A'}`, borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628', marginBottom: '2px' }}>{r.t}</div>
                  <div style={{ fontSize: '12px', color: '#8B8FA8' }}>{r.d}</div>
                </div>
                <Badge variant={r.s}>{r.s === 'r' ? 'Incumplimiento' : r.s === 'a' ? 'Atención' : 'OK'}</Badge>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: '#FFF5F5', border: '1px solid #FECDD3', borderRadius: '10px', padding: '16px', fontSize: '13px', color: '#C4183C', marginBottom: '1.5rem' }}>
          ⚠️ Sin diagnósticos registrados. Realiza el primer diagnóstico desde la pestaña Diagnóstico para generar el reporte completo.
        </div>
      )}

      {/* Historial denuncias en reporte */}
      {denuncias.length > 0 && (
        <div>
          <SectionLabel text="Historial de denuncias" />
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 120px', gap: '0', background: '#F8F8FB', borderBottom: '1px solid #EBEBF0' }}>
              {['Código', 'Tipo', 'Fecha', 'Estado'].map(h => <div key={h} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</div>)}
            </div>
            {denuncias.map(d => (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 120px', borderBottom: '1px solid #F5F5F8' }}>
                <div style={{ padding: '10px 16px', fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: '600', color: '#0A1628' }}>{d.codigo}</div>
                <div style={{ padding: '10px 16px', fontSize: '13px', color: '#0A1628' }}>{d.tipo}</div>
                <div style={{ padding: '10px 16px', fontSize: '12px', color: '#8B8FA8' }}>{new Date(d.created_at).toLocaleDateString('es-CL')}</div>
                <div style={{ padding: '10px 16px' }}><Badge variant={ESTADO_COLORS[d.estado]}>{ESTADO_LABELS[d.estado]}</Badge></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
