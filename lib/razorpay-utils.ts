/**
 * Razorpay Utility Functions
 * Production-ready implementation for payment processing
 */

import crypto from 'crypto';
import {
  Order,
  Payment,
  OrderStatus,
  PaymentStatus,
  CreateRazorpayOrderRequest,
  VerifyPaymentRequest,
  COLLECTIONS,
} from './razorpay-schema';

/**
 * Razorpay Configuration
 * Using function to ensure fresh environment variable reads
 */
export function getRazorpayConfig() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  };
}

// Legacy export for backwards compatibility
export const razorpayConfig = getRazorpayConfig();

/**
 * Validate Razorpay Configuration
 */
export function validateRazorpayConfig(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  console.log('Validating Razorpay Config:', {
    keyIdExists: !!keyId,
    keySecretExists: !!keySecret,
    keyIdLength: keyId?.length || 0,
    keySecretLength: keySecret?.length || 0,
  });
  
  if (!keyId || !keySecret) {
    console.error('Razorpay configuration validation failed');
    console.error('Missing:', {
      keyId: !keyId ? 'RAZORPAY_KEY_ID not found' : 'OK',
      keySecret: !keySecret ? 'RAZORPAY_KEY_SECRET not found' : 'OK',
    });
    return false;
  }
  
  if (keyId.length === 0 || keySecret.length === 0) {
    console.error('Razorpay credentials are empty strings');
    return false;
  }
  
  return true;
}

/**
 * Generate unique order ID
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
}

/**
 * Generate receipt ID
 */
export function generateReceiptId(): string {
  return `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Convert rupees to paise (Razorpay uses paise)
 */
export function convertToPaise(amountInRupees: number): number {
  return Math.round(amountInRupees * 100);
}

/**
 * Convert paise to rupees
 */
export function convertToRupees(amountInPaise: number): number {
  return amountInPaise / 100;
}

/**
 * Create Razorpay Order via API
 */
export async function createRazorpayOrder(params: {
  amount: number; // in rupees
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<any> {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay configuration is invalid');
  }

  const config = getRazorpayConfig();
  const amountInPaise = convertToPaise(params.amount);

  const orderData = {
    amount: amountInPaise,
    currency: params.currency || 'INR',
    receipt: params.receipt || generateReceiptId(),
    notes: params.notes || {},
  };

  console.log('Creating Razorpay order with:', {
    amount: amountInPaise,
    currency: orderData.currency,
    keyIdPrefix: config.keyId?.substring(0, 8) + '...',
  });

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${config.keyId}:${config.keySecret}`
        ).toString('base64')}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || 'Failed to create Razorpay order');
    }

    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
}

/**
 * Verify Razorpay Payment Signature
 * This is critical for security - verifies that the payment callback is genuine
 */
