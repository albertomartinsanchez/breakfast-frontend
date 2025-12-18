import { PDFGenerator, formatCurrency, formatDate } from './pdfGenerator'

export const generateProductPDF = async (analytics) => {
  const pdf = new PDFGenerator()
  const { product, summary, sales_history, top_customers, sales_by_date } = analytics

  // Header
  pdf.addHeader(
    'Product Report',
    product.name
  )

  // Product Info Section
  pdf.addSectionHeading('Product Information')
  pdf.addKeyValue('Name', product.name)
  pdf.addKeyValue('Description', product.description || 'N/A')
  pdf.addKeyValue('Buy Price', formatCurrency(product.buy_price))
  pdf.addKeyValue('Sell Price', formatCurrency(product.sell_price))
  pdf.addKeyValue('Profit Margin', `${product.profit_margin}%`, { 
    valueColor: '#7fb069',
    bold: true 
  })

  pdf.addSpace(5)
  pdf.addLine()
  pdf.addSpace(5)

  // Summary Section
  pdf.addSectionHeading('Sales Summary')
  pdf.addKeyValue('Total Units Sold', summary.total_units_sold.toString())
  pdf.addKeyValue('Number of Sales', summary.num_sales.toString())
  pdf.addKeyValue('Total Revenue', formatCurrency(summary.total_revenue), { 
    valueColor: '#81b3d0',
    bold: true 
  })
  pdf.addKeyValue('Total Profit', formatCurrency(summary.total_profit), { 
    valueColor: '#7fb069',
    bold: true 
  })
  pdf.addKeyValue('Avg Units/Sale', summary.average_units_per_sale.toFixed(1))
  pdf.addKeyValue('Avg Revenue/Sale', formatCurrency(summary.average_revenue_per_sale))

  pdf.addSpace(5)
  pdf.addLine()
  pdf.addSpace(5)

  // Top Customers Section
  if (top_customers.length > 0) {
    pdf.addSectionHeading('Top Customers')
    
    const headers = ['Customer', 'Units Purchased']
    const rows = top_customers.map(c => [
      c.customer_name,
      c.units_purchased.toString()
    ])

    pdf.addTable(headers, rows)
    pdf.addSpace(5)
  }

  // Sales by Date Section
  if (sales_by_date.length > 0) {
    pdf.addSectionHeading('Sales by Date')
    
    const headers = ['Date', 'Quantity', 'Revenue']
    const rows = sales_by_date.slice(0, 20).map(s => [ // Limit to 20 most recent
      formatDate(s.date),
      s.quantity.toString(),
      formatCurrency(s.revenue)
    ])

    pdf.addTable(headers, rows)
  }

  // Save
  pdf.save(`product-${product.name.replace(/\s+/g, '-')}.pdf`)
}
