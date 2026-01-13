import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Plus, Minus, Save, CheckCircle, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react'
import './CustomerOrder.css'
import DeliveryStatusCard from '../components/DeliveryStatusCard'
import { api } from '../services/api.js'

export default function CustomerOrder() {
  const { token, saleId } = useParams()
  const [loading, setLoading] = useState(true)
  const [saleData, setSaleData] = useState(null)
  const [error, setError] = useState(null)
  const [cart, setCart] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  const [deliveryStatus, setDeliveryStatus] = useState(null)
  const [cartExpanded, setCartExpanded] = useState(false)

  useEffect(() => {
    loadSaleData()
    loadDeliveryStatus()
  }, [token, saleId])

  useEffect(() => {
    if (saleData?.sale_status === 'in_progress') {
      const interval = setInterval(loadDeliveryStatus, 30000) // Poll every 30 seconds
      return () => clearInterval(interval)
    }
  }, [saleData?.sale_status])

  const loadSaleData = async () => {
    try {
      const data = await api.getCustomerSale(token, saleId)
      setSaleData(data)
      
      // Initialize cart with current order
      const initialCart = {}
      data.current_order.forEach(item => {
        initialCart[item.product_id] = item.quantity
      })
      setCart(initialCart)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadDeliveryStatus = async () => {
  try {
    const data = await api.getCustomerSaleDeliveryStatus(token, saleId)
    setDeliveryStatus(data)
  } catch (err) {
    console.error('Failed to load delivery status:', err)
  }
}

  const updateQuantity = (productId, change) => {
    setCart(prev => {
      const newQuantity = (prev[productId] || 0) + change
      if (newQuantity <= 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: newQuantity }
    })
  }

  const getTotalAmount = () => {
    if (!saleData) return 0
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = saleData.available_products.find(p => p.id === parseInt(productId))
      return total + (product ? product.sell_price * quantity : 0)
    }, 0)
  }

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    setSaveMessage(null)
    
    try {
      const items = Object.entries(cart).map(([product_id, quantity]) => ({
        product_id: parseInt(product_id),
        quantity
      }))
      
      const result = await api.updateCustomerOrder(token, saleId, items)
      setSaveMessage({ type: 'success', text: result.message })
      
      setTimeout(() => loadSaleData(), 1500)
      
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="customer-loading">
        <div className="spinner"></div>
        <p>Cargando venta...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="customer-error">
        <AlertCircle size={48} />
        <h2>Error</h2>
        <p>{error}</p>
        <Link to={`/customer/${token}`} className="back-link">← Volver a tu página</Link>
      </div>
    )
  }

  const totalAmount = getTotalAmount()
  const totalItems = getTotalItems()
  const hasChanges = JSON.stringify(cart) !== JSON.stringify(
    saleData.current_order.reduce((acc, item) => ({...acc, [item.product_id]: item.quantity}), {})
  )

  return (
    <div className="customer-order">
      <header className="order-header">
        <div className="header-content">
          <Link to={`/customer/${token}`} className="back-button">
            <ArrowLeft size={20} />
            Volver a ventas
          </Link>
          <h1>🥐 Haz tu pedido</h1>
          <div className="order-info">
            <p className="customer-name">{saleData.customer_name}</p>
            <p className="sale-date">{new Date(saleData.sale_date).toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </header>

      <DeliveryStatusCard deliveryStatus={deliveryStatus} />
      
      {saleData.message && (
        <div className={`message-banner ${saleData.is_open ? 'info' : 'warning'}`}>
          <AlertCircle size={20} />
          <span>{saleData.message}</span>
        </div>
      )}

      {saveMessage && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{saveMessage.text}</span>
        </div>
      )}

      <div className="products-section">
        <h2>Productos disponibles</h2>
        <div className="products-grid">
          {saleData.available_products.map(product => {
            const quantity = cart[product.id] || 0
            const isDisabled = !saleData.is_open
            
            return (
              <div key={product.id} className={`product-card ${quantity > 0 ? 'in-cart' : ''}`}>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  {product.description && (
                    <p className="product-description">{product.description}</p>
                  )}
                  <p className="product-price">€{product.sell_price.toFixed(2)}</p>
                </div>
                
                {saleData.is_open ? (
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      disabled={quantity === 0}
                      className="qty-btn"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="quantity">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="qty-btn"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ) : (
                  quantity > 0 && (
                    <div className="quantity-display">
                      Cantidad: {quantity}
                    </div>
                  )
                )}
              </div>
            )
          })}
        </div>
      </div>

      {(totalItems > 0 || saleData.current_order.length > 0) && (
        <div className={`cart-summary ${cartExpanded ? 'expanded' : 'collapsed'}`}>
          <button
            className="summary-toggle"
            onClick={() => setCartExpanded(!cartExpanded)}
            aria-expanded={cartExpanded}
          >
            <div className="summary-toggle-content">
              <ShoppingCart size={20} />
              <span className="toggle-text">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'} · <strong>€{totalAmount.toFixed(2)}</strong>
              </span>
            </div>
            {cartExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>

          {cartExpanded && (
            <div className="summary-details">
              <div className="summary-items">
                {Object.entries(cart).map(([productId, quantity]) => {
                  const product = saleData.available_products.find(p => p.id === parseInt(productId))
                  if (!product || quantity === 0) return null

                  return (
                    <div key={productId} className="summary-item">
                      <span>{quantity}x {product.name}</span>
                      <span>€{(product.sell_price * quantity).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>

              <div className="summary-total">
                <strong>Total:</strong>
                <strong className="total-amount">€{totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          )}

          {saleData.is_open && (
            <button
              onClick={handleSaveOrder}
              disabled={saving || !hasChanges}
              className="save-btn"
            >
              <Save size={20} />
              {saving ? 'Guardando...' : hasChanges ? 'Guardar pedido' : 'Sin cambios'}
            </button>
          )}
        </div>
      )}

      {totalItems === 0 && saleData.current_order.length === 0 && saleData.is_open && (
        <div className="empty-cart">
          <ShoppingCart size={48} />
          <p>Tu carrito está vacío</p>
          <p className="empty-hint">Añade productos arriba para comenzar tu pedido</p>
        </div>
      )}
    </div>
  )
}