export function verifyRazorpaySignature(params: VerifyPaymentRequest): boolean {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

    // Create the expected signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.keySecret)
      .update(text)
      .digest('hex');

    // Compare signatures
    return expectedSignature === razorpay_signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Verify Razorpay Webhook Signature
 * Verifies that the webhook request is from Razorpay
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret?: string
): boolean {
  try {
    const webhookSecret = secret || razorpayConfig.webhookSecret;
    
    if (!webhookSecret || webhookSecret === 'your_webhook_secret_here') {
      console.warn('Webhook secret not configured properly');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Fetch Payment Details from Razorpay
 */
export async function fetchPaymentDetails(paymentId: string): Promise<any> {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay configuration is invalid');
  }

  try {
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${razorpayConfig.keyId}:${razorpayConfig.keySecret}`
        ).toString('base64')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || 'Failed to fetch payment details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
}

/**
 * Fetch Order Details from Razorpay
 */
export async function fetchOrderDetails(orderId: string): Promise<any> {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay configuration is invalid');
  }

  try {
    const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${razorpayConfig.keyId}:${razorpayConfig.keySecret}`
        ).toString('base64')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || 'Failed to fetch order details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
}

/**
 * Capture Payment (if authorized)
 */
export async function capturePayment(
  paymentId: string,
  amount: number,
  currency: string = 'INR'
): Promise<any> {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay configuration is invalid');
  }

  try {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${razorpayConfig.keyId}:${razorpayConfig.keySecret}`
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          amount: convertToPaise(amount),
          currency,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || 'Failed to capture payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw error;
  }
}

/**
 * Create Refund
 */
export async function createRefund(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
): Promise<any> {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay configuration is invalid');
  }

  try {
    const refundData: any = {
      notes: notes || {},
    };

    if (amount) {
      refundData.amount = convertToPaise(amount);
    }

    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${razorpayConfig.keyId}:${razorpayConfig.keySecret}`
          ).toString('base64')}`,
        },
        body: JSON.stringify(refundData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || 'Failed to create refund');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get payment method display name
 */
export function getPaymentMethodName(method: string): string {
  const methodMap: Record<string, string> = {
    card: 'Credit/Debit Card',
    netbanking: 'Net Banking',
    wallet: 'Wallet',
    upi: 'UPI',
    emi: 'EMI',
    cardless_emi: 'Cardless EMI',
    paylater: 'Pay Later',
  };

  return methodMap[method] || method.toUpperCase();
}

/**
 * Format order for database
 */
export function formatOrderForDB(
  orderRequest: CreateRazorpayOrderRequest,
  razorpayOrder: any
): Omit<Order, '_id'> {
  const orderId = generateOrderId();
  const now = new Date();

  return {
    orderId,
    razorpayOrderId: razorpayOrder.id,
    items: orderRequest.items,
    subtotal: orderRequest.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    tax: 0, // Calculate based on your business logic
    shippingCharges: 0, // Calculate based on your business logic
    discount: 0,
    totalAmount: orderRequest.amount,
    currency: razorpayOrder.currency,
    customer: orderRequest.customer,
    shippingAddress: orderRequest.shippingAddress,
    billingAddress: orderRequest.billingAddress,
    status: OrderStatus.CREATED,
    paymentStatus: PaymentStatus.CREATED,
    signatureVerified: false,
    createdAt: now,
    updatedAt: now,
    receipt: razorpayOrder.receipt,
    notes: razorpayOrder.notes,
  };
}

/**
 * Format payment for database
 */
export function formatPaymentForDB(
  razorpayPayment: any,
  orderId: string,
  signature: string,
  verified: boolean
): Omit<Payment, '_id'> {
  const now = new Date();

  return {
    paymentId: razorpayPayment.id,
    orderId,
    razorpayOrderId: razorpayPayment.order_id,
    amount: razorpayPayment.amount,
    currency: razorpayPayment.currency,
    status: razorpayPayment.status as PaymentStatus,
    method: razorpayPayment.method,
    email: razorpayPayment.email,
    contact: razorpayPayment.contact,
    signature,
    signatureVerified: verified,
    razorpayResponse: razorpayPayment,
    createdAt: now,
    updatedAt: now,
    refunded: false,
    card: razorpayPayment.card,
    vpa: razorpayPayment.vpa,
    bank: razorpayPayment.bank,
    wallet: razorpayPayment.wallet,
    notes: razorpayPayment.notes,
  };
}

/**
 * Error handler for Razorpay errors
 */
export function handleRazorpayError(error: any): {
  message: string;
  code: string;
  statusCode: number;
} {
  // Razorpay API error
  if (error.error) {
    return {
      message: error.error.description || 'Payment processing failed',
      code: error.error.code || 'UNKNOWN_ERROR',
      statusCode: error.statusCode || 500,
    };
  }

  // Generic error
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number): boolean {
  // Razorpay minimum amount is 1 INR (100 paise)
  return amount >= 1 && amount <= 1000000; // Max 10 lakhs for testing
}

/**
 * Sanitize order notes
 */
export function sanitizeNotes(notes: Record<string, any>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(notes)) {
    if (typeof value === 'string' || typeof value === 'number') {
      sanitized[key] = String(value).substring(0, 512); // Razorpay limit
    }
  }
  
  return sanitized;
}
