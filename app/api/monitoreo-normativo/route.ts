import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Este endpoint se llama desde un cron job (Vercel Cron) cada 24h
// También se puede llamar manualmente desde el panel admin
// Protegido por CRON_SECRET para evitar llamadas no autorizadas

const TERMINOS_LABORALES = [
  'código del trabajo', 'jornada laboral', 'finiquito', 'despido',
  'acoso laboral', 'subcontratación', 'cotización', 'indemnización',
  'licencia médica', 'maternidad', 'paternidad', 'teletrabajo',
  'protección de datos', 'trabajador', 'empleador', 'remuneración',
  'horas extraordinarias', 'descanso', 'feriado', 'sindicato'
]

const SYSTEM_PROMPT = `Eres un experto en derecho laboral chileno. Se te entregará el texto de una ley o decreto publicado en el Diario Oficial de Chile.

Tu tarea es analizar si esta norma afecta a las empresas en sus obligaciones laborales o societarias y generar un análisis estructurado.

Responde SOLO con JSON válido, sin texto adicional ni backticks:
{
  "relevante": true/false,
  "titulo": "nombre corto y claro de la norma",
  "descripcion": "qué establece esta norma en 2-3 oraciones simples, en lenguaje para RRHH, no para abogados",
  "impacto": "alto|medio|bajo",
  "modulos_afectados": ["karin","horas","finiquitos","subcontratacion","documentacion","societario"],
  "paises": ["CL"],
  "fecha_vigencia": "YYYY-MM-DD o null si no se especifica",
  "accion_requerida": "qué debe hacer la empresa exactamente, en 1 oración"
}

Solo marca como relevante si afecta obligaciones laborales o societarias de empleadores. Si no es relevante, responde {"relevante": false}.`

export async function GET(req: Request) {
  try {
    // Verificar secret para evitar llamadas no autorizadas
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get('secret')
    if (secret !== (process.env.CRON_SECRET || 'normvia-cron-2026')) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Consultar la BCN por últimas leyes publicadas
    const hoy = new Date()
    const hace7dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fechaStr = hace7dias.toISOString().split('T')[0]

    const bcnUrl = `https://www.bcn.cl/leychile/Navegar?idNorma=&idVersion=&idParte=&idParrafo=&tipoVersion=Final&tipo_norma=1&fecha_promulgacion=${fechaStr}&fecha_publicacion=&organismo=&titulo=trabajo+laboral+empleador&portada=0&rowsPerPage=10&action=buscar`

    const bcnRes = await fetch(bcnUrl, {
      headers: { 'User-Agent': 'Normvia-Monitor/1.0 (contacto@normvia.cl)' }
    })

    if (!bcnRes.ok) {
      // Si falla el fetch externo, no es error crítico — registrar y continuar
      console.warn('BCN fetch failed:', bcnRes.status)
      return NextResponse.json({ ok: true, procesadas: 0, mensaje: 'BCN no disponible en este momento.' })
    }

    const html = await bcnRes.text()

    // Extraer títulos de leyes del HTML de la BCN
    const matches = html.match(/href="\/leychile\/navegar\?idNorma=\d+"[^>]*>([^<]+)<\/a>/gi) || []
    const leyes = matches.slice(0, 5).map(m => {
      const titulo = m.match(/>([^<]+)<\/a>/)?.[1]?.trim() || ''
      const id = m.match(/idNorma=(\d+)/)?.[1] || ''
      return { titulo, id }
    }).filter(l => l.titulo && l.id)

    let procesadas = 0
    const novedadesGeneradas: string[] = []

    for (const ley of leyes) {
      // Verificar si ya fue procesada
      const { data: existente } = await supabase
        .from('novedades_normativas')
        .select('id')
        .eq('url_fuente', `https://www.bcn.cl/leychile/navegar?idNorma=${ley.id}`)
        .maybeSingle()

      if (existente) continue

      // Verificar relevancia por términos clave en el título
      const tituloLower = ley.titulo.toLowerCase()
      const esRelevante = TERMINOS_LABORALES.some(t => tituloLower.includes(t))
      if (!esRelevante) continue

      // Analizar con Claude
      if (!process.env.ANTHROPIC_API_KEY) continue

      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `Analiza esta norma publicada en el Diario Oficial de Chile:\n\nTítulo: ${ley.titulo}\nURL: https://www.bcn.cl/leychile/navegar?idNorma=${ley.id}` }]
        })
      })

      if (!aiRes.ok) continue

      const aiData = await aiRes.json()
      const texto = aiData.content?.[0]?.text || ''

      let analisis: any
      try {
        analisis = JSON.parse(texto.replace(/```json|```/g, '').trim())
      } catch { continue }

      if (!analisis.relevante) continue

      // Guardar novedad
      const { data: novedad } = await supabase.from('novedades_normativas').insert({
        titulo: analisis.titulo || ley.titulo,
        descripcion: analisis.descripcion,
        impacto: analisis.impacto || 'medio',
        modulos_afectados: analisis.modulos_afectados || [],
        paises: analisis.paises || ['CL'],
        url_fuente: `https://www.bcn.cl/leychile/navegar?idNorma=${ley.id}`,
        fecha_vigencia: analisis.fecha_vigencia || null,
        procesado_ia: true
      }).select().single()

      if (!novedad) continue

      // Crear alerta para todas las empresas del país correspondiente
      const { data: empresas } = await supabase
        .from('empresas')
        .select('id, pais')
        .in('pais', analisis.paises || ['CL'])

      if (empresas && empresas.length > 0) {
        const alertas = empresas.map((e: any) => ({
          empresa_id: e.id,
          novedad_id: novedad.id,
          leida: false
        }))
        await supabase.from('alertas_normativas').insert(alertas)
      }

      procesadas++
      novedadesGeneradas.push(analisis.titulo)
    }

    return NextResponse.json({
      ok: true,
      procesadas,
      novedades: novedadesGeneradas,
      fecha: new Date().toISOString()
    })

  } catch (err: any) {
    console.error('Error monitoreo normativo:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
