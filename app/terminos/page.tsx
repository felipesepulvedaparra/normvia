'use client'
export default function TerminosPage() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #F7F5F0; color: #0F1923; -webkit-font-smoothing: antialiased; }
        a { color: #1A2E44; }
      `}</style>

      <nav style={{ background: 'rgba(247,245,240,.96)', borderBottom: '1px solid #E8E4DC', padding: '0 3rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600, color: '#0F1923', textDecoration: 'none' }}>
          norm<span style={{ color: '#C8A96E' }}>via</span>
        </a>
        <a href="/" style={{ fontSize: '13px', color: '#6B6B6E', textDecoration: 'none' }}>← Volver al inicio</a>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #E8E4DC' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: '1rem' }}>
            Versión 1.0 · Vigente desde diciembre 2026
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 500, color: '#0F1923', lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: '1rem' }}>
            Términos y Condiciones de Uso
          </h1>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#9B9B9E', letterSpacing: '.06em' }}>
            Normvia SpA · normvia.cl · contacto@normvia.cl
          </div>
        </div>

        {[
          {
            n: '1', title: 'Aceptación de los Términos',
            body: `El acceso y uso de la plataforma Normvia (normvia.cl) implica la aceptación plena de estos Términos y Condiciones por parte del usuario y de la empresa que representa (en adelante, "el Cliente").\n\nSi no está de acuerdo con estos términos, debe abstenerse de usar la plataforma. Normvia SpA se reserva el derecho de modificar estos términos con aviso previo de 15 días al Cliente.`
          },
          {
            n: '2', title: 'Descripción del Servicio',
            body: `Normvia es una plataforma SaaS de auditoría laboral preventiva y gestión societaria para empresas en Chile y Colombia. El servicio incluye:\n\n— Diagnósticos de cumplimiento laboral (Ley Karin, Ley 40 Horas, subcontratación, finiquitos).\n— Herramientas de gestión societaria (accionistas, asambleas, estatutos, resolución de conflictos).\n— Canal de denuncias anónimo bajo estándares de la Ley N° 21.643 (Ley Karin).\n— Asistente jurídico con inteligencia artificial.\n— Notificaciones automáticas y alertas de cumplimiento.\n\nNormvia no presta servicios jurídicos ni actúa como estudio de abogados. El contenido de la plataforma tiene carácter informativo y de apoyo al cumplimiento, y no constituye asesoría legal vinculante.`
          },
          {
            n: '3', title: 'Acceso Controlado',
            body: `El acceso a la plataforma es exclusivamente mediante invitación. Normvia habilita el acceso de cada empresa y su equipo a través de un proceso de incorporación controlado.\n\nEl Cliente es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las acciones realizadas bajo su cuenta. Ante cualquier uso no autorizado, debe notificar a Normvia de inmediato a contacto@normvia.cl.`
          },
          {
            n: '4', title: 'Tratamiento de Datos Personales y Ley N° 21.719',
            body: `En conformidad con la Ley N° 21.719 sobre Protección de Datos Personales de Chile:\n\n— El Cliente actúa como responsable del tratamiento de los datos personales de sus trabajadores y accionistas que ingrese a la plataforma.\n— Normvia actúa como encargado del tratamiento, procesando dichos datos únicamente para los fines del servicio contratado.\n— Normvia no utilizará los datos del Cliente para finalidades propias ajenas al contrato.\n— El Cliente garantiza que cuenta con las bases de licitud necesarias para el tratamiento de los datos que ingresa a la plataforma.\n\nEl detalle del tratamiento de datos se encuentra en nuestra Política de Privacidad, disponible en normvia.cl/privacidad.`
          },
          {
            n: '5', title: 'Limitación de Responsabilidad',
            body: `Normvia pone su máximo esfuerzo en mantener la información de la plataforma actualizada y correcta conforme a la normativa vigente. Sin embargo:\n\n— Los diagnósticos, alertas y reportes generados por la plataforma tienen carácter orientativo y no reemplazan la asesoría de un abogado especialista.\n— Normvia no será responsable por decisiones empresariales tomadas con base exclusiva en el contenido de la plataforma.\n— Normvia no garantiza que el uso de la plataforma exima al Cliente de cualquier sanción o multa por parte de la autoridad competente.\n\nLa responsabilidad total de Normvia ante el Cliente no podrá exceder el monto pagado por el servicio en los últimos 3 meses.`
          },
          {
            n: '6', title: 'Propiedad Intelectual',
            body: `Todos los derechos de propiedad intelectual sobre la plataforma Normvia, incluyendo su código, diseño, algoritmos, bases de datos y contenidos, son de titularidad exclusiva de Normvia SpA.\n\nEl Cliente no podrá copiar, reproducir, modificar, distribuir ni crear obras derivadas de la plataforma sin autorización escrita previa.`
          },
          {
            n: '7', title: 'Planes y Pagos',
            body: `El servicio se presta bajo planes de suscripción mensual o anual, según lo acordado entre Normvia y el Cliente. Los precios son los vigentes al momento de la contratación y pueden ser modificados con 30 días de aviso previo.\n\nEl no pago de las mensualidades faculta a Normvia para suspender el acceso a la plataforma hasta regularizar la situación.`
          },
          {
            n: '8', title: 'Vigencia y Terminación',
            body: `El contrato de servicio se mantiene vigente mientras el Cliente tenga una suscripción activa. Cualquiera de las partes puede dar término al servicio con 30 días de aviso previo.\n\nAnte la terminación, Normvia pondrá a disposición del Cliente sus datos por un plazo de 30 días corridos para su descarga. Transcurrido ese plazo, los datos serán eliminados conforme a nuestra Política de Privacidad.`
          },
          {
            n: '9', title: 'Ley Aplicable y Jurisdicción',
            body: `Estos términos se rigen por la legislación chilena. Cualquier disputa que no pueda resolverse de manera directa entre las partes será sometida a la jurisdicción de los tribunales ordinarios de justicia de Santiago de Chile.`
          },
        ].map(s => (
          <div key={s.n} style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#C8A96E', letterSpacing: '.1em', minWidth: '20px', paddingTop: '3px' }}>{s.n.padStart(2, '0')}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 500, color: '#0F1923', marginBottom: '.875rem', letterSpacing: '-.01em' }}>{s.title}</h2>
                <div style={{ fontSize: '14px', lineHeight: 1.8, color: '#4B4B4E', whiteSpace: 'pre-line' }}>{s.body}</div>
              </div>
            </div>
            <div style={{ height: '1px', background: '#E8E4DC', marginTop: '2.5rem' }} />
          </div>
        ))}
      </div>

      <div style={{ background: '#0A1118', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 500, color: 'rgba(255,255,255,.5)' }}>norm<span style={{ color: '#C8A96E' }}>via</span></div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,.2)', letterSpacing: '.06em' }}>© 2026 NORMVIA · TÉRMINOS Y CONDICIONES</div>
      </div>
    </>
  )
}
