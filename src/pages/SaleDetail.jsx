import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'

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

  if (loading) return <div>Loading...</div>
  if (!sale) return null

  return (
    <div>
      <div className="page-header">
        <Link to="/sales"><Button variant="secondary"><ArrowLeft size={16} /> Back to Sales</Button></Link>
        <div className="actions">
          <Link to={`/sales/${id}/edit`}><Button><Edit size={16} /> Edit</Button></Link>
          <Button variant="danger" onClick={handleDelete}><Trash2 size={16} /> Delete</Button>
        </div>
      </div>

      <Card title={`Sale - ${new Date(sale.date).toLocaleDateString()}`}>
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

      <style>{`
        .page-header { display: flex; justify-content: space-between; margin-bottom: var(--spacing-xl); flex-wrap: wrap; gap: var(--spacing-md); }
        .actions { display: flex; gap: var(--spacing-sm); }
        .sale-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-2xl); padding-bottom: var(--spacing-xl); border-bottom: 1px solid var(--color-border); }
        .summary-item { display: flex; gap: var(--spacing-md); align-items: center; }
        .summary-item svg { color: var(--color-primary); }
        .label { font-size: 0.875rem; color: var(--color-text-muted); }
        .value { font-size: 1.25rem; font-weight: 600; }
        .revenue { color: var(--color-info); }
        .profit { color: var(--color-success); }
        .customers-section h3 { margin-bottom: var(--spacing-lg); }
        .customer-section { background: var(--color-surface-hover); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--spacing-lg); margin-bottom: var(--spacing-md); }
        .customer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); }
        .customer-header h4 { margin: 0; }
        .customer-totals { display: flex; gap: var(--spacing-md); font-size: 0.875rem; }
        .products-table { width: 100%; border-collapse: collapse; }
        .products-table th { text-align: left; padding: var(--spacing-sm); color: var(--color-text-muted); font-weight: 600; font-size: 0.875rem; border-bottom: 1px solid var(--color-border); }
        .products-table td { padding: var(--spacing-sm); border-bottom: 1px solid var(--color-border); }
      `}</style>
    </div>
  )
}
