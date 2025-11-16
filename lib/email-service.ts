import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Mitss Furniture'

// Email service types
interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: any[]
  pricing: {
    subtotal: number
    shipping: number
    gst: number
    total: number
  }
  shippingAddress: any
}

export async function sendOrderConfirmation(
  to: string,
  orderDetails: {
    orderNumber: string
    customerName: string
    email: string
    phone: string
    address: string
    items: Array<{
      name: string
      quantity: number
      price: number
      image?: string
    }>
    subtotal: number
    shipping: number
    total: number
    paymentMethod: string
    orderDate: string
  },
  invoicePdfBuffer?: Buffer
) {
  try {
    const { getOrderConfirmationHTML, getOrderConfirmationText } = await import('./email-templates')
    
    const emailPayload: any = {
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [to],
      subject: `Order Confirmed! #${orderDetails.orderNumber} - Mitss Furniture`,
      html: getOrderConfirmationHTML(orderDetails),
      text: getOrderConfirmationText(orderDetails),
    }

    // Add PDF attachment if provided
    if (invoicePdfBuffer) {
      emailPayload.attachments = [
        {
          filename: `invoice-${orderDetails.orderNumber}.pdf`,
          content: invoicePdfBuffer,
        },
      ]
    }
    
    const { data, error } = await resend.emails.send(emailPayload)

    if (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }

    console.log('Order confirmation email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export async function sendContactForm(data: {
  name: string
  email: string
  subject?: string
  message: string
}) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: ['support@mitss.store'], // Replace with your support email
      replyTo: data.email,
      subject: `New Contact: ${data.subject || 'General Inquiry'} from ${data.name}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1A2642; color: white; padding: 20px; }
    .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin: 20px 0; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Contact Form Submission</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div>${data.name}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div><a href="mailto:${data.email}">${data.email}</a></div>
      </div>
      ${data.subject ? `
      <div class="field">
        <div class="label">Subject:</div>
        <div>${data.subject}</div>
      </div>
      ` : ''}
      <div class="field">
        <div class="label">Message:</div>
        <div style="white-space: pre-wrap;">${data.message}</div>
      </div>
    </div>
  </div>
</body>
</html>
      `,
      text: `New Contact Form Submission\n\nName: ${data.name}\nEmail: ${data.email}\n${data.subject ? `Subject: ${data.subject}\n` : ''}Message:\n${data.message}`,
    })

    if (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }

    return { success: true, data: emailData }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

/**
 * Generic email sending helper used by inventory alerts and other system notifications.
 * Provides a minimal wrapper around Resend for simple transactional messages.
 */
export async function sendEmail(params: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: Array<{ filename: string; content: Buffer | string }>
}) {
  try {
    const { to, subject, html, text, attachments } = params
    const emailPayload: any = {
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }
    if (text) emailPayload.text = text
    if (attachments && attachments.length) emailPayload.attachments = attachments

    const { data, error } = await resend.emails.send(emailPayload)
    if (error) {
      console.error('sendEmail failed:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('sendEmail exception:', error)
    return { success: false, error }
  }
}

// Generic email sending function
export async function sendPasswordReset(email: string, resetLink: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [email],
      subject: 'Reset Your Password - Mitss Furniture',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1A2642 0%, #2D3E5F 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; background: #fff; }
    .button { display: inline-block; background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MITSS</h1>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${resetLink}" class="button">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Mitss Furniture. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
      text: `Reset Your Password\n\nWe received a request to reset your password.\n\nClick here: ${resetLink}\n\nIf you didn't request this, you can safely ignore this email.\n\nThis link will expire in 1 hour.`,
    })

    if (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

function generateOrderConfirmationHTML(data: OrderEmailData): string {
  const { orderNumber, customerName, items, pricing, shippingAddress } = data

  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br/>
        <span style="color: #666;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${orderNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #D4AF37, #B8941F); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
        <p style="color: white; margin: 10px 0 0 0;">Thank you for your purchase</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${customerName},</p>
        <p>Your order has been successfully placed and is being processed. We'll send you shipping updates soon!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #D4AF37; margin-top: 0;">Order #${orderNumber}</h2>
          
          <h3 style="margin-top: 20px; color: #1A2642;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHTML}
            <tr>
              <td style="padding: 12px; padding-top: 20px;">Subtotal</td>
              <td style="padding: 12px; padding-top: 20px; text-align: right;">₹${pricing.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px;">Shipping</td>
              <td style="padding: 12px; text-align: right;">₹${pricing.shipping.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px;">GST (18%)</td>
              <td style="padding: 12px; text-align: right;">₹${pricing.gst.toLocaleString()}</td>
            </tr>
            <tr style="font-weight: bold; font-size: 18px;">
              <td style="padding: 12px; border-top: 2px solid #D4AF37;">Total</td>
              <td style="padding: 12px; border-top: 2px solid #D4AF37; text-align: right; color: #D4AF37;">₹${pricing.total.toLocaleString()}</td>
            </tr>
          </table>
          
          <h3 style="margin-top: 30px; color: #1A2642;">Shipping Address</h3>
          <p style="margin: 10px 0; line-height: 1.8;">
            ${shippingAddress.firstName} ${shippingAddress.lastName}<br/>
            ${shippingAddress.address}${shippingAddress.apartment ? ', ' + shippingAddress.apartment : ''}<br/>
            ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br/>
            Phone: ${shippingAddress.phone}
          </p>
        </div>
        
        <p style="margin-top: 30px;">You can track your order status in your account dashboard.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://mitss.store/track-order?number=${orderNumber}" 
             style="background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Track Your Order
          </a>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          If you have any questions, please contact us at <a href="mailto:info@mitss.store" style="color: #D4AF37;">info@mitss.store</a>
          or call us at +91 99500 36077
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>© 2024 Mitss - Modern Celluloid Industries. All rights reserved.</p>
        <p>Siwanchi Gate Rd, Pratap Nagar, Jodhpur, Rajasthan</p>
      </div>
    </body>
    </html>
  `
}
