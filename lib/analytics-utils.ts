/**
 * Advanced Analytics Utilities
 * Calculations for CLV, churn rate, conversion funnel, cohort analysis, etc.
 */

export interface CustomerMetrics {
  customerId: string
  totalSpent: number
  orderCount: number
  averageOrderValue: number
  lastOrderDate: Date
  firstOrderDate: Date
  daysAsCustomer: number
  clv: number
  churnRisk: 'low' | 'medium' | 'high'
  segment: 'vip' | 'loyal' | 'regular' | 'at-risk' | 'new'
}

export interface ProductPerformance {
  productId: string
  name: string
  totalRevenue: number
  unitsSold: number
  averageRating: number
  returnRate: number
  profitMargin: number
  turnoverRate: number
  roi: number
  trend: 'up' | 'stable' | 'down'
}

export interface ConversionFunnel {
  stage: string
  users: number
  conversionRate: number
  dropoffRate: number
  avgTimeSpent: number
}

export interface CohortData {
  cohortDate: Date
  cohortSize: number
  retention: Record<number, number> // week: percentage retained
  revenue: Record<number, number>
  churnRate: number
}

export interface AbandonedCart {
  cartId: string
  customerId: string
  customerEmail: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  cartValue: number
  createdAt: Date
  updatedAt: Date
  recoveryEmailed: boolean
}

/**
 * Calculate Customer Lifetime Value (CLV)
 * Formula: CLV = ARPU × Gross Margin × Customer Lifespan
 */
export function calculateCLV(
  totalSpent: number,
  orderCount: number,
  daysAsCustomer: number
): number {
  if (orderCount === 0 || daysAsCustomer === 0) return 0

  const averageOrderValue = totalSpent / orderCount
  const orderFrequency = orderCount / (daysAsCustomer / 30) // orders per month
  const customerLifespan = 36 // assume 3-year relationship
  const grossMargin = 0.35 // assume 35% gross margin

  // CLV = Average Order Value × Order Frequency × Customer Lifespan × Gross Margin
  const clv = averageOrderValue * orderFrequency * customerLifespan * grossMargin

  return Math.max(0, clv)
}

/**
 * Determine customer churn risk based on activity
 */
export function determineChurnRisk(
  lastOrderDaysAgo: number,
  orderFrequency: number
): 'low' | 'medium' | 'high' {
  const expectedDaysBetweenOrders = 30 / orderFrequency

  // High risk: no order for 3x expected interval
  if (lastOrderDaysAgo > expectedDaysBetweenOrders * 3) return 'high'

  // Medium risk: no order for 2x expected interval
  if (lastOrderDaysAgo > expectedDaysBetweenOrders * 2) return 'medium'

  return 'low'
}

/**
 * Segment customers based on CLV and recency
 */
export function segmentCustomer(
  clv: number,
  lastOrderDaysAgo: number,
  totalSpent: number,
  avgCLV: number
): 'vip' | 'loyal' | 'regular' | 'at-risk' | 'new' {
  if (lastOrderDaysAgo > 180) return 'at-risk'
  if (clv > avgCLV * 2) return 'vip'
  if (totalSpent > avgCLV * 0.75) return 'loyal'
  if (lastOrderDaysAgo < 30) return 'new'
  return 'regular'
}

/**
 * Calculate product turnover rate
 * Turnover Rate = Units Sold / Average Inventory
 */
export function calculateTurnoverRate(
  unitsSold: number,
  averageInventory: number
): number {
  if (averageInventory === 0) return 0
  return unitsSold / averageInventory
}

/**
 * Calculate product ROI
 * ROI = (Revenue - Cost) / Cost × 100
 */
