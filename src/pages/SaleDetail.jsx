import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, TrendingUp, Lock, Unlock, Truck, FileText, MapPin } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'
import { generateSalePDF } from '../utils/salePDF'
import RouteManager from '../components/RouteManager'
import './SaleDetail.css'

export default function SaleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [showRouteManager, setShowRouteManager] = useState(false)
  const [routeSet, setRouteSet] = useState(false)
  const [deliveryRoute, setDeliveryRoute] = useState([])

  useEffect(() => {
    loadSale()
  }, [id])

  const loadSale = async () => {
    try {
      const data = await api.getSale(id)
      setSale(data)

      // Check if route exists for closed sales
      if (data.status === 'closed') {
        try {
          const route = await api.getDeliveryRoute(id)
          setDeliveryRoute(route || [])
          setRouteSet(route && route.length > 0)
        } catch {
          setDeliveryRoute([])
          setRouteSet(false)
        }
      }
    } catch (error) {
      console.error('Failed to load sale:', error)
      navigate('/sales')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this sale?')) return
    try {
      await api.deleteSale(id)
      navigate('/sales')
    } catch (error) {
      alert('Failed to delete sale')
    }
  }

  const handleCloseSale = async () => {
    try {
      await api.updateSaleStatus(id, { status: 'closed' })
      await loadSale()
    } catch (error) {
      alert('Failed to close sale: ' + error.message)
    }
  }

  const handleReopenSale = async () => {
    if (!confirm('Reopen this sale? Customers will be able to add orders again.')) return
    try {
      await api.updateSaleStatus(id, { status: 'draft' })
      await loadSale()
    } catch (error) {
      alert('Failed to reopen sale: ' + error.message)
    }
  }

  const handleStartDelivery = async () => {
    try {
      await api.startDelivery(id)
      navigate(`/sales/${id}/delivery`)
    } catch (error) {
      alert('Failed to start delivery: ' + error.message)
    }
  }

  const handleExportPDF = async () => {
    setGeneratingPDF(true)
    try {
      // If sale is completed, fetch delivery data
      let deliveryData = null
      if (sale.status === 'completed' || sale.status === 'in_progress') {
        try {
          const [route, progress] = await Promise.all([
            api.getDeliveryRoute(id),
            api.getDeliveryProgress(id)
          ])
          deliveryData = {
            ...progress,
            deliveries: route
          }
        } catch (error) {
          console.warn('Could not fetch delivery data:', error)
        }
      }
      
      await generateSalePDF(sale, deliveryData)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF: ' + error.message)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const getSortedCustomerSales = () => {
    if (!sale) return []
    if (deliveryRoute.length === 0) return sale.customer_sales

    // Create a map of customer_id to sequence_order
    const sequenceMap = new Map(
      deliveryRoute.map(r => [r.customer_id, r.sequence_order])
    )

    // Sort customer_sales by sequence_order (customers not in route go to the end)
    return [...sale.customer_sales].sort((a, b) => {
      const seqA = sequenceMap.get(a.customer_id) ?? Infinity
      const seqB = sequenceMap.get(b.customer_id) ?? Infinity
      return seqA - seqB
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { label: 'Open', className: 'status-draft' },
      closed: { label: 'Closed', className: 'status-closed' },
      in_progress: { label: 'In Progress', className: 'status-in-progress' },
      completed: { label: 'Completed', className: 'status-completed' }
    }
    const badge = badges[status] || { label: status, className: 'status-draft' }
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>
  }

  if (loading) return <div>Loading...</div>
  if (!sale) return null

  return (
    <div>
      <div className="page-header">
        <Link to="/sales"><Button variant="secondary"><ArrowLeft size={16} /> Back to Sales</Button></Link>
        <div className="actions">
          <Button variant="primary" onClick={handleExportPDF} disabled={generatingPDF}>
            <FileText size={16} /> {generatingPDF ? 'Generating...' : 'Export PDF'}
          </Button>
          
          {sale.status === 'draft' && (
            <>
              <Link to={`/sales/${id}/edit`}><Button><Edit size={16} /> Edit</Button></Link>
              <Button variant="success" onClick={handleCloseSale}><Lock size={16} /> Close Sale</Button>
            </>
          )}
          {sale.status === 'closed' && (
            <>
              <Button variant="secondary" onClick={handleReopenSale}><Unlock size={16} /> Reopen</Button>
              <Button variant={routeSet ? "secondary" : "primary"} onClick={() => setShowRouteManager(true)}>
                <MapPin size={16} /> {routeSet ? 'Edit Route' : 'Set Route'}
              </Button>
              {routeSet && (
                <Button variant="success" onClick={handleStartDelivery}>
                  <Truck size={16} /> Start Delivery
                </Button>
              )}
            </>
          )}
          {sale.status === 'in_progress' && (
            <Link to={`/sales/${id}/delivery`}>
              <Button variant="success"><Truck size={16} /> Continue Delivery</Button>
            </Link>
          )}
          {sale.status === 'completed' && (
            <Link to={`/sales/${id}/delivery`}>
              <Button variant="secondary"><Truck size={16} /> View Delivery</Button>
            </Link>
          )}
          <Button variant="danger" onClick={handleDelete}><Trash2 size={16} /> Delete</Button>
        </div>
      </div>

      <Card title={
        <div className="card-title-with-badge">
          <span>Sale - {new Date(sale.date).toLocaleDateString('en-GB')}</span>
          {getStatusBadge(sale.status)}
        </div>
      }>
        <div className="sale-summary">
          <div className="summary-item">
            <Calendar size={20} />
            <div>
              <div className="label">Date</div>
              <div className="value">{new Date(sale.date).toLocaleDateString('en-GB')}</div>
            </div>
          </div>
          <div className="summary-item">
            <DollarSign size={20} />
            <div>
              <div className="label">Total Revenue</div>
              <div className="value revenue">€{sale.total_revenue.toFixed(2)}</div>
            </div>
          </div>
          <div className="summary-item">
            <TrendingUp size={20} />
            <div>
              <div className="label">Total Profit</div>
              <div className="value profit">€{sale.total_benefit.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="customers-section">
          <h3>Customers & Products</h3>
          {getSortedCustomerSales().map((cs, idx) => (
            <div key={idx} className="customer-section">
              <div className="customer-header">
                <h4>{cs.customer_name}</h4>
                <div className="customer-totals">
                  <span className="revenue">€{cs.total_revenue.toFixed(2)}</span>
                  <span className="profit">€{cs.total_benefit.toFixed(2)} profit</span>
                </div>
              </div>
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {cs.products.map((p, pidx) => (
                    <tr key={pidx}>
                      <td>{p.product_name}</td>
                      <td>{p.quantity}</td>
                      <td>€{p.sell_price_at_sale.toFixed(2)}</td>
                      <td>€{(p.quantity * p.sell_price_at_sale).toFixed(2)}</td>
                      <td className="profit">€{p.benefit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Card>

      <RouteManager
        saleId={id}
        isOpen={showRouteManager}
        onClose={() => setShowRouteManager(false)}
        onSave={async () => {
          setRouteSet(true)
          try {
            const route = await api.getDeliveryRoute(id)
            setDeliveryRoute(route || [])
          } catch {
            // Route was just saved, so this shouldn't fail
          }
          loadSale()
        }}
      />
    </div>
  )
}
