/**
 * Razorpay Checkout Component
 * Production-ready frontend implementation for Razorpay payment
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Razorpay script type
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface RazorpayCheckoutProps {
  items: OrderItem[];
  totalAmount: number;
  onSuccess?: (orderId: string, paymentId: string) => void;
  onFailure?: (error: any) => void;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export function RazorpayCheckout({
  items,
  totalAmount,
  onSuccess,
  onFailure,
  buttonText = 'Pay Now',
  buttonVariant = 'default',
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Customer form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate phone
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    if (!formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
      toast.error('Please fill in complete address');
      return false;
    }

    return true;
  };

  // Handle payment
  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      // Create order
      const shippingAddress: ShippingAddress = {
        fullName: formData.name,
        phone: formData.phone,
        email: formData.email,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          items,
          shippingAddress,
          billingAddress: shippingAddress,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MITSS',
        description: `Order for ${items.length} item(s)`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          order_id: orderData.orderId,
        },
        theme: {
          color: '#3b82f6',
        },
        handler: async (response: any) => {
          // Payment successful, verify on backend
          try {
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success && verifyData.verified) {
              toast.success('Payment successful!');
              if (onSuccess) {
                onSuccess(orderData.orderId, response.razorpay_payment_id);
              } else {
                // Redirect to success page
                window.location.href = `/order-confirmation?orderId=${orderData.orderId}`;
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error: any) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            if (onFailure) onFailure(error);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        if (onFailure) onFailure(response.error);
        setLoading(false);
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
      if (onFailure) onFailure(error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          variant={buttonVariant}
          size="lg"
          className="w-full"
          disabled={loading || items.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            buttonText
          )}
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Checkout Details</CardTitle>
            <CardDescription>
              Enter your details to complete the payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Details */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                placeholder="House/Flat No., Street"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                placeholder="Landmark, Area"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="400001"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Items:</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${totalAmount.toFixed(2)}`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
