'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Topbar, CardHeader } from '@/components/ui/Layout'
import Badge from '@/components/ui/Badge'

export default function AlertasPage() {
  const { empresaId } = useAuth()
  const [alertas, setAlertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (empresaId) load() }, [empresaId])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('alertas').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false })
    setAlertas(data || []); setLoading(false)
  }

  async function resolver(id: string) {
    await supabase.from('alertas').update({ resuelta: true, fecha_resolucion: new Date().toISOString() }).eq('id', id)
    load()
  }

  async function nueva() {
    const titulo = prompt('Título de la alerta:'); if (!titulo) return
    const desc = prompt('Descripción:') || ''
    const sev = prompt('Severidad (riesgo / atencion / info):') || 'atencion'
    await supabase.from('alertas').insert({ empresa_id: empresaId, tipo: 'manual', severidad: sev, titulo, descripcion: desc })
    load()
  }

  const activas = alertas.filter(a => !a.resuelta)
  const resueltas = alertas.filter(a => a.resuelta)

  return (
    <div>
      <Topbar title="Centro de Alertas" sub={`${activas.length} activas`}
        action={<button onClick={nueva} style={{ padding: '7px 16px', background: '#0B3D6B', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>+ Agregar alerta</button>} />
      <div style={{ padding: '2rem' }}>
        {loading ? <div style={{ color: '#6B6B6E', textAlign: 'center', padding: '3rem' }}>Cargando...</div> : (
          <>
            {activas.length === 0 && <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '13px', color: '#16A34A', marginBottom: '1rem' }}>✓ No hay alertas activas. Tu empresa está al día.</div>}
            {activas.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7', marginBottom: '1rem' }}>
                <CardHeader title="🔴 Activas — acción requerida" />
                {activas.map(a => (
                  <div key={a.id} style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid #F4F3EF', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0, background: a.severidad === 'riesgo' ? '#FDEAEA' : a.severidad === 'atencion' ? '#FEF3C7' : '#E8F1FA' }}>
                      {a.severidad === 'riesgo' ? '⚠️' : a.severidad === 'atencion' ? '📋' : 'ℹ️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#18181A', marginBottom: '2px' }}>{a.titulo}</div>
                      <div style={{ fontSize: '12px', color: '#6B6B6E', marginBottom: '5px' }}>{a.descripcion}</div>
                      <Badge variant={a.severidad === 'riesgo' ? 'r' : a.severidad === 'atencion' ? 'a' : 'az'}>{a.severidad}</Badge>
                    </div>
                    <button onClick={() => resolver(a.id)} style={{ padding: '6px 14px', background: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', flexShrink: 0, fontWeight: 500 }}>Resolver ✓</button>
                  </div>
                ))}
              </div>
            )}
            {resueltas.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>
                <CardHeader title="✅ Resueltas" />
                {resueltas.slice(0, 10).map(a => (
                  <div key={a.id} style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid #F4F3EF', display: 'flex', alignItems: 'flex-start', gap: '12px', opacity: .6 }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0, background: '#DCFCE7' }}>✓</div>
                    <div><div style={{ fontSize: '13px', fontWeight: 500, color: '#18181A' }}>{a.titulo}</div><Badge variant="v">Resuelta</Badge></div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
