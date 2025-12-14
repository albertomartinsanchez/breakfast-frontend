import React, { useState, useEffect } from 'react'
import { Plus, Eye, Edit, Trash2, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'

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

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <Card 
        title="Sales" 
        action={<Link to="/sales/new"><Button><Plus size={16} /> Create Sale</Button></Link>}
      >
        <div className="sales-list">
          {sales.map(sale => (
            <div key={sale.id} className="sale-item">
              <div className="sale-header">
                <div className="sale-date">
                  <Calendar size={18} />
                  <span>{new Date(sale.date).toLocaleDateString()}</span>
                </div>
                <div className="sale-stats">
                  <span className="stat">{sale.customer_sales.length} customers</span>
                  <span className="stat revenue">${sale.total_revenue.toFixed(2)}</span>
                  <span className="stat profit">${sale.total_benefit.toFixed(2)} profit</span>
                </div>
              </div>
              <div className="sale-actions">
                <Link to={`/sales/${sale.id}`}><button className="action-btn"><Eye size={16} /> View</button></Link>
                <Link to={`/sales/${sale.id}/edit`}><button className="action-btn"><Edit size={16} /> Edit</button></Link>
                <button onClick={() => handleDelete(sale.id)} className="action-btn danger"><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          ))}
          {sales.length === 0 && <div className="empty-state">No sales yet. Create your first sale!</div>}
        </div>
      </Card>

      <style>{`
        .sales-list { display: flex; flex-direction: column; gap: var(--spacing-md); }
        .sale-item { background: var(--color-surface-hover); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--spacing-lg); }
        .sale-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); flex-wrap: wrap; gap: var(--spacing-md); }
        .sale-date { display: flex; align-items: center; gap: var(--spacing-sm); font-weight: 600; color: var(--color-primary); }
        .sale-stats { display: flex; gap: var(--spacing-lg); flex-wrap: wrap; }
        .stat { font-size: 0.875rem; color: var(--color-text-muted); }
        .revenue { color: var(--color-info); font-weight: 600; }
        .profit { color: var(--color-success); font-weight: 600; }
        .sale-actions { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }
        .action-btn { background: var(--color-surface); color: var(--color-text); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-sm); display: flex; align-items: center; gap: var(--spacing-xs); }
        .action-btn:hover { background: var(--color-primary); color: var(--color-bg); }
        .action-btn.danger:hover { background: var(--color-danger); color: white; }
        .empty-state { padding: var(--spacing-2xl); text-align: center; color: var(--color-text-muted); }
      `}</style>
    </div>
  )
}
