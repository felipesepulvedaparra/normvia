'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Topbar, SectionLabel } from '@/components/ui/Layout'
import Opt from '@/components/ui/Opt'
import Badge from '@/components/ui/Badge'
import ResultadoView, { Item } from '@/components/ui/ResultadoView'

const PREGUNTAS = [
  { key: 'cont', label: '¿Todos los contratos tienen la jornada actualizada a 42 horas?', hint: 'Desde abril 2026 la jornada máxima es 42h semanales.', opts: [{ v: 'si', l: 'Sí, todos actualizados con anexo firmado' }, { v: 'parcial', l: 'Algunos no actualizados' }, { v: 'no', l: 'Ninguno actualizado aún' }] },
  { key: 'asist', label: '¿Llevan registro de asistencia para todos los trabajadores?', hint: 'Obligatorio por el Art. 33 del Código del Trabajo.', opts: [{ v: 'si', l: 'Sí, para todos' }, { v: 'parcial', l: 'Solo para algunos' }, { v: 'no', l: 'No llevamos registro' }] },
  { key: 'hextra', label: '¿Las horas extraordinarias se pagan con el recargo del 50%?', hint: undefined, opts: [{ v: 'si', l: 'Sí, con recargo legal' }, { v: 'nosabe', l: 'No estamos seguros del cálculo' }, { v: 'na', l: 'No hay horas extra' }] },
]

function calcItems(resp: Record<string, string>): Item[] {
  const items: Item[] = []
  items.push(resp.cont === 'no' ? { t: 'Contratos actualizados', s: 'r', d: 'Ningún contrato actualizado a 42h. Infracción directa desde abril 2026.' } : resp.cont === 'parcial' ? { t: 'Contratos actualizados', s: 'a', d: 'Parcialmente actualizados. Completar urgente.' } : { t: 'Contratos actualizados', s: 'v', d: 'Todos actualizados correctamente a 42h.' })
  items.push(resp.asist === 'no' ? { t: 'Registro de asistencia', s: 'r', d: 'Obligatorio por Art. 33. Una de las infracciones más multadas por la DT.' } : resp.asist === 'parcial' ? { t: 'Registro de asistencia', s: 'a', d: 'Debe implementarse para todos los trabajadores.' } : { t: 'Registro de asistencia', s: 'v', d: 'Registro correcto para todos los trabajadores.' })
  items.push(resp.hextra === 'nosabe' ? { t: 'Horas extraordinarias', s: 'a', d: 'Recargo legal es 50% sobre hora ordinaria. Verificar cálculo con nueva jornada de 42h.' } : { t: 'Horas extraordinarias', s: 'v', d: 'Calculadas y pagadas correctamente.' })
  return items
}

export default function HorasPage() {
  const { empresaId } = useAuth()
  const [diags, setDiags] = useState<any[]>([])
  const [resp, setResp] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  const [resultado, setResultado] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('diagnosticos').select('*').eq('empresa_id', empresaId).eq('modulo', 'horas').order('created_at', { ascending: false }).limit(5)
    setDiags(data || [])
  }

  async function handleSubmit() {
    if (!resp.cont || !resp.asist || !resp.hextra) { alert('Responde todas las preguntas.'); return }
    setLoading(true)
    const items = calcItems(resp)
    const ok = items.filter(i => i.s === 'v').length, warn = items.filter(i => i.s === 'a').length, risk = items.filter(i => i.s === 'r').length
    await supabase.from('diagnosticos').insert({ empresa_id: empresaId, modulo: 'horas', score: Math.round(ok / items.length * 100), items_ok: ok, items_warn: warn, items_risk: risk, respuestas: resp, resultados: items })
    if (risk > 0) await supabase.from('alertas').insert({ empresa_id: empresaId, tipo: 'horas', severidad: 'riesgo', titulo: `40 Horas: ${risk} incumplimientos detectados`, descripcion: 'Contratos o registros no actualizados.' })
    setResultado(items); setStep(1); setLoading(false); cargar()
  }

  const ultimo = diags[0]
  return (
    <div>
      <Topbar title="🕐 Ley 40 Horas" sub="Ley N° 21.561 · Desde abril 2026: máximo 42h semanales" />
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <Stat label="Último score" value={ultimo ? ultimo.score + '%' : '—'} color={ultimo ? (ultimo.score < 40 ? '#D94040' : ultimo.score < 70 ? '#D97706' : '#16A34A') : '#0B3D6B'} desc="" />
          <Stat label="Jornada vigente" value="42h" color="#0B3D6B" desc="Desde abril 2026" />
          <Stat label="Próximo cambio" value="2028" color="#D97706" desc="Reducción a 40h" />
          <Stat label="Diagnósticos" value={diags.length} color="#0B3D6B" desc="" />
        </div>
        {step === 0 ? (
          <div style={{ maxWidth: '640px' }}>
            {PREGUNTAS.map(q => (
              <div key={q.key} style={{ marginBottom: '1.375rem' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#18181A', marginBottom: '4px' }}>{q.label}</div>
                {q.hint && <div style={{ fontSize: '12px', color: '#6B6B6E', marginBottom: '8px', padding: '8px 12px', background: '#E8F1FA', borderRadius: '8px', borderLeft: '3px solid #1A5F9E' }}>{q.hint}</div>}
                <div>
                  {q.opts.map(o => <Opt key={o.v} name={q.key} val={o.v} curr={resp[q.key] || ''} label={o.l} onSelect={(v) => setResp(r => ({ ...r, [q.key]: v }))} />)}
                </div>
              </div>
            ))}
            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: '#0B3D6B', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, marginTop: '1rem' }}>
              {loading ? 'Guardando...' : 'Ver diagnóstico →'}
            </button>
          </div>
        ) : (
          <ResultadoView items={resultado} titulo="Diagnóstico Ley 40 Horas" onReset={() => { setStep(0); setResp({}) }} />
        )}
        {diags.length > 0 && (
          <div style={{ marginTop: '2rem', maxWidth: '640px' }}>
            <SectionLabel text="Historial" />
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>{diags.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.625rem 1.25rem', borderBottom: '1px solid #F4F3EF', fontSize: '13px' }}>
                <div><div style={{ fontWeight: 500 }}>{new Date(d.created_at).toLocaleDateString('es-CL')}</div><div style={{ fontSize: '11px', color: '#6B6B6E' }}>{d.items_risk} riesgo · {d.items_warn} atención · {d.items_ok} ok</div></div>
                <Badge variant={d.score < 40 ? 'r' : d.score < 70 ? 'a' : 'v'}>{d.score}%</Badge>
              </div>
            ))}</div>
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
      {desc && <div style={{ fontSize: '12px', color: '#6B6B6E' }}>{desc}</div>}
    </div>
  )
}
