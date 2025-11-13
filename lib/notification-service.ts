import { db } from './firebase'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  Timestamp,
  addDoc,
  limit
} from 'firebase/firestore'

export interface Notification {
  id: string
  userId: string
  type: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'price_drop' | 'back_in_stock' | 'abandoned_cart'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
  channels: {
    email?: boolean
    sms?: boolean
    push?: boolean
  }
}

export interface AbandonedCart {
  id: string
  userId: string
  userEmail: string
  userName: string
  cartItems: any[]
  cartTotal: number
  abandonedAt: Date
  remindersSent: number
  recovered: boolean
  recoveredAt?: Date
}

export interface OrderFeedback {
  id: string
  orderId: string
  userId: string
  productId: number
  rating: number // 1-5
  feedback: string
  deliveryRating?: number
  packagingRating?: number
  recommended: boolean
  images?: string[]
  createdAt: Date
}

// Send SMS notification using Twilio or similar service
export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Mock implementation - Replace with actual SMS service
    // Example: Twilio, AWS SNS, or any SMS gateway

    console.log(`SMS to ${phoneNumber}: ${message}`)

    // In production, use actual SMS service:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER

    const client = require('twilio')(accountSid, authToken)
    
    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phoneNumber
    })
    */

    return {
      success: true,
      message: 'SMS sent successfully'
    }
  } catch (error) {
    console.error('SMS sending error:', error)
    return {
      success: false,
      message: 'Failed to send SMS'
    }
  }
}

// Send order notification (Email + SMS)
export async function sendOrderNotification(
  userId: string,
  orderId: string,
  orderData: {
    status: string
    items: any[]
    total: number
    trackingNumber?: string
    estimatedDelivery?: Date
  },
  userContact: {
    email: string
    phone?: string
    name: string
  }
): Promise<void> {
  try {
    let title = ''
    let message = ''
    let smsMessage = ''

    switch (orderData.status) {
      case 'placed':
        title = 'Order Placed Successfully'
        message = `Your order #${orderId} has been placed successfully. Total: ₹${orderData.total}`
        smsMessage = `Mitss: Order #${orderId} placed! Total: ₹${orderData.total}. Track: mitss.store/track-order`
        break
      case 'confirmed':
        title = 'Order Confirmed'
        message = `Your order #${orderId} has been confirmed and is being prepared.`
        smsMessage = `Mitss: Order #${orderId} confirmed! We're preparing your items.`
        break
      case 'shipped':
        title = 'Order Shipped'
        message = `Your order #${orderId} has been shipped. Tracking: ${orderData.trackingNumber}`
        smsMessage = `Mitss: Order #${orderId} shipped! Track: ${orderData.trackingNumber}`
        break
      case 'out_for_delivery':
        title = 'Out for Delivery'
        message = `Your order #${orderId} is out for delivery. Expected today!`
        smsMessage = `Mitss: Your order #${orderId} is out for delivery. Expected today!`
        break
      case 'delivered':
        title = 'Order Delivered'
        message = `Your order #${orderId} has been delivered. Enjoy your purchase!`
        smsMessage = `Mitss: Order #${orderId} delivered! Rate your experience: mitss.store/feedback`
        break
      default:
        title = 'Order Update'
        message = `Your order #${orderId} status: ${orderData.status}`
        smsMessage = `Mitss: Order #${orderId} update - ${orderData.status}`
    }

    // Create notification record
    const notificationRef = doc(collection(db, 'notifications'))
    const notification: Omit<Notification, 'id'> = {
      userId,
      type: `order_${orderData.status}` as any,
      title,
      message,
      data: { orderId, ...orderData },
      read: false,
      createdAt: new Date(),
      channels: {
        email: true,
        sms: !!userContact.phone,
        push: true
      }
    }

    await setDoc(notificationRef, {
      ...notification,
      createdAt: Timestamp.fromDate(notification.createdAt)
    })

    // Send SMS if phone number provided
    if (userContact.phone) {
      await sendSMS(userContact.phone, smsMessage)
    }

    // Send email (using existing email service)
    // await sendEmail(userContact.email, title, message)

  } catch (error) {
    console.error('Error sending order notification:', error)
  }
}

// Track abandoned carts
export async function trackAbandonedCart(
  userId: string,
  userEmail: string,
  userName: string,
  cartItems: any[],
  cartTotal: number
): Promise<void> {
  try {
    const abandonedRef = doc(collection(db, 'abandonedCarts'))

    const abandonedCart: Omit<AbandonedCart, 'id'> = {
      userId,
      userEmail,
      userName,
      cartItems,
      cartTotal,
      abandonedAt: new Date(),
      remindersSent: 0,
      recovered: false
    }

    await setDoc(abandonedRef, {
      ...abandonedCart,
      abandonedAt: Timestamp.fromDate(abandonedCart.abandonedAt)
    })
  } catch (error) {
    console.error('Error tracking abandoned cart:', error)
  }
}

