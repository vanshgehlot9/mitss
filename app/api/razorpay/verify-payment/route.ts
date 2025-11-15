/**
 * API Route: Verify Razorpay Payment
 * POST /api/razorpay/verify-payment
 * 
 * This endpoint verifies the payment signature and updates the order status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import {
  verifyRazorpaySignature,
  fetchPaymentDetails,
  formatPaymentForDB,
} from '@/lib/razorpay-utils';
import {
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  OrderStatus,
  PaymentStatus,
  COLLECTIONS,
} from '@/lib/razorpay-schema';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: VerifyPaymentRequest = await request.json();

    // Validate required fields
    if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: 'Missing required payment parameters',
        },
        { status: 400 }
      );
    }

    // Verify signature
    const isSignatureValid = verifyRazorpaySignature(body);

    if (!isSignatureValid) {
      // Log suspicious activity
      console.error('Invalid payment signature detected:', {
        orderId: body.razorpay_order_id,
        paymentId: body.razorpay_payment_id,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: 'Payment verification failed. Invalid signature.',
        },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const ordersCollection = db.collection(COLLECTIONS.ORDERS);
    const paymentsCollection = db.collection(COLLECTIONS.PAYMENTS);

    // Find the order
    const order = await ordersCollection.findOne({
      razorpayOrderId: body.razorpay_order_id,
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Check if payment already processed
    const existingPayment = await paymentsCollection.findOne({
      paymentId: body.razorpay_payment_id,
    });

    if (existingPayment && existingPayment.signatureVerified) {
      return NextResponse.json(
        {
          success: true,
          verified: true,
          orderId: order.orderId,
          paymentId: body.razorpay_payment_id,
          status: OrderStatus.PAID,
          message: 'Payment already verified',
          order,
        },
        { status: 200 }
      );
    }

    // Fetch payment details from Razorpay
    let razorpayPayment;
    try {
      razorpayPayment = await fetchPaymentDetails(body.razorpay_payment_id);
    } catch (error: any) {
      console.error('Error fetching payment details:', error);
      
      // Still update order if signature is valid
      // This handles cases where Razorpay API might be temporarily unavailable
      await ordersCollection.updateOne(
        { razorpayOrderId: body.razorpay_order_id },
        {
          $set: {
            paymentId: body.razorpay_payment_id,
            signatureVerified: true,
            status: OrderStatus.PAID,
            paymentStatus: PaymentStatus.CAPTURED,
            paidAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json(
        {
          success: true,
          verified: true,
          orderId: order.orderId,
          paymentId: body.razorpay_payment_id,
          status: OrderStatus.PAID,
          message: 'Payment verified successfully',
        },
        { status: 200 }
      );
    }

    // Validate payment status
    if (razorpayPayment.status !== 'captured' && razorpayPayment.status !== 'authorized') {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: `Payment not successful. Status: ${razorpayPayment.status}`,
        },
        { status: 400 }
      );
    }

    // Validate payment amount matches order amount
    const orderAmountInPaise = Math.round(order.totalAmount * 100);
    if (razorpayPayment.amount !== orderAmountInPaise) {
      console.error('Payment amount mismatch:', {
        orderAmount: orderAmountInPaise,
        paymentAmount: razorpayPayment.amount,
      });

      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: 'Payment amount does not match order amount',
        },
        { status: 400 }
      );
    }

    // Format payment data
    const paymentData = formatPaymentForDB(
      razorpayPayment,
      order.orderId,
      body.razorpay_signature,
      true
    );

    // Store or update payment in database
    await paymentsCollection.updateOne(
      { paymentId: body.razorpay_payment_id },
      { $set: paymentData },
      { upsert: true }
    );

    // Update order status
    const updateResult = await ordersCollection.updateOne(
      { razorpayOrderId: body.razorpay_order_id },
      {
        $set: {
          paymentId: body.razorpay_payment_id,
          paymentMethod: razorpayPayment.method,
          signatureVerified: true,
          status: OrderStatus.PAID,
          paymentStatus:
            razorpayPayment.status === 'captured'
              ? PaymentStatus.CAPTURED
              : PaymentStatus.AUTHORIZED,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (!updateResult.acknowledged) {
      throw new Error('Failed to update order status');
    }

    // Fetch updated order
    const updatedOrder = await ordersCollection.findOne({
      razorpayOrderId: body.razorpay_order_id,
    });

    // Prepare response
    const response: VerifyPaymentResponse = {
      success: true,
      verified: true,
      orderId: order.orderId,
      paymentId: body.razorpay_payment_id,
      status: OrderStatus.PAID,
      message: 'Payment verified successfully',
      order: updatedOrder as any,
    };

    // Optional: Send confirmation email, update inventory, etc.
    // await sendOrderConfirmationEmail(order);
    // await updateInventory(order.items);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error verifying payment:', error);

    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: 'An error occurred while verifying payment',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check payment status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');

    if (!paymentId && !orderId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment ID or Order ID is required',
        },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const paymentsCollection = db.collection(COLLECTIONS.PAYMENTS);

    // Find payment
    const query = paymentId ? { paymentId } : { orderId };
    const payment = await paymentsCollection.findOne(query);

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        payment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching payment:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch payment details',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
