# Razorpay Payment Gateway Integration Guide

## 📋 Overview

This is a **production-ready Razorpay payment gateway integration** for Next.js 14+ using TypeScript, MongoDB, and the Razorpay API. Although configured with test keys, the implementation follows industry best practices for security, error handling, and scalability.

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
│  - Checkout UI  │
│  - Razorpay SDK │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Routes     │
│  /api/razorpay/ │
│  - create-order │
│  - verify       │
│  - webhook      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│   MongoDB       │◄────►│  Razorpay    │
│  - Orders       │      │  API Server  │
│  - Payments     │      └──────────────┘
│  - Webhooks     │
└─────────────────┘
```

## 📁 Project Structure

```
lib/
├── razorpay-schema.ts      # TypeScript types & enums
├── razorpay-utils.ts       # Utility functions
└── mongodb.ts              # Database connection

app/api/razorpay/
├── create-order/
│   └── route.ts           # Create Razorpay order
├── verify-payment/
│   └── route.ts           # Verify payment signature
└── webhook/
    └── route.ts           # Handle Razorpay webhooks

components/
├── razorpay-checkout.tsx          # Full checkout form
├── razorpay-payment-button.tsx    # Simple payment button
└── razorpay-order-status.tsx      # Order status page
```

## 🚀 Setup Instructions

### 1. Install Dependencies

The Razorpay SDK is not needed as a separate package since we're using the Checkout.js script directly. All required dependencies are already in your `package.json`.

### 2. Configure Environment Variables

Update your `.env.local` file (already configured):

```env
# Razorpay Test Keys
RAZORPAY_KEY_ID=rzp_test_RfFWI9Ba2Hz1e1
RAZORPAY_KEY_SECRET=tu0VmwxBseiqE2KKcKszfVHj
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RfFWI9Ba2Hz1e1

# MongoDB (already configured)
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=default

# Webhook Secret (Get from Razorpay Dashboard)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. MongoDB Collections

The integration automatically creates three collections:

- `razorpay_orders` - Stores order information
- `razorpay_payments` - Stores payment details
- `razorpay_webhooks` - Logs webhook events

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 💳 Usage Examples

### Example 1: Full Checkout Component

```tsx
import { RazorpayCheckout } from '@/components/razorpay-checkout';

function CheckoutPage() {
  const items = [
    {
      productId: 'prod_001',
      productName: 'Handmade Vase',
      quantity: 2,
      price: 1500,
    },
  ];

  return (
    <RazorpayCheckout
      items={items}
      totalAmount={3000}
      onSuccess={(orderId, paymentId) => {
        console.log('Payment successful!', orderId, paymentId);
        // Redirect or show success message
      }}
      onFailure={(error) => {
        console.error('Payment failed:', error);
      }}
    />
  );
}
```

### Example 2: Simple Payment Button

```tsx
import { RazorpayPaymentButton } from '@/components/razorpay-payment-button';

function CartPage() {
  return (
    <RazorpayPaymentButton
      amount={5000}
      orderId="ORD-12345"
      customerName="John Doe"
      customerEmail="john@example.com"
      customerPhone="9876543210"
      items={[
        { productId: '1', productName: 'Item 1', quantity: 1, price: 5000 }
      ]}
      onSuccess={(orderId, paymentId) => {
        window.location.href = `/order-confirmation?orderId=${orderId}`;
      }}
    >
      Proceed to Pay
    </RazorpayPaymentButton>
  );
}
```

### Example 3: Order Status Page

```tsx
// app/razorpay-status/page.tsx
import { RazorpayOrderStatus } from '@/components/razorpay-order-status';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function RazorpayStatusPage() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto py-20">
        <RazorpayOrderStatus />
      </div>
      <Footer />
    </>
  );
}
```

## 🔌 API Endpoints

### 1. Create Order - `POST /api/razorpay/create-order`

**Request:**
```json
{
  "amount": 1000,
  "currency": "INR",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "items": [
    {
      "productId": "prod_001",
      "productName": "Vase",
      "quantity": 1,
      "price": 1000
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "addressLine1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "ORD-1234567890-1234",
  "razorpayOrderId": "order_MNop123456",
  "amount": 100000,
  "currency": "INR",
  "keyId": "rzp_test_RfFWI9Ba2Hz1e1"
}
```

### 2. Verify Payment - `POST /api/razorpay/verify-payment`

**Request:**
```json
{
  "razorpay_order_id": "order_MNop123456",
  "razorpay_payment_id": "pay_ABcd123456",
  "razorpay_signature": "abc123def456..."
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "orderId": "ORD-1234567890-1234",
  "paymentId": "pay_ABcd123456",
  "status": "paid",
  "message": "Payment verified successfully"
}
```

### 3. Webhook - `POST /api/razorpay/webhook`

Razorpay will send webhook events to this endpoint. Configure it in your Razorpay Dashboard.

