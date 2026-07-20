import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Códigos ACTECO del SII por rubro — usados para filtrar empresas relevantes
const ACTECOS_POR_RUBRO: Record<string, string[]> = {
  'Construcción y obras': ['410000','421000','422000','429000','431000','432000','433000','439000'],
  'Retail y comercio': ['471000','472000','473000','474000','475000','476000','477000','478000','479000'],
  'Restaurantes y gastronomía': ['561000','562000','563000'],
  'Servicios profesionales': ['691000','692000','711000','712000','731000','741000','742000','749000'],
  'Transporte y logística': ['491000','492000','493000','501000','502000','511000','512000','521000','522000'],
  'Salud y clínicas': ['861000','862000','869000','871000','872000','873000','879000'],
  'Educación': ['851000','852000','853000','854000','855000','856000'],
  'Manufactura e industria': ['100000','110000','120000','130000','140000','150000','160000','170000','180000','190000','200000','210000','220000','230000','240000','250000','260000','270000','280000','290000','300000','310000','320000','330000'],
  'Tecnología': ['620100','620200','620900','631100','631200','639000'],
  'Inmobiliaria': ['681000','682000','683000'],
}

// Rango de RUTs para empresas (sociedades chilenas: 76.000.000 a 77.500.000 aprox.)
function generarRUTs(cantidad: number, offset: number = 0): string[] {
  const ruts: string[] = []
  const base = 76000000 + offset
  for (let i = 0; i < cantidad; i++) {
    const num = base + i * 137 // salto pseudo-aleatorio para variedad
    ruts.push(`${num}-${calcDV(num)}`)
  }
  return ruts
}

function calcDV(rut: number): string {
  let suma = 0, multiplo = 2
  let tmp = rut
  while (tmp > 0) {
    suma += (tmp % 10) * multiplo
    tmp = Math.floor(tmp / 10)
    multiplo = multiplo < 7 ? multiplo + 1 : 2
  }
  const res = 11 - (suma % 11)
  if (res === 11) return '0'
  if (res === 10) return 'K'
  return String(res)
}

async function buscarEmailEnWeb(sitio: string): Promise<string | null> {
  if (!sitio) return null
  try {
    const url = sitio.startsWith('http') ? sitio : `https://${sitio}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000)
    })
    const html = await res.text()
    // Buscar emails en el HTML
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = html.match(emailRegex) || []
    // Filtrar emails válidos (no imágenes, no CDN, no ejemplo)
    const validos = emails.filter(e =>
      !e.includes('example') && !e.includes('sentry') && !e.includes('wix') &&
      !e.includes('jquery') && !e.includes('.png') && !e.includes('.jpg') &&
      e.length < 60
    )
    return validos[0] || null
  } catch {
    return null
  }
}

async function buscarSitioWeb(nombreEmpresa: string): Promise<string | null> {
  try {
    // Usar Google para buscar el sitio web de la empresa
    const query = encodeURIComponent(`${nombreEmpresa} Chile sitio oficial`)
    const res = await fetch(`https://www.google.com/search?q=${query}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
      signal: AbortSignal.timeout(5000)
    })
    const html = await res.text()
    // Extraer primer resultado de dominio
    const dominioRegex = /https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g
    const matches = html.match(dominioRegex) || []
    const validos = matches.filter(d =>
      !d.includes('google') && !d.includes('youtube') &&
      !d.includes('facebook') && !d.includes('linkedin') &&
      !d.includes('sii.cl') && !d.includes('wikipedia')
    )
    return validos[0] || null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const { rubro, cantidad = 10, offset = 0 } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Generar RUTs candidatos
    const ruts = generarRUTs(cantidad * 5, offset) // generamos más para compensar los que no matchean

    // 2. Consultar API de sre.cl
    const sreRes = await fetch('https://sre.cl/api/company_info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'token_publico', ruts })
    })

    if (!sreRes.ok) {
      return NextResponse.json({ error: 'Error consultando registro de empresas.' }, { status: 500 })
    }

    const sreData = await sreRes.json()
    const actecosFiltro = ACTECOS_POR_RUBRO[rubro] || []

    // 3. Filtrar por rubro y activas
    const empresasFiltradas = Object.entries(sreData)
      .filter(([_, info]: [string, any]) => {
        if (info.error || !info.razon_social) return false
        if (!info.actecos || info.actecos.length === 0) return false
        // Si hay filtro de rubro, aplicarlo
        if (actecosFiltro.length > 0) {
          return info.actecos.some((a: string) =>
            actecosFiltro.some(filtro => a.startsWith(filtro.substring(0, 4)))
          )
        }
        return true
      })
      .slice(0, cantidad)

    let encontradas = 0
    const resultados: any[] = []

    for (const [rut, info] of empresasFiltradas) {
      const empresa = info as any
      const nombre = empresa.razon_social

      // Verificar si ya existe en prospectos
      const { data: existente } = await supabase
        .from('prospectos')
        .select('id')
        .ilike('empresa_nombre', `%${nombre.split(' ')[0]}%`)
        .maybeSingle()

      if (existente) continue

      // 4. Buscar sitio web
      let sitioWeb = empresa.sitio_web || null
      if (!sitioWeb) {
        sitioWeb = await buscarSitioWeb(nombre)
        await new Promise(r => setTimeout(r, 500)) // delay para no saturar
      }

      // 5. Buscar email en el sitio web
      let email = null
      if (sitioWeb) {
        email = await buscarEmailEnWeb(sitioWeb)
      }

      // 6. Determinar rubro legible desde ACTECO
      const rubroDetectado = rubro || 'Servicios profesionales'

      // 7. Insertar en prospectos
      const { data: nuevo } = await supabase.from('prospectos').insert({
        empresa_nombre: nombre,
        contacto_nombre: empresa.representante_legal || 'Encargado RRHH',
        contacto_email: email || '',
        rubro: rubroDetectado,
        trabajadores_estimado: '21-50',
        sitio_web: sitioWeb || '',
        notas: `RUT: ${rut} | ACTECO: ${empresa.actecos?.join(', ')} | Región: ${empresa.region || 'N/A'} | Fuente: SRE.cl`,
        estado: email ? 'nuevo' : 'sin_email'
      }).select().single()

      if (nuevo) {
        encontradas++
        resultados.push({
          nombre,
          rut,
          email: email || '(sin email)',
          sitio: sitioWeb || '(sin sitio)',
          rubro: rubroDetectado
        })
      }

      if (encontradas >= cantidad) break
    }

    return NextResponse.json({
      ok: true,
      encontradas,
      con_email: resultados.filter(r => r.email !== '(sin email)').length,
      sin_email: resultados.filter(r => r.email === '(sin email)').length,
      empresas: resultados
    })

  } catch (err: any) {
    console.error('Error agente búsqueda:', err)
    return NextResponse.json({ error: err.message || 'Error interno.' }, { status: 500 })
  }
}
