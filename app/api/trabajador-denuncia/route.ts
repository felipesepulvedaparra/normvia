import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { empresa_id, tipo, descripcion, anonima } = await req.json()
    if (!empresa_id || !tipo || !descripcion) return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const codigo = 'KRN-' + Date.now().toString(36).toUpperCase().slice(-6)
    const { error: e1 } = await supabase.from('denuncias_karin').insert({
      empresa_id, codigo, tipo, descripcion,
      anonima: anonima ?? true, estado: 'recibida',
      fecha: new Date().toISOString().split('T')[0]
    })
    if (e1) throw e1

    await supabase.from('alertas').insert({
      empresa_id, tipo: 'karin', severidad: 'riesgo',
      titulo: `Nueva denuncia — ${tipo}`,
      descripcion: `Código ${codigo}. Ingresada desde el Portal Trabajador.`
    })

    return NextResponse.json({ codigo })
  } catch (err: any) {
    console.error('Error denuncia:', err)
    return NextResponse.json({ error: err.message || 'Error interno.' }, { status: 500 })
  }
}
