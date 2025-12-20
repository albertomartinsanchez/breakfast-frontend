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
          <h3>✅ Delivered!</h3>
          <p>Your order was delivered at {new Date(deliveryStatus.completed_at).toLocaleTimeString()}</p>
          {deliveryStatus.amount_collected && (
            <p className="amount">Amount paid: ${deliveryStatus.amount_collected.toFixed(2)}</p>
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
          <h3>⊘ Delivery Skipped</h3>
          {deliveryStatus.skip_reason && (
            <p>Reason: {deliveryStatus.skip_reason}</p>
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
          <h3>🚚 Out for Delivery!</h3>
          
          <div className="delivery-info">
            <div className="info-item">
              <MapPin size={18} />
              <span>Position #{deliveryStatus.position_in_queue} in queue</span>
            </div>
            
            <div className="info-item">
              <Clock size={18} />
              <span>
                {deliveryStatus.deliveries_ahead > 0 
                  ? `${deliveryStatus.deliveries_ahead} deliveries ahead` 
                  : 'You\'re next!'}
              </span>
            </div>
            
            {deliveryStatus.estimated_minutes && (
              <div className="eta">
                Estimated arrival: ~{deliveryStatus.estimated_minutes} minutes
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}