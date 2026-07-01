'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Sidebar from '@/components/layout/Sidebar'
import AsistenteLegal from '@/components/ui/AsistenteLegal'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A1628' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: '600', color: '#fff', letterSpacing: '-.01em', marginBottom: '24px' }}>
          norm<span style={{ color: '#00B87A' }}>via</span>
        </div>
        <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,.1)', borderTopColor: '#00B87A', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF8' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <AsistenteLegal />
    </div>
  )
}
