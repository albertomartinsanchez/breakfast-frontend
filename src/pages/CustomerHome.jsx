import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, ShoppingCart, CheckCircle, XCircle, Truck, Package } from 'lucide-react'
import './CustomerHome.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function CustomerHome() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCustomerData()
  }, [token])

  const loadCustomerData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/${token}`)
      if (!response.ok) throw new Error('Invalid customer link')
      
      const data = await response.json()
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
      case 'draft': return 'Open for Orders'
      case 'closed': return 'Closed'
      case 'in_progress': return 'Out for Delivery'
      case 'completed': return 'Delivered'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="customer-loading">
        <div className="spinner"></div>
        <p>Loading your page...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="customer-error">
        <XCircle size={48} />
        <h2>Invalid Link</h2>
        <p>{error}</p>
      </div>
    )
  }

  const openSales = customer.sales.filter(s => s.is_open)
  const closedSales = customer.sales.filter(s => !s.is_open)

  return (
    <div className="customer-home">
      <header className="customer-header">
        <div className="header-content">
          <h1>🥐 {customer.customer_name}'s Orders</h1>
          <p className="subtitle">Welcome! Select a sale below to place or view your order.</p>
        </div>
      </header>

      <div className="sales-container">
        {/* Open Sales */}
        {openSales.length > 0 && (
          <section className="sales-section">
            <h2 className="section-title">📋 Open for Ordering</h2>
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
                        {new Date(sale.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="sale-status open">{getStatusLabel(sale.status)}</div>
                    </div>
                  </div>
                  <div className="sale-action">
                    <span className="action-text">Click to order →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Closed Sales */}
        {closedSales.length > 0 && (
          <section className="sales-section">
            <h2 className="section-title">📦 Past Sales</h2>
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
                        {new Date(sale.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="sale-status closed">{getStatusLabel(sale.status)}</div>
                    </div>
                  </div>
                  <div className="sale-action">
                    <span className="action-text">View order →</span>
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
            <p>No sales yet</p>
            <p className="empty-hint">Check back soon for new orders!</p>
          </div>
        )}
      </div>
    </div>
  )
}
