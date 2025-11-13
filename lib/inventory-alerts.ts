import { db } from './firebase'
import { collection, query, where, getDocs, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore'
import { sendEmail } from './email-service'

interface Product {
  id: string
  name: string
  stock: number
  lowStockThreshold: number
  category: string
  price: number
  sku: string
}

interface InventoryAlert {
  productId: string
  productName: string
  currentStock: number
  threshold: number
  alertType: 'low_stock' | 'out_of_stock' | 'restock_needed'
  status: 'active' | 'resolved'
  createdAt: Date
  resolvedAt?: Date
  notifiedAdmins: string[]
}

interface RestockReminder {
  productId: string
  productName: string
  recommendedQuantity: number
  lastOrderDate?: Date
  supplierInfo?: string
}

/**
 * Check all products and create alerts for low stock items
 */
export async function checkInventoryLevels(): Promise<InventoryAlert[]> {
  const alerts: InventoryAlert[] = []
  
  try {
    const productsRef = collection(db, 'products')
    const snapshot = await getDocs(productsRef)
    
    for (const docSnap of snapshot.docs) {
      const product = { id: docSnap.id, ...docSnap.data() } as Product
      
      // Set default threshold if not specified
      const threshold = product.lowStockThreshold || 10
      
      if (product.stock === 0) {
        // Out of stock
        const alert: InventoryAlert = {
          productId: product.id,
          productName: product.name,
          currentStock: 0,
          threshold,
          alertType: 'out_of_stock',
          status: 'active',
          createdAt: new Date(),
          notifiedAdmins: []
        }
        alerts.push(alert)
        await createAlert(alert)
      } else if (product.stock <= threshold) {
        // Low stock
        const alert: InventoryAlert = {
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          threshold,
          alertType: 'low_stock',
          status: 'active',
          createdAt: new Date(),
          notifiedAdmins: []
        }
        alerts.push(alert)
        await createAlert(alert)
      }
    }
    
    return alerts
  } catch (error) {
    console.error('Error checking inventory levels:', error)
    throw error
  }
}

/**
 * Create an inventory alert in Firestore
 */
async function createAlert(alert: InventoryAlert): Promise<string> {
  try {
    // Check if alert already exists for this product
    const alertsRef = collection(db, 'inventory_alerts')
    const q = query(
      alertsRef,
      where('productId', '==', alert.productId),
      where('status', '==', 'active')
    )
    
    const existingAlerts = await getDocs(q)
    
    if (existingAlerts.empty) {
      // Create new alert
      const docRef = await addDoc(alertsRef, {
        ...alert,
        createdAt: Timestamp.fromDate(alert.createdAt)
      })
      return docRef.id
    }
    
    return existingAlerts.docs[0].id
  } catch (error) {
    console.error('Error creating alert:', error)
    throw error
  }
}

/**
 * Send email notifications to admins about low stock
 */
export async function notifyAdminsLowStock(alerts: InventoryAlert[]): Promise<void> {
  if (alerts.length === 0) return
  
  try {
    // Get admin emails
    const admins = await getAdminEmails()
    
    for (const admin of admins) {
      const emailHtml = generateLowStockEmail(alerts)
      
      await sendEmail({
        to: admin.email,
        subject: `🚨 Low Stock Alert - ${alerts.length} Product${alerts.length > 1 ? 's' : ''} Need Attention`,
        html: emailHtml
      })
      
      // Mark alerts as notified
      for (const alert of alerts) {
        await markAlertAsNotified(alert.productId, admin.email)
      }
    }
  } catch (error) {
    console.error('Error notifying admins:', error)
    throw error
  }
}

/**
 * Get admin user emails from Firestore
 */
async function getAdminEmails(): Promise<{ email: string; name: string }[]> {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', 'admin'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      email: doc.data().email,
      name: doc.data().name || 'Admin'
    }))
  } catch (error) {
    console.error('Error getting admin emails:', error)
    return []
  }
}

/**
 * Mark alert as notified for specific admin
 */
async function markAlertAsNotified(productId: string, adminEmail: string): Promise<void> {
  try {
    const alertsRef = collection(db, 'inventory_alerts')
    const q = query(
      alertsRef,
      where('productId', '==', productId),
      where('status', '==', 'active')
    )
    
    const snapshot = await getDocs(q)
    
    for (const docSnap of snapshot.docs) {
      const currentNotified = docSnap.data().notifiedAdmins || []
      if (!currentNotified.includes(adminEmail)) {
        await updateDoc(doc(db, 'inventory_alerts', docSnap.id), {
          notifiedAdmins: [...currentNotified, adminEmail]
        })
      }
    }
  } catch (error) {
    console.error('Error marking alert as notified:', error)
  }
}

/**
 * Generate HTML email for low stock alerts
 */
