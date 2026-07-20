'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Topbar, CardHeader } from '@/components/ui/Layout'

export default function ConfigPage() {
  const { empresa, empresaId, refreshEmpresa } = useAuth()
  const [form, setForm] = useState({ nombre: '', rut: '', tipo: '', capital: 0, acciones_total: 1000, rep_legal: '', domicilio: '', giro: '', plan: 'starter' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (empresa) {
      const e: any = empresa
      setForm({ nombre: e.nombre || '', rut: e.rut || '', tipo: e.tipo || '', capital: e.capital || 0, acciones_total: e.acciones_total || 1000, rep_legal: e.rep_legal || '', domicilio: e.domicilio || '', giro: e.giro || '', plan: e.plan || 'starter' })
    }
  }, [empresa])

  async function guardar() {
    if (!empresaId) return
    setSaving(true)
    await supabase.from('empresas').update(form).eq('id', empresaId)
    await refreshEmpresa()
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <Topbar title="⚙️ Configuración" sub="Datos de la empresa" />
      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '900px' }}>
        {saved && <div style={{ gridColumn: '1/-1', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#16A34A' }}>✓ Guardado correctamente</div>}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>
          <CardHeader title="Datos de la empresa" />
          <div style={{ padding: '1.25rem' }}>
            <Inp label="Razón social" value={form.nombre} onChange={(e: any) => setForm(p => ({ ...p, nombre: e.target.value }))} />
            <Inp label="RUT" value={form.rut} onChange={(e: any) => setForm(p => ({ ...p, rut: e.target.value }))} />
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>Tipo societario</div>
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                <option>Sociedad por Acciones (SpA)</option><option>Sociedad Anónima Cerrada</option><option>Sociedad de Responsabilidad Limitada</option><option>Empresa Individual</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Inp label="Capital social (CLP)" type="number" value={form.capital} onChange={(e: any) => setForm(p => ({ ...p, capital: parseFloat(e.target.value) || 0 }))} />
              <Inp label="Acciones emitidas" type="number" value={form.acciones_total} onChange={(e: any) => setForm(p => ({ ...p, acciones_total: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>
          <CardHeader title="Datos operacionales" />
          <div style={{ padding: '1.25rem' }}>
            <Inp label="Representante legal" value={form.rep_legal} onChange={(e: any) => setForm(p => ({ ...p, rep_legal: e.target.value }))} />
            <Inp label="Domicilio" value={form.domicilio} onChange={(e: any) => setForm(p => ({ ...p, domicilio: e.target.value }))} />
            <Inp label="Giro" value={form.giro} onChange={(e: any) => setForm(p => ({ ...p, giro: e.target.value }))} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>Plan</div>
              <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                <option value="starter">Starter — $299.000/mes</option><option value="professional">Professional — $699.000/mes</option><option value="enterprise">Enterprise — A medida</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <button onClick={guardar} disabled={saving} style={{ padding: '12px 32px', background: '#0B3D6B', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .6 : 1 }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Fuera del componente padre por la misma razón que en finiquitos:
// definirlo adentro causa que el input pierda el foco en cada tecla.
function Inp({ label, value, onChange, type = 'text' }: any) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>{label}</div>
      <input type={type} value={value} onChange={onChange}
        style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px', color: '#18181A', background: '#fff', outline: 'none' }} />
    </div>
  )
}
