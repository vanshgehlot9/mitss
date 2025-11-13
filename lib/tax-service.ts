/**
 * Tax Service - GST Calculation for India
 * Handles IGST (Interstate) and CGST+SGST (Intrastate) calculations
 */

export interface TaxBreakdown {
  subtotal: number
  cgst: number
  sgst: number
  igst: number
  totalTax: number
  total: number
  gstRate: number
  isInterstate: boolean
}

export interface HSNCode {
  code: string
  description: string
  gstRate: number
  category: string
}

export interface TaxReport {
  period: string
  totalSales: number
  totalTax: number
  cgst: number
  sgst: number
  igst: number
  transactions: number
}

// Indian States and Union Territories
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
]

// Common HSN Codes for Handicrafts and Furniture
export const HSN_CODES: HSNCode[] = [
  // Handicrafts
  { code: '4420', description: 'Wooden handicrafts, ornaments', gstRate: 12, category: 'Handicrafts' },
  { code: '6913', description: 'Statuettes and ornamental ceramic articles', gstRate: 12, category: 'Handicrafts' },
  { code: '7013', description: 'Glassware for decoration', gstRate: 18, category: 'Handicrafts' },
  { code: '8306', description: 'Bells, gongs and similar articles', gstRate: 18, category: 'Handicrafts' },
  { code: '9505', description: 'Festive, carnival articles', gstRate: 12, category: 'Handicrafts' },
  
  // Furniture
  { code: '9403', description: 'Wooden furniture', gstRate: 18, category: 'Furniture' },
  { code: '9401', description: 'Seats and chairs', gstRate: 18, category: 'Furniture' },
  { code: '9404', description: 'Mattresses, cushions', gstRate: 18, category: 'Furniture' },
  
  // Home Decor
  { code: '5703', description: 'Carpets and textile floor coverings', gstRate: 12, category: 'Home Decor' },
  { code: '6304', description: 'Furnishing articles', gstRate: 12, category: 'Home Decor' },
  { code: '9405', description: 'Lamps and lighting fittings', gstRate: 18, category: 'Home Decor' },
  
  // General
  { code: '0000', description: 'General goods - No specific HSN', gstRate: 18, category: 'General' }
]

/**
 * Calculate GST based on customer and seller locations
 * @param subtotal - Amount before tax
 * @param gstRate - GST rate percentage (5, 12, 18, 28)
 * @param customerState - Customer's state
 * @param sellerState - Seller's state (default: Maharashtra for MITSS)
 * @returns TaxBreakdown object with all tax components
 */
export function calculateGST(
  subtotal: number,
  gstRate: number = 18,
  customerState: string,
  sellerState: string = 'Maharashtra'
): TaxBreakdown {
  // Validate GST rate
  const validRates = [0, 5, 12, 18, 28]
  if (!validRates.includes(gstRate)) {
    console.warn(`Invalid GST rate ${gstRate}%, defaulting to 18%`)
    gstRate = 18
  }

  // Determine if interstate or intrastate
  const isInterstate = customerState.toLowerCase() !== sellerState.toLowerCase()

  let cgst = 0
  let sgst = 0
  let igst = 0

  if (isInterstate) {
    // Interstate: Apply IGST
    igst = (subtotal * gstRate) / 100
  } else {
    // Intrastate: Apply CGST + SGST (split equally)
    const halfRate = gstRate / 2
    cgst = (subtotal * halfRate) / 100
    sgst = (subtotal * halfRate) / 100
  }

  const totalTax = cgst + sgst + igst
  const total = subtotal + totalTax

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    cgst: parseFloat(cgst.toFixed(2)),
    sgst: parseFloat(sgst.toFixed(2)),
    igst: parseFloat(igst.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    gstRate,
    isInterstate
  }
}

/**
 * Get GST rate for a product based on HSN code
 * @param hsnCode - HSN code of the product
 * @returns GST rate percentage
 */
export function getGSTRateByHSN(hsnCode: string): number {
  const hsn = HSN_CODES.find(h => h.code === hsnCode)
  return hsn ? hsn.gstRate : 18 // Default to 18% if not found
}

/**
 * Get HSN code details
 * @param hsnCode - HSN code
 * @returns HSNCode object or null
 */
export function getHSNDetails(hsnCode: string): HSNCode | null {
  return HSN_CODES.find(h => h.code === hsnCode) || null
}

/**
 * Search HSN codes by description or category
 * @param searchTerm - Search term
 * @returns Array of matching HSN codes
 */
export function searchHSNCodes(searchTerm: string): HSNCode[] {
  const term = searchTerm.toLowerCase()
  return HSN_CODES.filter(h =>
    h.description.toLowerCase().includes(term) ||
    h.category.toLowerCase().includes(term) ||
    h.code.includes(term)
  )
}

/**
 * Calculate tax for multiple items (cart/order)
 * @param items - Array of cart items with price and quantity
 * @param customerState - Customer's state
 * @param sellerState - Seller's state
 * @returns TaxBreakdown for the entire cart
 */
