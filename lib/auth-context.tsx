'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type Empresa = any

type AuthContextType = {
  user: any
  empresa: Empresa | null
  empresaId: string | null
  pais: string
  loading: boolean
  signOut: () => Promise<void>
  refreshEmpresa: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null, empresa: null, empresaId: null, pais: 'CL',
  loading: true, signOut: async () => {}, refreshEmpresa: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const [pais, setPais] = useState<string>('CL')
  const [loading, setLoading] = useState(true)

  // CORRECCIÓN CRÍTICA: filtrar por auth_id, no por id.
  // auth_id es el UUID que entrega Supabase Auth (auth.users.id).
  // id es la clave primaria de la fila en la tabla "usuarios", son cosas distintas.
  async function fetchEmpresa(authId: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('empresa_id, empresas(*)')
      .eq('auth_id', authId)
      .maybeSingle()

    if (error) {
      console.error('Error cargando empresa:', error.message)
      setEmpresa(null)
      setEmpresaId(null)
      return
    }

    if (!data) {
      // El usuario de Auth existe pero no está vinculado a ninguna empresa todavía.
      console.warn('Usuario sin empresa vinculada en la tabla usuarios.')
      setEmpresa(null)
      setEmpresaId(null)
      return
    }

    setEmpresaId(data.empresa_id || null)
    setEmpresa(data.empresas || null)
    setPais((data.empresas as any)?.pais || 'CL')
  }

  async function refreshEmpresa() {
    if (user?.id) await fetchEmpresa(user.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null); setEmpresa(null); setEmpresaId(null)
  }

  useEffect(() => {
    let active = true

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!active) return

      if (session?.user) {
        setUser(session.user)
        await fetchEmpresa(session.user.id)
      }
      setLoading(false)
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user || null
      setUser(u)
      if (u) {
        await fetchEmpresa(u.id)
      } else {
        setEmpresa(null)
        setEmpresaId(null)
      }
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, empresa, empresaId, pais, loading, signOut, refreshEmpresa }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
