import { NextRequest, NextResponse } from 'next/server'
import {
  sendOrderNotification,
  createQuickReorder,
  submitOrderFeedback,
  getUserNotifications,
  markNotificationRead
} from '@/lib/notification-service'
import { checkRateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'

// GET - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const notifications = await getUserNotifications(userId, unreadOnly)

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST - Send notification, quick reorder, or submit feedback
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.api)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { action } = body

    // Quick reorder
    if (action === 'quickReorder') {
      const { userId, orderId } = body

      if (!userId || !orderId) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await createQuickReorder(userId, orderId)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // Submit order feedback
    if (action === 'submitFeedback') {
      const { orderId, userId, productId, feedbackData } = body

      if (!orderId || !userId || !productId || !feedbackData) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await submitOrderFeedback(orderId, userId, productId, feedbackData)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Notifications POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId } = body

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'Notification ID is required' },
        { status: 400 }
      )
    }

    await markNotificationRead(notificationId)

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    })
  } catch (error) {
    console.error('Notifications PUT error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