function generateLowStockEmail(alerts: InventoryAlert[]): string {
  const outOfStock = alerts.filter(a => a.alertType === 'out_of_stock')
  const lowStock = alerts.filter(a => a.alertType === 'low_stock')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .alert-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #EF4444; border-radius: 4px; }
        .out-of-stock { border-left-color: #EF4444; background: #FEE2E2; }
        .low-stock { border-left-color: #F59E0B; background: #FEF3C7; }
        .product-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
        .stock-info { color: #666; font-size: 14px; }
        .action-btn { display: inline-block; background: #D4AF37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Inventory Alert</h1>
          <p>Products need immediate attention</p>
        </div>
        <div class="content">
          ${outOfStock.length > 0 ? `
            <h2 style="color: #EF4444;">⚠️ Out of Stock (${outOfStock.length})</h2>
            ${outOfStock.map(alert => `
              <div class="alert-box out-of-stock">
                <div class="product-name">${alert.productName}</div>
                <div class="stock-info">
                  Current Stock: <strong>0 units</strong><br>
                  Status: <strong style="color: #EF4444;">OUT OF STOCK</strong>
                </div>
              </div>
            `).join('')}
          ` : ''}
          
          ${lowStock.length > 0 ? `
            <h2 style="color: #F59E0B;">⚠️ Low Stock (${lowStock.length})</h2>
            ${lowStock.map(alert => `
              <div class="alert-box low-stock">
                <div class="product-name">${alert.productName}</div>
                <div class="stock-info">
                  Current Stock: <strong>${alert.currentStock} units</strong><br>
                  Threshold: ${alert.threshold} units<br>
                  Status: <strong style="color: #F59E0B;">LOW STOCK</strong>
                </div>
              </div>
            `).join('')}
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inventory" class="action-btn">
              View Inventory Dashboard
            </a>
          </div>
          
          <div class="footer">
            <p>This is an automated alert from MITSS Inventory System</p>
            <p>Please take necessary action to restock these products</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Resolve an inventory alert
 */
export async function resolveAlert(alertId: string): Promise<void> {
  try {
    const alertRef = doc(db, 'inventory_alerts', alertId)
    await updateDoc(alertRef, {
      status: 'resolved',
      resolvedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error resolving alert:', error)
    throw error
  }
}

/**
 * Get restock recommendations based on sales history
 */
export async function getRestockRecommendations(): Promise<RestockReminder[]> {
  const recommendations: RestockReminder[] = []
  
  try {
    // Get products with low stock
    const productsRef = collection(db, 'products')
    const snapshot = await getDocs(productsRef)
    
    for (const docSnap of snapshot.docs) {
      const product = { id: docSnap.id, ...docSnap.data() } as Product
      const threshold = product.lowStockThreshold || 10
      
      if (product.stock <= threshold) {
        // Calculate recommended restock quantity based on sales
        const avgSales = await getAverageMonthlySales(product.id)
        const recommendedQty = Math.max(threshold * 2, avgSales * 2)
        
        recommendations.push({
          productId: product.id,
          productName: product.name,
          recommendedQuantity: Math.ceil(recommendedQty),
          supplierInfo: 'Contact supplier for restock'
        })
      }
    }
    
    return recommendations
  } catch (error) {
    console.error('Error getting restock recommendations:', error)
    return []
  }
}

/**
 * Calculate average monthly sales for a product
 */
async function getAverageMonthlySales(productId: string): Promise<number> {
  try {
    const ordersRef = collection(db, 'orders')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const q = query(
      ordersRef,
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
    )
    
    const snapshot = await getDocs(q)
    let totalQuantity = 0
    
    snapshot.forEach(doc => {
      const order = doc.data()
      const item = order.items?.find((i: any) => i.productId === productId)
      if (item) {
        totalQuantity += item.quantity
      }
    })
    
    return totalQuantity
  } catch (error) {
    console.error('Error calculating average sales:', error)
    return 10 // Default fallback
  }
}

/**
 * Schedule automated inventory checks (call this from a cron job or API route)
 */
export async function runInventoryCheck(): Promise<void> {
  try {
    console.log('Running automated inventory check...')
    
    const alerts = await checkInventoryLevels()
    
    if (alerts.length > 0) {
      console.log(`Found ${alerts.length} inventory alerts`)
      await notifyAdminsLowStock(alerts)
      console.log('Admin notifications sent')
    } else {
      console.log('No inventory issues found')
    }
  } catch (error) {
    console.error('Error running inventory check:', error)
    throw error
  }
}

/**
 * Get inventory forecast for next 30 days
 */
export async function getInventoryForecast(productId: string): Promise<{
  currentStock: number
  avgDailySales: number
  daysUntilOutOfStock: number
  forecastDate: Date
}> {
  try {
    const productRef = doc(db, 'products', productId)
    const productSnap = await (productRef as any).get()
    
    if (!productSnap.exists()) {
      throw new Error('Product not found')
    }
    
    const product = productSnap.data()
    const avgMonthlySales = await getAverageMonthlySales(productId)
    const avgDailySales = avgMonthlySales / 30
    
    const daysUntilOutOfStock = avgDailySales > 0 
      ? Math.floor(product.stock / avgDailySales)
      : 999
    
    const forecastDate = new Date()
    forecastDate.setDate(forecastDate.getDate() + daysUntilOutOfStock)
    
    return {
      currentStock: product.stock,
      avgDailySales,
      daysUntilOutOfStock,
      forecastDate
    }
  } catch (error) {
    console.error('Error generating forecast:', error)
    throw error
  }
}
