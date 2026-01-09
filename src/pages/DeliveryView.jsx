import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Check, SkipForward, Package, DollarSign, AlertCircle, ChevronDown, ChevronUp, MapPin, RotateCcw } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import RouteManager from '../components/RouteManager'
import './DeliveryView.css'

export default function DeliveryView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [skipReason, setSkipReason] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showSkipped, setShowSkipped] = useState(false)
  const [showRouteManager, setShowRouteManager] = useState(false)
  const [saleStatus, setSaleStatus] = useState(null)

  useEffect(() => {
    loadDeliveryData()
    loadSaleStatus()
  }, [id])

  const loadDeliveryData = async () => {
    try {
      const [routeData, progressData] = await Promise.all([
        api.getDeliveryRoute(id),
        api.getDeliveryProgress(id)
      ])
      setDeliveries(routeData)
      setProgress(progressData)
    } catch (error) {
      console.error('Failed to load delivery data:', error)
      alert('Failed to load delivery data')
    } finally {
      setLoading(false)
    }
  }

  const loadSaleStatus = async () => {
    try {
      const sale = await api.getSale(id)
      setSaleStatus(sale.status)
    } catch (error) {
      console.error('Failed to load sale status:', error)
    }
  }

  const currentDelivery = deliveries.find(d => d.status === 'pending')
  const completedDeliveries = deliveries.filter(d => d.status === 'completed')
  const skippedDeliveries = deliveries.filter(d => d.status === 'skipped')
  const upcomingDeliveries = deliveries.filter(d => d.status === 'pending' && d !== currentDelivery)

  const handleComplete = async () => {
    if (!currentDelivery) return
    
    try {
      await api.updateDeliveryStatus(id, currentDelivery.customer_id, {
        status: 'completed',
        amount_collected: currentDelivery.total_amount
      })
      await loadDeliveryData()
      await loadSaleStatus()
    } catch (error) {
      alert('Failed to mark as delivered: ' + error.message)
    }
  }

  const handleSkip = async () => {
    if (!skipReason.trim()) {
      alert('Please provide a reason for skipping')
      return
    }

    try {
      await api.updateDeliveryStatus(id, selectedCustomer.customer_id, {
        status: 'skipped',
        skip_reason: skipReason
      })
      setShowSkipModal(false)
      setSkipReason('')
      setSelectedCustomer(null)
      await loadDeliveryData()
      await loadSaleStatus()
    } catch (error) {
      alert('Failed to skip delivery: ' + error.message)
    }
  }

  const handleSetAsCurrent = async (customer) => {
    if (!confirm(`Set ${customer.customer_name} as the current stop?`)) return
    
    try {
      await api.updateDeliveryStatus(id, customer.customer_id, {
        status: 'pending'
      })
      await loadDeliveryData()
      await loadSaleStatus()
    } catch (error) {
      alert('Failed to reset delivery: ' + error.message)
    }
  }

  const openSkipModal = (customer) => {
    setSelectedCustomer(customer)
    setShowSkipModal(true)
  }

  const handleRouteSaved = async () => {
    await loadDeliveryData()
    alert('Route updated successfully!')
  }

  if (loading) return <div>Loading...</div>

  const progressPercentage = progress ? ((progress.completed_count / progress.total_deliveries) * 100).toFixed(0) : 0
  const isCompleted = saleStatus === 'completed'

  return (
    <div className="delivery-view">
      <div className="page-header">
        <Link to={`/sales/${id}`}>
          <Button variant="secondary"><ArrowLeft size={16} /> Back to Sale</Button>
        </Link>
        {!isCompleted && (
          <Button variant="primary" onClick={() => setShowRouteManager(true)}>
            <MapPin size={16} /> Manage Route
          </Button>
        )}
      </div>

      {/* Progress Header */}
      <Card className="progress-card">
        <h2>Delivery Progress</h2>
        <div className="progress-stats">
          <div className="stat">
            <Check size={20} />
            <div>
              <div className="stat-value">{progress?.completed_count || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat">
            <SkipForward size={20} />
            <div>
              <div className="stat-value">{progress?.skipped_count || 0}</div>
              <div className="stat-label">Skipped</div>
            </div>
          </div>
          <div className="stat">
            <Package size={20} />
            <div>
              <div className="stat-value">{progress?.pending_count || 0}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat">
            <DollarSign size={20} />
            <div>
              <div className="stat-value">€{progress?.total_collected.toFixed(2) || '0.00'}</div>
              <div className="stat-label">Collected</div>
            </div>
          </div>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="progress-text">{progressPercentage}% Complete</div>
        </div>

        {progress?.skipped_count > 0 && (
          <div className="warning-box">
            <AlertCircle size={16} />
            <span>€{progress.total_skipped_amount.toFixed(2)} lost from skipped deliveries</span>
          </div>
        )}
      </Card>

      {/* Current Delivery */}
      {currentDelivery && (
        <Card className="current-delivery">
          <div className="delivery-badge">CURRENT STOP</div>
          <div className="sequence-number">#{currentDelivery.sequence_order}</div>
          <h2>{currentDelivery.customer_name}</h2>
          
          <div className="delivery-items">
            {currentDelivery.items.map((item, idx) => (
              <div key={idx} className="item-row">
                <span className="item-name">{item.quantity}x {item.product_name}</span>
                <span className="item-price">€{(item.sell_price_at_sale * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="delivery-total">
            <strong>Total to collect:</strong>
            <strong className="total-amount">€{currentDelivery.total_amount.toFixed(2)}</strong>
          </div>

          <div className="delivery-actions">
            <Button variant="success" onClick={handleComplete} fullWidth>
              <Check size={18} /> Mark as Delivered
            </Button>
            <Button variant="danger" onClick={() => openSkipModal(currentDelivery)} fullWidth>
              <SkipForward size={18} /> Skip
            </Button>
          </div>
        </Card>
      )}

      {/* No More Deliveries */}
      {!currentDelivery && progress?.pending_count === 0 && (
        <Card className="delivery-complete">
          <div className="complete-icon">🎉</div>
          <h2>All Deliveries Complete!</h2>
          <div className="final-stats">
            <div className="final-stat">
              <span className="label">Delivered:</span>
              <span className="value">{progress.completed_count}</span>
            </div>
            <div className="final-stat">
              <span className="label">Skipped:</span>
              <span className="value">{progress.skipped_count}</span>
            </div>
            <div className="final-stat">
              <span className="label">Total Collected:</span>
              <span className="value success">€{progress.total_collected.toFixed(2)}</span>
            </div>
            {progress.skipped_count > 0 && (
              <div className="final-stat warning">
                <span className="label">Lost from Skips:</span>
                <span className="value">€{progress.total_skipped_amount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Upcoming Deliveries */}
      {upcomingDeliveries.length > 0 && (
        <Card title="Next Stops">
          <div className="upcoming-list">
            {upcomingDeliveries.map((delivery, index) => (
              <div key={delivery.customer_id} className="upcoming-item">
                <div className="upcoming-number">{index + 1}</div>
                <div className="upcoming-info">
                  <strong>{delivery.customer_name}</strong>
                  <span className="upcoming-amount">€{delivery.total_amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Completed Section */}
      {completedDeliveries.length > 0 && (
        <Card>
          <div className="collapsible-header" onClick={() => setShowCompleted(!showCompleted)}>
            <h3>✓ Completed ({completedDeliveries.length})</h3>
            {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {showCompleted && (
            <div className="completed-list">
              {completedDeliveries.map(delivery => (
                <div key={delivery.customer_id} className="completed-item">
                  <div className="completed-info">
                    <strong>{delivery.customer_name}</strong>
                    <span className="completed-time">
                      {new Date(delivery.completed_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="completed-actions">
                    <span className="completed-amount">€{delivery.amount_collected.toFixed(2)}</span>
                    {!isCompleted && (
                      <Button 
                        variant="secondary" 
                        onClick={() => handleSetAsCurrent(delivery)}
                        style={{ marginLeft: 'var(--spacing-sm)' }}
                      >
                        <RotateCcw size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Skipped Section */}
      {skippedDeliveries.length > 0 && (
        <Card>
          <div className="collapsible-header" onClick={() => setShowSkipped(!showSkipped)}>
            <h3>⏭️ Skipped ({skippedDeliveries.length})</h3>
            {showSkipped ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {showSkipped && (
            <div className="skipped-list">
              {skippedDeliveries.map(delivery => (
                <div key={delivery.customer_id} className="skipped-item">
                  <div className="skipped-info">
                    <strong>{delivery.customer_name}</strong>
                    <span className="skipped-reason">{delivery.skip_reason}</span>
                  </div>
                  <div className="skipped-actions">
                    <span className="skipped-amount">-€{delivery.total_amount.toFixed(2)}</span>
                    {!isCompleted && (
                      <Button 
                        variant="secondary" 
                        onClick={() => handleSetAsCurrent(delivery)}
                        style={{ marginLeft: 'var(--spacing-sm)' }}
                      >
                        <RotateCcw size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Skip Modal */}
      {showSkipModal && (
        <Modal
          isOpen={showSkipModal}
          onClose={() => {
            setShowSkipModal(false)
            setSkipReason('')
            setSelectedCustomer(null)
          }}
          title="Skip Delivery"
        >
          <div className="skip-modal-content">
            <p>Why are you skipping delivery to <strong>{selectedCustomer?.customer_name}</strong>?</p>
            <textarea
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="Enter reason (e.g., Customer not home, address not found...)"
              rows="4"
              className="skip-modal-textarea"
            />
            <div className="skip-modal-actions">
              <Button variant="secondary" onClick={() => setShowSkipModal(false)} fullWidth>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleSkip} fullWidth>
                Skip Delivery
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Route Manager Modal */}
      {!isCompleted && (
        <RouteManager
          saleId={id}
          isOpen={showRouteManager}
          onClose={() => setShowRouteManager(false)}
          onSave={handleRouteSaved}
        />
      )}
    </div>
  )
}