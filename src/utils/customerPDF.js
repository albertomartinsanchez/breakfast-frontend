import { PDFGenerator, formatCurrency, formatDate } from './pdfGenerator'

export const generateCustomerPDF = async (analytics) => {
  const pdf = new PDFGenerator()
  const { customer, summary, purchase_history, favorite_products } = analytics

  // Header
  pdf.addHeader(
    'Customer Report',
    customer.name
  )

  // Customer Info Section
  pdf.addSectionHeading('Customer Information')
  pdf.addKeyValue('Name', customer.name)
  pdf.addKeyValue('Address', customer.address || 'N/A')
  pdf.addKeyValue('Phone', customer.phone || 'N/A')

  pdf.addSpace(5)
  pdf.addLine()
  pdf.addSpace(5)

  // Summary Section
  pdf.addSectionHeading('Purchase Summary')
  pdf.addKeyValue('Total Orders', summary.total_orders.toString())
  pdf.addKeyValue('Total Spent', formatCurrency(summary.total_spent), { 
    valueColor: '#81b3d0',
    bold: true 
  })
  pdf.addKeyValue('Profit Generated', formatCurrency(summary.total_profit_generated), { 
    valueColor: '#7fb069',
    bold: true 
  })
  pdf.addKeyValue('Average Order', formatCurrency(summary.average_order_value))
  pdf.addKeyValue('First Order', summary.first_order_date ? formatDate(summary.first_order_date) : 'N/A')
  pdf.addKeyValue('Last Order', summary.last_order_date ? formatDate(summary.last_order_date) : 'N/A')

  pdf.addSpace(5)
  pdf.addLine()
  pdf.addSpace(5)

  // Favorite Products Section
  if (favorite_products.length > 0) {
    pdf.addSectionHeading('Favorite Products')
    
    const headers = ['Product', 'Times Purchased', 'Total Spent']
    const rows = favorite_products.map(p => [
      p.product_name,
      p.times_purchased.toString(),
      formatCurrency(p.total_spent)
    ])

    pdf.addTable(headers, rows)
    pdf.addSpace(5)
  }

  // Purchase History Section
  if (purchase_history.length > 0) {
    pdf.addSectionHeading('Purchase History')
    
    const headers = ['Date', 'Sale ID', 'Total', 'Profit', 'Status']
    const rows = purchase_history.map(h => [
      formatDate(h.date),
      `#${h.sale_id}`,
      formatCurrency(h.total),
      formatCurrency(h.profit),
      h.status.toUpperCase()
    ])

    pdf.addTable(headers, rows, {
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 }
      }
    })
  }

  // Save
  pdf.save(`customer-${customer.name.replace(/\s+/g, '-')}.pdf`)
}
