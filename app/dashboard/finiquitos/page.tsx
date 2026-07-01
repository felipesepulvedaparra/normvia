'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { fmt, fmtF } from '@/lib/db'
import { Topbar, SectionLabel } from '@/components/ui/Layout'
import Opt from '@/components/ui/Opt'
import Badge from '@/components/ui/Badge'

function calcMontos(sueldo: number, inicio: string, termino: string, causal: string, vac: string) {
  const fi = new Date(inicio), ft = new Date(termino)
  let anos = 0, meses = 0
  if (!isNaN(fi.getTime()) && !isNaN(ft.getTime()) && ft > fi) {
    const m = Math.floor((ft.getTime() - fi.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    anos = Math.floor(m / 12); meses = m % 12
  }
  const at = anos + meses / 12
  let indem = 0, recargo = 0, aviso = 0
  if (causal === '161') { indem = sueldo * Math.min(Math.floor(at), 11); recargo = indem * 0.3; aviso = sueldo }
  const vacProp = (vac === 'si' || vac === 'nosabe') ? (sueldo / 30) * Math.max(Math.round((meses / 12) * 15), 2) : 0
  return { anos, meses, indem, recargo, aviso, vacProp, total: indem + recargo + aviso + vacProp }
}

export default function FiniquitosPage() {
  const { empresaId } = useAuth()
  const [finis, setFinis] = useState<any[]>([])
  // step 1: datos | step 2: simulación | step 3: verificación legal | step 4: resultado
  const [step, setStep] = useState(1)
  const [nombre, setNombre] = useState(''); const [rut, setRut] = useState('')
  const [sueldo, setSueldo] = useState(''); const [inicio, setInicio] = useState(''); const [termino, setTermino] = useState('')
  const [vac, setVac] = useState(''); const [causal, setCausal] = useState(''); const [fund, setFund] = useState('')
  const [cot, setCot] = useState(''); const [fe, setFe] = useState(''); const [fuero, setFuero] = useState('')
  const [calculo, setCalculo] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('finiquitos').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false })
    setFinis(data || [])
  }

  function irSimulacion() {
    if (!nombre || !sueldo || !inicio || !termino || !causal) { alert('Completa todos los campos obligatorios (marcados con *).'); return }
    if (causal === '160' && !fund) { alert('Indica si la causal está documentada.'); return }
    const c = calcMontos(parseFloat(sueldo), inicio, termino, causal, vac)
    setCalculo(c)
    setStep(2)
  }

  function irVerificacion() {
    setStep(3)
  }

  async function irResultado() {
    if (!cot || !fe || !fuero) { alert('Responde las tres preguntas de verificación legal.'); return }
    setSaving(true)
    const its: any[] = []
    its.push(cot === 'no' ? { t: 'Cotizaciones previsionales', s: 'r', d: 'Impagas. Ley Bustos: el finiquito NO produce efecto aunque se firme.' } : cot === 'parcial' || cot === 'nosabe' ? { t: 'Cotizaciones previsionales', s: 'a', d: 'Verificar que todas estén al día antes de firmar.' } : { t: 'Cotizaciones previsionales', s: 'v', d: 'Al día. Requisito Ley Bustos cumplido.' })
    its.push(fe === 'no' ? { t: 'Ministro de fe', s: 'r', d: 'Sin ministro de fe el finiquito no produce efecto liberatorio.' } : fe === 'nosabe' ? { t: 'Ministro de fe', s: 'a', d: 'Coordinar con Inspector o Notario antes de firmar.' } : { t: 'Ministro de fe', s: 'v', d: 'Firma ante ministro de fe correctamente gestionada.' })
    its.push(fuero === 'licencia' ? { t: 'Licencia médica', s: 'r', d: 'No se puede despedir con licencia activa. El despido puede ser nulo.' } : fuero === 'fuero' ? { t: 'Fuero laboral', s: 'r', d: 'Requiere autorización judicial previa.' } : fuero === 'nosabe' ? { t: 'Fuero laboral', s: 'a', d: 'Verificar si tiene fuero antes de proceder.' } : { t: 'Sin fuero ni licencia', s: 'v', d: 'Sin impedimentos.' })
    its.push(causal === '160' && fund === 'no' ? { t: 'Fundamento causal', s: 'r', d: 'Sin respaldo. Puede derivar en recargo del 80%.' } : { t: 'Causal de término', s: 'v', d: 'Causal con respaldo suficiente.' })

    const risk = its.filter(i => i.s === 'r').length
    const estado = risk > 0 ? 'error' : its.some(i => i.s === 'a') ? 'borrador' : 'validado'

    await supabase.from('finiquitos').insert({
      empresa_id: empresaId, trabajador_nombre: nombre, trabajador_rut: rut,
      sueldo: parseFloat(sueldo), fecha_inicio: inicio, fecha_termino: termino,
      causal, cotizaciones_al_dia: cot === 'si', ministro_fe: fe === 'si',
      tiene_fuero: fuero, vacaciones: vac, monto_total: calculo?.total || 0, estado,
      errores_detectados: its.filter(i => i.s === 'r').map(i => i.t)
    })
    if (risk > 0) {
      await supabase.from('alertas').insert({ empresa_id: empresaId, tipo: 'finiquito', severidad: 'riesgo', titulo: `Finiquito con errores: ${nombre}`, descripcion: `${risk} error(es) crítico(s) detectados.` })
    }
    setItems(its); setStep(4); setSaving(false); cargar()
  }

  function reset() {
    setStep(1); setNombre(''); setRut(''); setSueldo(''); setInicio(''); setTermino('')
    setVac(''); setCausal(''); setFund(''); setCot(''); setFe(''); setFuero('')
    setCalculo(null); setItems([])
  }

  const progress = Math.round((Math.min(step, 4) / 4) * 100)

  return (
    <div>
      <Topbar title="📄 Finiquitos" sub="Validación pre-firma · Simulación de montos · Historial" />
      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        <div style={{ maxWidth: '560px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B6B6E', marginBottom: '6px', fontWeight: 500 }}>
            <span>{step <= 4 ? `Paso ${step} de 4` : 'Resultado'}</span><span>{progress}%</span>
          </div>
          <div style={{ height: '4px', background: '#D1CFC7', borderRadius: '2px', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ height: '4px', background: '#00C896', borderRadius: '2px', width: `${progress}%`, transition: 'width .4s' }} />
          </div>

          {step === 1 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1A5F9E', marginBottom: '1rem' }}>Datos del trabajador y causal</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <INP label="Nombre *" value={nombre} onChange={(e: any) => setNombre(e.target.value)} placeholder="Juan Pérez" />
                <INP label="RUT" value={rut} onChange={(e: any) => setRut(e.target.value)} placeholder="12.345.678-9" />
              </div>
              <INP label="Remuneración bruta (CLP) *" type="number" value={sueldo} onChange={(e: any) => setSueldo(e.target.value)} placeholder="700000" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <INP label="Fecha inicio *" type="date" value={inicio} onChange={(e: any) => setInicio(e.target.value)} />
                <INP label="Fecha término *" type="date" value={termino} onChange={(e: any) => setTermino(e.target.value)} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>¿Tiene vacaciones pendientes?</div>
                <Opt name="vac" val="si" curr={vac} label="Sí" onSelect={setVac} />
                <Opt name="vac" val="no" curr={vac} label="No, las tomó todas" onSelect={setVac} />
                <Opt name="vac" val="nosabe" curr={vac} label="No sé" onSelect={setVac} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>Causal de término *</div>
                {[{ v: '159_1', l: 'Art. 159 N°1 — Mutuo acuerdo' }, { v: '159_2', l: 'Art. 159 N°2 — Renuncia voluntaria' }, { v: '159_4', l: 'Art. 159 N°4 — Vencimiento de plazo' }, { v: '160', l: 'Art. 160 — Despido por falta grave' }, { v: '161', l: 'Art. 161 — Necesidades de la empresa' }].map(o => (
                  <Opt key={o.v} name="causal" val={o.v} curr={causal} label={o.l} onSelect={setCausal} />
                ))}
              </div>
              {causal === '160' && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>¿La causal está documentada?</div>
                  <Opt name="fund" val="si" curr={fund} label="Sí, tenemos respaldo" onSelect={setFund} />
                  <Opt name="fund" val="parcial" curr={fund} label="Parcialmente" onSelect={setFund} />
                  <Opt name="fund" val="no" curr={fund} label="No tenemos respaldo" onSelect={setFund} />
                </div>
              )}
              <button onClick={irSimulacion} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: '#0B3D6B', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                Ver simulación →
              </button>
            </div>
          )}

          {step === 2 && calculo && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1A5F9E', marginBottom: '1rem' }}>Simulación de montos</div>
              <div style={{ background: '#fff', border: '1px solid #D1CFC7', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem' }}>
                {[
                  ['Trabajador', nombre],
                  ['Remuneración', fmt(parseFloat(sueldo))],
                  ['Antigüedad', `${calculo.anos} años ${calculo.meses} meses`],
                  ...(causal === '161' ? [['Indemnización por años', fmt(calculo.indem)], ['Recargo 30%', fmt(calculo.recargo)], ['Aviso previo', fmt(calculo.aviso)]] : [['Indemnización', 'No corresponde en esta causal']]),
                  ['Vacaciones proporcionales', fmt(calculo.vacProp)],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F4F3EF', fontSize: '13px' }}>
                    <span style={{ color: '#6B6B6E' }}>{l}</span><span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ background: '#E8F1FA', borderRadius: '10px', padding: '13px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0B3D6B' }}>Total estimado</span>
                  <span style={{ fontFamily: 'serif', fontSize: '1.5rem', color: '#0B3D6B', fontWeight: 500 }}>{fmt(calculo.total)}</span>
                </div>
              </div>
              <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px', padding: '12px 15px', fontSize: '12px', color: '#633806', marginBottom: '1.5rem' }}>
                ⚠️ Cálculo referencial. Puede variar según beneficios del contrato.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ padding: '10px 20px', border: '1.5px solid #D1CFC7', borderRadius: '10px', background: '#fff', color: '#6B6B6E', fontSize: '14px', cursor: 'pointer' }}>← Atrás</button>
                <button onClick={irVerificacion} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', background: '#0B3D6B', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Continuar verificación →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1A5F9E', marginBottom: '1rem' }}>Verificación legal</div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>¿Las cotizaciones previsionales están al día?</div>
                <div style={{ fontSize: '12px', color: '#6B6B6E', marginBottom: '8px', padding: '8px 12px', background: '#E8F1FA', borderRadius: '8px', borderLeft: '3px solid #1A5F9E' }}>Ley Bustos: cotizaciones impagas invalidan el finiquito aunque se firme.</div>
                <Opt name="cot" val="si" curr={cot} label="Sí, todas al día" onSelect={setCot} />
                <Opt name="cot" val="parcial" curr={cot} label="Hay algunos atrasos" onSelect={setCot} />
                <Opt name="cot" val="no" curr={cot} label="No, hay impagas" onSelect={setCot} />
                <Opt name="cot" val="nosabe" curr={cot} label="No tengo certeza" onSelect={setCot} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>¿Se firmará ante ministro de fe?</div>
                <div style={{ fontSize: '12px', color: '#6B6B6E', marginBottom: '8px', padding: '8px 12px', background: '#E8F1FA', borderRadius: '8px', borderLeft: '3px solid #1A5F9E' }}>Inspector del Trabajo, Notario o Presidente del Sindicato.</div>
                <Opt name="fe" val="si" curr={fe} label="Sí, ante Inspector o Notario" onSelect={setFe} />
                <Opt name="fe" val="no" curr={fe} label="No, internamente" onSelect={setFe} />
                <Opt name="fe" val="nosabe" curr={fe} label="No definido aún" onSelect={setFe} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>¿El trabajador tiene licencia médica o fuero?</div>
                <Opt name="fuero" val="no" curr={fuero} label="No" onSelect={setFuero} />
                <Opt name="fuero" val="licencia" curr={fuero} label="Tiene licencia médica activa" onSelect={setFuero} />
                <Opt name="fuero" val="fuero" curr={fuero} label="Tiene fuero laboral" onSelect={setFuero} />
                <Opt name="fuero" val="nosabe" curr={fuero} label="No estoy seguro" onSelect={setFuero} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={{ padding: '10px 20px', border: '1.5px solid #D1CFC7', borderRadius: '10px', background: '#fff', color: '#6B6B6E', fontSize: '14px', cursor: 'pointer' }}>← Atrás</button>
                <button onClick={irResultado} disabled={saving} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', background: '#0B3D6B', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .6 : 1 }}>
                  {saving ? 'Guardando...' : 'Ver diagnóstico →'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && items.length > 0 && (
            <div>
              <div style={{ background: 'linear-gradient(135deg,#071F36,#0B3D6B)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 90% 10%,rgba(0,200,150,.18),transparent 60%)' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontFamily: 'serif', fontSize: '1.4rem', color: '#fff', marginBottom: '.25rem' }}>Diagnóstico del Finiquito</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', marginBottom: '1.25rem' }}>{nombre} · Guardado en base de datos ✓</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                    {[{ n: items.filter(i => i.s === 'r').length, l: 'Error', c: '#FDA4A4' }, { n: items.filter(i => i.s === 'a').length, l: 'Atención', c: '#FCD34D' }, { n: items.filter(i => i.s === 'v').length, l: 'OK', c: '#00C896' }].map(s => (
                      <div key={s.l} style={{ background: 'rgba(255,255,255,.08)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'serif', fontSize: '2rem', fontWeight: 500, color: s.c }}>{s.n}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.45)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {items.map((item, i) => (
                <div key={i} style={{ background: item.s === 'r' ? '#FDEAEA' : item.s === 'a' ? '#FEF3C7' : '#DCFCE7', border: `1.5px solid ${item.s === 'r' ? '#FBBCBC' : item.s === 'a' ? '#FCD34D' : '#86EFAC'}`, borderRadius: '10px', padding: '13px 15px', marginBottom: '7px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '3px' }}>{item.t}</div>
                    <div style={{ fontSize: '12px', color: '#6B6B6E' }}>{item.d}</div>
                  </div>
                  <Badge variant={item.s}>{item.s === 'r' ? 'Error' : item.s === 'a' ? 'Verificar' : 'OK'}</Badge>
                </div>
              ))}
              <button onClick={reset} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '.75rem', fontSize: '12px', color: '#6B6B6E', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Validar otro finiquito
              </button>
            </div>
          )}
        </div>

        <div>
          <SectionLabel text="Historial" />
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>
            {finis.length === 0
              ? <div style={{ padding: '1.5rem', fontSize: '13px', color: '#6B6B6E', textAlign: 'center' }}>Sin finiquitos registrados</div>
              : finis.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1.25rem', borderBottom: '1px solid #F4F3EF', fontSize: '13px' }}>
                  <div>
                    <div style={{ fontWeight: 500, color: '#18181A' }}>{f.trabajador_nombre}</div>
                    <div style={{ fontSize: '11px', color: '#6B6B6E' }}>{f.causal} · {fmt(f.monto_total)} · {fmtF(f.created_at?.split('T')[0])}</div>
                  </div>
                  <Badge variant={f.estado === 'validado' || f.estado === 'firmado' ? 'v' : f.estado === 'error' ? 'r' : 'g'}>{f.estado}</Badge>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// IMPORTANTE: este componente vive FUERA de FiniquitosPage a propósito.
// Si se define dentro del cuerpo del componente padre, React lo recrea
// en cada render (cada tecla escrita dispara un render por el setState),
// lo que desmonta y vuelve a montar el <input>, perdiendo el foco.
// Por eso antes solo dejaba escribir una letra a la vez.
function INP({ label, type = 'text', value, onChange, placeholder = '' }: any) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>{label}</div>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px', color: '#18181A', background: '#fff', outline: 'none' }} />
    </div>
  )
}