// Send abandoned cart reminders (run as cron job)
export async function sendAbandonedCartReminders(): Promise<void> {
  try {
    const cartsRef = collection(db, 'abandonedCarts')
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    const q = query(
      cartsRef,
      where('recovered', '==', false),
      where('remindersSent', '<', 3),
      where('abandonedAt', '>', Timestamp.fromDate(threeDaysAgo))
    )

    const snapshot = await getDocs(q)

    for (const doc of snapshot.docs) {
      const cartData = doc.data()
      const cart = {
        ...cartData,
        abandonedAt: cartData.abandonedAt.toDate()
      } as AbandonedCart
      const hoursSinceAbandoned = (Date.now() - cart.abandonedAt.getTime()) / (1000 * 60 * 60)

      let shouldSend = false
      let reminderType = ''

      // First reminder: 1 hour
      if (cart.remindersSent === 0 && hoursSinceAbandoned >= 1) {
        shouldSend = true
        reminderType = 'first'
      }
      // Second reminder: 24 hours
      else if (cart.remindersSent === 1 && hoursSinceAbandoned >= 24) {
        shouldSend = true
        reminderType = 'second'
      }
      // Third reminder: 48 hours (with discount)
      else if (cart.remindersSent === 2 && hoursSinceAbandoned >= 48) {
        shouldSend = true
        reminderType = 'third'
      }

      if (shouldSend) {
        // Send reminder email
        const message = getAbandonedCartMessage(cart, reminderType)
        console.log(`Sending ${reminderType} reminder to ${cart.userEmail}`)

        // Create notification
        await addDoc(collection(db, 'notifications'), {
          userId: cart.userId,
          type: 'abandoned_cart',
          title: 'Your cart is waiting!',
          message: message.subject,
          data: { cartItems: cart.cartItems, discount: reminderType === 'third' ? 10 : 0 },
          read: false,
          createdAt: Timestamp.now(),
          channels: { email: true, sms: false, push: true }
        })

        // Update reminder count
        await updateDoc(doc.ref, {
          remindersSent: cart.remindersSent + 1
        })
      }
    }
  } catch (error) {
    console.error('Error sending abandoned cart reminders:', error)
  }
}

// Mark cart as recovered
export async function markCartRecovered(userId: string): Promise<void> {
  try {
    const cartsRef = collection(db, 'abandonedCarts')
    const q = query(
      cartsRef,
      where('userId', '==', userId),
      where('recovered', '==', false),
      orderBy('abandonedAt', 'desc'),
      limit(1)
    )

    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, {
        recovered: true,
        recoveredAt: Timestamp.now()
      })
    }
  } catch (error) {
    console.error('Error marking cart recovered:', error)
  }
}

// Quick reorder
export async function createQuickReorder(
  userId: string,
  orderId: string
): Promise<{ success: boolean; message: string; cartItems?: any[] }> {
  try {
    // Get original order
    const orderRef = doc(db, 'orders', orderId)
    const orderDoc = await getDoc(orderRef)

    if (!orderDoc.exists()) {
      return {
        success: false,
        message: 'Order not found'
      }
    }

    const orderData = orderDoc.data()

    // Check if user owns this order
    if (orderData.userId !== userId) {
      return {
        success: false,
        message: 'Unauthorized'
      }
    }

    // Add items to cart
    const cartRef = doc(db, 'carts', userId)
    await setDoc(
      cartRef,
      {
        userId,
        items: orderData.items,
        updatedAt: Timestamp.now()
      },
      { merge: true }
    )

    return {
      success: true,
      message: 'Items added to cart',
      cartItems: orderData.items
    }
  } catch (error) {
    console.error('Error creating quick reorder:', error)
    return {
      success: false,
      message: 'Failed to reorder'
    }
  }
}

// Submit order feedback
export async function submitOrderFeedback(
  orderId: string,
  userId: string,
  productId: number,
  feedbackData: {
    rating: number
    feedback: string
    deliveryRating?: number
    packagingRating?: number
    recommended: boolean
    images?: string[]
  }
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify order ownership
    const orderRef = doc(db, 'orders', orderId)
    const orderDoc = await getDoc(orderRef)

    if (!orderDoc.exists() || orderDoc.data().userId !== userId) {
      return {
        success: false,
        message: 'Order not found or unauthorized'
      }
    }

    const feedbackRef = doc(collection(db, 'orderFeedback'))
    const feedback: Omit<OrderFeedback, 'id'> = {
      orderId,
      userId,
      productId,
      rating: feedbackData.rating,
      feedback: feedbackData.feedback,
      deliveryRating: feedbackData.deliveryRating,
      packagingRating: feedbackData.packagingRating,
      recommended: feedbackData.recommended,
      images: feedbackData.images,
      createdAt: new Date()
    }

    await setDoc(feedbackRef, {
      ...feedback,
      createdAt: Timestamp.fromDate(feedback.createdAt)
    })

    // Update order with feedback status
    await updateDoc(orderRef, {
      feedbackSubmitted: true,
      feedbackAt: Timestamp.now()
    })

    return {
      success: true,
      message: 'Feedback submitted successfully'
    }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return {
      success: false,
      message: 'Failed to submit feedback'
    }
  }
}

// Get abandoned cart message
function getAbandonedCartMessage(cart: AbandonedCart, reminderType: string) {
  switch (reminderType) {
    case 'first':
      return {
        subject: 'You left items in your cart!',
        body: `Hi ${cart.userName}, you have ${cart.cartItems.length} items waiting in your cart (₹${cart.cartTotal}). Complete your order now!`
      }
    case 'second':
      return {
        subject: 'Your cart misses you!',
        body: `${cart.userName}, your ${cart.cartItems.length} items are still waiting. Don't miss out!`
      }
    case 'third':
      return {
        subject: 'Special 10% OFF on your cart!',
        body: `${cart.userName}, as a special offer, get 10% off on your cart of ₹${cart.cartTotal}! Use code: COMEBACK10`
      }
    default:
      return {
        subject: 'Your cart is waiting',
        body: 'Complete your purchase today!'
      }
  }
}

// Get user notifications
export async function getUserNotifications(
  userId: string,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  try {
    const notifRef = collection(db, 'notifications')
    let q = query(notifRef, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(50))

    if (unreadOnly) {
      q = query(notifRef, where('userId', '==', userId), where('read', '==', false), orderBy('createdAt', 'desc'))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as Notification[]
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

// Mark notification as read
export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    const notifRef = doc(db, 'notifications', notificationId)
    await updateDoc(notifRef, {
      read: true,
      readAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}
