/**
 * API Route: Razorpay Webhook Handler
 * POST /api/razorpay/webhook
 * 
 * This endpoint handles webhook events from Razorpay
 * Events: payment.captured, payment.failed, order.paid, refund.created, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyWebhookSignature, fetchPaymentDetails } from '@/lib/razorpay-utils';
import {
  OrderStatus,
  PaymentStatus,
  WebhookEvent,
  COLLECTIONS,
} from '@/lib/razorpay-schema';
import { finalizeReservation, restoreReservation } from '@/lib/inventory-alerts';

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('Webhook signature missing');
      return NextResponse.json(
        {
          success: false,
          message: 'Webhook signature missing',
        },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error('Invalid webhook signature:', {
        event: body.event,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid webhook signature',
        },
        { status: 400 }
      );
    }

    // Extract event details
    const { event, payload } = body;
    const entity = payload.payment?.entity || payload.order?.entity || payload.refund?.entity;

    if (!event || !entity) {
      console.error('Invalid webhook payload:', body);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid webhook payload',
        },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const ordersCollection = db.collection(COLLECTIONS.ORDERS);
    const paymentsCollection = db.collection(COLLECTIONS.PAYMENTS);
    const webhooksCollection = db.collection(COLLECTIONS.WEBHOOKS);

    // Store webhook event
    const webhookEvent: Omit<WebhookEvent, '_id'> = {
      eventId: body.event_id || `evt_${Date.now()}`,
      event,
      entity: entity.entity || 'unknown',
      payload: body,
      processed: false,
      signatureVerified: true,
      receivedAt: new Date(),
      createdAt: new Date(),
    };

    await webhooksCollection.insertOne(webhookEvent);

    // Process different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(entity, ordersCollection, paymentsCollection);
        break;

      case 'payment.failed':
        await handlePaymentFailed(entity, ordersCollection, paymentsCollection);
        break;

      case 'order.paid':
        await handleOrderPaid(entity, ordersCollection);
        break;

      case 'payment.authorized':
        await handlePaymentAuthorized(entity, ordersCollection, paymentsCollection);
        break;

      case 'refund.created':
        await handleRefundCreated(entity, ordersCollection, paymentsCollection);
        break;

      case 'refund.processed':
        await handleRefundProcessed(entity, ordersCollection, paymentsCollection);
        break;

      case 'refund.failed':
        await handleRefundFailed(entity, ordersCollection, paymentsCollection);
        break;

      case 'payment.dispute.created':
        await handleDisputeCreated(entity, ordersCollection, paymentsCollection);
        break;

      case 'payment.dispute.won':
        await handleDisputeWon(entity, ordersCollection, paymentsCollection);
        break;

      case 'payment.dispute.lost':
        await handleDisputeLost(entity, ordersCollection, paymentsCollection);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(entity, ordersCollection);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    // Mark webhook as processed
    await webhooksCollection.updateOne(
      { eventId: webhookEvent.eventId },
      {
        $set: {
          processed: true,
          processedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook processed successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error processing webhook:', error);

    // Store error in webhook record if possible
    try {
      const db = await getDatabase();
      const webhooksCollection = db.collection(COLLECTIONS.WEBHOOKS);
      
      const rawBody = await request.text();
      const body = JSON.parse(rawBody);
      
      await webhooksCollection.updateOne(
        { eventId: body.event_id },
        {
          $set: {
            error: error.message,
            processed: false,
          },
        }
      );
    } catch (dbError) {
      console.error('Failed to log webhook error:', dbError);
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Webhook processing failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(
  payment: any,
  ordersCollection: any,
  paymentsCollection: any
) {
  const { id: paymentId, order_id: razorpayOrderId, amount, method, status } = payment;

  // Update or create payment record
  await paymentsCollection.updateOne(
    { paymentId },
    {
      $set: {
        paymentId,
        razorpayOrderId,
        amount,
        status: PaymentStatus.CAPTURED,
        method,
        capturedAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // Get order to find reservation ID
  const order = await ordersCollection.findOne({ razorpayOrderId });

  // Update order status
  await ordersCollection.updateOne(
    { razorpayOrderId },
    {
      $set: {
        paymentId,
        paymentMethod: method,
        status: OrderStatus.PAID,
        paymentStatus: PaymentStatus.CAPTURED,
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  // Finalize reservation if it exists
  if (order?.reservationId) {
    try {
      await finalizeReservation(order.reservationId);
      console.log('Reservation finalized:', order.reservationId);
    } catch (error) {
      console.error('Error finalizing reservation:', error);
      // Log but don't throw - order payment is already recorded
    }
  }

  console.log('Payment captured:', paymentId);

  // Optional: Send confirmation email, update inventory, etc.
  // const order = await ordersCollection.findOne({ razorpayOrderId });
  // await sendOrderConfirmationEmail(order);
  // await updateInventory(order.items);
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(
  payment: any,
  ordersCollection: any,
  paymentsCollection: any
) {
  const {
    id: paymentId,
    order_id: razorpayOrderId,
    error_code,
    error_description,
    error_reason,
  } = payment;

  // Get order to find reservation ID
  const order = await ordersCollection.findOne({ razorpayOrderId });

  // Update or create payment record
  await paymentsCollection.updateOne(
    { paymentId },
    {
      $set: {
        paymentId,
        razorpayOrderId,
        status: PaymentStatus.FAILED,
        errorCode: error_code,
        errorDescription: error_description,
        errorReason: error_reason,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // Update order status
  await ordersCollection.updateOne(
    { razorpayOrderId },
    {
      $set: {
        paymentId,
        status: OrderStatus.FAILED,
        paymentStatus: PaymentStatus.FAILED,
        updatedAt: new Date(),
      },
    }
  );

  // Restore reservation if it exists
  if (order?.reservationId) {
    try {
      await restoreReservation(order.reservationId);
      console.log('Reservation restored:', order.reservationId);
    } catch (error) {
      console.error('Error restoring reservation:', error);
      // Log but don't throw - order status is already updated
    }
  }

  console.log('Payment failed:', paymentId, error_description);

  // Optional: Send failure notification
  // const order = await ordersCollection.findOne({ razorpayOrderId });
  // await sendPaymentFailureEmail(order, error_description);
}

/**
 * Handle order.paid event
 */
