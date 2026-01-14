import { useEffect, useState } from 'react'
import { Truck, ShoppingCart, X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { t } from '../utils/translations'
import './NotificationToast.css'

const NOTIFICATION_CONFIG = {
  delivery_started: {
    icon: Truck,
    messageKey: 'delivery_started',
    actionKey: 'track_your_order',
    className: 'delivery'
  },
  new_sale: {
    icon: ShoppingCart,
    messageKey: 'new_sale_available',
    actionKey: 'order_now',
    className: 'new-sale'
  }
}

export default function NotificationToast({ type = 'delivery_started', saleId, token, onClose }) {
  const [isExiting, setIsExiting] = useState(false)
  const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.delivery_started
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  function handleClose() {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  return (
    <div className={`notification-toast ${config.className} ${isExiting ? 'exiting' : ''}`}>
      <div className="toast-icon">
        <Icon size={24} />
      </div>
      <div className="toast-content">
        <p className="toast-message">{t(config.messageKey)}</p>
      </div>
      <Link
        to={`/customer/${token}/sale/${saleId}`}
        className="toast-action"
        onClick={handleClose}
      >
        {t(config.actionKey)}
        <ArrowRight size={16} />
      </Link>
      <button className="toast-close" onClick={handleClose} aria-label="Close">
        <X size={18} />
      </button>
    </div>
  )
}
