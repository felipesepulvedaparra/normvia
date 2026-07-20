'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { fmt, fmtF } from '@/lib/db'
import { useRouter } from 'next/navigation'
import { Topbar, SectionLabel } from '@/components/ui/Layout'
import Badge from '@/components/ui/Badge'
import { getPaisConfig } from '@/lib/paises'

// Contador animado
function AnimatedNum({ target, suffix = '' }: { target: number, suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef(false)
  useEffect(() => {
    if (ref.current || target === 0) { setVal(target); return }
    ref.current = true
    const dur = 800, steps = 40, inc = target / steps
    let cur = 0, i = 0
    const t = setInterval(() => {
      i++; cur += inc
      setVal(Math.min(Math.round(cur), target))
      if (i >= steps) clearInterval(t)
    }, dur / steps)
    return () => clearInterval(t)
  }, [target])
  return <>{val}{suffix}</>
}

// Barra de cumplimiento por módulo
function ComplianceBar({ score, label, icon, href, onClick }: any) {
  const color = score === null ? '#D0D0DC' : score >= 70 ? '#00B87A' : score >= 40 ? '#F59E0B' : '#E5484D'
  const [hovered, setHovered] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#F8F8FB' : '#fff', borderRadius: '10px', border: `1px solid ${hovered ? '#0A1628' : '#EBEBF0'}`, padding: '14px 16px', cursor: 'pointer', transition: 'all .15s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628', letterSpacing: '-.01em' }}>{label}</span>
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: '600', color }}>
          {score === null ? '—' : score + '%'}
        </span>
      </div>
      <div style={{ height: '4px', background: '#F0F0F5', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '4px', width: `${score || 0}%`, background: color, borderRadius: '2px', transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { empresaId, empresa, pais, loading: authLoading } = useAuth()
  const [alertas, setAlertas] = useState<any[]>([])
  const [finiquitos, setFiniquitos] = useState<any[]>([])
  const [scores, setScores] = useState<Record<string, number | null>>({})
  const [contratistas, setContratistas] = useState<any[]>([])
  const [denuncias, setDenuncias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const config = getPaisConfig(pais)

  useEffect(() => {
    if (authLoading) return
    if (!empresaId) { setLoading(false); return }
    cargar()
  }, [empresaId, authLoading])

  async function cargar() {
    if (!empresaId) return
    setLoading(true)
    const [a, f, d, c, den] = await Promise.all([
      supabase.from('alertas').select('*').eq('empresa_id', empresaId).eq('resuelta', false).order('created_at', { ascending: false }).limit(6),
      supabase.from('finiquitos').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false }).limit(5),
      supabase.from('diagnosticos').select('modulo, score, created_at').eq('empresa_id', empresaId).order('created_at', { ascending: false }),
      supabase.from('contratistas').select('*').eq('empresa_id', empresaId).eq('activo', true),
      supabase.from('denuncias_karin').select('estado').eq('empresa_id', empresaId),
    ])
    setAlertas(a.data || [])
    setFiniquitos(f.data || [])
    setContratistas(c.data || [])
    setDenuncias(den.data || [])

    // Score más reciente por módulo
    const sc: Record<string, number | null> = {}
    for (const row of (d.data || [])) {
      if (!sc[row.modulo]) sc[row.modulo] = row.score
    }
    setScores(sc)
    setLoading(false)
  }

  async function resolver(id: string) {
    await supabase.from('alertas').update({ resuelta: true, fecha_resolucion: new Date().toISOString() }).eq('id', id)
    cargar()
  }

  const hoy = new Date()
  const vencidos = contratistas.filter(c => c.fecha_vencimiento_f30 && new Date(c.fecha_vencimiento_f30) < hoy)
  const alertasRiesgo = alertas.filter(a => a.severidad === 'riesgo').length
  const denunciasActivas = denuncias.filter(d => d.estado === 'recibida' || d.estado === 'en_investigacion').length
  const allScores = Object.values(scores).filter(s => s !== null) as number[]
  const scoreGlobal = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0

  if (authLoading || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FAFAF8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '28px', height: '28px', border: '2px solid #EBEBF0', borderTopColor: '#0A1628', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: '13px', color: '#8B8FA8' }}>Cargando...</div>
      </div>
    </div>
  )

  if (!empresaId) return (
    <div>
      <Topbar title="Dashboard" />
      <div style={{ padding: '28px' }}>
        <div style={{ background: '#FFFBEB', border: '1px solid #F59E0B', borderRadius: '10px', padding: '16px 20px', fontSize: '13px', color: '#92400E', maxWidth: '560px' }}>
          ⚠️ Tu cuenta no está vinculada a ninguna empresa. Contacta a soporte en contacto@normvia.cl
        </div>
      </div>
    </div>
  )

  const scoreColor = scoreGlobal >= 70 ? '#00B87A' : scoreGlobal >= 40 ? '#F59E0B' : '#E5484D'

  return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Topbar title="Dashboard"
        sub={`${config.bandera} ${(empresa as any)?.nombre}`}
        action={
          <button onClick={() => router.push('/dashboard/finiquitos')}
            style={{ padding: '6px 14px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', letterSpacing: '-.01em' }}>
            + Nuevo diagnóstico
          </button>
        }
      />

      <div style={{ padding: '24px 28px', animation: 'fadeUp .4s ease' }}>

        {/* HERO — Score global + alertas clave */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', marginBottom: '24px' }}>

          {/* Score ring */}
          <div style={{ background: '#0A1628', borderRadius: '14px', padding: '28px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: `rgba(${scoreGlobal >= 70 ? '0,184,122' : scoreGlobal >= 40 ? '245,158,11' : '229,72,77'},.1)` }} />
            <div>
              <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: '16px' }}>Score de cumplimiento</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '4rem', fontWeight: '600', color: scoreColor, lineHeight: 1, letterSpacing: '-.04em' }}>
                <AnimatedNum target={scoreGlobal} suffix="%" />
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.35)', marginTop: '8px' }}>
                {allScores.length === 0 ? 'Sin diagnósticos aún' : `Basado en ${allScores.length} módulo${allScores.length > 1 ? 's' : ''}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.3rem', fontWeight: '600', color: alertasRiesgo > 0 ? '#E5484D' : '#00B87A' }}><AnimatedNum target={alertasRiesgo} /></div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.3)', marginTop: '2px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Riesgo</div>
              </div>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.3rem', fontWeight: '600', color: denunciasActivas > 0 ? '#F59E0B' : '#00B87A' }}><AnimatedNum target={denunciasActivas} /></div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.3)', marginTop: '2px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Denuncias</div>
              </div>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.3rem', fontWeight: '600', color: vencidos.length > 0 ? '#E5484D' : '#00B87A' }}><AnimatedNum target={vencidos.length} /></div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.3)', marginTop: '2px', letterSpacing: '.04em', textTransform: 'uppercase' }}>F30 venc.</div>
              </div>
            </div>
          </div>

          {/* Alertas */}
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #EBEBF0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0A1628', letterSpacing: '-.01em' }}>Alertas activas</div>
              <span onClick={() => router.push('/dashboard/alertas')} style={{ fontSize: '12px', color: '#6366F1', cursor: 'pointer', fontWeight: '500' }}>Ver todas →</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {alertas.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#00B87A' }}>Sin alertas activas</div>
                  <div style={{ fontSize: '12px', color: '#B0B4C8', marginTop: '4px' }}>Tu empresa está al día</div>
                </div>
              ) : alertas.map(a => (
                <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid #F5F5F8', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '3px', alignSelf: 'stretch', borderRadius: '2px', background: a.severidad === 'riesgo' ? '#E5484D' : '#F59E0B', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628', marginBottom: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titulo}</div>
                    <div style={{ fontSize: '11px', color: '#8B8FA8' }}>{a.descripcion}</div>
                  </div>
                  <button onClick={() => resolver(a.id)} style={{ padding: '4px 10px', background: '#F0FDF8', border: '1px solid #00B87A', borderRadius: '6px', fontSize: '11px', color: '#047857', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit', fontWeight: '500' }}>Resolver</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MÓDULOS con barra de cumplimiento */}
        <SectionLabel text="Estado de cumplimiento por módulo" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '24px' }}>
          {config.modulos.map(m => (
            <ComplianceBar
              key={m.key}
              icon={m.icon}
              label={m.title}
              score={scores[m.key] ?? null}
              href={'/dashboard/' + m.key}
              onClick={() => router.push('/dashboard/' + m.key)}
            />
          ))}
        </div>

        {/* BOTTOM — finiquitos + actividad reciente */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Finiquitos */}
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0A1628' }}>Últimos {config.finiquito.nombre.toLowerCase()}s</div>
              <span onClick={() => router.push('/dashboard/finiquitos')} style={{ fontSize: '12px', color: '#6366F1', cursor: 'pointer', fontWeight: '500' }}>Ver todos →</span>
            </div>
            {finiquitos.length === 0
              ? <div style={{ padding: '20px', fontSize: '12px', color: '#8B8FA8', textAlign: 'center' }}>Sin registros</div>
              : finiquitos.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', borderBottom: '1px solid #F5F5F8' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628', letterSpacing: '-.01em' }}>{f.trabajador_nombre}</div>
                    <div style={{ fontSize: '11px', color: '#8B8FA8', fontFamily: "'DM Mono', monospace", marginTop: '1px' }}>{fmt(f.monto_total)} {config.moneda}</div>
                  </div>
                  <Badge variant={f.estado === 'validado' ? 'v' : f.estado === 'error' ? 'r' : 'g'}>{f.estado}</Badge>
                </div>
              ))
            }
          </div>

          {/* Accesos rápidos */}
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #EBEBF0', padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0A1628', marginBottom: '16px', letterSpacing: '-.01em' }}>Acciones rápidas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: '⚖️', label: `Nuevo diagnóstico ${config.karin.nombre}`, href: 'karin', color: '#6366F1' },
                { icon: '📄', label: `Validar ${config.finiquito.nombre.toLowerCase()}`, href: 'finiquitos', color: '#00B87A' },
                { icon: '📥', label: 'Registrar denuncia anónima', href: 'karin', color: '#E5484D' },
                { icon: '🏛️', label: 'Convocar asamblea', href: 'societario', color: '#F59E0B' },
                { icon: '⚡', label: 'Resolución de conflicto societario', href: 'societario', color: '#8B5CF6' },
              ].map(a => (
                <div key={a.label} onClick={() => router.push('/dashboard/' + a.href)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #EBEBF0', cursor: 'pointer', transition: 'all .12s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = '#F8F8FB' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBEBF0'; e.currentTarget.style.background = '#fff' }}>
                  <span style={{ fontSize: '15px' }}>{a.icon}</span>
                  <span style={{ fontSize: '13px', color: '#0A1628', fontWeight: '400', letterSpacing: '-.01em' }}>{a.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#D0D0DC' }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
