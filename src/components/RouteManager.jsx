import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, Save } from 'lucide-react'
import Modal from '../components/Modal'
import Button from '../components/Button'
import { api } from '../services/api'
import './RouteManager.css'

export default function RouteManager({ saleId, isOpen, onClose, onSave }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadRoute()
    }
  }, [isOpen, saleId])

  const loadRoute = async () => {
    try {
      // Get sale details to extract customers
      const sale = await api.getSale(saleId)
      
      // Extract unique customers with their totals
      const customerMap = new Map()
      
      sale.customer_sales.forEach(cs => {
        if (!customerMap.has(cs.customer_id)) {
          customerMap.set(cs.customer_id, {
            customer_id: cs.customer_id,
            customer_name: cs.customer_name,
            total_amount: cs.total_revenue,
            sequence: customerMap.size + 1 // Default sequence
          })
        }
      })
      
      // Try to get existing delivery route (might not exist yet if not started)
      try {
        const route = await api.getDeliveryRoute(saleId)
        if (route && route.length > 0) {
          // Use existing sequence
          const sortedCustomers = route.map(r => ({
            customer_id: r.customer_id,
            customer_name: r.customer_name,
            total_amount: r.total_amount,
            sequence: r.sequence_order
          }))
          setCustomers(sortedCustomers.sort((a, b) => a.sequence - b.sequence))
        } else {
          // Use default from sale
          setCustomers(Array.from(customerMap.values()))
        }
      } catch (error) {
        // Route doesn't exist yet, use default from sale
        setCustomers(Array.from(customerMap.values()))
      }
    } catch (error) {
      console.error('Failed to load route:', error)
      alert('Failed to load route: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const moveUp = (index) => {
    if (index === 0) return
    const newCustomers = [...customers]
    ;[newCustomers[index], newCustomers[index - 1]] = [newCustomers[index - 1], newCustomers[index]]
    updateSequences(newCustomers)
  }

  const moveDown = (index) => {
    if (index === customers.length - 1) return
    const newCustomers = [...customers]
    ;[newCustomers[index], newCustomers[index + 1]] = [newCustomers[index + 1], newCustomers[index]]
    updateSequences(newCustomers)
  }

  const updateSequences = (newCustomers) => {
    const updated = newCustomers.map((c, idx) => ({
      ...c,
      sequence: idx + 1
    }))
    setCustomers(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const route = customers.map(c => ({
        customer_id: c.customer_id,
        sequence: c.sequence
      }))
      
      await api.updateDeliveryRoute(saleId, route)
      onSave()
      onClose()
    } catch (error) {
      console.error('Failed to save route:', error)
      alert('Failed to save route: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Delivery Route">
      <div className="route-manager">
        {loading ? (
          <div className="route-loading">Loading...</div>
        ) : (
          <>
            <p className="route-hint">
              Arrange customers in the order you want to deliver. The first customer will be your first stop.
            </p>
            
            <div className="route-list">
              {customers.map((customer, index) => (
                <div key={customer.customer_id} className="route-item">
                  <div className="route-number">{index + 1}</div>
                  <div className="route-info">
                    <strong>{customer.customer_name}</strong>
                    <span className="route-amount">${customer.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="route-controls">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="route-btn"
                      title="Move up"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === customers.length - 1}
                      className="route-btn"
                      title="Move down"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="route-actions">
              <Button variant="secondary" onClick={onClose} fullWidth disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} fullWidth disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Route'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