export function calculateROI(
  totalRevenue: number,
  totalCost: number
): number {
  if (totalCost === 0) return 0
  return ((totalRevenue - totalCost) / totalCost) * 100
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMargin(
  revenue: number,
  cost: number
): number {
  if (revenue === 0) return 0
  return ((revenue - cost) / revenue) * 100
}

/**
 * Determine product trend (up/down/stable)
 */
export function determineTrend(
  currentPeriodSales: number,
  previousPeriodSales: number,
  threshold: number = 0.1 // 10% threshold
): 'up' | 'stable' | 'down' {
  if (previousPeriodSales === 0) return currentPeriodSales > 0 ? 'up' : 'stable'

  const percentChange = (currentPeriodSales - previousPeriodSales) / previousPeriodSales

  if (percentChange > threshold) return 'up'
  if (percentChange < -threshold) return 'down'
  return 'stable'
}

/**
 * Calculate conversion funnel rates
 */
export function calculateConversionFunnel(
  visitors: number,
  productViews: number,
  addToCart: number,
  checkoutStart: number,
  purchases: number
): ConversionFunnel[] {
  return [
    {
      stage: 'Visitors',
      users: visitors,
      conversionRate: 100,
      dropoffRate: 0,
      avgTimeSpent: 120, // seconds
    },
    {
      stage: 'Product Views',
      users: productViews,
      conversionRate: (productViews / visitors) * 100,
      dropoffRate: ((visitors - productViews) / visitors) * 100,
      avgTimeSpent: 180,
    },
    {
      stage: 'Add to Cart',
      users: addToCart,
      conversionRate: (addToCart / visitors) * 100,
      dropoffRate: ((productViews - addToCart) / productViews) * 100,
      avgTimeSpent: 60,
    },
    {
      stage: 'Checkout Started',
      users: checkoutStart,
      conversionRate: (checkoutStart / visitors) * 100,
      dropoffRate: ((addToCart - checkoutStart) / addToCart) * 100,
      avgTimeSpent: 240,
    },
    {
      stage: 'Purchase',
      users: purchases,
      conversionRate: (purchases / visitors) * 100,
      dropoffRate: ((checkoutStart - purchases) / checkoutStart) * 100,
      avgTimeSpent: 45,
    },
  ]
}

/**
 * Calculate cohort retention rate
 */
export function calculateCohortRetention(
  cohortSize: number,
  currentWeekSize: number
): number {
  if (cohortSize === 0) return 0
  return (currentWeekSize / cohortSize) * 100
}

/**
 * Calculate customer churn rate
 */
export function calculateChurnRate(
  customersStartPeriod: number,
  customersEndPeriod: number
): number {
  if (customersStartPeriod === 0) return 0
  const churnedCustomers = customersStartPeriod - customersEndPeriod
  return (churnedCustomers / customersStartPeriod) * 100
}

/**
 * Detect abandoned carts (not purchased after X days)
 */
export function isAbandonedCart(
  cartCreatedAt: Date,
  lastUpdatedAt: Date,
  daysThreshold: number = 3
): boolean {
  const now = new Date()
  const daysSinceUpdate = (now.getTime() - lastUpdatedAt.getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceUpdate > daysThreshold
}

/**
 * Calculate recovery email effectiveness
 */
export function calculateRecoveryEmailROI(
  emailsSent: number,
  recoveredOrders: number,
  recoveredRevenue: number,
  emailCost: number = 0.01 // $0.01 per email
): number {
  const totalEmailCost = emailsSent * emailCost
  const netRevenue = recoveredRevenue - totalEmailCost
  const roi = (netRevenue / totalEmailCost) * 100

  return roi > 0 ? roi : 0
}

/**
 * Calculate average order value (AOV) trends
 */
export function calculateAOVTrend(
  currentPeriodRevenue: number,
  currentPeriodOrders: number,
  previousPeriodRevenue: number,
  previousPeriodOrders: number
): {
  currentAOV: number
  previousAOV: number
  change: number
  percentChange: number
} {
  const currentAOV = currentPeriodOrders > 0 ? currentPeriodRevenue / currentPeriodOrders : 0
  const previousAOV = previousPeriodOrders > 0 ? previousPeriodRevenue / previousPeriodOrders : 0
  const change = currentAOV - previousAOV
  const percentChange = previousAOV > 0 ? (change / previousAOV) * 100 : 0

  return {
    currentAOV: Math.round(currentAOV),
    previousAOV: Math.round(previousAOV),
    change: Math.round(change),
    percentChange: Math.round(percentChange * 10) / 10,
  }
}

/**
 * Calculate repeat purchase rate
 */
export function calculateRepeatPurchaseRate(
  returningCustomers: number,
  totalCustomers: number
): number {
  if (totalCustomers === 0) return 0
  return (returningCustomers / totalCustomers) * 100
}

/**
 * Calculate customer lifetime value distribution
 */
export function calculateCLVDistribution(
  clvValues: number[]
): {
  min: number
  max: number
  average: number
  median: number
  quartile25: number
  quartile75: number
} {
  if (clvValues.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0, quartile25: 0, quartile75: 0 }
  }

  const sorted = [...clvValues].sort((a, b) => a - b)
  const sum = sorted.reduce((a, b) => a + b, 0)
  const average = sum / sorted.length

  const getPercentile = (percentile: number) => {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    average: Math.round(average),
    median: sorted[Math.floor(sorted.length / 2)],
    quartile25: getPercentile(25),
    quartile75: getPercentile(75),
  }
}

/**
 * Calculate inventory turnover and days inventory outstanding (DIO)
 */
export function calculateInventoryMetrics(
  costOfGoodsSold: number,
  averageInventoryValue: number,
  daysInPeriod: number = 30
): {
  turnoverRate: number
  daysInventoryOutstanding: number
} {
  const turnoverRate = averageInventoryValue > 0 ? costOfGoodsSold / averageInventoryValue : 0
  const daysInventoryOutstanding = turnoverRate > 0 ? daysInPeriod / turnoverRate : 0

  return {
    turnoverRate: Math.round(turnoverRate * 100) / 100,
    daysInventoryOutstanding: Math.round(daysInventoryOutstanding),
  }
}

/**
 * Calculate month-over-month growth
 */
export function calculateMoMGrowth(
  currentMonth: number,
  previousMonth: number
): number {
  if (previousMonth === 0) return currentMonth > 0 ? 100 : 0
  return ((currentMonth - previousMonth) / previousMonth) * 100
}

/**
 * Calculate year-over-year growth
 */
export function calculateYoYGrowth(
  currentYear: number,
  previousYear: number
): number {
  if (previousYear === 0) return currentYear > 0 ? 100 : 0
  return ((currentYear - previousYear) / previousYear) * 100
}

/**
 * Identify top customers by CLV
 */
export function identifyTopCustomers(
  customers: CustomerMetrics[],
  topN: number = 10
): CustomerMetrics[] {
  return customers.sort((a, b) => b.clv - a.clv).slice(0, topN)
}

/**
 * Identify at-risk customers for retention
 */
export function identifyAtRiskCustomers(
  customers: CustomerMetrics[]
): CustomerMetrics[] {
  return customers.filter(
    (c) => c.churnRisk === 'high' || (c.churnRisk === 'medium' && c.clv > 500)
  )
}

/**
 * Calculate product performance score
 */
export function calculateProductScore(
  revenue: number,
  profitMargin: number,
  roi: number,
  returnRate: number,
  rating: number
): number {
  // Weighted score: 40% profit, 30% ROI, 20% rating, 10% return rate
  const profitScore = Math.min(profitMargin, 50) / 50 * 40
  const roiScore = Math.min(roi, 200) / 200 * 30
  const ratingScore = (rating / 5) * 20
  const returnScore = Math.max(0, 10 - returnRate * 2)

  const totalScore = profitScore + roiScore + ratingScore + returnScore
  return Math.round(totalScore * 10) / 10
}
