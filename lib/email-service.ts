// Email service using Nodemailer
// Install: npm install nodemailer @types/nodemailer

// Dynamic import to avoid build errors if not installed
let nodemailer: any = null
try {
  nodemailer = require('nodemailer')
} catch (e) {
  console.warn('Nodemailer not installed. Email sending will be simulated.')
}

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

// Create reusable transporter
const createTransporter = () => {
  if (!nodemailer) return null
  
  // Use environment variables for configuration
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    })
  } else if (process.env.SMTP_HOST) {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }
  
  // Fallback to console logging in development
  return null
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      // Development mode - just log
      console.log('📧 Order Confirmation Email (Dev Mode)')
      console.log('To:', data.customerEmail)
      console.log('Order Number:', data.orderNumber)
      console.log('Customer:', data.customerName)
      console.log('Total:', `₹${data.pricing.total.toLocaleString()}`)
      return { success: true, message: 'Email logged in development mode' }
    }

    const html = generateOrderConfirmationHTML(data)
    
    const mailOptions = {
      from: `"Mitss - Modern Celluloid Industries" <${process.env.EMAIL_FROM || 'orders@mitss.store'}>`,
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html,
    }

    await transporter.sendMail(mailOptions)
    
    console.log('✅ Order confirmation email sent to:', data.customerEmail)
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error }
  }
}

export async function sendShippingUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  trackingNumber: string,
  carrier: string
) {
  try {
    console.log('📦 Shipping Update Email')
    console.log('To:', customerEmail)
    console.log('Order:', orderNumber)
    console.log('Tracking:', trackingNumber)
    
    return { success: true, message: 'Shipping email would be sent in production' }
  } catch (error) {
    console.error('Shipping email error:', error)
    return { success: false, error }
  }
}

// Generic email sending function
export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  from?: string
}): Promise<{ success: boolean; error?: any }> {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.log(`[SIMULATED] Email to ${options.to}: ${options.subject}`)
    return { success: true }
  }

  try {
    const info = await transporter.sendMail({
      from: options.from || process.env.EMAIL_FROM || '"MITSS" <noreply@mitss.store>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    console.log('Email sent:', info.messageId)
    return { success: true }
  } catch (error) {
    console.error('Email error:', error)
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
