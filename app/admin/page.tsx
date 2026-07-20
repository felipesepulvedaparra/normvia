'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'normvia-admin-2026'

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [clave, setClave] = useState('')
  const [err, setErr] = useState(false)
  const [nombre, setNombre] = useState(''); const [rut, setRut] = useState('')
  const [tipo, setTipo] = useState('Sociedad por Acciones (SpA)'); const [pais, setPais] = useState('CL')
  const [plan, setPlan] = useState('starter'); const [repLegal, setRepLegal] = useState('')
  const [uNombre, setUNombre] = useState(''); const [uEmail, setUEmail] = useState('')
  const [uPass, setUPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean, msg: string } | null>(null)
  const [empresas, setEmpresas] = useState<any[]>([])

  function verificar(e: React.FormEvent) {
    e.preventDefault()
    if (clave === ADMIN_KEY) { setAuth(true); cargar() }
    else { setErr(true); setTimeout(() => setErr(false), 2000) }
  }

  async function cargar() {
    const { data } = await supabase.from('empresas').select('id,nombre,pais,plan,created_at').order('created_at', { ascending: false }).limit(30)
    setEmpresas(data || [])
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre || !rut || !uEmail || !uPass || !uNombre) { setResultado({ ok: false, msg: 'Completa todos los campos.' }); return }
    setLoading(true); setResultado(null)
    try {
      const { data: a, error: ae } = await supabase.auth.signUp({ email: uEmail, password: uPass })
      if (ae) throw new Error(ae.message)
      if (!a.user) throw new Error('No se pudo crear el usuario.')
      const { data: emp, error: ee } = await supabase.from('empresas').insert({ nombre, rut, tipo, pais, plan, rep_legal: repLegal }).select().single()
      if (ee) throw new Error(ee.message)
      const { error: ue } = await supabase.from('usuarios').insert({ empresa_id: emp.id, auth_id: a.user.id, nombre: uNombre, email: uEmail, rol: 'admin' })
      if (ue) throw new Error(ue.message)
      await supabase.from('estatutos').insert({ empresa_id: emp.id, version: 1 })
      setResultado({ ok: true, msg: `✓ Empresa "${nombre}" creada. ${uEmail} ya puede ingresar.` })
      setNombre(''); setRut(''); setRepLegal(''); setUNombre(''); setUEmail(''); setUPass('')
      cargar()
    } catch (e: any) { setResultado({ ok: false, msg: e.message }) }
    setLoading(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 13px', border: '1px solid #E2E2EC', borderRadius: '7px', fontSize: '13px', color: '#0A1628', background: '#fff', outline: 'none' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: '600', color: '#6B6B6E', marginBottom: '4px', letterSpacing: '.04em', textTransform: 'uppercase' }

  if (!auth) return (
    <div style={{ minHeight: '100vh', background: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '340px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#0A1628', marginBottom: '4px' }}>Panel Admin</div>
        <div style={{ fontSize: '12px', color: '#8B8FA8', marginBottom: '24px' }}>Normvia — Acceso restringido</div>
        <form onSubmit={verificar}>
          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Clave de acceso</label>
            <input type="password" value={clave} onChange={e => setClave(e.target.value)} placeholder="••••••••••" style={{ ...inp, borderColor: err ? '#E5484D' : '#E2E2EC' }} autoFocus />
            {err && <div style={{ fontSize: '11px', color: '#E5484D', marginTop: '4px' }}>Clave incorrecta</div>}
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Ingresar →</button>
        </form>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', padding: '2rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#00B87A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0A1628' }}>N</span>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#0A1628' }}>Panel de Administración</div>
            <div style={{ fontSize: '11px', color: '#8B8FA8' }}>Normvia · Gestión de empresas y accesos</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #EBEBF0', padding: '1.5rem' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0A1628', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #F0F0F5' }}>+ Crear empresa</div>
            <form onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366F1', letterSpacing: '.06em', textTransform: 'uppercase' }}>Empresa</div>
              <div><label style={lbl}>Razón social *</label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Mi Empresa" style={inp} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={lbl}>RUT *</label><input type="text" value={rut} onChange={e => setRut(e.target.value)} placeholder="76.000.000-0" style={inp} /></div>
                <div><label style={lbl}>País</label>
                  <select value={pais} onChange={e => setPais(e.target.value)} style={{ ...inp, appearance: 'none' as any }}>
                    <option value="CL">🇨🇱 Chile</option>
                    <option value="CO">🇨🇴 Colombia</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={lbl}>Tipo</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ ...inp, appearance: 'none' as any }}>
                    {pais === 'CL' ? <><option>Sociedad por Acciones (SpA)</option><option>Sociedad Anónima Cerrada</option><option>Sociedad de Responsabilidad Limitada</option></> : <><option>Sociedad por Acciones Simplificada (SAS)</option><option>Sociedad de Responsabilidad Limitada (Ltda)</option><option>Sociedad Anónima (SA)</option></>}
                  </select>
                </div>
                <div><label style={lbl}>Plan</label>
                  <select value={plan} onChange={e => setPlan(e.target.value)} style={{ ...inp, appearance: 'none' as any }}>
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
              <div><label style={lbl}>Rep. legal</label><input type="text" value={repLegal} onChange={e => setRepLegal(e.target.value)} placeholder="Nombre completo" style={inp} /></div>

              <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366F1', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: '.25rem' }}>Usuario admin</div>
              <div><label style={lbl}>Nombre *</label><input type="text" value={uNombre} onChange={e => setUNombre(e.target.value)} placeholder="Juan González" style={inp} /></div>
              <div><label style={lbl}>Email *</label><input type="email" value={uEmail} onChange={e => setUEmail(e.target.value)} placeholder="juan@empresa.cl" style={inp} /></div>
              <div><label style={lbl}>Contraseña temporal *</label><input type="text" value={uPass} onChange={e => setUPass(e.target.value)} placeholder="Mínimo 6 caracteres" style={inp} /></div>

              {resultado && <div style={{ background: resultado.ok ? '#F0FDF8' : '#FFF5F5', border: `1px solid ${resultado.ok ? '#00B87A' : '#E5484D'}`, borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: resultado.ok ? '#047857' : '#C4183C', lineHeight: 1.5 }}>{resultado.msg}</div>}
              <button type="submit" disabled={loading} style={{ padding: '10px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, fontFamily: 'inherit' }}>
                {loading ? 'Creando...' : 'Crear empresa y usuario →'}
              </button>
            </form>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #EBEBF0', padding: '1.5rem' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0A1628', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #F0F0F5', display: 'flex', justifyContent: 'space-between' }}>
              Empresas registradas
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#00B87A' }}>{empresas.length}</span>
            </div>
            {empresas.length === 0 ? <div style={{ fontSize: '13px', color: '#8B8FA8', textAlign: 'center', padding: '2rem 0' }}>Sin empresas</div>
              : empresas.map(e => (
                <div key={e.id} style={{ padding: '10px 0', borderBottom: '1px solid #F5F5F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#0A1628' }}>{e.nombre}</div>
                    <div style={{ fontSize: '11px', color: '#8B8FA8', marginTop: '2px' }}>{e.pais === 'CL' ? '🇨🇱' : '🇨🇴'} {e.pais} · {new Date(e.created_at).toLocaleDateString('es-CL')}</div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#E8F1FA', color: '#0A1628', fontFamily: "'DM Mono', monospace" }}>{e.plan}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '14px 18px', background: '#FFF5F5', borderRadius: '10px', fontSize: '12px', color: '#C4183C', lineHeight: 1.6 }}>
          ⚠️ Panel exclusivo del equipo Normvia. Configura <code>NEXT_PUBLIC_ADMIN_KEY</code> en Vercel para cambiar la clave de acceso.
        </div>
      </div>
    </div>
  )
}
