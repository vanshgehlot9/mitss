import { NextRequest, NextResponse } from 'next/server'
import { 
  checkInventoryLevels, 
  notifyAdminsLowStock, 
  resolveAlert,
  getRestockRecommendations,
  runInventoryCheck,
  getInventoryForecast
} from '@/lib/inventory-alerts'

/**
 * GET /api/inventory/alerts
 * Get all active inventory alerts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'check') {
      // Run inventory check and return alerts
      const alerts = await checkInventoryLevels()
      return NextResponse.json({
        success: true,
        alerts,
        count: alerts.length
      })
    }
    
    if (action === 'recommendations') {
      // Get restock recommendations
      const recommendations = await getRestockRecommendations()
      return NextResponse.json({
        success: true,
        recommendations
      })
    }
    
    if (action === 'forecast') {
      const productId = searchParams.get('productId')
      if (!productId) {
        return NextResponse.json(
          { error: 'Product ID required for forecast' },
          { status: 400 }
        )
      }
      
      const forecast = await getInventoryForecast(productId)
      return NextResponse.json({
        success: true,
        forecast
      })
    }
    
    // Default: get all alerts
    const alerts = await checkInventoryLevels()
    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length
    })
    
  } catch (error) {
    console.error('Error in inventory alerts API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory alerts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/alerts
 * Trigger manual inventory check and send notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, alertId } = body
    
    if (action === 'notify') {
      // Check inventory and notify admins
      await runInventoryCheck()
      
      return NextResponse.json({
        success: true,
        message: 'Inventory check completed and notifications sent'
      })
    }
    
    if (action === 'resolve' && alertId) {
      // Resolve a specific alert
      await resolveAlert(alertId)
      
      return NextResponse.json({
        success: true,
        message: 'Alert resolved successfully'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error in inventory alerts POST:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
