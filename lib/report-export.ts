import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Export customer metrics to CSV
 */
export function exportCustomerMetricsCSV(customers: any[]): void {
  const headers = [
    'Email',
    'Total Spent',
    'Order Count',
    'Avg Order Value',
    'CLV',
    'Segment',
    'Churn Risk',
  ]

  const rows = customers.map((c) => [
    c.email,
    `₹${c.totalSpent.toLocaleString()}`,
    c.orderCount,
    `₹${c.averageOrderValue.toLocaleString()}`,
    `₹${c.clv.toLocaleString()}`,
    c.segment.toUpperCase(),
    c.churnRisk.toUpperCase(),
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  downloadCSV(csv, 'customer-metrics.csv')
}

/**
 * Export abandoned carts to CSV
 */
export function exportAbandonedCartsCSV(carts: any[]): void {
  const headers = ['Customer Email', 'Cart Value', 'Items Count', 'Recovery Email Sent', 'Days Abandoned']

  const rows = carts.map((c) => [
    c.customerEmail,
    `₹${c.cartValue.toLocaleString()}`,
    c.items.length,
    c.recoveryEmailSent ? 'Yes' : 'No',
    Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  downloadCSV(csv, 'abandoned-carts.csv')
}

/**
 * Export conversion funnel to CSV
 */
export function exportFunnelCSV(funnel: any[]): void {
  const headers = ['Stage', 'Users', 'Conversion Rate', 'Dropoff Rate', 'Avg Time (min)']

  const rows = funnel.map((stage) => [
    stage.stage,
    stage.users.toLocaleString(),
    `${stage.conversionRate.toFixed(2)}%`,
    `${stage.dropoffRate.toFixed(2)}%`,
    (stage.avgTimeInSeconds / 60).toFixed(1),
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  downloadCSV(csv, 'conversion-funnel.csv')
}

/**
 * Export product performance to CSV
 */
export function exportProductPerformanceCSV(products: any[]): void {
  const headers = [
    'Product ID',
    'Product Name',
    'Total Sales',
    'Revenue',
    'Profit Margin',
    'ROI',
    'Avg Rating',
    'Return Rate',
    'Performance Score',
  ]

  const rows = products.map((p) => [
    p.id,
    p.name,
    p.totalSales.toLocaleString(),
    `₹${p.revenue.toLocaleString()}`,
    `${p.profitMargin.toFixed(1)}%`,
    `${p.roi.toFixed(1)}%`,
    p.avgRating.toFixed(1),
    `${p.returnRate.toFixed(1)}%`,
    p.performanceScore.toFixed(1),
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  downloadCSV(csv, 'product-performance.csv')
}

/**
 * Generate comprehensive revenue report PDF
 */
export function generateRevenuePDF(data: {
  period: string
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  topProducts: any[]
  topCustomers: any[]
  conversionRate: number
}): void {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.text('Revenue Report', 20, 20)

  // Period
  doc.setFontSize(12)
  doc.text(`Period: ${data.period}`, 20, 35)

  // Key Metrics
  doc.setFontSize(11)
  let yPos = 50

  doc.text(`Total Revenue: ₹${data.totalRevenue.toLocaleString()}`, 20, yPos)
  yPos += 10

  doc.text(`Total Orders: ${data.totalOrders}`, 20, yPos)
  yPos += 10

  doc.text(`Average Order Value: ₹${data.avgOrderValue.toLocaleString()}`, 20, yPos)
  yPos += 10

  doc.text(`Conversion Rate: ${data.conversionRate.toFixed(2)}%`, 20, yPos)
  yPos += 15

  // Top Products Table
  doc.setFontSize(13)
  doc.text('Top Products', 20, yPos)
  yPos += 5

  autoTable(doc, {
    head: [['Product Name', 'Sales', 'Revenue', 'Margin']],
    body: data.topProducts.map((p) => [
      p.name,
      p.totalSales.toLocaleString(),
      `₹${p.revenue.toLocaleString()}`,
      `${p.profitMargin.toFixed(1)}%`,
    ]),
    startY: yPos,
    margin: { left: 20, right: 20 },
  })

  // Top Customers Table
  yPos = (doc as any).lastAutoTable.finalY + 15

  doc.setFontSize(13)
  doc.text('Top Customers', 20, yPos)
  yPos += 5

  autoTable(doc, {
    head: [['Email', 'Orders', 'Total Spent', 'CLV']],
    body: data.topCustomers.map((c) => [
      c.email,
      c.orderCount.toLocaleString(),
      `₹${c.totalSpent.toLocaleString()}`,
      `₹${c.clv.toLocaleString()}`,
    ]),
    startY: yPos,
    margin: { left: 20, right: 20 },
  })

  // Download
  doc.save('revenue-report.pdf')
}

/**
 * Generate customer analytics PDF
 */
export function generateCustomerAnalyticsPDF(data: {
  totalCustomers: number
  segments: Record<string, number>
  avgClv: number
  churnRate: number
  topCustomers: any[]
}): void {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text('Customer Analytics Report', 20, 20)

  let yPos = 40

  doc.setFontSize(12)
  doc.text(`Total Customers: ${data.totalCustomers}`, 20, yPos)
  yPos += 10

  doc.text(`Average CLV: ₹${data.avgClv.toLocaleString()}`, 20, yPos)
  yPos += 10

  doc.text(`Churn Rate: ${data.churnRate.toFixed(2)}%`, 20, yPos)
  yPos += 15

  // Segments Breakdown
  doc.setFontSize(13)
  doc.text('Customer Segments', 20, yPos)
  yPos += 5

  Object.entries(data.segments).forEach(([segment, count]) => {
    doc.setFontSize(11)
    doc.text(`${segment}: ${count} (${((count / data.totalCustomers) * 100).toFixed(1)}%)`, 20, yPos)
    yPos += 8
  })

  yPos += 5

  // Top Customers
  doc.setFontSize(13)
  doc.text('Top Customers by CLV', 20, yPos)
  yPos += 5

  autoTable(doc, {
    head: [['Email', 'CLV', 'Orders', 'Segment']],
    body: data.topCustomers.map((c) => [
      c.email,
      `₹${c.clv.toLocaleString()}`,
      c.orderCount,
      c.segment,
    ]),
    startY: yPos,
    margin: { left: 20, right: 20 },
  })

  doc.save('customer-analytics.pdf')
}

/**
 * Generate cohort analysis PDF
 */
export function generateCohortAnalysisPDF(cohortData: any[][]): void {
  const doc = new jsPDF('l') // landscape

  doc.setFontSize(20)
  doc.text('Cohort Analysis Report', 20, 20)

  let yPos = 40

  autoTable(doc, {
    head: [['Cohort', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']],
    body: cohortData.map((row) => row.map((cell) => (typeof cell === 'number' ? `${cell.toFixed(1)}%` : cell))),
    startY: yPos,
    margin: { left: 20, right: 20 },
  })

  doc.save('cohort-analysis.pdf')
}

/**
 * Generate inventory report PDF
 */
export function generateInventoryReportPDF(products: any[]): void {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text('Inventory Report', 20, 20)

  let yPos = 40

  autoTable(doc, {
    head: [['Product', 'Current Stock', 'Turnover Rate', 'Days to Turnover', 'Status']],
    body: products.map((p) => [
      p.name,
      p.currentStock.toLocaleString(),
      `${p.turnoverRate.toFixed(2)}x/year`,
      Math.round(365 / p.turnoverRate),
      p.turnoverRate > 4 ? 'Fast Moving' : 'Slow Moving',
    ]),
    startY: yPos,
    margin: { left: 20, right: 20 },
  })

  doc.save('inventory-report.pdf')
}

/**
 * Helper function to download CSV
 */
function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
