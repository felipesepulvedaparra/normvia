import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { empresa_id, trabajador_nombre, trabajador_rut, trabajador_email, tipo, descripcion } = await req.json()
    if (!empresa_id || !trabajador_nombre || !tipo || !descripcion)
      return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.from('solicitudes_arco').insert({
      empresa_id, trabajador_nombre,
      trabajador_rut: trabajador_rut || null,
      trabajador_email: trabajador_email || null,
      tipo, descripcion, estado: 'recibida'
    })
    if (error) throw error

    await supabase.from('alertas').insert({
      empresa_id, tipo: 'karin', severidad: 'atencion',
      titulo: `Solicitud ARCO+ — ${tipo} — ${trabajador_nombre}`,
      descripcion: `Plazo legal: 30 días corridos para responder (Ley N° 21.719).`
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Error ARCO+:', err)
    return NextResponse.json({ error: err.message || 'Error interno.' }, { status: 500 })
  }
}
