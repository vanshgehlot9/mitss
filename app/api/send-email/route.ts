import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmation } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (type === 'order-confirmation') {
      const result = await sendOrderConfirmation(data.email, data)

      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Order confirmation email sent successfully' 
        })
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid email type' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
