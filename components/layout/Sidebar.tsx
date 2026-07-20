'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const NAV = [
  { href: '/dashboard', label: 'Inicio' },
  { href: '/dashboard/alertas', label: 'Alertas' },
  { href: '/dashboard/radar', label: '🔍 Radar Normativo' },
  { href: '/dashboard/trabajadores', label: '👥 Portal Trabajador' },
  null,
  { href: '/dashboard/karin', label: 'Ley Karin' },
  { href: '/dashboard/horas', label: 'Ley 40 Horas' },
  { href: '/dashboard/finiquitos', label: 'Finiquitos' },
  { href: '/dashboard/subcontratacion', label: 'Subcontratación' },
  { href: '/dashboard/documentacion', label: 'Documentación' },
  { href: '/dashboard/societario', label: 'Societario' },
  null,
  { href: '/dashboard/configuracion', label: 'Configuración' },
]

export default function Sidebar() {
  const { empresa, signOut } = useAuth()
  const router = useRouter()
  const path = usePathname()

  return (
    <aside style={{
      width: '220px', background: '#0A1628', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', position: 'fixed',
      top: 0, left: 0, zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,.04)',
    }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#00B87A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0A1628' }}>N</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff', letterSpacing: '-.01em' }}>normvia</span>
        </div>
      </div>

      <nav style={{ padding: '8px 0', flex: 1, overflowY: 'auto' }}>
        {NAV.map((item, i) => {
          if (!item) return <div key={i} style={{ height: '1px', background: 'rgba(255,255,255,.04)', margin: '6px 16px' }} />
          const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href))
          return (
            <div key={item.href} onClick={() => router.push(item.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px',
                fontSize: '13px', cursor: 'pointer', margin: '1px 0',
                color: active ? '#fff' : 'rgba(255,255,255,.38)',
                background: active ? 'rgba(255,255,255,.06)' : 'transparent',
                borderLeft: active ? '2px solid #00B87A' : '2px solid transparent',
                fontWeight: active ? '500' : '400', transition: 'all .1s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,.65)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,.38)' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: active ? '#00B87A' : 'rgba(255,255,255,.15)', flexShrink: 0 }} />
              {item.label}
            </div>
          )
        })}
        <div onClick={signOut}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', fontSize: '13px', color: 'rgba(255,255,255,.22)', cursor: 'pointer', marginTop: '4px' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.22)')}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,.1)', flexShrink: 0 }} />
          Cerrar sesión
        </div>
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00B87A', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,.6)', lineHeight: 1.2 }}>{(empresa as any)?.nombre || 'Mi Empresa'}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.22)', marginTop: '1px' }}>Plan {(empresa as any)?.plan || 'Starter'}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
