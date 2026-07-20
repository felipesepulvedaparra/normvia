import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { codigo, nombre, rut } = await req.json()
    if (!codigo || !nombre) {
      return NextResponse.json({ error: 'Código y nombre son requeridos.' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!url || !key) {
      return NextResponse.json({ error: 'Plataforma no configurada. Contacta a soporte.' }, { status: 503 })
    }

    const supabase = createClient(url, key)
    const codigoLimpio = codigo.toUpperCase().trim()

    // Buscar código — sin filtro de activo primero para dar mejor mensaje de error
    const { data: cod, error } = await supabase
      .from('codigos_acceso')
      .select('id, codigo, activo, usos, max_usos, empresa_id, empresas(id, nombre, pais, tipo)')
      .eq('codigo', codigoLimpio)
      .maybeSingle()

    if (error) {
      console.error('Error buscando código:', error)
      return NextResponse.json({ error: 'Error al verificar el código. Intenta de nuevo.' }, { status: 500 })
    }

    if (!cod) {
      return NextResponse.json({ error: 'Código no encontrado. Verifica que esté bien escrito.' }, { status: 404 })
    }

    if (!cod.activo) {
      return NextResponse.json({ error: 'Este código está desactivado. Solicita uno nuevo a tu empresa.' }, { status: 403 })
    }

    if (cod.max_usos > 0 && cod.usos >= cod.max_usos) {
      return NextResponse.json({ error: 'Este código ya fue utilizado. Solicita uno nuevo a tu empresa.' }, { status: 403 })
    }

    // Generar token de sesión
    const token = crypto.randomUUID() + '-' + Date.now()

    await supabase.from('sesiones_trabajador').insert({
      empresa_id: cod.empresa_id,
      codigo_id: cod.id,
      nombre: nombre.trim(),
      rut: rut?.trim() || null,
      token,
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    })

    // Incrementar usos si es de uso único
    if (cod.max_usos === 1) {
      await supabase.from('codigos_acceso').update({ usos: cod.usos + 1 }).eq('id', cod.id)
    }

    const empresa = cod.empresas as any

    return NextResponse.json({
      token,
      empresa: {
        id: cod.empresa_id,
        nombre: empresa?.nombre || 'Tu empresa',
        pais: empresa?.pais || 'CL'
      },
      trabajador: { nombre: nombre.trim(), rut: rut?.trim() || '' }
    })

  } catch (err: any) {
    console.error('Error en trabajador-acceso:', err)
    return NextResponse.json({ error: 'Error interno. Intenta de nuevo.' }, { status: 500 })
  }
}
