import React from 'react'
import { Truck, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react'
import './DeliveryStatusCard.css'

export default function DeliveryStatusCard({ deliveryStatus }) {
  if (!deliveryStatus) return null

  const { sale_status, customer_delivery_status } = deliveryStatus

  // Don't show card if sale is draft or closed (not started delivery)
  if (sale_status === 'draft' || sale_status === 'closed') {
    return null
  }

  // Completed
  if (customer_delivery_status === 'completed') {
    return (
      <div className="delivery-status-card completed">
        <div className="status-icon">
          <CheckCircle size={32} />
        </div>
        <div className="status-content">
          <h3>✅ ¡Entregado!</h3>
          <p>Tu pedido fue entregado a las {new Date(deliveryStatus.completed_at).toLocaleTimeString('es-ES')}</p>
          {deliveryStatus.amount_collected && (
            <p className="amount">Importe pagado: €{deliveryStatus.amount_collected.toFixed(2)}</p>
          )}
        </div>
      </div>
    )
  }

  // Skipped
  if (customer_delivery_status === 'skipped') {
    return (
      <div className="delivery-status-card skipped">
        <div className="status-icon">
          <XCircle size={32} />
        </div>
        <div className="status-content">
          <h3>⊘ Entrega omitida</h3>
          {deliveryStatus.skip_reason && (
            <p>Motivo: {deliveryStatus.skip_reason}</p>
          )}
        </div>
      </div>
    )
  }

  // Pending (in delivery)
  if (customer_delivery_status === 'pending') {
    return (
      <div className="delivery-status-card in-progress">
        <div className="status-icon pulsing">
          <Truck size={32} />
        </div>
        <div className="status-content">
          <h3>🚚 ¡En reparto!</h3>

          <div className="delivery-info">
            <div className="info-item">
              <Clock size={18} />
              <span>
                {deliveryStatus.is_next
                  ? '¡Eres el siguiente!'
                  : `Hay algunas entregas antes de la tuya, ¡pero ya queda menos!`}
              </span>
            </div>

          </div>
        </div>
      </div>
    )
  }

  return null
}