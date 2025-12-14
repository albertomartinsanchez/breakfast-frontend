import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, Plus } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'
import './Dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, sales: 0, revenue: 0, profit: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [products, customers, sales] = await Promise.all([
        api.getProducts(),
        api.getCustomers(),
        api.getSales()
      ])
      
      const revenue = sales.reduce((sum, sale) => sum + (sale.total_revenue || 0), 0)
      const profit = sales.reduce((sum, sale) => sum + (sale.total_benefit || 0), 0)
      
      setStats({
        products: products.length,
        customers: customers.length,
        sales: sales.length,
        revenue,
        profit
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { icon: Package, label: 'Products', value: stats.products, color: 'info', link: '/products' },
    { icon: Users, label: 'Customers', value: stats.customers, color: 'success', link: '/customers' },
    { icon: ShoppingCart, label: 'Sales', value: stats.sales, color: 'warning', link: '/sales' },
    { icon: DollarSign, label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, color: 'primary', link: '/sales' },
    { icon: TrendingUp, label: 'Profit', value: `$${stats.profit.toFixed(2)}`, color: 'primary', link: '/sales' },
  ]

  if (loading) return <div>Loading...</div>

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="quick-actions">
          <Link to="/products"><Button size="sm"><Plus size={16} /> Product</Button></Link>
          <Link to="/customers"><Button size="sm" variant="secondary"><Plus size={16} /> Customer</Button></Link>
          <Link to="/sales/new"><Button size="sm" variant="success"><Plus size={16} /> Sale</Button></Link>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(({ icon: Icon, label, value, color, link }) => (
          <Link to={link} key={label} className="stat-card-link">
            <div className={`stat-card stat-${color}`}>
              <div className="stat-icon"><Icon size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}