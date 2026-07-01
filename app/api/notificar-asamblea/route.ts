import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // Inicialización diferida: se crea el cliente solo al recibir una petición,
    // nunca durante el build. Esto evita el error de "Failed to collect page data".
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Notificaciones no configuradas todavía.' }, { status: 503 })
    }
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { destinatarios, asamblea, empresaNombre } = await req.json()

    if (!destinatarios || destinatarios.length === 0) {
      return NextResponse.json({ error: 'Sin destinatarios' }, { status: 400 })
    }

    const fechaFormateada = new Date(asamblea.fecha + 'T12:00').toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })

    const html = `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #071F36; padding: 32px; border-radius: 12px 12px 0 0;">
          <div style="font-family: Georgia, serif; font-size: 24px; color: #fff;">
            norm<span style="color: #00C896;">via</span>
          </div>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #D1CFC7; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0B3D6B; font-size: 20px; margin-bottom: 4px;">Recordatorio de Asamblea</h2>
          <p style="color: #6B6B6E; font-size: 13px; margin-bottom: 24px;">${empresaNombre}</p>

          <div style="background: #E8F1FA; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 6px; font-size: 14px; color: #0B3D6B;"><strong>${asamblea.titulo}</strong></p>
            <p style="margin: 0; font-size: 13px; color: #0B3D6B;">📅 ${fechaFormateada} · ${asamblea.hora} hrs</p>
            ${asamblea.lugar ? `<p style="margin: 4px 0 0; font-size: 13px; color: #0B3D6B;">📍 ${asamblea.lugar}</p>` : ''}
          </div>

          <p style="font-size: 13px; color: #18181A; line-height: 1.6;">
            Te recordamos que tienes una asamblea ${asamblea.tipo} próximamente. Tu presencia es importante para alcanzar el quórum necesario.
          </p>

          <p style="font-size: 11px; color: #6B6B6E; margin-top: 24px;">
            Este correo fue enviado automáticamente por Normvia en nombre de ${empresaNombre}.
          </p>
        </div>
      </div>
    `

    const resultados = await Promise.allSettled(
      destinatarios.map((email: string) =>
        resend.emails.send({
          from: 'Normvia <onboarding@resend.dev>', // cambiar por dominio propio verificado cuando lo tengas
          to: email,
          subject: `Recordatorio: ${asamblea.titulo} — ${fechaFormateada}`,
          html,
        })
      )
    )

    const enviados = resultados.filter(r => r.status === 'fulfilled').length
    const fallidos = resultados.length - enviados

    return NextResponse.json({ enviados, fallidos })
  } catch (err: any) {
    console.error('Error enviando notificación:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
