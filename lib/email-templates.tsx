interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
}

interface OrderDetails {
  orderNumber: string
  customerName: string
  email: string
  phone: string
  address: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  orderDate: string
}

export function getOrderConfirmationHTML(order: OrderDetails): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Mitss Furniture</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f6f9fc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #1A2642 0%, #2D3E5F 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      color: #D4AF37;
      font-size: 32px;
      font-weight: bold;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .success-icon {
      text-align: center;
      margin-bottom: 20px;
    }
    .success-icon div {
      display: inline-block;
      width: 60px;
      height: 60px;
      background-color: #10B981;
      border-radius: 50%;
      position: relative;
    }
    .success-icon div:after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 32px;
      font-weight: bold;
    }
    h1 {
      color: #1A2642;
      font-size: 28px;
      margin: 20px 0 10px;
      text-align: center;
    }
    .subtitle {
      color: #6B7280;
      text-align: center;
      margin-bottom: 30px;
    }
    .order-number {
      background-color: #F3F4F6;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
    }
    .order-number strong {
      color: #1A2642;
      font-size: 18px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      color: #1A2642;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #E5E7EB;
    }
    .item {
      display: flex;
      padding: 15px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .item-details {
      flex: 1;
    }
    .item-name {
      color: #1A2642;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .item-quantity {
      color: #6B7280;
      font-size: 14px;
    }
    .item-price {
      color: #1A2642;
      font-weight: 600;
    }
    .totals {
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #4B5563;
    }
    .total-row.grand-total {
      border-top: 2px solid #E5E7EB;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #1A2642;
    }
    .info-box {
      background-color: #F9FAFB;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .info-label {
      color: #6B7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .info-value {
      color: #1A2642;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background-color: #D4AF37;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px auto;
      display: block;
      width: fit-content;
    }
    .footer {
      background-color: #F9FAFB;
      padding: 30px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #D4AF37;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1 class="logo">MITSS</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Success Icon -->
      <div class="success-icon">
        <div></div>
      </div>

      <h1>Order Confirmed!</h1>
      <p class="subtitle">Thank you for your purchase, ${order.customerName}</p>

      <!-- Order Number -->
      <div class="order-number">
        <div class="info-label">Order Number</div>
        <strong>#${order.orderNumber}</strong>
      </div>

      <!-- Order Items -->
      <div class="section">
        <div class="section-title">Order Details</div>
        ${order.items.map(item => `
          <div class="item">
            <div class="item-details">
              <div class="item-name">${item.name}</div>
              <div class="item-quantity">Quantity: ${item.quantity}</div>
            </div>
            <div class="item-price">₹${item.price.toLocaleString()}</div>
          </div>
        `).join('')}

        <!-- Totals -->
        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>₹${order.subtotal.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Shipping</span>
            <span>₹${order.shipping.toLocaleString()}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total</span>
            <span>₹${order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="section">
        <div class="section-title">Shipping Address</div>
        <div class="info-box">
          <div class="info-value">${order.address}</div>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="section">
        <div class="section-title">Contact Information</div>
        <div class="info-box">
          <div class="info-label">Email</div>
          <div class="info-value">${order.email}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Phone</div>
          <div class="info-value">${order.phone}</div>
        </div>
      </div>

      <!-- Track Order Button -->
      <a href="https://mitss.store/track-order?id=${order.orderNumber}" class="button">
        Track Your Order
      </a>

      <p style="text-align: center; color: #6B7280; font-size: 14px;">
        We'll send you shipping confirmation as soon as your order ships.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Need Help?</strong></p>
      <p>Contact us at <a href="mailto:support@mitss.store" style="color: #D4AF37;">support@mitss.store</a></p>
      <p>or call us at +91-XXXXXXXXXX</p>
      
      <div class="social-links">
        <a href="https://mitss.store">Visit Our Website</a>
      </div>
      
      <p style="margin-top: 20px; font-size: 12px;">
        © ${new Date().getFullYear()} Mitss Furniture. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

export function getOrderConfirmationText(order: OrderDetails): string {
  return `
Order Confirmation - Mitss Furniture

Hi ${order.customerName},

Thank you for your order! We're excited to get your furniture ready for delivery.

ORDER DETAILS
Order Number: #${order.orderNumber}
Order Date: ${order.orderDate}

ITEMS:
${order.items.map(item => `- ${item.name} x ${item.quantity} - ₹${item.price.toLocaleString()}`).join('\n')}

SUMMARY:
Subtotal: ₹${order.subtotal.toLocaleString()}
Shipping: ₹${order.shipping.toLocaleString()}
Total: ₹${order.total.toLocaleString()}

SHIPPING ADDRESS:
${order.address}

CONTACT:
Email: ${order.email}
Phone: ${order.phone}

Track your order: https://mitss.store/track-order?id=${order.orderNumber}

We'll notify you when your order ships.

Need help? Contact us at support@mitss.store

Best regards,
Mitss Furniture Team
  `
}
