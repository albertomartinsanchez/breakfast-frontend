import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, TrendingUp, Lock, Unlock, Truck } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'
import './SaleDetail.css'

export default function SaleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSale()
  }, [id])

  const loadSale = async () => {
    try {
      const data = await api.getSale(id)
      setSale(data)
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
          {sale.status === 'draft' && (
            <>
              <Link to={`/sales/${id}/edit`}><Button><Edit size={16} /> Edit</Button></Link>
              <Button variant="success" onClick={handleCloseSale}><Lock size={16} /> Close Sale</Button>
            </>
          )}
          {sale.status === 'closed' && (
            <>
              <Button variant="secondary" onClick={handleReopenSale}><Unlock size={16} /> Reopen</Button>
              <Button variant="success" onClick={handleStartDelivery}><Truck size={16} /> Start Delivery</Button>
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
          {sale.status === 'draft' && (
            <Button variant="danger" onClick={handleDelete}><Trash2 size={16} /> Delete</Button>
          )}
        </div>
      </div>

      <Card title={
        <div className="card-title-with-badge">
          <span>Sale - {new Date(sale.date).toLocaleDateString()}</span>
          {getStatusBadge(sale.status)}
        </div>
      }>
        <div className="sale-summary">
          <div className="summary-item">
            <Calendar size={20} />
            <div>
              <div className="label">Date</div>
              <div className="value">{new Date(sale.date).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="summary-item">
            <DollarSign size={20} />
            <div>
              <div className="label">Total Revenue</div>
              <div className="value revenue">${sale.total_revenue.toFixed(2)}</div>
            </div>
          </div>
          <div className="summary-item">
            <TrendingUp size={20} />
            <div>
              <div className="label">Total Profit</div>
              <div className="value profit">${sale.total_benefit.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="customers-section">
          <h3>Customers & Products</h3>
          {sale.customer_sales.map((cs, idx) => (
            <div key={idx} className="customer-section">
              <div className="customer-header">
                <h4>{cs.customer_name}</h4>
                <div className="customer-totals">
                  <span className="revenue">${cs.total_revenue.toFixed(2)}</span>
                  <span className="profit">${cs.total_benefit.toFixed(2)} profit</span>
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
                      <td>${p.sell_price_at_sale.toFixed(2)}</td>
                      <td>${(p.quantity * p.sell_price_at_sale).toFixed(2)}</td>
                      <td className="profit">${p.benefit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}