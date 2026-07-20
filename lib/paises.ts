export type Pais = 'CL' | 'CO'
export type ModuloConfig = { key: string; icon: string; title: string; sub: string; ley?: string }
export type Item = { t: string; s: 'r' | 'a' | 'v'; d: string }
export type Pregunta = { key: string; label: string; hint?: string; opts: { v: string; l: string }[] }
export type Causal = { v: string; l: string; generaIndem: boolean }
export type PaisConfig = {
  nombre: string; bandera: string; moneda: string; jornada: number
  modulos: ModuloConfig[]
  karin: { nombre: string; ley: string; vigencia: string; preguntas: Pregunta[] }
  horas: { nombre: string; ley: string; horasActuales: number; horasProximas: number; añoProximo: number; preguntas: Pregunta[] }
  finiquito: { nombre: string; causales: Causal[] }
}

const PAISES: Record<Pais, PaisConfig> = {
  CL: {
    nombre: 'Chile', bandera: '🇨🇱', moneda: 'CLP', jornada: 42,
    modulos: [
      { key: 'karin', icon: '⚖️', title: 'Ley Karin', sub: 'Prevención de acoso · Ley 21.643' },
      { key: 'horas', icon: '◷', title: 'Ley 40 Horas', sub: 'Jornada vigente 42h' },
      { key: 'finiquitos', icon: '◈', title: 'Finiquitos', sub: 'Validación pre-firma' },
      { key: 'subcontratacion', icon: '◎', title: 'Subcontratación', sub: 'F30 y F30-1' },
      { key: 'documentacion', icon: '◱', title: 'Documentación', sub: 'Contratos y anexos' },
      { key: 'societario', icon: '◉', title: 'Societario', sub: 'Accionistas y asambleas' },
    ],
    karin: {
      nombre: 'Ley Karin', ley: 'Ley N° 21.643', vigencia: 'Vigente desde agosto 2024',
      preguntas: [
        { key: 'proto', label: '¿El protocolo de prevención está implementado y comunicado?', hint: 'Obligatorio desde agosto 2024 para TODAS las empresas.', opts: [{ v: 'si', l: 'Sí, implementado y comunicado' }, { v: 'proceso', l: 'En proceso' }, { v: 'no', l: 'No tenemos protocolo' }] },
        { key: 'canal', label: '¿Existe un canal de denuncia formal y confidencial?', hint: 'Debe ser accesible por correo, formulario o presencialmente.', opts: [{ v: 'si', l: 'Sí, formal y confidencial' }, { v: 'informal', l: 'Solo de forma informal' }, { v: 'no', l: 'No existe canal' }] },
        { key: 'cap', label: '¿Todos los trabajadores recibieron capacitación?', opts: [{ v: 'si', l: 'Sí, todos' }, { v: 'parcial', l: 'Solo algunos' }, { v: 'no', l: 'No se ha realizado' }] },
        { key: 'sem', label: '¿Se realiza comunicación semestral sobre los canales?', hint: 'Obligatorio informar semestralmente.', opts: [{ v: 'si', l: 'Sí, semestralmente' }, { v: 'aveces', l: 'A veces' }, { v: 'no', l: 'No se realiza' }] },
      ]
    },
    horas: {
      nombre: 'Ley 40 Horas', ley: 'Ley N° 21.561', horasActuales: 42, horasProximas: 40, añoProximo: 2028,
      preguntas: [
        { key: 'cont', label: '¿Todos los contratos tienen la jornada actualizada a 42 horas?', hint: 'Desde abril 2026 la jornada máxima es 42h semanales.', opts: [{ v: 'si', l: 'Sí, todos actualizados' }, { v: 'parcial', l: 'Algunos no actualizados' }, { v: 'no', l: 'Ninguno actualizado' }] },
        { key: 'asist', label: '¿Llevan registro de asistencia para todos los trabajadores?', hint: 'Obligatorio por el Art. 33 del Código del Trabajo.', opts: [{ v: 'si', l: 'Sí, para todos' }, { v: 'parcial', l: 'Solo para algunos' }, { v: 'no', l: 'No llevamos registro' }] },
        { key: 'hextra', label: '¿Las horas extraordinarias se pagan con el recargo del 50%?', opts: [{ v: 'si', l: 'Sí, con recargo legal' }, { v: 'nosabe', l: 'No estamos seguros' }, { v: 'na', l: 'No hay horas extra' }] },
      ]
    },
    finiquito: {
      nombre: 'Finiquito',
      causales: [
        { v: '159_1', l: 'Art. 159 N°1 — Mutuo acuerdo', generaIndem: false },
        { v: '159_2', l: 'Art. 159 N°2 — Renuncia voluntaria', generaIndem: false },
        { v: '159_4', l: 'Art. 159 N°4 — Vencimiento de plazo', generaIndem: false },
        { v: '160', l: 'Art. 160 — Despido por falta grave', generaIndem: false },
        { v: '161', l: 'Art. 161 — Necesidades de la empresa', generaIndem: true },
      ]
    }
  },
  CO: {
    nombre: 'Colombia', bandera: '🇨🇴', moneda: 'COP', jornada: 44,
    modulos: [
      { key: 'karin', icon: '⚖️', title: 'Acoso Laboral', sub: 'Prevención · Ley 1010 de 2006' },
      { key: 'horas', icon: '◷', title: 'Jornada Laboral', sub: 'Reducción gradual · Ley 2101' },
      { key: 'finiquitos', icon: '◈', title: 'Liquidación', sub: 'Cálculo y validación laboral' },
      { key: 'subcontratacion', icon: '◎', title: 'Subcontratación', sub: 'Tercerización · Decreto 4369' },
      { key: 'documentacion', icon: '◱', title: 'Documentación', sub: 'Contratos y anexos' },
      { key: 'societario', icon: '◉', title: 'Societario', sub: 'Accionistas y asambleas SAS' },
    ],
    karin: {
      nombre: 'Ley de Acoso Laboral', ley: 'Ley 1010 de 2006', vigencia: 'Vigente · Aplica a todos los empleadores',
      preguntas: [
        { key: 'reglamento', label: '¿El reglamento interno incluye el procedimiento de acoso laboral?', hint: 'Obligatorio según Art. 9 de la Ley 1010 de 2006.', opts: [{ v: 'si', l: 'Sí, incluido y actualizado' }, { v: 'proceso', l: 'En proceso de actualización' }, { v: 'no', l: 'No está incluido' }] },
        { key: 'comite', label: '¿Existe un Comité de Convivencia Laboral activo?', hint: 'Obligatorio para empresas con más de 10 trabajadores. Resolución 652 de 2012.', opts: [{ v: 'si', l: 'Sí, activo y con actas al día' }, { v: 'existe', l: 'Existe pero no funciona regularmente' }, { v: 'no', l: 'No existe' }] },
        { key: 'cap', label: '¿Se realizan capacitaciones sobre convivencia y acoso laboral?', opts: [{ v: 'si', l: 'Sí, periódicamente' }, { v: 'parcial', l: 'Algunas veces' }, { v: 'no', l: 'No se realizan' }] },
        { key: 'canal', label: '¿Existe mecanismo formal para denunciar acoso laboral?', hint: 'Puede ser ante el Comité de Convivencia, Inspector de Trabajo o Defensoría.', opts: [{ v: 'si', l: 'Sí, conocido por todos los trabajadores' }, { v: 'informal', l: 'Solo de forma informal' }, { v: 'no', l: 'No existe mecanismo' }] },
      ]
    },
    horas: {
      nombre: 'Reducción de Jornada', ley: 'Ley 2101 de 2021', horasActuales: 44, horasProximas: 42, añoProximo: 2026,
      preguntas: [
        { key: 'cont', label: '¿Los contratos reflejan la jornada máxima actual de 44 horas?', hint: 'La Ley 2101 establece reducción gradual hasta llegar a 40h. Hoy rige 44h.', opts: [{ v: 'si', l: 'Sí, todos actualizados' }, { v: 'parcial', l: 'Algunos desactualizados' }, { v: 'no', l: 'Ninguno actualizado' }] },
        { key: 'asist', label: '¿Llevan registro de horas trabajadas para todos los empleados?', hint: 'Obligatorio según el Código Sustantivo del Trabajo (CST).', opts: [{ v: 'si', l: 'Sí, para todos' }, { v: 'parcial', l: 'Solo para algunos' }, { v: 'no', l: 'No llevamos registro' }] },
        { key: 'hextra', label: '¿Las horas extra se pagan con los recargos correctos?', hint: 'Diurnas: 25% extra. Nocturnas: 75%. Dominicales/festivos: 75%.', opts: [{ v: 'si', l: 'Sí, con recargos correctos' }, { v: 'nosabe', l: 'No estamos seguros del cálculo' }, { v: 'na', l: 'No hay horas extra' }] },
        { key: 'nocturno', label: '¿El trabajo nocturno se paga con el recargo del 35%?', hint: 'Aplica desde las 9 PM hasta las 6 AM.', opts: [{ v: 'si', l: 'Sí, con recargo del 35%' }, { v: 'nosabe', l: 'No estamos seguros' }, { v: 'na', l: 'No hay trabajo nocturno' }] },
      ]
    },
    finiquito: {
      nombre: 'Liquidación',
      causales: [
        { v: 'mutuo', l: 'Mutuo acuerdo entre las partes', generaIndem: false },
        { v: 'renuncia', l: 'Renuncia voluntaria del trabajador', generaIndem: false },
        { v: 'vencimiento', l: 'Vencimiento de contrato a término fijo', generaIndem: false },
        { v: 'justa_causa', l: 'Terminación con justa causa (Art. 62 CST)', generaIndem: false },
        { v: 'sin_justa_causa', l: 'Terminación sin justa causa · genera indemnización', generaIndem: true },
      ]
    }
  }
}

export function getPaisConfig(pais: string): PaisConfig {
  return PAISES[(pais as Pais)] || PAISES.CL
}

export const PAISES_DISPONIBLES = [
  { code: 'CL' as Pais, nombre: 'Chile', bandera: '🇨🇱' },
  { code: 'CO' as Pais, nombre: 'Colombia', bandera: '🇨🇴' },
]
