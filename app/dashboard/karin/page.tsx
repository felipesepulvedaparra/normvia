'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Topbar, SectionLabel } from '@/components/ui/Layout'
import Opt from '@/components/ui/Opt'
import Badge from '@/components/ui/Badge'
import ResultadoView, { Item } from '@/components/ui/ResultadoView'

const PREGUNTAS = [
  { key: 'proto', label: '¿El protocolo de prevención está implementado y comunicado a todos los trabajadores?', hint: 'Obligatorio desde agosto 2024 para TODAS las empresas.', opts: [{ v: 'si', l: 'Sí, implementado y comunicado' }, { v: 'proceso', l: 'En proceso de implementación' }, { v: 'no', l: 'No tenemos protocolo' }] },
  { key: 'canal', label: '¿Existe un canal de denuncia formal y confidencial?', hint: 'Debe ser accesible por correo, formulario o presencialmente.', opts: [{ v: 'si', l: 'Sí, formal y confidencial' }, { v: 'informal', l: 'Solo de forma informal' }, { v: 'no', l: 'No existe canal' }] },
  { key: 'cap', label: '¿Todos los trabajadores recibieron capacitación sobre Ley Karin?', hint: undefined, opts: [{ v: 'si', l: 'Sí, todos' }, { v: 'parcial', l: 'Solo algunos' }, { v: 'no', l: 'No se ha realizado' }] },
  { key: 'sem', label: '¿Se realiza comunicación semestral sobre los canales de denuncia?', hint: 'Obligatorio informar semestralmente a todos los trabajadores.', opts: [{ v: 'si', l: 'Sí, semestralmente' }, { v: 'aveces', l: 'A veces' }, { v: 'no', l: 'No se realiza' }] },
]

function calcItems(resp: Record<string, string>): Item[] {
  const items: Item[] = []
  items.push(resp.proto === 'no' ? { t: 'Protocolo de prevención', s: 'r', d: 'No implementado. Obligatorio desde agosto 2024. Cualquier denuncia expone a responsabilidad directa.' } : resp.proto === 'proceso' ? { t: 'Protocolo de prevención', s: 'a', d: 'En proceso. La ley ya está vigente. Priorizar su cierre.' } : { t: 'Protocolo de prevención', s: 'v', d: 'Implementado y comunicado correctamente.' })
  items.push(resp.canal === 'no' ? { t: 'Canal de denuncia', s: 'r', d: 'No existe. La Ley Karin exige canal formal y confidencial.' } : resp.canal === 'informal' ? { t: 'Canal de denuncia', s: 'a', d: 'Canal informal no cumple el estándar legal.' } : { t: 'Canal de denuncia', s: 'v', d: 'Canal formal correctamente implementado.' })
  items.push(resp.cap === 'no' ? { t: 'Capacitación', s: 'r', d: 'No realizada. Obligación de prevención de la ley.' } : resp.cap === 'parcial' ? { t: 'Capacitación', s: 'a', d: 'Solo algunos. Debe llegar a todos.' } : { t: 'Capacitación', s: 'v', d: 'Capacitación realizada para todos.' })
  items.push(resp.sem === 'no' ? { t: 'Comunicación semestral', s: 'r', d: 'No se realiza. Obligación formal semestral.' } : resp.sem === 'aveces' ? { t: 'Comunicación semestral', s: 'a', d: 'No sistemática. Debe ser periódica y documentada.' } : { t: 'Comunicación semestral', s: 'v', d: 'Comunicación semestral realizada correctamente.' })
  return items
}

