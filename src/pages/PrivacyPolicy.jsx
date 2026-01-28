import React from 'react'
import './PrivacyPolicy.css'

export default function PrivacyPolicy() {
  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <h1>Política de Privacidad</h1>
        <p className="last-updated">Última actualización: Enero 2026</p>

        <section>
          <h2>1. Información que Recopilamos</h2>
          <p>Nuestra aplicación recopila la siguiente información para gestionar pedidos y entregas:</p>
          <ul>
            <li><strong>Datos de contacto:</strong> nombre, dirección y teléfono</li>
            <li><strong>Datos de pedidos:</strong> historial de compras y preferencias</li>
            <li><strong>Identificadores del dispositivo:</strong> tokens para notificaciones push</li>
          </ul>
        </section>

        <section>
          <h2>2. Uso de la Información</h2>
          <p>Utilizamos tus datos exclusivamente para:</p>
          <ul>
            <li>Gestionar y procesar tus pedidos</li>
            <li>Coordinar las entregas a domicilio</li>
            <li>Enviarte notificaciones sobre el estado de tus pedidos</li>
            <li>Mantener un historial de tus compras</li>
          </ul>
        </section>

        <section>
          <h2>3. Compartición de Datos</h2>
          <p>
            <strong>No vendemos ni compartimos tu información personal con terceros.</strong> Tus datos
            se utilizan únicamente para la gestión interna de pedidos y entregas.
          </p>
        </section>

        <section>
          <h2>4. Notificaciones Push</h2>
          <p>
            Si activas las notificaciones push, almacenamos un identificador de tu dispositivo para
            enviarte actualizaciones sobre:
          </p>
          <ul>
            <li>Nuevas ventas disponibles</li>
            <li>Cierre de pedidos</li>
            <li>Estado del reparto</li>
            <li>Llegada del repartidor</li>
          </ul>
          <p>Puedes desactivar las notificaciones en cualquier momento desde la configuración de tu dispositivo.</p>
        </section>

        <section>
          <h2>5. Seguridad</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos
            personales contra accesos no autorizados, pérdida o alteración.
          </p>
        </section>

        <section>
          <h2>6. Retención de Datos</h2>
          <p>
            Conservamos tus datos mientras mantengas una relación activa con nosotros. Si deseas
            eliminar tu información, puedes solicitarlo contactándonos directamente.
          </p>
        </section>

        <section>
          <h2>7. Tus Derechos</h2>
          <p>Tienes derecho a:</p>
          <ul>
            <li>Acceder a tus datos personales</li>
            <li>Rectificar información incorrecta</li>
            <li>Solicitar la eliminación de tus datos</li>
            <li>Oponerte al tratamiento de tus datos</li>
          </ul>
        </section>

        <section>
          <h2>8. Contacto</h2>
          <p>
            Para cualquier consulta sobre esta política de privacidad o sobre tus datos personales,
            puedes contactarnos a través de la aplicación.
          </p>
        </section>

        <section>
          <h2>9. Cambios en esta Política</h2>
          <p>
            Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre
            cambios significativos a través de la aplicación.
          </p>
        </section>
      </div>
    </div>
  )
}
