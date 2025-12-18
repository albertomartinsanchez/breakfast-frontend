import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Check, SkipForward, Package, DollarSign, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'

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

  useEffect(() => {
    loadDeliveryData()
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
    } catch (error) {
      alert('Failed to skip delivery: ' + error.message)
    }
  }

  const openSkipModal = (customer) => {
    setSelectedCustomer(customer)
    setShowSkipModal(true)
  }

  if (loading) return <div>Loading...</div>

  const progressPercentage = progress ? ((progress.completed_count / progress.total_deliveries) * 100).toFixed(0) : 0

  return (
    <div className="delivery-view">
      <div className="page-header">
        <Link to={`/sales/${id}`}>
          <Button variant="secondary"><ArrowLeft size={16} /> Back to Sale</Button>
        </Link>
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
              <div className="stat-value">${progress?.total_collected.toFixed(2) || '0.00'}</div>
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
            <span>${progress.total_skipped_amount.toFixed(2)} lost from skipped deliveries</span>
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
                <span className="item-price">${(item.sell_price_at_sale * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="delivery-total">
            <strong>Total to collect:</strong>
            <strong className="total-amount">${currentDelivery.total_amount.toFixed(2)}</strong>
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
              <span className="value success">${progress.total_collected.toFixed(2)}</span>
            </div>
            {progress.skipped_count > 0 && (
              <div className="final-stat warning">
                <span className="label">Lost from Skips:</span>
                <span className="value">${progress.total_skipped_amount.toFixed(2)}</span>
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
                  <span className="upcoming-amount">${delivery.total_amount.toFixed(2)}</span>
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
                  <span className="completed-amount">${delivery.amount_collected.toFixed(2)}</span>
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
                  <span className="skipped-amount">-${delivery.total_amount.toFixed(2)}</span>
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
              style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
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

      <style>{`
        .delivery-view { max-width: 800px; margin: 0 auto; }
        .page-header { margin-bottom: var(--spacing-xl); }
        
        /* Progress Card */
        .progress-card h2 { margin-bottom: var(--spacing-lg); }
        .progress-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-lg); }
        .stat { display: flex; gap: var(--spacing-sm); align-items: center; }
        .stat svg { color: var(--color-primary); flex-shrink: 0; }
        .stat-value { font-size: 1.5rem; font-weight: 700; line-height: 1; }
        .stat-label { font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        
        .progress-bar-container { margin-bottom: var(--spacing-md); }
        .progress-bar { height: 12px; background: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, var(--color-success), var(--color-primary)); transition: width 0.3s ease; }
        .progress-text { text-align: center; font-size: 0.875rem; color: var(--color-text-muted); margin-top: var(--spacing-sm); }
        
        .warning-box { display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-md); background: var(--color-warning-bg); border: 1px solid var(--color-warning); border-radius: var(--radius-md); color: var(--color-warning); font-size: 0.875rem; }
        
        /* Current Delivery */
        .current-delivery { position: relative; padding: var(--spacing-xl); background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-hover) 100%); border: 2px solid var(--color-primary); box-shadow: var(--shadow-glow); }
        .delivery-badge { position: absolute; top: var(--spacing-md); right: var(--spacing-md); background: var(--color-primary); color: var(--color-bg); padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; }
        .sequence-number { position: absolute; top: var(--spacing-md); left: var(--spacing-md); width: 40px; height: 40px; background: var(--color-primary); color: var(--color-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.125rem; }
        .current-delivery h2 { margin: var(--spacing-sm) 0 var(--spacing-lg); padding-left: 50px; }
        
        .delivery-items { background: var(--color-surface); border-radius: var(--radius-md); padding: var(--spacing-md); margin-bottom: var(--spacing-lg); }
        .item-row { display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--color-border); }
        .item-row:last-child { border-bottom: none; }
        .item-name { font-weight: 500; }
        .item-price { color: var(--color-info); font-weight: 600; }
        
        .delivery-total { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); background: var(--color-bg); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg); font-size: 1.125rem; }
        .total-amount { color: var(--color-success); font-size: 1.5rem; }
        
        .delivery-actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); }
        
        /* Delivery Complete */
        .delivery-complete { text-align: center; padding: var(--spacing-2xl); }
        .complete-icon { font-size: 4rem; margin-bottom: var(--spacing-lg); }
        .delivery-complete h2 { margin-bottom: var(--spacing-xl); }
        .final-stats { display: grid; gap: var(--spacing-md); max-width: 400px; margin: 0 auto; }
        .final-stat { display: flex; justify-content: space-between; padding: var(--spacing-md); background: var(--color-surface-hover); border-radius: var(--radius-md); }
        .final-stat.warning { background: var(--color-warning-bg); border: 1px solid var(--color-warning); }
        .final-stat .label { color: var(--color-text-muted); }
        .final-stat .value { font-weight: 700; }
        .final-stat .value.success { color: var(--color-success); }
        
        /* Upcoming */
        .upcoming-list { display: grid; gap: var(--spacing-sm); }
        .upcoming-item { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-md); background: var(--color-surface-hover); border-radius: var(--radius-md); }
        .upcoming-number { width: 32px; height: 32px; background: var(--color-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--color-text-muted); }
        .upcoming-info { flex: 1; display: flex; justify-content: space-between; align-items: center; }
        .upcoming-amount { color: var(--color-info); font-weight: 600; }
        
        /* Collapsible */
        .collapsible-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; }
        .collapsible-header:hover { opacity: 0.8; }
        .collapsible-header h3 { margin: 0; }
        
        /* Completed */
        .completed-list { display: grid; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
        .completed-item { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); background: var(--color-surface-hover); border-radius: var(--radius-md); opacity: 0.7; }
        .completed-info { display: flex; flex-direction: column; gap: var(--spacing-xs); }
        .completed-time { font-size: 0.75rem; color: var(--color-text-muted); }
        .completed-amount { color: var(--color-success); font-weight: 600; }
        
        /* Skipped */
        .skipped-list { display: grid; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
        .skipped-item { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); background: var(--color-danger-bg); border: 1px solid var(--color-danger); border-radius: var(--radius-md); }
        .skipped-info { display: flex; flex-direction: column; gap: var(--spacing-xs); }
        .skipped-reason { font-size: 0.75rem; color: var(--color-text-muted); font-style: italic; }
        .skipped-amount { color: var(--color-danger); font-weight: 600; }
        
        /* Mobile Responsive */
        @media (max-width: 640px) {
          .progress-stats { grid-template-columns: repeat(2, 1fr); }
          .delivery-actions { grid-template-columns: 1fr; }
          .stat-value { font-size: 1.25rem; }
        }
      `}</style>
    </div>
  )
}
