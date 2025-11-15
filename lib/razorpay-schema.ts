// Database Schema and Types for Razorpay Integration

/**
 * Order Status Enum
 */
export enum OrderStatus {
  CREATED = 'created',
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
  CREATED = 'created',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

/**
 * Order Item Interface
 */
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  variant?: {
    size?: string;
    color?: string;
    material?: string;
  };
}

/**
 * Shipping Address Interface
 */
export interface ShippingAddress {
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

/**
 * Order Interface (MongoDB Document)
 */
export interface Order {
  _id?: string;
  orderId: string; // Our internal order ID (e.g., ORD-123456)
  razorpayOrderId?: string; // Razorpay order ID (e.g., order_abc123)
  userId?: string; // Firebase user ID if authenticated
  
  // Order Details
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  totalAmount: number; // Amount in rupees
  currency: string; // INR
  
  // Customer Details
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Shipping Details
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  
  // Order Status
  status: OrderStatus;
  
  // Payment Details
  paymentId?: string; // Razorpay payment ID
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  
  // Razorpay Signature Verification
  signatureVerified: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  
  // Additional Info
  notes?: Record<string, string>;
  receipt?: string;
  
  // Refund Details (if applicable)
  refundId?: string;
  refundAmount?: number;
  refundedAt?: Date;
  refundReason?: string;
}

/**
 * Payment Interface (MongoDB Document)
 */
export interface Payment {
  _id?: string;
  paymentId: string; // Razorpay payment ID
  orderId: string; // Our internal order ID
  razorpayOrderId: string; // Razorpay order ID
  
  // Payment Details
  amount: number; // Amount in paise (multiply by 100)
  currency: string;
  status: PaymentStatus;
  method?: string; // card, netbanking, upi, wallet
  
  // Card Details (if applicable)
  card?: {
    last4?: string;
    network?: string;
    type?: string;
  };
  
  // UPI Details (if applicable)
  vpa?: string;
  
  // Bank Details (if applicable)
  bank?: string;
  
  // Wallet Details (if applicable)
  wallet?: string;
  
  // Customer Details
  email: string;
  contact: string;
  
  // Verification
  signature: string;
  signatureVerified: boolean;
  
  // Razorpay Response
  razorpayResponse?: Record<string, any>;
  
  // Error Details (if failed)
  errorCode?: string;
  errorDescription?: string;
  errorReason?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  capturedAt?: Date;
  
  // Additional Info
  notes?: Record<string, string>;
  fee?: number;
  tax?: number;
  
  // Refund Details (if applicable)
  refunded: boolean;
  refundStatus?: string;
  refundId?: string;
}

/**
 * Webhook Event Interface
 */
export interface WebhookEvent {
  _id?: string;
  eventId: string; // Razorpay event ID
  event: string; // payment.captured, payment.failed, order.paid, refund.created, etc.
  entity: string; // payment, order, refund
  
  // Payload
  payload: Record<string, any>;
  
  // Processing Status
  processed: boolean;
  processedAt?: Date;
  
  // Error (if processing failed)
  error?: string;
  
  // Timestamps
  receivedAt: Date;
  createdAt: Date;
  
  // Verification
  signatureVerified: boolean;
}

/**
 * Razorpay Order Creation Request
 */
export interface CreateRazorpayOrderRequest {
  amount: number; // in rupees (will be converted to paise)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
}

/**
 * Razorpay Order Creation Response
 */
export interface CreateRazorpayOrderResponse {
  success: boolean;
  orderId: string; // Our internal order ID
  razorpayOrderId: string; // Razorpay order ID
  amount: number;
  currency: string;
  keyId: string; // Public key for frontend
  message?: string;
}

/**
 * Payment Verification Request
 */
export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Payment Verification Response
 */
export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  orderId: string;
  paymentId: string;
  status: OrderStatus;
  message: string;
  order?: Order;
}

/**
 * MongoDB Collection Names
 */
export const COLLECTIONS = {
  ORDERS: 'razorpay_orders',
  PAYMENTS: 'razorpay_payments',
  WEBHOOKS: 'razorpay_webhooks',
} as const;

/**
 * Razorpay Error Codes
 */
export const RAZORPAY_ERROR_CODES = {
  BAD_REQUEST_ERROR: 'BAD_REQUEST_ERROR',
  GATEWAY_ERROR: 'GATEWAY_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
} as const;
