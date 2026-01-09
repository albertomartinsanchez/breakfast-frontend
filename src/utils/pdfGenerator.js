import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// PDF styling constants - IMPROVED CONTRAST
const COLORS = {
  primary: '#d4a574',
  text: '#000000',           // Changed from #e8eaed to black for better readability
  textMuted: '#606060',      // Changed from #9aa0a6 to darker gray
  success: '#7fb069',
  info: '#81b3d0',
  danger: '#e07a5f',
  bg: '#0a0e0f',
  surface: '#121719'
}

const FONTS = {
  title: 20,
  subtitle: 16,
  heading: 14,
  body: 10,
  small: 8
}

export class PDFGenerator {
  constructor(orientation = 'portrait') {
    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    })
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 15
    this.currentY = this.margin
  }

  // Add header with logo/title
  addHeader(title, subtitle = null) {
    this.doc.setFillColor(COLORS.primary)
    this.doc.rect(0, 0, this.pageWidth, 30, 'F')
    
    this.doc.setTextColor(COLORS.bg)
    this.doc.setFontSize(FONTS.title)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, 15)
    
    if (subtitle) {
      this.doc.setFontSize(FONTS.body)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(subtitle, this.margin, 22)
    }
    
    this.currentY = 40
  }

  // Add section heading
  addSectionHeading(text) {
    this.checkPageBreak(15)
    this.doc.setTextColor(COLORS.primary)
    this.doc.setFontSize(FONTS.heading)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.margin, this.currentY)
    this.currentY += 8
  }

  // Add text
  addText(text, options = {}) {
    const {
      fontSize = FONTS.body,
      color = COLORS.text,
      bold = false,
      indent = 0
    } = options

    this.checkPageBreak(10)
    this.doc.setTextColor(color)
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal')
    
    const maxWidth = this.pageWidth - (this.margin * 2) - indent
    const lines = this.doc.splitTextToSize(text, maxWidth)
    
    lines.forEach(line => {
      this.checkPageBreak(6)
      this.doc.text(line, this.margin + indent, this.currentY)
      this.currentY += 6
    })
  }

  // Add key-value pair
  addKeyValue(key, value, options = {}) {
    const {
      valueColor = COLORS.text,
      bold = false
    } = options

    this.checkPageBreak(8)
    
    // Key
    this.doc.setTextColor(COLORS.textMuted)
    this.doc.setFontSize(FONTS.body)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(key + ':', this.margin, this.currentY)
    
    // Value
    this.doc.setTextColor(valueColor)
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal')
    this.doc.text(value, this.margin + 50, this.currentY)
    
    this.currentY += 7
  }

  // Add table
  addTable(headers, rows, options = {}) {
    this.checkPageBreak(20)
    
    autoTable(this.doc, {
      head: [headers],
      body: rows,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      theme: 'grid',
      headStyles: {
        fillColor: [212, 165, 116], // primary color
        textColor: [10, 14, 15], // bg color (dark)
        fontSize: FONTS.body,
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [0, 0, 0], // Changed to black for readability
        fontSize: FONTS.small
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245] // Light gray background for alternating rows
      },
      ...options
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
  }

  // Add horizontal line
  addLine() {
    this.checkPageBreak(5)
    this.doc.setDrawColor(COLORS.textMuted)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 5
  }

  // Add spacing
  addSpace(height = 5) {
    this.currentY += height
  }

  // Check if we need a page break
  checkPageBreak(requiredSpace) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  // Add footer with page numbers
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(FONTS.small)
      this.doc.setTextColor(COLORS.textMuted)
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      )
      
      // Generated date
      const d = new Date()
      const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
      this.doc.text(
        `Generated: ${date}`,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: 'right' }
      )
    }
  }

  // Save PDF
  save(filename) {
    this.addFooter()
    this.doc.save(filename)
  }

  // Get blob for preview
  getBlob() {
    this.addFooter()
    return this.doc.output('blob')
  }
}

// Helper function to format currency
export const formatCurrency = (amount) => {
  return `€${amount.toFixed(2)}`
}

// Helper function to format date as dd/mm/yyyy
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}