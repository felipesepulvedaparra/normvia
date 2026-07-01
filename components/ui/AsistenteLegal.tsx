'use client'
import { useState, useRef, useEffect } from 'react'

type Mensaje = { role: 'user' | 'assistant', content: string }

const SUGERENCIAS = [
  '¿Mi empresa cumple la Ley Karin?',
  '¿Cuánto cuesta un finiquito con causal 161?',
  '¿Qué necesito para una asamblea extraordinaria?',
]

export default function AsistenteLegal() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes, loading])

  async function enviar(textoForzado?: string) {
    const texto = (textoForzado ?? input).trim()
    if (!texto || loading) return
    const nuevosMensajes: Mensaje[] = [...mensajes, { role: 'user', content: texto }]
    setMensajes(nuevosMensajes); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/asistente-legal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensajes: nuevosMensajes }) })
      const data = await res.json()
      setMensajes(m => [...m, { role: 'assistant', content: data.error || data.respuesta }])
    } catch {
      setMensajes(m => [...m, { role: 'assistant', content: 'No pude conectarme. Intenta de nuevo.' }])
    }
    setLoading(false)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
  }

  return (
    <>
      {!abierto && (
        <button onClick={() => setAbierto(true)} aria-label="Abrir asistente legal"
          style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, width: '52px', height: '52px', borderRadius: '50%', background: '#0A1628', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', boxShadow: '0 8px 24px rgba(10,22,40,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'transform .15s, box-shadow .15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(10,22,40,.3)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,22,40,.2)' }}>
          ⚖️
        </button>
      )}

      {abierto && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, width: '368px', maxWidth: 'calc(100vw - 32px)', height: '540px', maxHeight: 'calc(100vh - 48px)', background: '#fff', borderRadius: '14px', boxShadow: '0 20px 60px rgba(10,22,40,.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #EBEBF0' }}>
          {/* Header */}
          <div style={{ background: '#0A1628', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(0,184,122,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚖️</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', letterSpacing: '-.01em' }}>Asistente Legal</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00B87A' }} />
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.35)' }}>Derecho laboral · Societario</span>
                </div>
              </div>
            </div>
            <button onClick={() => setAbierto(false)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '13px' }}>✕</button>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#FAFAF8' }}>
            {mensajes.length === 0 && (
              <div>
                <div style={{ fontSize: '12px', color: '#8B8FA8', lineHeight: '1.7', marginBottom: '14px' }}>
                  Pregúntame sobre Ley Karin, finiquitos, jornada laboral, subcontratación o sociedades. Para casos complejos, te conecto con un especialista.
                </div>
                {SUGERENCIAS.map(s => (
                  <button key={s} onClick={() => enviar(s)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 11px', background: '#fff', border: '1px solid #EBEBF0', borderRadius: '7px', fontSize: '12px', color: '#0A1628', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '6px', transition: 'border-color .1s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#0A1628')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#EBEBF0')}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {mensajes.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '86%', padding: '9px 13px', borderRadius: '10px', fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap', background: m.role === 'user' ? '#0A1628' : '#fff', color: m.role === 'user' ? '#fff' : '#0A1628', border: m.role === 'user' ? 'none' : '1px solid #EBEBF0' }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '9px 13px', borderRadius: '10px', background: '#fff', border: '1px solid #EBEBF0', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D0D0DC', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #EBEBF0', background: '#fff', display: 'flex', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
            <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Escribe tu consulta legal..." rows={1}
              style={{ flex: 1, resize: 'none', border: '1px solid #E2E2EC', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', fontFamily: 'inherit', outline: 'none', maxHeight: '90px', color: '#0A1628', background: '#FAFAF8', transition: 'border-color .1s' }}
              onFocus={e => (e.target.style.borderColor = '#0A1628')}
              onBlur={e => (e.target.style.borderColor = '#E2E2EC')} />
            <button onClick={() => enviar()} disabled={loading || !input.trim()}
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: !input.trim() || loading ? '#E2E2EC' : '#0A1628', color: '#fff', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, transition: 'background .1s' }}>
              →
            </button>
          </div>
          <div style={{ fontSize: '10px', color: '#C0C4D8', textAlign: 'center', padding: '5px 0 8px', flexShrink: 0 }}>No reemplaza asesoría legal en casos complejos</div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: .3 } 50% { opacity: 1 } }`}</style>
        </div>
      )}
    </>
  )
}
