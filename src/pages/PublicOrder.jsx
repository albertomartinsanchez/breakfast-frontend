import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Save, CheckCircle, AlertCircle } from 'lucide-react'
import './PublicOrder.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function PublicOrder() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState(null)
  const [error, setError] = useState(null)
  const [cart, setCart] = useState({}) // { product_id: quantity }
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)

  useEffect(() => {
    loadOrderData()
  }, [token])

  const loadOrderData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/order/${token}`)
      
      if (!response.ok) {
        throw new Error('Invalid order link')
      }
      
      const data = await response.json()
      setOrderData(data)
      
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
    if (!orderData) return 0
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = orderData.available_products.find(p => p.id === parseInt(productId))
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
      
      const response = await fetch(`${API_BASE_URL}/order/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save order')
      }
      
      const result = await response.json()
      setSaveMessage({ type: 'success', text: result.message })
      
      // Reload to get updated data
      setTimeout(() => loadOrderData(), 1500)
      
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="public-order-loading">
        <div className="spinner"></div>
        <p>Loading order...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="public-order-error">
        <AlertCircle size={48} />
        <h2>Invalid Order Link</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!orderData) return null

  const totalAmount = getTotalAmount()
  const totalItems = getTotalItems()
  const hasChanges = JSON.stringify(cart) !== JSON.stringify(
    orderData.current_order.reduce((acc, item) => ({...acc, [item.product_id]: item.quantity}), {})
  )

  return (
    <div className="public-order">
      {/* Header */}
      <header className="order-header">
        <div className="header-content">
          <h1>🥐 Order Your Breakfast</h1>
          <div className="order-info">
            <p className="customer-name">{orderData.customer_name}</p>
            <p className="sale-date">{new Date(orderData.sale_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </div>
      </header>

      {/* Message Banner */}
      {orderData.message && (
        <div className={`message-banner ${orderData.is_open ? 'info' : 'warning'}`}>
          <AlertCircle size={20} />
          <span>{orderData.message}</span>
        </div>
      )}

      {/* Save Message */}
      {saveMessage && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Products */}
      <div className="products-section">
        <h2>Available Products</h2>
        <div className="products-grid">
          {orderData.available_products.map(product => {
            const quantity = cart[product.id] || 0
            const isDisabled = !orderData.is_open
            
            return (
              <div key={product.id} className={`product-card ${quantity > 0 ? 'in-cart' : ''}`}>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  {product.description && (
                    <p className="product-description">{product.description}</p>
                  )}
                  <p className="product-price">${product.sell_price.toFixed(2)}</p>
                </div>
                
                {orderData.is_open ? (
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
                      Quantity: {quantity}
                    </div>
                  )
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Cart Summary */}
      {(totalItems > 0 || orderData.current_order.length > 0) && (
        <div className="cart-summary">
          <div className="summary-header">
            <ShoppingCart size={24} />
            <h3>Your Order</h3>
          </div>
          
          <div className="summary-items">
            {Object.entries(cart).map(([productId, quantity]) => {
              const product = orderData.available_products.find(p => p.id === parseInt(productId))
              if (!product || quantity === 0) return null
              
              return (
                <div key={productId} className="summary-item">
                  <span>{quantity}x {product.name}</span>
                  <span>${(product.sell_price * quantity).toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          
          <div className="summary-total">
            <strong>Total:</strong>
            <strong className="total-amount">${totalAmount.toFixed(2)}</strong>
          </div>
          
          {orderData.is_open && (
            <button
              onClick={handleSaveOrder}
              disabled={saving || !hasChanges}
              className="save-btn"
            >
              <Save size={20} />
              {saving ? 'Saving...' : hasChanges ? 'Save Order' : 'No Changes'}
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {totalItems === 0 && orderData.current_order.length === 0 && orderData.is_open && (
        <div className="empty-cart">
          <ShoppingCart size={48} />
          <p>Your cart is empty</p>
          <p className="empty-hint">Add products above to start your order</p>
        </div>
      )}
    </div>
  )
}
