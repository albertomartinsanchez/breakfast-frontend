import { PDFGenerator, formatCurrency, formatDate } from './pdfGenerator'

export const generateSalePDF = async (sale, deliveryData = null) => {
  const pdf = new PDFGenerator()

  // Header
  pdf.addHeader(
    'Sale Report',
    `Date: ${formatDate(sale.date)} | Status: ${sale.status.toUpperCase()}`
  )

  // Summary Section
  pdf.addSectionHeading('Summary')
  pdf.addKeyValue('Sale ID', `#${sale.id}`)
  pdf.addKeyValue('Date', formatDate(sale.date))
  pdf.addKeyValue('Status', sale.status.toUpperCase(), { bold: true })
  
  // If we have delivery data, show actual collected amounts
  if (deliveryData && sale.status === 'completed') {
    pdf.addKeyValue('Expected Revenue', formatCurrency(sale.total_revenue), { 
      valueColor: '#9aa0a6'
    })
    pdf.addKeyValue('Actual Collected', formatCurrency(deliveryData.total_collected), { 
      valueColor: '#81b3d0',
      bold: true 
    })
    
    if (deliveryData.skipped_count > 0) {
      pdf.addKeyValue('Lost from Skipped', formatCurrency(deliveryData.total_skipped_amount), { 
        valueColor: '#e07a5f'
      })
    }
    
    // Calculate actual profit (profit from completed only)
    const actualProfit = sale.total_benefit * (deliveryData.total_collected / sale.total_revenue)
    pdf.addKeyValue('Actual Profit', formatCurrency(actualProfit), { 
      valueColor: '#7fb069',
      bold: true 
    })
  } else {
    pdf.addKeyValue('Total Revenue', formatCurrency(sale.total_revenue), { 
      valueColor: '#81b3d0',
      bold: true 
    })
    pdf.addKeyValue('Total Profit', formatCurrency(sale.total_benefit), { 
      valueColor: '#7fb069',
      bold: true 
    })
  }

  pdf.addSpace(5)
  pdf.addLine()
  pdf.addSpace(5)

  // Delivery Status Section (if completed)
  if (deliveryData && sale.status === 'completed') {
    pdf.addSectionHeading('Delivery Summary')
    pdf.addKeyValue('Completed Deliveries', `${deliveryData.completed_count}`)
    pdf.addKeyValue('Skipped Deliveries', `${deliveryData.skipped_count}`)
    pdf.addKeyValue('Collection Rate', `${((deliveryData.completed_count / deliveryData.total_deliveries) * 100).toFixed(1)}%`)
    
    pdf.addSpace(5)
    pdf.addLine()
    pdf.addSpace(5)
  }

  // Customers & Products Section
  pdf.addSectionHeading('Customers & Products')

  sale.customer_sales.forEach((cs, index) => {
    // Check if this customer was skipped (if we have delivery data)
    let customerStatus = ''
    if (deliveryData) {
      const deliveryStep = deliveryData.deliveries?.find(d => d.customer_id === cs.customer_id)
      if (deliveryStep?.status === 'skipped') {
        customerStatus = ' [SKIPPED]'
      } else if (deliveryStep?.status === 'completed') {
        customerStatus = ' [✓]'
      }
    }

    // Customer header
    pdf.addText(`${index + 1}. ${cs.customer_name}${customerStatus}`, { 
      fontSize: 12,
      bold: true,
      color: customerStatus.includes('SKIPPED') ? '#e07a5f' : '#d4a574'
    })
    
    pdf.addText(`Revenue: ${formatCurrency(cs.total_revenue)} | Profit: ${formatCurrency(cs.total_benefit)}`, {
      fontSize: 9,
      color: '#c0c0c0',
      indent: 5
    })

    pdf.addSpace(3)

    // Products table
    const headers = ['Product', 'Qty', 'Unit Price', 'Total', 'Profit']
    const rows = cs.products.map(p => [
      p.product_name,
      p.quantity.toString(),
      formatCurrency(p.sell_price_at_sale),
      formatCurrency(p.quantity * p.sell_price_at_sale),
      formatCurrency(p.benefit)
    ])

    pdf.addTable(headers, rows)
    pdf.addSpace(5)
  })

  // Save
  pdf.save(`sale-${sale.id}-${sale.date}.pdf`)
}