import React, { useState, useEffect } from 'react'
import { BarChart3, FileText, Calendar } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'
import { generateDashboardPDF } from '../utils/dashboardPDF'
import './Analytics.css'

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange.start) params.append('start_date', dateRange.start)
      if (dateRange.end) params.append('end_date', dateRange.end)
      
      const data = await api.getDashboardAnalytics(params.toString())
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      alert('Failed to load analytics: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    setGeneratingPDF(true)
    try {
      await generateDashboardPDF(analytics)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF: ' + error.message)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleFilterChange = () => {
    setLoading(true)
    loadAnalytics()
  }

  if (loading) return <div>Loading...</div>
  if (!analytics) return <div>No data available</div>

  const { summary, sales_by_status, top_products, top_customers } = analytics

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="header-left">
          <BarChart3 size={32} />
          <h1>Business Analytics</h1>
        </div>
        <Button variant="primary" onClick={handleExportPDF} disabled={generatingPDF}>
          <FileText size={16} /> {generatingPDF ? 'Generating...' : 'Export PDF'}
        </Button>
      </div>

      {/* Date Filter */}
      <Card title="Date Range Filter">
        <div className="date-filter">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <Button onClick={handleFilterChange}>
            <Calendar size={16} /> Apply Filter
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="summary-grid">
        <Card className="summary-card">
          <div className="summary-label">Total Sales</div>
          <div className="summary-value">{summary.total_sales}</div>
        </Card>
        <Card className="summary-card">
          <div className="summary-label">Total Revenue</div>
          <div className="summary-value revenue">€{summary.total_revenue.toFixed(2)}</div>
        </Card>
        <Card className="summary-card">
          <div className="summary-label">Total Profit</div>
          <div className="summary-value profit">€{summary.total_profit.toFixed(2)}</div>
        </Card>
        <Card className="summary-card">
          <div className="summary-label">Profit Margin</div>
          <div className="summary-value">{summary.profit_margin}%</div>
        </Card>
        <Card className="summary-card">
          <div className="summary-label">Total Customers</div>
          <div className="summary-value">{summary.total_customers}</div>
        </Card>
        <Card className="summary-card">
          <div className="summary-label">Total Products</div>
          <div className="summary-value">{summary.total_products}</div>
        </Card>
      </div>

      {/* Sales by Status */}
      {Object.keys(sales_by_status).length > 0 && (
        <Card title="Sales by Status">
          <div className="status-grid">
            {Object.entries(sales_by_status).map(([status, count]) => (
              <div key={status} className="status-item">
                <span className="status-label">{status.toUpperCase()}</span>
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Products */}
      {top_products.length > 0 && (
        <Card title="Top Products by Revenue">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {top_products.slice(0, 10).map((product, idx) => (
                <tr key={idx}>
                  <td>{product.product_name}</td>
                  <td>{product.units_sold}</td>
                  <td className="revenue">€{product.revenue.toFixed(2)}</td>
                  <td className="profit">€{product.profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Top Customers */}
      {top_customers.length > 0 && (
        <Card title="Top Customers by Revenue">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {top_customers.slice(0, 10).map((customer, idx) => (
                <tr key={idx}>
                  <td>{customer.customer_name}</td>
                  <td>{customer.orders}</td>
                  <td className="revenue">€{customer.revenue.toFixed(2)}</td>
                  <td className="profit">€{customer.profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
