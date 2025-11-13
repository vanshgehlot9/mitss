import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

// GET - Generate invoice for an order
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch order details
    const orderDoc = await getDoc(doc(db, 'orders', orderId))
    
    if (!orderDoc.exists()) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = { id: orderDoc.id, ...orderDoc.data() }

    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(order)

    // Return HTML for now (can be converted to PDF using libraries like puppeteer or pdfkit)
    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html',
      },
    })

  } catch (error: any) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error.message },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(order: any): string {
  const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
  
  const itemsHTML = order.items.map((item: any, index: number) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #ddd;">${index + 1}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd;">
        <strong>${item.name}</strong><br/>
        <span style="color: #666; font-size: 12px;">${item.category}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Invoice - ${order.orderNumber}</title>
      <style>
        @media print {
          .no-print { display: none; }
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        .invoice-header {
          background: linear-gradient(to right, #D4AF37, #B8941F);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background: #1A2642;
          color: white;
          padding: 12px;
          text-align: left;
        }
        .total-row {
          font-weight: bold;
          background: #f9f9f9;
        }
        .grand-total {
          background: #D4AF37;
          color: white;
          font-size: 18px;
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: center; margin-bottom: 20px;">
        <button onclick="window.print()" style="background: #D4AF37; color: white; padding: 10px 30px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Print Invoice
        </button>
      </div>

      <div class="invoice-header">
        <h1 style="margin: 0;">TAX INVOICE</h1>
        <p style="margin: 10px 0 0 0;">Mitss - Modern Celluloid Industries</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <div>
          <h3 style="color: #1A2642; margin-bottom: 10px;">From:</h3>
          <p style="margin: 5px 0;"><strong>Modern Celluloid Industries</strong></p>
          <p style="margin: 5px 0; font-size: 14px;">
            Siwanchi Gate Rd, Pratap Nagar<br/>
            Jodhpur, Rajasthan 342001<br/>
            GSTIN: 08XXXXX1234X1Z5<br/>
            Phone: +91 99500 36077<br/>
            Email: info@mitss.store
          </p>
        </div>
        <div style="text-align: right;">
          <h3 style="color: #1A2642; margin-bottom: 10px;">Invoice Details:</h3>
          <p style="margin: 5px 0;"><strong>Invoice No:</strong> ${order.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date.toLocaleDateString('en-IN')}</p>
          <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${order.paymentStatus || 'Paid'}</p>
          ${order.customerInfo?.gstNumber ? `<p style="margin: 5px 0;"><strong>Customer GSTIN:</strong> ${order.customerInfo.gstNumber}</p>` : ''}
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: #1A2642; margin-bottom: 10px;">Bill To:</h3>
        <p style="margin: 5px 0;"><strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong></p>
        <p style="margin: 5px 0; font-size: 14px;">
          ${order.shippingAddress.address}${order.shippingAddress.apartment ? ', ' + order.shippingAddress.apartment : ''}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
          Phone: ${order.shippingAddress.phone}<br/>
          Email: ${order.userEmail}
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>Item Description</th>
            <th style="width: 80px; text-align: center;">Qty</th>
            <th style="width: 120px; text-align: right;">Rate</th>
            <th style="width: 120px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" style="padding: 12px; text-align: right;">Subtotal</td>
            <td style="padding: 12px; text-align: right;">₹${order.pricing.subtotal.toLocaleString()}</td>
          </tr>
          <tr class="total-row">
            <td colspan="4" style="padding: 12px; text-align: right;">Shipping Charges</td>
            <td style="padding: 12px; text-align: right;">₹${order.pricing.shipping.toLocaleString()}</td>
          </tr>
          <tr class="total-row">
            <td colspan="4" style="padding: 12px; text-align: right;">GST @ 18%</td>
            <td style="padding: 12px; text-align: right;">₹${order.pricing.gst.toLocaleString()}</td>
          </tr>
          <tr class="grand-total">
            <td colspan="4" style="padding: 15px; text-align: right;">Grand Total</td>
            <td style="padding: 15px; text-align: right;">₹${order.pricing.total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd;">
        <p style="font-size: 14px; color: #666;">
          <strong>Terms & Conditions:</strong><br/>
          1. Goods once sold will not be taken back or exchanged.<br/>
          2. All disputes are subject to Jodhpur jurisdiction only.<br/>
          3. This is a computer-generated invoice and does not require a signature.
        </p>
      </div>

      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>Thank you for your business!</p>
        <p>© 2024 Mitss - Modern Celluloid Industries. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}
