/**
 * API Route: Create Razorpay Order
 * POST /api/razorpay/create-order
 * 
 * This endpoint creates a new Razorpay order and stores it in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import {
  createRazorpayOrder,
  generateOrderId,
  validatePaymentAmount,
  formatOrderForDB,
  validateRazorpayConfig,
  sanitizeNotes,
} from '@/lib/razorpay-utils';
import {
  CreateRazorpayOrderRequest,
  CreateRazorpayOrderResponse,
  COLLECTIONS,
} from '@/lib/razorpay-schema';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Razorpay Create Order API Called ===');
    console.log('Environment Check:', {
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Set (length: ' + process.env.RAZORPAY_KEY_ID.length + ')' : 'NOT SET',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'Set (length: ' + process.env.RAZORPAY_KEY_SECRET.length + ')' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    });
    
    // Validate Razorpay configuration
    if (!validateRazorpayConfig()) {
      console.error('Razorpay configuration validation failed');
      console.error('Environment variables check:');
      console.error('  RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
      console.error('  RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
      console.error('');
      console.error('📋 TROUBLESHOOTING STEPS:');
      console.error('  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
      console.error('  2. Verify these variables are set:');
      console.error('     - RAZORPAY_KEY_ID (starts with "rzp_")');
      console.error('     - RAZORPAY_KEY_SECRET (your secret key)');
      console.error('  3. Ensure they are enabled for the correct environment (Production/Preview)');
      console.error('  4. REDEPLOY your application (Environment variables only apply to new deployments)');
      console.error('  5. Check Vercel Function Logs to see if variables are loaded');
      
      return NextResponse.json(
        {
          success: false,
          message: 'Payment gateway not configured. Environment variables missing on server.',
          error: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found in environment',
          troubleshooting: {
            step1: 'Verify environment variables in Vercel Dashboard → Settings → Environment Variables',
            step2: 'Ensure variables are set: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET',
            step3: 'Important: REDEPLOY your application after adding/changing environment variables',
            step4: 'Environment variables only apply to new deployments, not existing ones',
            step5: 'Check Vercel Function Logs to verify variables are loaded at runtime',
          }
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body: CreateRazorpayOrderRequest = await request.json();
    console.log('Request body received:', { 
      amount: body.amount, 
      customerEmail: body.customer?.email,
      itemsCount: body.items?.length 
    });

    // Validate required fields
    if (!body.amount || !body.customer || !body.items || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: amount, customer, or items',
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (!validatePaymentAmount(body.amount)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid payment amount. Must be between ₹1 and ₹10,00,000',
        },
        { status: 400 }
      );
    }

    // Validate customer details
    const { customer } = body;
    if (!customer.name || !customer.email || !customer.phone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer name, email, and phone are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate phone format (Indian)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = customer.phone.replace(/\D/g, '').slice(-10);
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid phone number format',
        },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (!body.shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: 'Shipping address is required',
        },
        { status: 400 }
      );
    }

    // Calculate total from items
    const calculatedTotal = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Verify amount matches items total (with tolerance for rounding)
    if (Math.abs(calculatedTotal - body.amount) > 1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order amount does not match items total',
        },
        { status: 400 }
      );
    }

    // Prepare notes
    const notes = sanitizeNotes({
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      items_count: body.items.length,
      ...body.notes,
    });

    // Create Razorpay order
    console.log('Creating Razorpay order with amount:', body.amount);
    const razorpayOrder = await createRazorpayOrder({
      amount: body.amount,
      currency: body.currency || 'INR',
      notes,
    });
    console.log('Razorpay order created:', { id: razorpayOrder.id, amount: razorpayOrder.amount });

    // Format order for database
    const orderData = formatOrderForDB(body, razorpayOrder);

    // Connect to database
    const db = await getDatabase();
    const ordersCollection = db.collection(COLLECTIONS.ORDERS);

    // Insert order into database
    const result = await ordersCollection.insertOne(orderData);

    if (!result.acknowledged) {
      throw new Error('Failed to save order to database');
    }

    // Prepare response
    const response: CreateRazorpayOrderResponse = {
      success: true,
      orderId: orderData.orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      message: 'Order created successfully',
    };

    console.log('Sending response:', { success: true, orderId: response.orderId, razorpayOrderId: response.razorpayOrderId });
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);

    // Handle Razorpay API errors
    if (error.error) {
      return NextResponse.json(
        {
          success: false,
          message: error.error.description || 'Failed to create payment order',
          code: error.error.code,
        },
        { status: error.statusCode || 500 }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while creating the order',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to fetch order details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order ID is required',
        },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const ordersCollection = db.collection(COLLECTIONS.ORDERS);

    // Find order
    const order = await ordersCollection.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching order:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch order details',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
