# 🚀 Razorpay Integration - Quick Start

## ✅ What's Been Implemented

A complete, production-ready Razorpay payment gateway integration with:

- ✅ **Backend API Routes** (Order creation, payment verification, webhooks)
- ✅ **Frontend Components** (Checkout form, payment button, order status)
- ✅ **Database Schema** (Orders, payments, webhooks in MongoDB)
- ✅ **Security** (Signature verification, environment variables)
- ✅ **Test Keys Configured** (Ready to test immediately)

## 🎯 Quick Test (3 Minutes)

### Step 1: Start the Server

```bash
npm run dev
```

### Step 2: Test with Postman

1. Import `RAZORPAY_API_COLLECTION.json` into Postman
2. Run "1. Create Razorpay Order" request
3. Copy the `razorpayOrderId` from response

### Step 3: Test Payment Flow

Create a test page to try the checkout:

```tsx
// app/test-payment/page.tsx
import { RazorpayCheckout } from '@/components/razorpay-checkout';

export default function TestPayment() {
  const testItems = [
    {
      productId: 'test_001',
      productName: 'Test Product',
      quantity: 1,
      price: 100,
    },
  ];

  return (
    <div className="container mx-auto py-20">
      <h1 className="text-3xl font-bold mb-8">Test Razorpay Payment</h1>
      <RazorpayCheckout
        items={testItems}
        totalAmount={100}
        onSuccess={(orderId, paymentId) => {
          alert(`Payment Success! Order: ${orderId}`);
        }}
      />
    </div>
  );
}
```

### Step 4: Make Test Payment

1. Visit `http://localhost:3000/test-payment`
2. Fill in the form (use any dummy data)
3. Click "Pay Now"
4. Use test card: **4111 1111 1111 1111**
5. CVV: **123**, Expiry: Any future date
6. Payment should succeed!

## 📱 Integration Points

### For Shopping Cart

```tsx
import { RazorpayCheckout } from '@/components/razorpay-checkout';

function Cart() {
  const cartItems = useCart(); // Your cart logic
  const total = calculateTotal(cartItems);

  return (
    <RazorpayCheckout
      items={cartItems}
      totalAmount={total}
      onSuccess={(orderId) => {
        clearCart();
        router.push(`/order-confirmation?orderId=${orderId}`);
      }}
    />
  );
}
```

### For Product Page (Quick Buy)

```tsx
import { RazorpayPaymentButton } from '@/components/razorpay-payment-button';

function ProductPage({ product }) {
  return (
    <RazorpayPaymentButton
      amount={product.price}
      orderId={generateOrderId()}
      customerName="Guest User"
      customerEmail="guest@example.com"
      customerPhone="9999999999"
      items={[{
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }]}
    >
      Buy Now ₹{product.price}
    </RazorpayPaymentButton>
  );
}
```

## 🔧 Configuration Checklist

- [x] Test API keys added to `.env.local`
- [x] MongoDB connection working
- [x] Collections will auto-create on first order
- [ ] **TODO:** Add webhook secret (after setting up in Razorpay Dashboard)

## 📊 Database Collections

Your MongoDB will have these collections:

1. **razorpay_orders** - All order data
2. **razorpay_payments** - Payment transactions
3. **razorpay_webhooks** - Webhook event logs

## 🎨 UI Components Available

### 1. Full Checkout Form
`<RazorpayCheckout />` - Complete checkout with address form

### 2. Payment Button
`<RazorpayPaymentButton />` - Simple "Pay Now" button

### 3. Order Status
`<RazorpayOrderStatus />` - Display order and payment details

## 📍 API Routes Created

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/razorpay/create-order` | POST | Create new order |
| `/api/razorpay/verify-payment` | POST | Verify payment signature |
| `/api/razorpay/webhook` | POST | Handle Razorpay webhooks |

## 🧪 Test Cards

| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | Success |
| 4012 8888 8888 1881 | Success |
| 5555 5555 5555 4444 | Success (Mastercard) |

**CVV:** Any 3 digits  
**Expiry:** Any future date  
**OTP:** 123456 (for 3D Secure)

## 🔔 Setup Webhooks (Optional but Recommended)

1. For local testing, use **ngrok**:
   ```bash
   ngrok http 3000
   ```

2. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/webhooks)

3. Add webhook URL:
   ```
   https://your-ngrok-url.ngrok.io/api/razorpay/webhook
   ```

4. Select events:
   - payment.captured
   - payment.failed
   - order.paid

5. Copy webhook secret to `.env.local`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

## 📖 Full Documentation

See `RAZORPAY_INTEGRATION_GUIDE.md` for:
- Complete API reference
- Advanced usage examples
- Production deployment steps
- Security best practices
- Troubleshooting guide

## 🎯 Next Steps

1. ✅ Test the payment flow
2. ✅ Integrate into your cart/checkout
3. ✅ Test webhook events (optional)
4. 🔄 When ready for production:
   - Get live API keys from Razorpay
   - Complete KYC verification
   - Update environment variables
   - Configure production webhooks

## 🆘 Need Help?

- **Documentation:** `RAZORPAY_INTEGRATION_GUIDE.md`
- **API Collection:** Import `RAZORPAY_API_COLLECTION.json` in Postman
- **Razorpay Docs:** https://razorpay.com/docs/

## 🎉 You're All Set!

Your Razorpay integration is ready to use. Start testing payments now! 💳✨