export default function KarinPage() {
  const { empresaId } = useAuth()
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
    if (Object.keys(resp).length < PREGUNTAS.length) { alert('Responde todas las preguntas.'); return }
    setLoading(true)
    const items = calcItems(resp)
    const ok = items.filter(i => i.s === 'v').length, warn = items.filter(i => i.s === 'a').length, risk = items.filter(i => i.s === 'r').length
    const score = Math.round(ok / items.length * 100)
    await supabase.from('diagnosticos').insert({ empresa_id: empresaId, modulo: 'karin', score, items_ok: ok, items_warn: warn, items_risk: risk, respuestas: resp, resultados: items })
    if (risk > 0) await supabase.from('alertas').insert({ empresa_id: empresaId, tipo: 'karin', severidad: 'riesgo', titulo: `Ley Karin: ${risk} obligaciones sin cumplir`, descripcion: 'Diagnóstico detectó incumplimientos críticos.' })
    setResultado(items); setStep(1); setLoading(false); cargar()
  }

  const ultimo = diags[0]

  return (
    <div>
      <Topbar title="⚖️ Ley Karin" sub="Ley N° 21.643 · Vigente desde agosto 2024" />
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <Stat label="Último score" value={ultimo ? ultimo.score + '%' : '—'} color={ultimo ? (ultimo.score < 40 ? '#D94040' : ultimo.score < 70 ? '#D97706' : '#16A34A') : '#0B3D6B'} desc={ultimo ? 'Último diagnóstico' : 'Sin diagnóstico aún'} />
          <Stat label="Diagnósticos" value={diags.length} color="#0B3D6B" desc="Realizados en total" />
          <Stat label="Riesgo alto" value={ultimo?.items_risk || 0} color="#D94040" desc="Items críticos" />
          <Stat label="Cumpliendo" value={ultimo?.items_ok || 0} color="#16A34A" desc="Sin problemas" />
        </div>

        {step === 0 ? (
          <div style={{ maxWidth: '640px' }}>
            <SectionLabel text="Diagnóstico Ley Karin" />
            <div style={{ background: '#E8F1FA', border: '1px solid #BDD4ED', borderRadius: '10px', padding: '12px 15px', fontSize: '12px', color: '#0B3D6B', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              ℹ️ Responde las preguntas sobre el estado actual de tu empresa. El diagnóstico se guarda en tu historial.
            </div>
            {PREGUNTAS.map(q => (
              <div key={q.key} style={{ marginBottom: '1.375rem' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#18181A', marginBottom: '4px', lineHeight: '1.4' }}>{q.label}</div>
                {q.hint && <div style={{ fontSize: '12px', color: '#6B6B6E', marginBottom: '8px', padding: '8px 12px', background: '#E8F1FA', borderRadius: '8px', borderLeft: '3px solid #1A5F9E', lineHeight: '1.5' }}>{q.hint}</div>}
                <div>
                  {q.opts.map(o => <Opt key={o.v} name={q.key} val={o.v} curr={resp[q.key] || ''} label={o.l} onSelect={(v) => setResp(r => ({ ...r, [q.key]: v }))} />)}
                </div>
              </div>
            ))}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: '#0B3D6B', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, marginTop: '.5rem' }}>
              {loading ? 'Guardando...' : 'Ver diagnóstico →'}
            </button>
          </div>
        ) : (
          <ResultadoView items={resultado} titulo="Diagnóstico Ley Karin" onReset={() => { setStep(0); setResp({}) }} />
        )}

        {diags.length > 0 && (
          <div style={{ marginTop: '2rem', maxWidth: '640px' }}>
            <SectionLabel text="Historial" />
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>
              {diags.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.625rem 1.25rem', borderBottom: '1px solid #F4F3EF', fontSize: '13px' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Diagnóstico {new Date(d.created_at).toLocaleDateString('es-CL')}</div>
                    <div style={{ fontSize: '11px', color: '#6B6B6E' }}>{d.items_risk} riesgo · {d.items_warn} atención · {d.items_ok} ok</div>
                  </div>
                  <Badge variant={d.score < 40 ? 'r' : d.score < 70 ? 'a' : 'v'}>{d.score}%</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, color, desc }: { label: string, value: any, color: string, desc: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #D1CFC7' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B6B6E', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '.625rem' }}>{label}</div>
      <div style={{ fontFamily: 'serif', fontSize: '2rem', fontWeight: 500, color, letterSpacing: '-.03em', marginBottom: '.125rem' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#6B6B6E' }}>{desc}</div>
    </div>
  )
}
