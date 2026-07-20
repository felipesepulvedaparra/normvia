import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { empresa_id, trabajador_nombre, pregunta, respuesta } = await req.json()
    if (!empresa_id || !pregunta) return NextResponse.json({ ok: false }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.from('consultas_trabajador').insert({
      empresa_id, trabajador_nombre: trabajador_nombre || 'Anónimo', pregunta, respuesta: respuesta || ''
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
