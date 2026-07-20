import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { empresa_id, trabajador_nombre, trabajador_rut, motivo, descripcion, modalidad_solicitada } = await req.json()
    if (!empresa_id || !trabajador_nombre || !motivo || !descripcion || !modalidad_solicitada)
      return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.from('solicitudes_teletrabajo').insert({
      empresa_id, trabajador_nombre, trabajador_rut: trabajador_rut || null,
      motivo, descripcion, modalidad_solicitada, estado: 'pendiente'
    })
    if (error) throw error

    await supabase.from('alertas').insert({
      empresa_id, tipo: 'karin', severidad: 'atencion',
      titulo: `Solicitud de teletrabajo — ${trabajador_nombre}`,
      descripcion: `Motivo: ${motivo}. Modalidad: ${modalidad_solicitada}. Ley N° 21.645.`
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Error teletrabajo:', err)
    return NextResponse.json({ error: err.message || 'Error interno.' }, { status: 500 })
  }
}
