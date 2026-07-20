import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const SYSTEM_PROMPT = `Eres un experto en ventas B2B para Normvia, una plataforma de cumplimiento laboral preventivo para empresas chilenas.

Tu tarea es escribir emails fríos altamente personalizados para contactar a empresas que probablemente no cumplen con la normativa laboral vigente en Chile.

CONTEXTO DE NORMVIA:
- Plataforma SaaS de auditoría laboral preventiva
- Cubre: Ley Karin (N°21.643), Ley 40 Horas (N°21.561), Finiquitos, Subcontratación, Societario
- Plan Starter: $150.000 CLP/mes (1-50 trabajadores)
- Plan Professional: $300.000 CLP/mes (51-200 trabajadores)
- La DT hizo 104.000 fiscalizaciones en 2025, casi 1 de cada 3 terminó en multa
- Multa promedio: $2.700.000 CLP por infracción

DATOS REALES PARA USAR:
- Ley Karin vigente desde agosto 2024: TODAS las empresas deben tener protocolo de prevención
- Jornada máxima 42h desde abril 2026: todos los contratos deben actualizarse
- F30 vencido = responsabilidad solidaria del mandante
- 40% de los finiquitos tienen errores que pueden generar demandas

REGLAS DEL EMAIL:
1. Máximo 150 palabras — los emails cortos tienen más apertura
2. Personaliza según el rubro: usa ejemplos específicos de su industria
3. NO menciones el precio en el primer email
4. Termina SIEMPRE con una pregunta simple que invite a responder
5. Tono: directo, sin floreos, como si lo escribiera un abogado amigo
6. Asunto: máximo 8 palabras, sin emojis, que genere curiosidad o urgencia
7. Firma: Felipe Sepúlveda | Normvia | contacto@normvia.cl | +56 9 9022 6972

Responde SOLO con JSON válido:
{
  "asunto": "asunto del email",
  "cuerpo": "cuerpo del email en texto plano con saltos de línea \\n"
}`

export async function POST(req: Request) {
  try {
    const { accion, prospecto } = await req.json()

    if (accion === 'generar') {
      // Generar email personalizado con IA
      if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada.' }, { status: 503 })
      }

      const prompt = `Genera un email frío para este prospecto:
- Empresa: ${prospecto.empresa_nombre}
- Contacto: ${prospecto.contacto_nombre}
- Rubro: ${prospecto.rubro}
- Tamaño estimado: ${prospecto.trabajadores_estimado} trabajadores
${prospecto.sitio_web ? `- Sitio web: ${prospecto.sitio_web}` : ''}

Personaliza el email según el rubro específico. Menciona los riesgos laborales más comunes en ese sector.`

      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      if (!aiRes.ok) return NextResponse.json({ error: 'Error generando email.' }, { status: 500 })

      const aiData = await aiRes.json()
      const texto = aiData.content?.[0]?.text || ''

      let email: any
      try {
        email = JSON.parse(texto.replace(/```json|```/g, '').trim())
      } catch {
        return NextResponse.json({ error: 'Error procesando respuesta IA.' }, { status: 500 })
      }

      return NextResponse.json({ asunto: email.asunto, cuerpo: email.cuerpo })
    }

    if (accion === 'enviar') {
      // Enviar email aprobado
      if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: 'RESEND_API_KEY no configurada.' }, { status: 503 })
      }

      const resend = new Resend(process.env.RESEND_API_KEY)

      const html = `
        <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; padding: 32px; color: #0F1923;">
          ${prospecto.cuerpo.split('\n').map((p: string) => p ? `<p style="margin: 0 0 14px; font-size: 15px; line-height: 1.7; color: #0F1923;">${p}</p>` : '<br/>').join('')}
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E8E4DC; font-size: 12px; color: #8B8FA8; line-height: 1.6;">
            Este email fue enviado a ${prospecto.contacto_email} en el contexto de una comunicación B2B.
            Si no deseas recibir más emails de nuestra parte, responde con "No gracias".
          </div>
        </div>
      `

      const { error } = await resend.emails.send({
        from: 'Felipe Sepúlveda | Normvia <contacto@normvia.cl>',
        to: prospecto.contacto_email,
        subject: prospecto.asunto,
        html,
        replyTo: 'contacto@normvia.cl'
      })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (accion === 'seguimiento') {
      // Email de seguimiento (día 3 o día 7)
      if (!process.env.ANTHROPIC_API_KEY || !process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: 'APIs no configuradas.' }, { status: 503 })
      }

      const numero = prospecto.numero_seguimiento || 2
      const prompts: Record<number, string> = {
        2: `Genera un email de seguimiento BREVE (máximo 80 palabras) para ${prospecto.contacto_nombre} de ${prospecto.empresa_nombre} (${prospecto.rubro}). 
Es el segundo contacto, 3 días después del primero. No menciones que no respondieron. 
Ofrece algo de valor concreto: un dato nuevo sobre fiscalizaciones en su rubro o un recordatorio de la Ley Karin.
Termina con la misma pregunta simple del primer email.`,
        3: `Genera un email final MUY BREVE (máximo 60 palabras) para ${prospecto.contacto_nombre} de ${prospecto.empresa_nombre}.
Es el tercer y último contacto. Sé directo: si no es el momento, está bien. 
Deja la puerta abierta para el futuro. No presiones.`
      }

      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompts[numero] || prompts[2] }]
        })
      })

      const aiData = await aiRes.json()
      const texto = aiData.content?.[0]?.text || ''
      let email: any
      try { email = JSON.parse(texto.replace(/```json|```/g, '').trim()) } catch {
        return NextResponse.json({ error: 'Error IA.' }, { status: 500 })
      }

      const resend = new Resend(process.env.RESEND_API_KEY)
      const html = `<div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; padding: 32px; color: #0F1923;">
        ${email.cuerpo.split('\n').map((p: string) => p ? `<p style="margin: 0 0 14px; font-size: 15px; line-height: 1.7;">${p}</p>` : '<br/>').join('')}
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E8E4DC; font-size: 12px; color: #8B8FA8;">
          Si no deseas recibir más emails, responde con "No gracias".
        </div>
      </div>`

      await resend.emails.send({
        from: 'Felipe Sepúlveda | Normvia <contacto@normvia.cl>',
        to: prospecto.contacto_email,
        subject: `Re: ${prospecto.asunto_original}`,
        html, replyTo: 'contacto@normvia.cl'
      })

      return NextResponse.json({ ok: true, asunto: email.asunto, cuerpo: email.cuerpo })
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 })

  } catch (err: any) {
    console.error('Error agente prospección:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
