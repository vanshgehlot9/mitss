/**
 * Razorpay Order Status Page
 * Displays order and payment details after successful payment
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Package, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Order, Payment } from '@/lib/razorpay-schema';

export function RazorpayOrderStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId && !paymentId) {
      setError('No order information found');
      setLoading(false);
      return;
    }

    fetchOrderDetails(orderId, paymentId);
  }, [searchParams]);

  const fetchOrderDetails = async (orderId: string | null, paymentId: string | null) => {
    try {
      // Fetch order details
      if (orderId) {
        const orderResponse = await fetch(`/api/razorpay/create-order?orderId=${orderId}`);
        const orderData = await orderResponse.json();

        if (orderData.success) {
          setOrder(orderData.order);
        }
      }

      // Fetch payment details
      if (paymentId || orderId) {
        const paymentResponse = await fetch(
          `/api/razorpay/verify-payment?${paymentId ? `paymentId=${paymentId}` : `orderId=${orderId}`}`
        );
        const paymentData = await paymentResponse.json();

        if (paymentData.success) {
          setPayment(paymentData.payment);
        }
      }
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      created: 'bg-blue-100 text-blue-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodDisplay = (method?: string) => {
    if (!method) return 'N/A';
    
    const methods: Record<string, string> = {
      card: 'Card',
      netbanking: 'Net Banking',
      upi: 'UPI',
      wallet: 'Wallet',
      emi: 'EMI',
    };
    
    return methods[method] || method.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-6 w-6" />
            Order Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error || 'Unable to find order details'}</p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isPaymentSuccessful = order.status === 'paid';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isPaymentSuccessful ? (
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            ) : (
              <div className="rounded-full bg-yellow-100 p-3">
                <Package className="h-12 w-12 text-yellow-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {isPaymentSuccessful ? 'Payment Successful!' : 'Order Created'}
          </CardTitle>
          <CardDescription>
            {isPaymentSuccessful
              ? 'Thank you for your order. Your payment has been confirmed.'
              : 'Your order has been created and is awaiting payment.'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono font-medium">{order.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-bold text-lg">₹{order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      {payment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Payment ID</p>
                <p className="font-mono text-sm">{payment.paymentId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">{getPaymentMethodDisplay(payment.method)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="font-medium">₹{(payment.amount / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            {payment.card && (
              <div>
                <p className="text-sm text-muted-foreground">Card Details</p>
                <p className="font-medium">
                  {payment.card.network} •••• {payment.card.last4}
                </p>
              </div>
            )}
            
            {payment.vpa && (
              <div>
                <p className="text-sm text-muted-foreground">UPI ID</p>
                <p className="font-medium">{payment.vpa}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Customer & Shipping Info */}
      <Card>
        <CardHeader>
          <CardTitle>Customer & Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.customer.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.customer.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Shipping Address</p>
                <div className="font-medium">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium">₹{(item.quantity * item.price).toFixed(2)}</p>
              </div>
            ))}
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
              )}
              {order.shippingCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₹{order.shippingCharges.toFixed(2)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button asChild variant="outline">
          <Link href="/">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/account">View Orders</Link>
        </Button>
      </div>
    </div>
  );
}
