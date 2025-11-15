/**
 * Simple Razorpay Payment Button
 * For use in cart or product pages
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentButtonProps {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  onSuccess?: (orderId: string, paymentId: string) => void;
  onFailure?: (error: any) => void;
  children?: React.ReactNode;
  className?: string;
}

export function RazorpayPaymentButton({
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  items,
  onSuccess,
  onFailure,
  children,
  className,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

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

  const handlePayment = async () => {
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          items,
          shippingAddress: {
            fullName: customerName,
            phone: customerPhone,
            email: customerEmail,
            addressLine1: 'To be provided',
            city: 'To be provided',
            state: 'To be provided',
            postalCode: '000000',
            country: 'India',
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'MITSS',
        description: `Payment for Order #${orderId}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: { color: '#3b82f6' },
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
                onSuccess(data.orderId, response.razorpay_payment_id);
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
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

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        if (onFailure) onFailure(response.error);
        setLoading(false);
      });

      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
      if (onFailure) onFailure(error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || `Pay ₹${amount.toFixed(2)}`
      )}
    </Button>
  );
}
