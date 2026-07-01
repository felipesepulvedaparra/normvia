import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Inicialización diferida: no crea el cliente al nivel del módulo
// porque durante el build de Next.js/Vercel las variables de entorno
// NEXT_PUBLIC_ aún no están disponibles y lanza "supabaseUrl is required".
let _client: SupabaseClient | null = null

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      if (url && key) {
        _client = createClient(url, key)
      } else {
        // En build sin variables, devuelve un objeto vacío que no hace nada
        return () => ({ data: null, error: { message: 'Supabase no configurado' } })
      }
    }
    return (_client as any)[prop]
  }
})
