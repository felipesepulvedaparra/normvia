'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { fmtF, diasHasta } from '@/lib/db'
import { Topbar, CardHeader } from '@/components/ui/Layout'
import Badge from '@/components/ui/Badge'

export default function DocumentacionPage() {
  const { empresaId } = useAuth()
  const [docs, setDocs] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', tipo: 'contrato', trabajador_nombre: '', fecha_documento: '', fecha_vencimiento: '', firmado: false, notas: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (empresaId) cargar() }, [empresaId])
  async function cargar() {
    const { data } = await supabase.from('documentos').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false })
    setDocs(data || [])
    await chequearVencidos(data || [])
  }

  // Igual que en Subcontratación: revisa solo, sin intervención manual,
  // si hay documentos vencidos sin alerta activa, y la crea.
  async function chequearVencidos(documentos: any[]) {
    const vencidosHoy = documentos.filter(d => {
      const dd = diasHasta(d.fecha_vencimiento)
      return dd !== null && dd < 0
    })
    if (vencidosHoy.length === 0) return

    const { data: alertasActivas } = await supabase
      .from('alertas')
      .select('titulo')
      .eq('empresa_id', empresaId)
      .eq('tipo', 'documentacion')
      .eq('resuelta', false)

    const titulosExistentes = new Set((alertasActivas || []).map(a => a.titulo))

    for (const d of vencidosHoy) {
      const titulo = `Documento vencido: ${d.nombre}`
      if (!titulosExistentes.has(titulo)) {
        await supabase.from('alertas').insert({
          empresa_id: empresaId, tipo: 'documentacion', severidad: 'atencion',
          titulo, descripcion: `${d.tipo} vencido el ${fmtF(d.fecha_vencimiento)}.`
        })
      }
    }
  }

  async function guardar() {
    if (!form.nombre) { alert('Ingresa el nombre del documento.'); return }
    setSaving(true)
    await supabase.from('documentos').insert({ ...form, empresa_id: empresaId })
    setModal(false); setForm({ nombre: '', tipo: 'contrato', trabajador_nombre: '', fecha_documento: '', fecha_vencimiento: '', firmado: false, notas: '' })
    setSaving(false); cargar()
  }

  async function toggleFirmado(id: string, actual: boolean) {
    await supabase.from('documentos').update({ firmado: !actual }).eq('id', id); cargar()
  }
  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este documento?')) return
    await supabase.from('documentos').delete().eq('id', id); cargar()
  }

  const firmados = docs.filter(d => d.firmado)
  const sinFirmar = docs.filter(d => !d.firmado)
  const vencidos = docs.filter(d => { const dd = diasHasta(d.fecha_vencimiento); return dd !== null && dd < 0 })

  return (
    <div>
      <Topbar title="🗂️ Documentación" sub="Contratos, anexos, reglamento y registros"
        action={<button onClick={() => setModal(true)} style={{ padding: '7px 16px', background: '#0B3D6B', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>+ Agregar documento</button>} />
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <Stat label="Total" value={docs.length} color="#0B3D6B" />
          <Stat label="Firmados" value={firmados.length} color="#16A34A" />
          <Stat label="Sin firmar" value={sinFirmar.length} color="#D97706" />
          <Stat label="Vencidos" value={vencidos.length} color={vencidos.length > 0 ? '#D94040' : '#16A34A'} />
        </div>
        {docs.length === 0 ? (
          <div style={{ background: '#E8F1FA', border: '1px solid #BDD4ED', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '13px', color: '#0B3D6B' }}>
            ℹ️ Sin documentos registrados. Agrega contratos, anexos, reglamentos o protocolos.
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #D1CFC7' }}>
            <CardHeader title="Documentos registrados" />
            {docs.map(d => {
              const dias = diasHasta(d.fecha_vencimiento)
              const vencido = dias !== null && dias < 0
              const porVencer = dias !== null && dias >= 0 && dias <= 30
              return (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1.25rem', borderBottom: '1px solid #F4F3EF', fontSize: '13px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: '#18181A' }}>{d.nombre}</div>
                    <div style={{ fontSize: '11px', color: '#6B6B6E', marginTop: '2px' }}>
                      {d.tipo}{d.trabajador_nombre ? ' · ' + d.trabajador_nombre : ''} · {fmtF(d.fecha_documento)}
                      {d.fecha_vencimiento && <> · Vence: {fmtF(d.fecha_vencimiento)}</>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {vencido && <Badge variant="r">Vencido</Badge>}
                    {porVencer && !vencido && <Badge variant="a">Por vencer</Badge>}
                    <Badge variant={d.firmado ? 'v' : 'g'}>{d.firmado ? 'Firmado' : 'Sin firmar'}</Badge>
                    <button onClick={() => toggleFirmado(d.id, d.firmado)} style={{ fontSize: '11px', padding: '4px 8px', background: '#F4F3EF', border: '1px solid #D1CFC7', borderRadius: '6px', cursor: 'pointer', color: '#6B6B6E' }}>{d.firmado ? 'Desmarcar' : 'Firmar'}</button>
                    <button onClick={() => eliminar(d.id)} style={{ fontSize: '11px', padding: '4px 8px', background: '#FDEAEA', border: '1px solid #FBBCBC', borderRadius: '6px', cursor: 'pointer', color: '#D94040' }}>✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,12,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F4F3EF', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#0B3D6B' }}>Agregar documento</div>
              <button onClick={() => setModal(false)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: '#F4F3EF', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[{ l: 'Nombre del documento *', k: 'nombre', t: 'text', p: 'Ej: Contrato Juan Pérez' }, { l: 'Trabajador', k: 'trabajador_nombre', t: 'text', p: 'Opcional' }, { l: 'Fecha del documento', k: 'fecha_documento', t: 'date', p: '' }, { l: 'Fecha de vencimiento', k: 'fecha_vencimiento', t: 'date', p: '' }].map(f => (
                <div key={f.k}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>{f.l}</div>
                  <input type={f.t} value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.p}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6E', marginBottom: '5px' }}>Tipo</div>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1CFC7', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
                  {['contrato', 'anexo', 'reglamento', 'protocolo', 'finiquito', 'otro'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.firmado} onChange={e => setForm(p => ({ ...p, firmado: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#0B3D6B' }} />
                Documento ya firmado
              </label>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #F4F3EF', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={{ padding: '9px 20px', border: '1.5px solid #D1CFC7', borderRadius: '8px', background: '#fff', color: '#6B6B6E', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} disabled={saving} style={{ padding: '9px 20px', border: 'none', borderRadius: '8px', background: '#0B3D6B', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .6 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: any) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #D1CFC7' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B6B6E', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '.625rem' }}>{label}</div>
      <div style={{ fontFamily: 'serif', fontSize: '2rem', fontWeight: 500, color }}>{value}</div>
    </div>
  )
}