export function calculateCartTax(
  items: Array<{ price: number; quantity: number; gstRate?: number; hsnCode?: string }>,
  customerState: string,
  sellerState: string = 'Maharashtra'
): TaxBreakdown {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)

  // Use weighted average GST rate if items have different rates
  let totalGSTAmount = 0
  const isInterstate = customerState.toLowerCase() !== sellerState.toLowerCase()

  items.forEach(item => {
    const itemTotal = item.price * item.quantity
    let gstRate = item.gstRate || 18

    // Override with HSN-based rate if HSN code is provided
    if (item.hsnCode) {
      gstRate = getGSTRateByHSN(item.hsnCode)
    }

    totalGSTAmount += (itemTotal * gstRate) / 100
  })

  let cgst = 0
  let sgst = 0
  let igst = 0

  if (isInterstate) {
    igst = totalGSTAmount
  } else {
    cgst = totalGSTAmount / 2
    sgst = totalGSTAmount / 2
  }

  // Calculate effective GST rate
  const effectiveGSTRate = subtotal > 0 ? (totalGSTAmount / subtotal) * 100 : 0

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    cgst: parseFloat(cgst.toFixed(2)),
    sgst: parseFloat(sgst.toFixed(2)),
    igst: parseFloat(igst.toFixed(2)),
    totalTax: parseFloat(totalGSTAmount.toFixed(2)),
    total: parseFloat((subtotal + totalGSTAmount).toFixed(2)),
    gstRate: parseFloat(effectiveGSTRate.toFixed(2)),
    isInterstate
  }
}

/**
 * Generate tax report for a given period
 * @param orders - Array of orders with tax information
 * @param startDate - Start date of the period
 * @param endDate - End date of the period
 * @returns TaxReport object
 */
export function generateTaxReport(
  orders: Array<{
    total: number
    tax: number
    cgst?: number
    sgst?: number
    igst?: number
    createdAt: Date
  }>,
  startDate: Date,
  endDate: Date
): TaxReport {
  const filteredOrders = orders.filter(order =>
    order.createdAt >= startDate && order.createdAt <= endDate
  )

  const report: TaxReport = {
    period: `${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')}`,
    totalSales: 0,
    totalTax: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    transactions: filteredOrders.length
  }

  filteredOrders.forEach(order => {
    report.totalSales += order.total
    report.totalTax += order.tax || 0
    report.cgst += order.cgst || 0
    report.sgst += order.sgst || 0
    report.igst += order.igst || 0
  })

  // Round all values
  report.totalSales = parseFloat(report.totalSales.toFixed(2))
  report.totalTax = parseFloat(report.totalTax.toFixed(2))
  report.cgst = parseFloat(report.cgst.toFixed(2))
  report.sgst = parseFloat(report.sgst.toFixed(2))
  report.igst = parseFloat(report.igst.toFixed(2))

  return report
}

/**
 * Export tax report to CSV format
 * @param report - TaxReport object
 * @returns CSV string
 */
export function exportTaxReportCSV(report: TaxReport): string {
  const headers = ['Metric', 'Value']
  const rows = [
    ['Period', report.period],
    ['Total Transactions', report.transactions.toString()],
    ['Total Sales', `₹${report.totalSales.toLocaleString('en-IN')}`],
    ['Total Tax', `₹${report.totalTax.toLocaleString('en-IN')}`],
    ['CGST', `₹${report.cgst.toLocaleString('en-IN')}`],
    ['SGST', `₹${report.sgst.toLocaleString('en-IN')}`],
    ['IGST', `₹${report.igst.toLocaleString('en-IN')}`]
  ]

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
}

/**
 * Validate Indian GST Number (GSTIN)
 * Format: 2 digits (state code) + 10 digits (PAN) + 1 digit (entity number) + 1 letter (Z) + 1 check digit
 * @param gstin - GST number to validate
 * @returns boolean
 */
export function validateGSTIN(gstin: string): boolean {
  if (!gstin) return false
  
  // Remove spaces and convert to uppercase
  gstin = gstin.replace(/\s/g, '').toUpperCase()
  
  // Check length
  if (gstin.length !== 15) return false
  
  // Check format: 2 digits + 10 alphanumeric + Z + 1 alphanumeric
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  
  return gstinRegex.test(gstin)
}

/**
 * Format amount in Indian currency format
 * @param amount - Amount to format
 * @returns Formatted string
 */
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Get tax invoice number
 * @param orderId - Order ID
 * @param prefix - Invoice prefix (default: INV)
 * @returns Formatted invoice number
 */
export function generateInvoiceNumber(orderId: string, prefix: string = 'INV'): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${prefix}/${year}${month}/${orderId.slice(0, 8).toUpperCase()}`
}

// Export all functions and types
export default {
  calculateGST,
  calculateCartTax,
  getGSTRateByHSN,
  getHSNDetails,
  searchHSNCodes,
  generateTaxReport,
  exportTaxReportCSV,
  validateGSTIN,
  formatIndianCurrency,
  generateInvoiceNumber,
  INDIAN_STATES,
  HSN_CODES
}
