'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { fmt, fmtF } from '@/lib/db'
import { useRouter } from 'next/navigation'
import { Topbar, CardHeader, SectionLabel } from '@/components/ui/Layout'
import Badge from '@/components/ui/Badge'

export default function Dashboard() {
  const { empresaId, empresa, loading: authLoading } = useAuth()
  const [alertas, setAlertas] = useState<any[]>([])
  const [finiquitos, setFiniquitos] = useState<any[]>([])
  const [diagnosticos, setDiagnosticos] = useState<any[]>([])
  const [contratistas, setContratistas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!empresaId) { setLoading(false); return }
    cargar()
  }, [empresaId, authLoading])

  async function cargar() {
    if (!empresaId) return
    setLoading(true)
    const [a, f, d, c] = await Promise.all([
      supabase.from('alertas').select('*').eq('empresa_id', empresaId).eq('resuelta', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('finiquitos').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false }).limit(5),
      supabase.from('diagnosticos').select('score').eq('empresa_id', empresaId).order('created_at', { ascending: false }).limit(20),
      supabase.from('contratistas').select('*').eq('empresa_id', empresaId).eq('activo', true),
    ])
    setAlertas(a.data || []); setFiniquitos(f.data || [])
    setDiagnosticos(d.data || []); setContratistas(c.data || [])
    setLoading(false)
  }

  async function resolver(id: string) {
    await supabase.from('alertas').update({ resuelta: true, fecha_resolucion: new Date().toISOString() }).eq('id', id)
    cargar()
  }

  const scoreGlobal = diagnosticos.length ? Math.round(diagnosticos.reduce((s, d) => s + (d.score || 0), 0) / diagnosticos.length) : 0
  const hoy = new Date()
  const vencidos = contratistas.filter(c => c.fecha_vencimiento_f30 && new Date(c.fecha_vencimiento_f30) < hoy)
  const alertasRiesgo = alertas.filter(a => a.severidad === 'riesgo').length
  const alertasAtencion = alertas.filter(a => a.severidad === 'atencion').length

  if (authLoading || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FAFAF8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid #EBEBF0', borderTopColor: '#0A1628', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontSize: '13px', color: '#8B8FA8' }}>Cargando...</div>
      </div>
    </div>
  )

  if (!empresaId) return (
    <div>
      <Topbar title="Dashboard" />
      <div style={{ padding: '28px' }}>
        <div style={{ background: '#FFFBEB', border: '1px solid #F59E0B', borderRadius: '10px', padding: '16px 20px', fontSize: '13px', color: '#92400E', maxWidth: '560px', lineHeight: '1.6' }}>
          ⚠️ Tu cuenta no está vinculada a ninguna empresa. Contacta a soporte en contacto@normvia.cl
        </div>
      </div>
    </div>
  )

  const MODULOS = [
    { href: 'karin', icon: '⚖️', title: 'Ley Karin', sub: 'Prevención de acoso' },
    { href: 'horas', icon: '◷', title: 'Ley 40 Horas', sub: 'Jornada vigente 42h' },
    { href: 'finiquitos', icon: '◈', title: 'Finiquitos', sub: 'Validación pre-firma' },
    { href: 'subcontratacion', icon: '◎', title: 'Subcontratación', sub: 'F30 y F30-1' },
    { href: 'documentacion', icon: '◱', title: 'Documentación', sub: 'Contratos y anexos' },
    { href: 'societario', icon: '◉', title: 'Societario', sub: 'Accionistas y asambleas' },
  ]

  return (
    <div>
      <Topbar title="Dashboard"
        sub={(empresa as any)?.nombre}
        action={
          <button onClick={() => router.push('/dashboard/finiquitos')}
            style={{ padding: '6px 14px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', letterSpacing: '-.01em' }}>
            + Nuevo diagnóstico
          </button>
        }
      />
      <div style={{ padding: '24px 28px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Riesgo alto', value: alertasRiesgo, mono: true, color: alertasRiesgo > 0 ? '#E5484D' : '#00B87A', desc: 'Alertas críticas activas' },
            { label: 'Atención', value: alertasAtencion, mono: true, color: alertasAtencion > 0 ? '#F59E0B' : '#00B87A', desc: 'Requieren revisión' },
            { label: 'Score global', value: scoreGlobal ? scoreGlobal + '%' : '—', mono: true, color: '#0A1628', desc: 'Promedio de módulos' },
            { label: 'F30 vencidos', value: vencidos.length, mono: true, color: vencidos.length > 0 ? '#E5484D' : '#00B87A', desc: 'Contratistas activos' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #EBEBF0' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#8B8FA8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '10px' }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '26px', fontWeight: '500', color: s.color, letterSpacing: '-.03em', lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#B0B4C8' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Módulos */}
        <SectionLabel text="Módulos" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '28px' }}>
          {MODULOS.map(m => (
            <div key={m.href} onClick={() => router.push('/dashboard/' + m.href)}
              style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', padding: '16px 18px', cursor: 'pointer', transition: 'all .12s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0A1628'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(10,22,40,.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBEBF0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ fontSize: '18px', marginBottom: '8px', lineHeight: 1 }}>{m.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628', marginBottom: '2px', letterSpacing: '-.01em' }}>{m.title}</div>
              <div style={{ fontSize: '11px', color: '#B0B4C8' }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
          {/* Alertas */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
            <CardHeader title="Alertas activas" action={<span onClick={() => router.push('/dashboard/alertas')} style={{ fontSize: '12px', color: '#6366F1', cursor: 'pointer', fontWeight: '500' }}>Ver todas →</span>} />
            {alertas.length === 0
              ? <div style={{ padding: '20px', fontSize: '12px', color: '#00B87A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00B87A' }} />
                  Sin alertas activas
                </div>
              : alertas.map(a => (
                <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid #F5F5F8', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '3px', height: '36px', borderRadius: '2px', background: a.severidad === 'riesgo' ? '#E5484D' : '#F59E0B', flexShrink: 0, marginTop: '1px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628', marginBottom: '2px' }}>{a.titulo}</div>
                    <div style={{ fontSize: '11px', color: '#8B8FA8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.descripcion}</div>
                  </div>
                  <button onClick={() => resolver(a.id)} style={{ fontSize: '11px', padding: '3px 8px', background: '#F0FDF8', border: '1px solid #00B87A', borderRadius: '5px', cursor: 'pointer', color: '#047857', flexShrink: 0, fontFamily: 'inherit' }}>
                    Resolver
                  </button>
                </div>
              ))
            }
          </div>

          {/* Finiquitos */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
            <CardHeader title="Últimos finiquitos" action={<span onClick={() => router.push('/dashboard/finiquitos')} style={{ fontSize: '12px', color: '#6366F1', cursor: 'pointer', fontWeight: '500' }}>Ver todos →</span>} />
            {finiquitos.length === 0
              ? <div style={{ padding: '20px', fontSize: '12px', color: '#8B8FA8' }}>Sin finiquitos registrados</div>
              : finiquitos.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #F5F5F8', fontSize: '13px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#0A1628', letterSpacing: '-.01em' }}>{f.trabajador_nombre}</div>
                    <div style={{ fontSize: '11px', color: '#8B8FA8', fontFamily: "'DM Mono', monospace", marginTop: '1px' }}>{fmt(f.monto_total)}</div>
                  </div>
                  <Badge variant={f.estado === 'validado' ? 'v' : f.estado === 'error' ? 'r' : 'g'}>{f.estado}</Badge>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
