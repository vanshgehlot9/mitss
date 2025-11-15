/**
 * Example: Razorpay Payment Test Page
 * Use this page to test the payment integration
 * Access at: http://localhost:3000/test-razorpay
 */

'use client';

import { useState } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { RazorpayCheckout } from '@/components/razorpay-checkout';
import { RazorpayPaymentButton } from '@/components/razorpay-payment-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreditCard, ShoppingCart, Zap, CheckCircle } from 'lucide-react';

export default function TestRazorpayPage() {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string>('');

  // Sample items for testing
  const testItems = [
    {
      productId: 'test_001',
      productName: 'Handmade Ceramic Vase',
      quantity: 1,
      price: 1500,
      image: '/images/products/vase.jpg',
    },
    {
      productId: 'test_002',
      productName: 'Decorative Wall Art',
      quantity: 1,
      price: 2500,
      image: '/images/products/wall-art.jpg',
    },
  ];

  const totalAmount = testItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePaymentSuccess = (orderId: string, paymentId: string) => {
    console.log('Payment successful!', { orderId, paymentId });
    setPaymentSuccess(true);
    setLastOrderId(orderId);
  };

  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-20 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 pt-12">
          <h1 className="text-4xl font-bold mb-4">🔐 Razorpay Payment Integration Test</h1>
          <p className="text-muted-foreground text-lg">
            Test the complete payment flow with Razorpay test mode
          </p>
        </div>

        {/* Success Alert */}
        {paymentSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Payment Successful!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your payment was processed successfully. Order ID: <strong>{lastOrderId}</strong>
              <br />
              <a
                href={`/order-confirmation?orderId=${lastOrderId}`}
                className="text-green-600 underline mt-2 inline-block"
              >
                View Order Details →
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Test Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Test Card Details
            </CardTitle>
            <CardDescription>Use these test credentials for making payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Card Number</p>
                <p className="font-mono font-bold">4111 1111 1111 1111</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CVV</p>
                <p className="font-mono font-bold">123</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiry</p>
                <p className="font-mono font-bold">Any future date</p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">For UPI</p>
              <p className="font-mono">success@razorpay</p>
            </div>
          </CardContent>
        </Card>

        {/* Test Options */}
        <Tabs defaultValue="checkout" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checkout" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Full Checkout
            </TabsTrigger>
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Pay Button
            </TabsTrigger>
          </TabsList>

          {/* Full Checkout Tab */}
          <TabsContent value="checkout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Checkout Flow</CardTitle>
                <CardDescription>
                  Full checkout experience with customer details and address form
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Order Summary */}
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  {testItems.map((item) => (
                    <div key={item.productId} className="flex justify-between mb-2">
                      <span className="text-sm">
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="text-sm font-medium">₹{item.price}</span>
                    </div>
                  ))}
                  <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>

                {/* Checkout Component */}
                <RazorpayCheckout
                  items={testItems}
                  totalAmount={totalAmount}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                  buttonText="Proceed to Payment"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Pay Tab */}
          <TabsContent value="quick" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Payment Button</CardTitle>
                <CardDescription>
                  Simplified payment button for fast checkout (minimal form)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Single Item Example */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-semibold">{testItems[0].productName}</h3>
                        <p className="text-sm text-muted-foreground">Single product purchase</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">₹{testItems[0].price}</p>
                      </div>
                    </div>
                    <RazorpayPaymentButton
                      amount={testItems[0].price}
                      orderId={`TEST-${Date.now()}`}
                      customerName="Test User"
                      customerEmail="test@example.com"
                      customerPhone="9999999999"
                      items={[testItems[0]]}
                      onSuccess={handlePaymentSuccess}
                      onFailure={handlePaymentFailure}
                      className="w-full"
                    >
                      Buy Now - ₹{testItems[0].price}
                    </RazorpayPaymentButton>
                  </div>

                  {/* Multiple Items Example */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-semibold">Complete Cart ({testItems.length} items)</h3>
                        <p className="text-sm text-muted-foreground">All products in cart</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">₹{totalAmount}</p>
                      </div>
                    </div>
                    <RazorpayPaymentButton
                      amount={totalAmount}
                      orderId={`TEST-${Date.now()}`}
                      customerName="Test User"
                      customerEmail="test@example.com"
                      customerPhone="9999999999"
                      items={testItems}
                      onSuccess={handlePaymentSuccess}
                      onFailure={handlePaymentFailure}
                      className="w-full"
                    >
                      Pay Full Amount - ₹{totalAmount}
                    </RazorpayPaymentButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* API Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔌 API Endpoints</CardTitle>
            <CardDescription>Backend routes handling the payment flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">POST</span>
                <code>/api/razorpay/create-order</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">POST</span>
                <code>/api/razorpay/verify-payment</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">POST</span>
                <code>/api/razorpay/webhook</code>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Import <code>RAZORPAY_API_COLLECTION.json</code> in Postman to test these endpoints
              directly.
            </p>
          </CardContent>
        </Card>

        {/* Documentation Links */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-muted-foreground">
            📖 See <code>RAZORPAY_INTEGRATION_GUIDE.md</code> for complete documentation
          </p>
          <p className="text-muted-foreground">
            🚀 See <code>QUICK_START_RAZORPAY.md</code> for quick setup guide
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
