import React, { useState, useEffect } from 'react'
import { Plus, Eye, Edit, Trash2, Calendar, Package, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'
import './Sales.css'

export default function Sales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      const data = await api.getSales()
      setSales(data.sort((a, b) => new Date(b.date) - new Date(a.date)))
    } catch (error) {
      console.error('Failed to load sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this sale?')) return
    try {
      await api.deleteSale(id)
      await loadSales()
    } catch (error) {
      alert('Failed to delete sale')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { label: 'Open', className: 'status-badge-draft' },
      closed: { label: 'Closed', className: 'status-badge-closed' },
      in_progress: { label: 'In Progress', className: 'status-badge-in-progress' },
      completed: { label: 'Completed', className: 'status-badge-completed' }
    }
    const badge = badges[status] || { label: status, className: 'status-badge-draft' }
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>
  }

  const getTotalProducts = (sale) => {
    return sale.customer_sales.reduce((total, cs) => {
      return total + cs.products.reduce((sum, p) => sum + p.quantity, 0)
    }, 0)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <Card 
        title="Sales" 
        action={<Link to="/sales/new"><Button><Plus size={16} /> Create Sale</Button></Link>}
      >
        <div className="sales-list">
          {sales.map(sale => {
            const totalProducts = getTotalProducts(sale)
            const isEditable = sale.status === 'draft'
            
            return (
              <div key={sale.id} className="sale-item">
                <div className="sale-header">
                  <div className="sale-info-left">
                    <div className="sale-date">
                      <Calendar size={18} />
                      <span>{new Date(sale.date).toLocaleDateString()}</span>
                    </div>
                    {getStatusBadge(sale.status)}
                  </div>
                  <div className="sale-stats">
                    <span className="stat">
                      <Users size={14} />
                      {sale.customer_sales.length} stops
                    </span>
                    <span className="stat">
                      <Package size={14} />
                      {totalProducts} products
                    </span>
                    <span className="stat revenue">${sale.total_revenue.toFixed(2)}</span>
                    <span className="stat profit">${sale.total_benefit.toFixed(2)} profit</span>
                  </div>
                </div>
                <div className="sale-actions">
                  <Link to={`/sales/${sale.id}`}>
                    <button className="action-btn">
                      <Eye size={16} /> View
                    </button>
                  </Link>
                  {isEditable && (
                    <Link to={`/sales/${sale.id}/edit`}>
                      <button className="action-btn">
                        <Edit size={16} /> Edit
                      </button>
                    </Link>
                  )}
                  {isEditable && (
                    <button onClick={() => handleDelete(sale.id)} className="action-btn danger">
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {sales.length === 0 && (
            <div className="empty-state">No sales yet. Create your first sale!</div>
          )}
        </div>
      </Card>
    </div>
  )
}