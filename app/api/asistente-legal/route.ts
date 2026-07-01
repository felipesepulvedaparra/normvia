import { NextResponse } from 'next/server'

// IMPORTANTE: requiere ANTHROPIC_API_KEY en .env.local
// Se obtiene en https://console.anthropic.com → API Keys

const SYSTEM_PROMPT = `Eres el Asistente Legal de Normvia, una plataforma de cumplimiento laboral y societario para pymes chilenas.

Tu rol:
- Responder preguntas sobre derecho laboral y societario chileno: Ley Karin (N° 21.643), Ley de 40 Horas (N° 21.561), finiquitos, subcontratación (Ley 20.123, F30/F30-1), sociedades (SpA, SRL, SA), Código del Trabajo en general.
- Explicar de forma clara, sin lenguaje técnico innecesario, como si hablaras con un dueño de pyme o encargado de RRHH sin formación legal.
- Ser preciso con la normativa chilena vigente, citando leyes y artículos cuando corresponda.

Reglas estrictas:
- NUNCA das el equivalente a una asesoría legal vinculante ni reemplazas a un abogado en casos complejos, litigiosos, o con alta exposición económica/legal.
- Si la consulta involucra una demanda activa, un litigio en curso, montos muy altos, despidos masivos, fueros sindicales complejos, o cualquier situación con riesgo legal serio, debes recomendar derivar a un abogado especialista y ofrecer agendar esa derivación.
- No inventes artículos de ley ni cifras que no sepas con certeza. Si no estás seguro de un dato específico (porcentajes exactos, plazos exactos), dilo explícitamente y recomienda verificar con un profesional o la fuente oficial (dt.gob.cl).
- Mantén las respuestas breves y accionables: la persona que pregunta normalmente quiere una respuesta rápida y clara, no un ensayo.
- Si preguntan algo fuera de tu ámbito (no relacionado a derecho laboral/societario chileno), indica amablemente que tu especialidad es esa área y redirige.

Formato:
- Respuestas cortas, en párrafos breves o listas si ayuda a la claridad.
- Tono cercano pero profesional, nunca condescendiente.
- Cuando derives a abogado humano, sé explícito: "Esto te recomiendo conversarlo con un abogado especialista. ¿Quieres que te ayude a coordinar esa conversación?"`

export async function POST(req: Request) {
  try {
    const { mensajes } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Asistente no configurado todavía.' }, { status: 503 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: mensajes, // [{ role: 'user'|'assistant', content: string }, ...]
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Error API Claude:', errText)
      return NextResponse.json({ error: 'No se pudo procesar la consulta. Intenta de nuevo.' }, { status: 500 })
    }

    const data = await response.json()
    const texto = data.content?.find((c: any) => c.type === 'text')?.text || 'No pude generar una respuesta.'

    return NextResponse.json({ respuesta: texto })
  } catch (err: any) {
    console.error('Error asistente legal:', err)
    return NextResponse.json({ error: 'Error interno del asistente.' }, { status: 500 })
  }
}
