'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Topbar, SectionLabel } from '@/components/ui/Layout'
import Badge from '@/components/ui/Badge'

const IMPACTO_COLOR: Record<string, string> = { alto: 'r', medio: 'a', bajo: 'v' }
const IMPACTO_LABEL: Record<string, string> = { alto: 'Impacto alto', medio: 'Impacto medio', bajo: 'Impacto bajo' }
const MODULO_LABEL: Record<string, string> = {
  karin: 'Ley Karin', horas: 'Ley 40 Horas', finiquitos: 'Finiquitos',
  subcontratacion: 'Subcontratación', documentacion: 'Documentación', societario: 'Societario'
}

export default function RadarNormativoPage() {
  const { empresaId, pais } = useAuth()
  const [novedades, setNovedades] = useState<any[]>([])
  const [alertasLeidas, setAlertasLeidas] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [ejecutando, setEjecutando] = useState(false)
  const [ultimaRevision, setUltimaRevision] = useState<string | null>(null)
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => { if (empresaId) cargar() }, [empresaId, pais])

  async function cargar() {
    setLoading(true)
    // Cargar novedades del país de la empresa
    const { data: novs } = await supabase
      .from('novedades_normativas')
      .select('*')
      .contains('paises', [pais || 'CL'])
      .order('created_at', { ascending: false })
      .limit(20)

    // Cargar cuáles ya leyó esta empresa
    const { data: alertas } = await supabase
      .from('alertas_normativas')
      .select('novedad_id, leida')
      .eq('empresa_id', empresaId)

    const leidas = new Set((alertas || []).filter((a: any) => a.leida).map((a: any) => a.novedad_id))
    setNovedades(novs || [])
    setAlertasLeidas(leidas)
    if (novs && novs.length > 0) setUltimaRevision(novs[0].created_at)
    setLoading(false)
  }

  async function marcarLeida(novedadId: string) {
    await supabase.from('alertas_normativas')
      .upsert({ empresa_id: empresaId, novedad_id: novedadId, leida: true }, { onConflict: 'empresa_id,novedad_id' })
    setAlertasLeidas(prev => { const next = new Set(Array.from(prev)); next.add(novedadId); return next })
  }

  async function ejecutarMonitoreo() {
    setEjecutando(true)
    try {
      const res = await fetch(`/api/monitoreo-normativo?secret=normvia-cron-2026`)
      const data = await res.json()
      if (data.procesadas > 0) {
        await cargar()
        alert(`✓ Se detectaron ${data.procesadas} nueva(s) norma(s) relevante(s).`)
      } else {
        alert('Sin novedades normativas en las últimas 24 horas.')
      }
    } catch { alert('Error al ejecutar el monitoreo.') }
    setEjecutando(false)
  }

  const noLeidas = novedades.filter(n => !alertasLeidas.has(n.id)).length
  const altoImpacto = novedades.filter(n => n.impacto === 'alto').length

  return (
    <div>
      <Topbar
        title="🔍 Radar Normativo"
        sub="Monitoreo automático de cambios legales que afectan a tu empresa"
        action={
          <button onClick={ejecutarMonitoreo} disabled={ejecutando}
            style={{ padding: '6px 14px', background: ejecutando ? '#E2E2EC' : '#0A1628', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: ejecutando ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {ejecutando ? 'Buscando...' : '⟳ Revisar ahora'}
          </button>
        }
      />

      <div style={{ padding: '1.5rem 2rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Sin leer', value: noLeidas, color: noLeidas > 0 ? '#E5484D' : '#00B87A', desc: 'Novedades pendientes' },
            { label: 'Impacto alto', value: altoImpacto, color: altoImpacto > 0 ? '#E5484D' : '#00B87A', desc: 'Requieren acción urgente' },
            { label: 'Total detectadas', value: novedades.length, color: '#0A1628', desc: 'Últimas 20 normas' },
            { label: 'Actualización', value: 'Diaria', color: '#6366F1', desc: 'Lun a Vie · 8:00 AM' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #EBEBF0' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '22px', fontWeight: '500', color: s.color, lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#B0B4C8' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div style={{ background: '#F5F3FF', border: '1px solid #C4B5FD', borderRadius: '10px', padding: '14px 18px', fontSize: '13px', color: '#5B21B6', marginBottom: '1.5rem', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>🤖</span>
          <div>
            <strong>Radar Normativo con IA.</strong> Normvia monitorea automáticamente la Biblioteca del Congreso Nacional cada día hábil. Cuando detecta una nueva ley o decreto que afecta a tu empresa, Claude analiza su impacto y te genera una alerta en lenguaje simple — sin necesidad de leer el Diario Oficial.
            {ultimaRevision && <span style={{ color: 'rgba(91,33,182,.6)', marginLeft: '8px' }}>Última revisión: {new Date(ultimaRevision).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', fontSize: '13px', color: '#8B8FA8' }}>Cargando novedades...</div>
        ) : novedades.length === 0 ? (
          <div style={{ background: '#F0FDF8', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✓</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#047857', marginBottom: '4px' }}>Sin novedades normativas recientes</div>
            <div style={{ fontSize: '12px', color: '#6EE7B7' }}>El radar revisa automáticamente cada día hábil. Si hay cambios, aparecerán aquí.</div>
            <button onClick={ejecutarMonitoreo} disabled={ejecutando}
              style={{ marginTop: '1rem', padding: '8px 18px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {ejecutando ? 'Buscando...' : 'Buscar ahora →'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.5fr' : '1fr', gap: '1.5rem' }}>
            {/* Lista */}
            <div>
              <SectionLabel text={`Novedades normativas · ${novedades.length}`} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {novedades.map(n => {
                  const leida = alertasLeidas.has(n.id)
                  return (
                    <div key={n.id}
                      onClick={() => { setSelected(n); if (!leida) marcarLeida(n.id) }}
                      style={{ background: selected?.id === n.id ? '#F5F3FF' : '#fff', borderRadius: '10px', border: `1px solid ${selected?.id === n.id ? '#C4B5FD' : leida ? '#EBEBF0' : '#0A1628'}`, padding: '14px 16px', cursor: 'pointer', transition: 'all .12s', opacity: leida ? .75 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ flex: 1, paddingRight: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            {!leida && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#E5484D', flexShrink: 0 }} />}
                            <div style={{ fontSize: '13px', fontWeight: leida ? 400 : 600, color: '#0A1628', lineHeight: 1.3 }}>{n.titulo}</div>
                          </div>
                          <div style={{ fontSize: '11px', color: '#8B8FA8' }}>
                            {new Date(n.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
                            {n.fecha_vigencia && <span style={{ marginLeft: '8px', color: '#E5484D' }}>· Vigencia: {new Date(n.fecha_vigencia).toLocaleDateString('es-CL')}</span>}
                          </div>
                        </div>
                        <Badge variant={IMPACTO_COLOR[n.impacto] || 'g'}>{IMPACTO_LABEL[n.impacto] || n.impacto}</Badge>
                      </div>
                      {/* Módulos afectados */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {(n.modulos_afectados || []).map((m: string) => (
                          <span key={m} style={{ fontSize: '10px', padding: '2px 8px', background: '#F0F0F5', borderRadius: '4px', color: '#6B6B6E', fontFamily: "'DM Mono', monospace" }}>
                            {MODULO_LABEL[m] || m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Detalle */}
            {selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F0F0F5', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#0A1628', marginBottom: '4px', lineHeight: 1.3 }}>{selected.titulo}</div>
                      {selected.fecha_vigencia && (
                        <div style={{ fontSize: '12px', color: '#E5484D', fontWeight: '500' }}>
                          ⏱️ Vigencia: {new Date(selected.fecha_vigencia).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <Badge variant={IMPACTO_COLOR[selected.impacto] || 'g'}>{IMPACTO_LABEL[selected.impacto]}</Badge>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Qué establece</div>
                    <div style={{ fontSize: '14px', color: '#0A1628', lineHeight: 1.7, marginBottom: '1.25rem', background: '#F8F8FB', borderRadius: '8px', padding: '12px 16px' }}>
                      {selected.descripcion}
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Módulos que afecta</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      {(selected.modulos_afectados || []).map((m: string) => (
                        <span key={m} style={{ fontSize: '12px', padding: '4px 12px', background: '#E8F1FA', borderRadius: '6px', color: '#0A1628', fontWeight: '500' }}>
                          {MODULO_LABEL[m] || m}
                        </span>
                      ))}
                    </div>

                    {selected.url_fuente && (
                      <a href={selected.url_fuente} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6366F1', textDecoration: 'none', fontWeight: '500' }}>
                        Ver texto completo en BCN →
                      </a>
                    )}
                  </div>
                </div>

                {/* Acción sugerida por IA */}
                <div style={{ background: '#0A1628', borderRadius: '10px', padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #C8A96E, transparent)' }} />
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>🤖 Análisis IA</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.8)', lineHeight: 1.6 }}>
                    Esta norma fue analizada automáticamente por Normvia. Puedes consultar al <strong style={{ color: '#C8A96E' }}>Asistente Legal</strong> para entender cómo afecta específicamente a tu empresa.
                  </div>
                  <button onClick={() => setSelected(null)} style={{ marginTop: '12px', padding: '6px 14px', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.12)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    ← Volver a la lista
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
