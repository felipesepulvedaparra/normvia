'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [nombre, setNombre] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [rut, setRut] = useState('')
  const [tipo, setTipo] = useState('Sociedad por Acciones (SpA)')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  async function doLogin(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) { setError(tradErr(error.message)); setLoading(false); return }
    router.push('/dashboard')
  }

  async function doRegister(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true)
    if (pass.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return }
    try {
      const { data: auth, error: authErr } = await supabase.auth.signUp({ email, password: pass })
      if (authErr) throw authErr
      if (!auth.user) throw new Error('No se pudo crear el usuario.')
      const { data: emp, error: empErr } = await supabase.from('empresas').insert({ nombre: empresa, rut, tipo }).select().single()
      if (empErr) throw empErr
      const { error: usrErr } = await supabase.from('usuarios').insert({ empresa_id: emp.id, auth_id: auth.user.id, nombre, email, rol: 'admin' })
      if (usrErr) throw usrErr
      await supabase.from('estatutos').insert({ empresa_id: emp.id, version: 1 })
      setSuccess('Cuenta creada. Ahora puedes ingresar.'); setTab('login')
    } catch (err: any) { setError(tradErr(err.message)) }
    setLoading(false)
  }

  function tradErr(msg: string) {
    if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos.'
    if (msg.includes('already registered')) return 'Este email ya está registrado.'
    if (msg.includes('duplicate key') && msg.includes('rut')) return 'Ya existe una empresa con ese RUT.'
    return msg
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 13px', border: '1px solid #E2E2EC', borderRadius: '7px', fontSize: '13px', color: '#0A1628', background: '#FAFAF8', outline: 'none', transition: 'border-color .15s' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: '600', color: '#8B8FA8', marginBottom: '5px', letterSpacing: '.04em', textTransform: 'uppercase' }

  return (
    <div className="login-grid" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left — brand */}
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
            La plataforma que las pymes chilenas usan para saber exactamente dónde están paradas antes de que llegue la Inspección del Trabajo.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { num: '60 UTM', label: 'multa máxima DT por infracción grave' },
            { num: '40%', label: 'de finiquitos tienen errores en Chile' },
            { num: 'Vigente', label: 'Ley Karin desde agosto 2024' },
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', fontWeight: '500', color: '#00B87A', minWidth: '60px' }}>{s.num}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div style={{ background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0A1628', letterSpacing: '-.02em', marginBottom: '4px' }}>
              {tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </h1>
            <p style={{ fontSize: '13px', color: '#8B8FA8' }}>
              {tab === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
                style={{ background: 'none', border: 'none', color: '#6366F1', cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: 0, fontFamily: 'inherit' }}>
                {tab === 'login' ? 'Regístrate' : 'Ingresa'}
              </button>
            </p>
          </div>

          {error && <div style={{ background: '#FFF5F5', border: '1px solid #FECDD3', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#C4183C', marginBottom: '16px' }}>{error}</div>}
          {success && <div style={{ background: '#F0FDF8', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#047857', marginBottom: '16px' }}>{success}</div>}

          {tab === 'login' ? (
            <form onSubmit={doLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={lbl}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@empresa.cl" required style={inp} onFocus={e => (e.target.style.borderColor = '#0A1628')} onBlur={e => (e.target.style.borderColor = '#E2E2EC')} /></div>
              <div><label style={lbl}>Contraseña</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required style={inp} onFocus={e => (e.target.style.borderColor = '#0A1628')} onBlur={e => (e.target.style.borderColor = '#E2E2EC')} /></div>
              <button type="submit" disabled={loading} style={{ padding: '10px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, marginTop: '4px', letterSpacing: '-.01em' }}>
                {loading ? 'Ingresando...' : 'Ingresar →'}
              </button>
            </form>
          ) : (
            <form onSubmit={doRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={lbl}>Tu nombre</label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Juan González" required style={inp} onFocus={e => (e.target.style.borderColor = '#0A1628')} onBlur={e => (e.target.style.borderColor = '#E2E2EC')} /></div>
                <div><label style={lbl}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@empresa.cl" required style={inp} onFocus={e => (e.target.style.borderColor = '#0A1628')} onBlur={e => (e.target.style.borderColor = '#E2E2EC')} /></div>
              </div>
              <div><label style={lbl}>Contraseña</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Mínimo 6 caracteres" required style={inp} onFocus={e => (e.target.style.borderColor = '#0A1628')} onBlur={e => (e.target.style.borderColor = '#E2E2EC')} /></div>
              <div><label style={lbl}>Nombre de la empresa</label><input type="text" value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Mi Empresa SpA" required style={inp} onFocus={e => (e.target.style.borderColor = '#0A1628')} onBlur={e => (e.target.style.borderColor = '#E2E2EC')} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={lbl}>RUT empresa</label><input type="text" value={rut} onChange={e => setRut(e.target.value)} placeholder="76.000.000-0" required style={inp} onFocus={e => (e.target.style.borderColor = '#0A1628')} onBlur={e => (e.target.style.borderColor = '#E2E2EC')} /></div>
                <div><label style={lbl}>Tipo</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)} style={{...inp, appearance: 'none'}}>
                    <option>Sociedad por Acciones (SpA)</option>
                    <option>Sociedad Anónima Cerrada</option>
                    <option>Sociedad de Responsabilidad Limitada</option>
                    <option>Empresa Individual</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ padding: '10px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, marginTop: '4px', letterSpacing: '-.01em' }}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
              </button>
            </form>
          )}
          <p style={{ fontSize: '11px', color: '#B0B4C8', textAlign: 'center', marginTop: '20px' }}>30 días gratis · Sin tarjeta de crédito</p>
        </div>
      </div>
    </div>
  )
}
