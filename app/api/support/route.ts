import { NextRequest, NextResponse } from 'next/server'
import {
  createSupportTicket,
  addTicketResponse,
  getUserTickets,
  getFAQs,
  rateFAQ,
  askProductQuestion,
  answerProductQuestion,
  getProductQuestions,
  getSizeGuide,
  initializeChatSession
} from '@/lib/support-service'
import { checkRateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'

// GET - Fetch support data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')
    const category = searchParams.get('category')

    // Get FAQs
    if (type === 'faqs') {
      const faqs = await getFAQs(category || undefined)
      return NextResponse.json({
        success: true,
        faqs
      })
    }

    // Get user tickets
    if (type === 'tickets') {
      if (!userId) {
        return NextResponse.json(
          { success: false, message: 'User ID is required' },
          { status: 400 }
        )
      }

      const tickets = await getUserTickets(userId)
      return NextResponse.json({
        success: true,
        tickets
      })
    }

    // Get product questions
    if (type === 'product-questions') {
      if (!productId) {
        return NextResponse.json(
          { success: false, message: 'Product ID is required' },
          { status: 400 }
        )
      }

      const questions = await getProductQuestions(parseInt(productId), true)
      return NextResponse.json({
        success: true,
        questions
      })
    }

    // Get size guide
    if (type === 'size-guide') {
      const guide = await getSizeGuide(
        productId ? parseInt(productId) : undefined,
        category || undefined
      )

      if (!guide) {
        return NextResponse.json(
          { success: false, message: 'Size guide not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        guide
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid type parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Support GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// POST - Create support ticket, ask question, start chat
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.contactForm)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { action } = body

    // Create support ticket
    if (action === 'createTicket') {
      const { userId, userName, userEmail, subject, message, category, priority, orderId, productId } = body

      if (!userId || !userName || !userEmail || !subject || !message || !category) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await createSupportTicket({
        userId,
        userName,
        userEmail,
        subject,
        message,
        category,
        priority: priority || 'medium',
        orderId,
        productId
      })

      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // Add ticket response
    if (action === 'addResponse') {
      const { ticketId, userId, userName, message, isStaff, attachments } = body

      if (!ticketId || !userId || !userName || !message) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await addTicketResponse(
        ticketId,
        userId,
        userName,
        message,
        isStaff || false,
        attachments
      )

      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // Ask product question
    if (action === 'askQuestion') {
      const { productId, userId, userName, question } = body

      if (!productId || !userId || !userName || !question) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await askProductQuestion(productId, userId, userName, question)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // Answer product question (admin)
    if (action === 'answerQuestion') {
      const { questionId, answer, answeredBy } = body

      if (!questionId || !answer || !answeredBy) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await answerProductQuestion(questionId, answer, answeredBy)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // Rate FAQ
    if (action === 'rateFAQ') {
      const { faqId, isHelpful } = body

      if (!faqId || typeof isHelpful !== 'boolean') {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await rateFAQ(faqId, isHelpful)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    // Initialize chat session
    if (action === 'startChat') {
      const { userId, userName, userEmail, initialMessage } = body

      if (!userId || !userName || !userEmail || !initialMessage) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await initializeChatSession(userId, userName, userEmail, initialMessage)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Support POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
