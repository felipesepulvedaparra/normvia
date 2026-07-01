import { supabase } from './supabase'

export const fmt = (n: number) => '$' + Math.round(n || 0).toLocaleString('es-CL')
export const fmtF = (str?: string) => {
  if (!str) return '—'
  return new Date(str + 'T12:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}
export const diasHasta = (str?: string) => {
  if (!str) return null
  return Math.ceil((new Date(str + 'T12:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
}
