'use client'
export default function PrivacidadPage() {
  const fecha = '1 de diciembre de 2026'
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #F7F5F0; color: #0F1923; -webkit-font-smoothing: antialiased; }
        a { color: #1A2E44; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: 'rgba(247,245,240,.96)', borderBottom: '1px solid #E8E4DC', padding: '0 3rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600, color: '#0F1923', textDecoration: 'none' }}>
          norm<span style={{ color: '#C8A96E' }}>via</span>
        </a>
        <a href="/" style={{ fontSize: '13px', color: '#6B6B6E', textDecoration: 'none' }}>← Volver al inicio</a>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #E8E4DC' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: '1rem' }}>
            Ley N° 21.719 · Vigente desde diciembre 2026
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 500, color: '#0F1923', lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: '1rem' }}>
            Política de Privacidad y Protección de Datos Personales
          </h1>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#9B9B9E', letterSpacing: '.06em' }}>
            Última actualización: {fecha} · Normvia SpA · RUT: [RUT empresa]
          </div>
        </div>

        {/* Contenido */}
        {[
          {
            n: '1', title: 'Identificación del Responsable',
            body: `Normvia SpA (en adelante, "Normvia", "nosotros" o "la plataforma"), con domicilio en Chile, es el responsable del tratamiento de los datos personales que se recopilan a través de la plataforma normvia.cl, en conformidad con la Ley N° 21.719 sobre Protección de Datos Personales de Chile.\n\nPara consultas relacionadas con el tratamiento de sus datos personales, puede contactarnos en: contacto@normvia.cl`
          },
          {
            n: '2', title: 'Datos que Recopilamos',
            body: `Normvia recopila y trata las siguientes categorías de datos personales:\n\n— Datos de identificación: nombre completo, RUT, correo electrónico y cargo dentro de la empresa.\n— Datos laborales de trabajadores: nombre, RUT, fecha de ingreso, causal de término, montos de finiquito o liquidación, y otros datos necesarios para los módulos de cumplimiento.\n— Datos de uso de la plataforma: registros de acceso, módulos utilizados y acciones realizadas.\n— Datos societarios: información de accionistas, incluyendo nombre, RUT, número de acciones y correo electrónico.\n\nNormvia no recopila datos sensibles en los términos del artículo 2° de la Ley N° 21.719 (datos de salud, biometría, origen racial, afiliación política, entre otros).`
          },
          {
            n: '3', title: 'Finalidad y Base de Licitud del Tratamiento',
            body: `Los datos personales son tratados para las siguientes finalidades:\n\n— Prestación del servicio de auditoría laboral preventiva contratado por la empresa cliente.\n— Generación de diagnósticos, alertas y reportes de cumplimiento.\n— Envío de notificaciones relacionadas con el servicio (alertas de vencimiento, recordatorios de asamblea).\n— Mejora y desarrollo de la plataforma.\n\nLa base de licitud del tratamiento es la ejecución de un contrato en el que el titular es parte o, cuando corresponda, el interés legítimo de Normvia en la prestación del servicio contratado (Art. 13 letra b y e, Ley N° 21.719).`
          },
          {
            n: '4', title: 'Calidad de Encargado de Tratamiento',
            body: `Respecto de los datos personales de trabajadores que las empresas clientes ingresan a la plataforma, Normvia actúa en calidad de encargado del tratamiento, siendo la empresa cliente el responsable de dichos datos.\n\nNormvia trata esos datos únicamente conforme a las instrucciones de la empresa cliente y para los fines del servicio contratado, sin utilizarlos para finalidades propias ajenas al contrato.`
          },
          {
            n: '5', title: 'Conservación de los Datos',
            body: `Los datos personales se conservan durante el período de vigencia del contrato de servicio y por un plazo adicional de 2 años desde la terminación del mismo, salvo que la ley exija un período mayor o que el titular solicite su eliminación antes de ese plazo.\n\nUna vez vencido el período de conservación, los datos serán eliminados de forma segura o anonimizados de manera irreversible.`
          },
          {
            n: '6', title: 'Derechos del Titular (ARCO+)',
            body: `En conformidad con la Ley N° 21.719, usted tiene derecho a:\n\n— Acceso: conocer qué datos personales suyos tratamos y cómo.\n— Rectificación: solicitar la corrección de datos inexactos o incompletos.\n— Cancelación (supresión): solicitar la eliminación de sus datos cuando ya no sean necesarios.\n— Oposición: oponerse al tratamiento de sus datos en determinadas circunstancias.\n— Portabilidad: recibir sus datos en un formato estructurado y de uso común.\n— Bloqueo: solicitar la suspensión temporal del tratamiento.\n\nPara ejercer cualquiera de estos derechos, envíe su solicitud a contacto@normvia.cl indicando su nombre completo, RUT y el derecho que desea ejercer. Responderemos dentro de los 30 días corridos siguientes a la recepción de su solicitud.`
          },
          {
            n: '7', title: 'Seguridad de los Datos',
            body: `Normvia implementa medidas técnicas y organizativas adecuadas para proteger los datos personales contra el acceso no autorizado, la pérdida, alteración o divulgación indebida. Entre ellas:\n\n— Cifrado de datos en tránsito mediante HTTPS/TLS.\n— Control de acceso basado en roles (cada usuario accede solo a los datos de su empresa).\n— Infraestructura alojada en Supabase con políticas de seguridad a nivel de fila (Row Level Security).\n— Acceso restringido al equipo de Normvia mediante autenticación de dos factores.\n\nEn caso de una brecha de seguridad que afecte datos personales, Normvia notificará a la Agencia de Protección de Datos Personales dentro de las 72 horas de tomar conocimiento del incidente, conforme al Art. 47 de la Ley N° 21.719.`
          },
          {
            n: '8', title: 'Transferencia Internacional de Datos',
            body: `Los datos personales pueden ser procesados por proveedores de infraestructura ubicados fuera de Chile (Supabase, Vercel, Resend, Anthropic), los cuales cuentan con estándares de seguridad adecuados y políticas de privacidad propias. Normvia ha evaluado que dichos proveedores ofrecen un nivel de protección equivalente al exigido por la legislación chilena.`
          },
          {
            n: '9', title: 'Modificaciones a esta Política',
            body: `Normvia podrá actualizar esta política de privacidad cuando sea necesario. Los cambios materiales serán notificados a los usuarios a través de la plataforma o por correo electrónico con al menos 15 días de anticipación a su entrada en vigor.`
          },
          {
            n: '10', title: 'Contacto y Reclamaciones',
            body: `Para consultas, ejercicio de derechos o cualquier reclamación relacionada con el tratamiento de sus datos personales:\n\nCorreo electrónico: contacto@normvia.cl\nSitio web: normvia.cl\n\nSi considera que sus derechos no han sido atendidos correctamente, tiene derecho a presentar un reclamo ante la Agencia de Protección de Datos Personales de Chile, una vez que esta se encuentre operativa.`
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

        <div style={{ background: '#0F1923', borderRadius: '8px', padding: '1.5rem 2rem', marginTop: '2rem' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: '.5rem' }}>Marco normativo</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.5)', lineHeight: 1.7 }}>
            Esta política se rige por la Ley N° 21.719 sobre Protección de Datos Personales de Chile, que reemplaza la Ley N° 19.628 y entra en vigor en diciembre de 2026. Normvia SpA se compromete a mantener esta política actualizada conforme a los reglamentos que dicte la Agencia de Protección de Datos Personales.
          </div>
        </div>
      </div>

      <div style={{ background: '#0A1118', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 500, color: 'rgba(255,255,255,.5)' }}>norm<span style={{ color: '#C8A96E' }}>via</span></div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,.2)', letterSpacing: '.06em' }}>© 2026 NORMVIA · LEY N° 21.719</div>
      </div>
    </>
  )
}
