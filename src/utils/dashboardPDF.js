import { PDFGenerator, formatCurrency, formatDate } from './pdfGenerator'

export const generateDashboardPDF = async (analytics) => {
  const pdf = new PDFGenerator('landscape')
  const { summary, sales_by_status, top_products, top_customers, sales_by_date } = analytics

  // Header
  pdf.addHeader(
    'Business Analytics Dashboard',
    'Comprehensive Overview'
  )

  // Summary Section
  pdf.addSectionHeading('Business Summary')
  
  const summaryData = [
    ['Total Sales', summary.total_sales.toString()],
    ['Total Revenue', formatCurrency(summary.total_revenue)],
    ['Total Profit', formatCurrency(summary.total_profit)],
    ['Profit Margin', `${summary.profit_margin}%`],
    ['Total Products', summary.total_products.toString()],
    ['Total Customers', summary.total_customers.toString()],
    ['Avg Sale Revenue', formatCurrency(summary.average_sale_revenue)],
    ['Avg Sale Profit', formatCurrency(summary.average_sale_profit)]
  ]

  pdf.addTable(['Metric', 'Value'], summaryData, {
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 80, halign: 'right' }
    }
  })

  pdf.addSpace(10)

  // Sales by Status
  if (Object.keys(sales_by_status).length > 0) {
    pdf.addSectionHeading('Sales by Status')
    
    const statusRows = Object.entries(sales_by_status).map(([status, count]) => [
      status.toUpperCase(),
      count.toString()
    ])

    pdf.addTable(['Status', 'Count'], statusRows, {
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 80, halign: 'right' }
      }
    })

    pdf.addSpace(10)
  }

  // Top Products Section
  if (top_products.length > 0) {
    pdf.addSectionHeading('Top Products by Revenue')
    
    const headers = ['Product', 'Units Sold', 'Revenue', 'Profit']
    const rows = top_products.slice(0, 10).map(p => [
      p.product_name,
      p.units_sold.toString(),
      formatCurrency(p.revenue),
      formatCurrency(p.profit)
    ])

    pdf.addTable(headers, rows)
    pdf.addSpace(10)
  }

  // Top Customers Section
  if (top_customers.length > 0) {
    pdf.addSectionHeading('Top Customers by Revenue')
    
    const headers = ['Customer', 'Orders', 'Revenue', 'Profit']
    const rows = top_customers.slice(0, 10).map(c => [
      c.customer_name,
      c.orders.toString(),
      formatCurrency(c.revenue),
      formatCurrency(c.profit)
    ])

    pdf.addTable(headers, rows)
    pdf.addSpace(10)
  }

  // Sales Trends Section
  if (sales_by_date.length > 0) {
    pdf.addSectionHeading('Recent Sales Trends')
    
    const headers = ['Date', 'Sales', 'Revenue', 'Profit']
    const rows = sales_by_date.slice(0, 15).map(s => [ // Last 15 dates
      formatDate(s.date),
      s.count.toString(),
      formatCurrency(s.revenue),
      formatCurrency(s.profit)
    ])

    pdf.addTable(headers, rows)
  }

  // Save
  const today = new Date().toISOString().split('T')[0]
  pdf.save(`dashboard-${today}.pdf`)
}