async function handleOrderPaid(order: any, ordersCollection: any) {
  const { id: razorpayOrderId, amount, amount_paid, status } = order;

  await ordersCollection.updateOne(
    { razorpayOrderId },
    {
      $set: {
        status: OrderStatus.PAID,
        paymentStatus: PaymentStatus.CAPTURED,
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  console.log('Order paid:', razorpayOrderId);
}

/**
 * Handle payment.authorized event
 */
async function handlePaymentAuthorized(
  payment: any,
  ordersCollection: any,
  paymentsCollection: any
) {
  const { id: paymentId, order_id: razorpayOrderId, amount, method } = payment;

  // Update or create payment record
  await paymentsCollection.updateOne(
    { paymentId },
    {
      $set: {
        paymentId,
        razorpayOrderId,
        amount,
        status: PaymentStatus.AUTHORIZED,
        method,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // Update order status
  await ordersCollection.updateOne(
    { razorpayOrderId },
    {
      $set: {
        paymentId,
        paymentMethod: method,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.AUTHORIZED,
        updatedAt: new Date(),
      },
    }
  );

  console.log('Payment authorized:', paymentId);
}

/**
 * Handle refund.created event
 */
async function handleRefundCreated(
  refund: any,
  ordersCollection: any,
  paymentsCollection: any
) {
  const { id: refundId, payment_id: paymentId, amount, status } = refund;

  // Update payment record
  await paymentsCollection.updateOne(
    { paymentId },
    {
      $set: {
        refunded: true,
        refundStatus: status,
        refundId,
        updatedAt: new Date(),
      },
    }
  );

  // Find and update order
  const payment = await paymentsCollection.findOne({ paymentId });
  if (payment) {
    await ordersCollection.updateOne(
      { orderId: payment.orderId },
      {
        $set: {
          status: OrderStatus.REFUNDED,
          refundId,
          refundAmount: amount / 100, // Convert paise to rupees
          refundedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  }

  console.log('Refund created:', refundId);
}

/**
 * Handle refund.processed event
 */
async function handleRefundProcessed(
  refund: any,
  ordersCollection: any,
  paymentsCollection: any
) {
  const { id: refundId, payment_id: paymentId, amount, status } = refund;

  // Update payment record
  await paymentsCollection.updateOne(
    { paymentId },
    {
      $set: {
        refunded: true,
        refundStatus: 'processed',
        updatedAt: new Date(),
      },
    }
  );

  console.log('Refund processed:', refundId);

  // Optional: Send refund confirmation email
  // const payment = await paymentsCollection.findOne({ paymentId });
  // const order = await ordersCollection.findOne({ orderId: payment.orderId });
  // await sendRefundConfirmationEmail(order);
}

/**
 * Handle refund.failed event
 */
async function handleRefundFailed(
  refund: any,
  ordersCollection: any,
  paymentsCollection: any
) {
  const { id: refundId, payment_id: paymentId, amount, reason } = refund;

  console.error('Refund failed:', refundId, reason);

  // Update payment record
  await paymentsCollection.updateOne(
    { paymentId },
    {
      $set: {
        refundStatus: 'failed',
        refundFailureReason: reason,
        updatedAt: new Date(),
      },
    }
  );

  // Log alert for admin review
  const db = await getDatabase();
  const alertsCollection = db.collection(COLLECTIONS.ALERTS || 'alerts');
  
  try {
    await alertsCollection.insertOne({
      type: 'refund_failed',
      refundId,
      paymentId,
      reason,
      createdAt: new Date(),
      resolved: false,
    });
  } catch (error) {
    console.error('Error logging refund failure alert:', error);
  }
}

/**
 * Handle payment.dispute.created event
 */
async function handleDisputeCreated(
  dispute: any,
  ordersCollection: any,
  paymentsCollection: any
) {
  const { id: disputeId, payment_id: paymentId, amount, reason_code, evidence_due_date } = dispute;

  console.warn('Dispute created:', disputeId, reason_code);

  // Update payment record
  await paymentsCollection.updateOne(
    { paymentId },
    {
      $set: {
        disputeId,
        disputeStatus: 'created',
        disputeReason: reason_code,
        evidenceDueDate: evidence_due_date,
        updatedAt: new Date(),
      },
    }
  );

  // Log dispute alert for admin
  const db = await getDatabase();
  const disputesCollection = db.collection(COLLECTIONS.DISPUTES || 'disputes');
  
  try {
    await disputesCollection.insertOne({
      disputeId,
      paymentId,
      amount,
      reason: reason_code,
      status: 'created',
      evidenceDueDate: evidence_due_date,
      createdAt: new Date(),
      requiresAction: true,
    });
  } catch (error) {
    console.error('Error logging dispute:', error);
  }
}

/**
 * Handle payment.dispute.won event
 */
async function handleDisputeWon(
  dispute: any,
  ordersCollection: any,
  paymentsCollection: any
) {
  const { id: disputeId, payment_id: paymentId, amount } = dispute;

  console.log('Dispute won:', disputeId);

  // Update payment record
  await paymentsCollection.updateOne(
    { paymentId },
    {
      $set: {
        disputeStatus: 'won',
        updatedAt: new Date(),
      },
    }
  );

  // Update dispute record
  const db = await getDatabase();
  const disputesCollection = db.collection(COLLECTIONS.DISPUTES || 'disputes');
  
  try {
    await disputesCollection.updateOne(
      { disputeId },
      {
        $set: {
          status: 'won',
          resolvedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.error('Error updating dispute won status:', error);
  }
}

/**
 * Handle payment.dispute.lost event
 */
async function handleDisputeLost(
  dispute: any,
  ordersCollection: any,
  paymentsCollection: any
) {
  const { id: disputeId, payment_id: paymentId, amount, reason_code } = dispute;

  console.error('Dispute lost:', disputeId, reason_code);

  // Update payment record
  await paymentsCollection.updateOne(
    { paymentId },
    {
      $set: {
        disputeStatus: 'lost',
        updatedAt: new Date(),
      },
    }
  );

  // Update dispute record and alert admin
  const db = await getDatabase();
  const disputesCollection = db.collection(COLLECTIONS.DISPUTES || 'disputes');
  const alertsCollection = db.collection(COLLECTIONS.ALERTS || 'alerts');
  
  try {
    await disputesCollection.updateOne(
      { disputeId },
      {
        $set: {
          status: 'lost',
          resolvedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Alert admin
    await alertsCollection.insertOne({
      type: 'dispute_lost',
      disputeId,
      paymentId,
      amount,
      createdAt: new Date(),
      requiresAction: true,
    });
  } catch (error) {
    console.error('Error updating dispute lost status:', error);
  }
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(invoice: any, ordersCollection: any) {
  const { id: invoiceId, amount, status, order_id: razorpayOrderId } = invoice;

  console.log('Invoice paid:', invoiceId);

  // Update order status if exists
  if (razorpayOrderId) {
    await ordersCollection.updateOne(
      { razorpayOrderId },
      {
        $set: {
          invoicePaid: true,
          invoicePaidAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  }
}

/**
 * GET endpoint (not typically used for webhooks)
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'Razorpay webhook endpoint. POST only.',
    },
    { status: 405 }
  );
}
