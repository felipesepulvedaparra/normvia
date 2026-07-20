'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function doLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) { setError('Email o contraseña incorrectos.'); setLoading(false); return }
    router.push('/dashboard')
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #E2E2EC', borderRadius: '8px', fontSize: '14px', color: '#0A1628', background: '#FAFAF8', outline: 'none', transition: 'border-color .15s' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '5px', letterSpacing: '.04em', textTransform: 'uppercase' }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ background: '#0A1628', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(0,184,122,.05)' }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '64px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#00B87A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0A1628' }}>N</span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff', letterSpacing: '-.02em' }}>normvia</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: '#fff', lineHeight: '1.2', letterSpacing: '-.03em', marginBottom: '16px', maxWidth: '320px' }}>
            Cumplimiento laboral<br />sin sorpresas.
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)', lineHeight: '1.7', maxWidth: '300px' }}>
            Plataforma de auditoría laboral y societaria preventiva para empresas en Chile y Colombia.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { num: '60 UTM', label: 'multa máxima por infracción grave · Chile' },
            { num: '200 SMMLV', label: 'sanción máxima acoso laboral · Colombia' },
            { num: '40%', label: 'de finiquitos y liquidaciones con errores' },
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', fontWeight: '500', color: '#00B87A', minWidth: '90px' }}>{s.num}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#0A1628', letterSpacing: '-.02em', marginBottom: '6px' }}>Bienvenido</h1>
            <p style={{ fontSize: '13px', color: '#8B8FA8', lineHeight: 1.5 }}>
              Ingresa con las credenciales que te entregó tu administrador de Normvia.
            </p>
          </div>

          {error && <div style={{ background: '#FFF5F5', border: '1px solid #FECDD3', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#C4183C', marginBottom: '20px' }}>{error}</div>}

          <form onSubmit={doLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={lbl}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@empresa.cl" required style={inp} onFocus={e => (e.target.style.borderColor = '#0A1628')} onBlur={e => (e.target.style.borderColor = '#E2E2EC')} /></div>
            <div><label style={lbl}>Contraseña</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required style={inp} onFocus={e => (e.target.style.borderColor = '#0A1628')} onBlur={e => (e.target.style.borderColor = '#E2E2EC')} /></div>
            <button type="submit" disabled={loading} style={{ padding: '11px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, marginTop: '4px' }}>
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '16px', background: '#F0F0F5', borderRadius: '10px', fontSize: '12px', color: '#8B8FA8', lineHeight: 1.6 }}>
            ¿Primera vez? Escríbenos a{' '}
            <a href="mailto:contacto@normvia.cl" style={{ color: '#0A1628', fontWeight: '600', textDecoration: 'none' }}>contacto@normvia.cl</a>
            {' '}para coordinar el acceso de tu empresa.
          </div>
          <div style={{ marginTop: '16px', fontSize: '11px', color: '#B0B4C8', lineHeight: 1.6, textAlign: 'center' }}>
            Al ingresar, aceptas nuestros{' '}
            <a href="/terminos" style={{ color: '#6B6B6E', textDecoration: 'underline' }}>Términos de uso</a>
            {' '}y{' '}
            <a href="/privacidad" style={{ color: '#6B6B6E', textDecoration: 'underline' }}>Política de privacidad</a>.
            {' '}Normvia trata tus datos conforme a la Ley N° 21.719.
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 700px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important } }`}</style>
    </div>
  )
}