**Supported Events:**
- `payment.captured`
- `payment.failed`
- `payment.authorized`
- `order.paid`
- `refund.created`
- `refund.processed`

## 🔐 Security Features

### 1. Signature Verification
All payments are verified using HMAC SHA256 signature:
```typescript
const expectedSignature = crypto
  .createHmac('sha256', keySecret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');
```

### 2. Environment Variables
Sensitive keys are stored in environment variables, never in code.

### 3. Server-Side Validation
- Amount validation
- Customer data validation
- Order integrity checks
- Webhook signature verification

### 4. Database Security
- All payment data is stored securely in MongoDB
- Timestamps for audit trails
- Status tracking for reconciliation

## 🧪 Testing

### Test Card Details

**Card Number:** 4111 1111 1111 1111  
**CVV:** Any 3 digits  
**Expiry:** Any future date  
**Name:** Any name

### Test UPI ID
Use any UPI ID (e.g., `success@razorpay`)

### Test Net Banking
Select any bank and use the credentials provided by Razorpay test mode.

### Testing Webhooks Locally

Use **ngrok** to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Use the HTTPS URL in Razorpay webhook settings
# Example: https://abcd1234.ngrok.io/api/razorpay/webhook
```

## 📊 Database Schema

### Orders Collection (`razorpay_orders`)
```typescript
{
  orderId: "ORD-1234567890-1234",
  razorpayOrderId: "order_MNop123456",
  items: [...],
  totalAmount: 1000,
  currency: "INR",
  customer: { name, email, phone },
  shippingAddress: {...},
  status: "paid" | "pending" | "failed",
  paymentStatus: "captured" | "authorized" | "failed",
  createdAt: Date,
  paidAt: Date
}
```

### Payments Collection (`razorpay_payments`)
```typescript
{
  paymentId: "pay_ABcd123456",
  orderId: "ORD-1234567890-1234",
  razorpayOrderId: "order_MNop123456",
  amount: 100000, // in paise
  currency: "INR",
  status: "captured",
  method: "card" | "upi" | "netbanking",
  signatureVerified: true,
  createdAt: Date
}
```

## 🔔 Webhook Configuration

### Setup Razorpay Webhooks

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **Webhooks**
3. Click **Create Webhook**
4. Enter webhook URL: `https://yourdomain.com/api/razorpay/webhook`
5. Select events:
   - ✅ payment.captured
   - ✅ payment.failed
   - ✅ order.paid
   - ✅ refund.created
6. Set a webhook secret
7. Copy the secret to your `.env.local`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_actual_webhook_secret
   ```

## 🚨 Error Handling

The integration handles various error scenarios:

- Invalid signature → Payment rejected
- Amount mismatch → Order cancelled
- Network failures → Retry mechanism
- Webhook failures → Logged for manual review

## 📈 Going to Production

### 1. Get Production Keys
- Login to Razorpay Dashboard
- Complete KYC verification
- Get live API keys from Settings → API Keys

### 2. Update Environment Variables
```env
RAZORPAY_KEY_ID=rzp_live_YourLiveKeyId
RAZORPAY_KEY_SECRET=your_live_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YourLiveKeyId
```

### 3. Configure Production Webhook
Use your production domain URL:
```
https://yourdomain.com/api/razorpay/webhook
```

### 4. Enable Required Features
- Setup payment methods (cards, UPI, wallets, etc.)
- Configure settlement schedule
- Setup email notifications
- Enable auto-capture (or manual capture based on business logic)

## 🔍 Monitoring & Logs

### Check Order Status
```typescript
// From MongoDB
const order = await ordersCollection.findOne({ orderId: 'ORD-123' });
console.log(order.status); // paid, pending, failed
```

### Check Payment Status
```typescript
const payment = await paymentsCollection.findOne({ paymentId: 'pay_123' });
console.log(payment.signatureVerified); // true/false
```

### Webhook Logs
All webhook events are logged in `razorpay_webhooks` collection for debugging.

## 🆘 Troubleshooting

### Payment signature verification fails
- Check if `RAZORPAY_KEY_SECRET` matches your Razorpay dashboard
- Ensure no extra spaces in environment variables

### Webhook not receiving events
- Verify webhook URL is accessible (use ngrok for local testing)
- Check webhook secret matches
- Ensure endpoint returns 200 status

### Order not found after payment
- Check MongoDB connection
- Verify order was created before payment
- Check database logs

## 📞 Support

For Razorpay API issues:
- Documentation: https://razorpay.com/docs/
- Support: support@razorpay.com

## ✅ Checklist

- [x] Environment variables configured
- [x] MongoDB collections created
- [x] Test payment working
- [x] Signature verification implemented
- [x] Webhook endpoint configured
- [x] Error handling implemented
- [x] Order status page created
- [ ] Webhook secret configured (add your own)
- [ ] Production keys (when ready)

## 🎉 Success!

Your Razorpay integration is now complete and production-ready! 🚀
