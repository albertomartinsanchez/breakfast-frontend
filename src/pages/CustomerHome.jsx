import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, ShoppingCart, CheckCircle, XCircle, Truck, Package } from 'lucide-react'
import { api } from '../services/api.js'
import { t } from '../utils/translations.js'
import { playNotificationSound } from '../utils/notificationSound.js'
import NotificationToast from '../components/NotificationToast.jsx'
import './CustomerHome.css'

export default function CustomerHome() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState(null)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const previousStatuses = useRef({})

  useEffect(() => {
    loadCustomerData()
  }, [token])

  // SSE subscription for real-time sale status updates
  useEffect(() => {
    if (!customer) return

    const streamUrl = api.getSalesStatusStreamUrl(token)
    const eventSource = new EventSource(streamUrl)

    eventSource.onmessage = (event) => {
      try {
        const newSales = JSON.parse(event.data)

        if (newSales.error) {
          console.error('SSE error:', newSales.error)
          eventSource.close()
          return
        }

        const currentIds = new Set(Object.keys(previousStatuses.current).map(Number))
        const newIds = new Set(newSales.map(s => s.id))

        // Check for new sales (IDs that didn't exist before)
        for (const sale of newSales) {
          if (!currentIds.has(sale.id)) {
            // New sale added
            playNotificationSound()
            setNotification({ type: 'new_sale', saleId: sale.id })
            previousStatuses.current[sale.id] = sale.status
          } else {
            // Check for status changes
            const prevStatus = previousStatuses.current[sale.id]
            if (prevStatus !== sale.status) {
              if (sale.status === 'in_progress') {
                playNotificationSound()
                setNotification({ type: 'delivery_started', saleId: sale.id })
              }
              previousStatuses.current[sale.id] = sale.status
            }
          }
        }

        // Remove deleted sales from tracking
        for (const id of currentIds) {
          if (!newIds.has(id)) {
            delete previousStatuses.current[id]
          }
        }

        // Update customer sales with new data
        setCustomer(prev => ({
          ...prev,
          sales: newSales
        }))
      } catch (err) {
        console.error('Failed to parse SSE data:', err)
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error, will auto-reconnect...')
    }

    return () => {
      eventSource.close()
    }
  }, [customer?.customer_id, token])

  const loadCustomerData = async () => {
    try {
      const data = await api.getCustomerByToken(token)
      // Initialize previous statuses to avoid notification on first load
      data.sales.forEach(s => {
        previousStatuses.current[s.id] = s.status
      })
      setCustomer(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <ShoppingCart size={20} />
      case 'closed': return <Package size={20} />
      case 'in_progress': return <Truck size={20} />
      case 'completed': return <CheckCircle size={20} />
      default: return null
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Abierto para pedidos'
      case 'closed': return 'Cerrado'
      case 'in_progress': return 'En reparto'
      case 'completed': return 'Entregado'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="customer-loading">
        <div className="spinner"></div>
        <p>Cargando tu página...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="customer-error">
        <XCircle size={48} />
        <h2>Enlace inválido</h2>
        <p>{t(error)}</p>
      </div>
    )
  }

  const openSales = customer.sales.filter(s => s.is_open)
  const closedSales = customer.sales.filter(s => !s.is_open)

  return (
    <div className="customer-home">
      {notification && (
        <NotificationToast
          type={notification.type}
          saleId={notification.saleId}
          token={token}
          onClose={() => setNotification(null)}
        />
      )}
      <header className="customer-header">
        <div className="header-content">
          <h1>🥐 Pedidos de {customer.customer_name}</h1>
          <p className="subtitle">¡Bienvenido! Selecciona una venta para hacer o ver tu pedido.</p>
        </div>
      </header>

      <div className="sales-container">
        {/* Open Sales */}
        {openSales.length > 0 && (
          <section className="sales-section">
            <h2 className="section-title">📋 Abiertos para pedir</h2>
            <div className="sales-grid">
              {openSales.map(sale => (
                <Link
                  key={sale.id}
                  to={`/customer/${token}/sale/${sale.id}`}
                  className="sale-card sale-card-open"
                >
                  <div className="sale-header">
                    <div className="sale-icon">{getStatusIcon(sale.status)}</div>
                    <div className="sale-info">
                      <div className="sale-date">
                        <Calendar size={16} />
                        {new Date(sale.date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="sale-status open">{getStatusLabel(sale.status)}</div>
                    </div>
                  </div>
                  <div className="sale-action">
                    <span className="action-text">Haz clic para pedir →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Closed Sales */}
        {closedSales.length > 0 && (
          <section className="sales-section">
            <h2 className="section-title">📦 Ventas anteriores</h2>
            <div className="sales-grid">
              {closedSales.map(sale => (
                <Link
                  key={sale.id}
                  to={`/customer/${token}/sale/${sale.id}`}
                  className="sale-card sale-card-closed"
                >
                  <div className="sale-header">
                    <div className="sale-icon">{getStatusIcon(sale.status)}</div>
                    <div className="sale-info">
                      <div className="sale-date">
                        <Calendar size={16} />
                        {new Date(sale.date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="sale-status closed">{getStatusLabel(sale.status)}</div>
                    </div>
                  </div>
                  <div className="sale-action">
                    <span className="action-text">Ver pedido →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {customer.sales.length === 0 && (
          <div className="empty-state">
            <Package size={64} />
            <p>Aún no hay ventas</p>
            <p className="empty-hint">¡Vuelve pronto para nuevos pedidos!</p>
          </div>
        )}
      </div>
    </div>
  )
}
