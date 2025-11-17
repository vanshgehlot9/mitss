/**
 * Protected debug route to check presence of Razorpay environment variables.
 * Usage: set an environment variable `DEBUG_TOKEN` on the server, then call
 * the route with header `x-debug-token: <DEBUG_TOKEN>`.
 *
 * This endpoint intentionally does NOT return secret values. It only returns
 * booleans and lengths so you can verify variables are available at runtime.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-debug-token');

    if (!process.env.DEBUG_TOKEN) {
      return NextResponse.json(
        { success: false, message: 'DEBUG_TOKEN not configured on server. Set DEBUG_TOKEN to enable debug endpoint.' },
        { status: 403 }
      );
    }

    if (!token || token !== process.env.DEBUG_TOKEN) {
      return NextResponse.json({ success: false, message: 'Invalid or missing debug token' }, { status: 401 });
    }

    // Check all possible environment variable names
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keyId = process.env.RAZORPAY_KEY_ID || 
                  process.env.RAZORPAY_KEY || 
                  process.env.RAZORPAY_KEYID ||
                  (publicKeyId && publicKeyId.startsWith('rzp_') ? publicKeyId : null);
    
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 
                      process.env.RAZORPAY_SECRET ||
                      process.env.RAZORPAY_KEY_SECRET_KEY;

    const rsp = {
      success: true,
      configValid: !!(keyId && keySecret),
      resolved: {
        keyId_found: !!keyId,
        keyId_length: keyId?.length || 0,
        keyId_prefix: keyId?.substring(0, 4) || 'N/A',
        keySecret_found: !!keySecret,
        keySecret_length: keySecret?.length || 0,
      },
      env: {
        RAZORPAY_KEY_ID_set: !!process.env.RAZORPAY_KEY_ID,
        RAZORPAY_KEY_ID_length: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.length : 0,
        RAZORPAY_KEY_set: !!process.env.RAZORPAY_KEY,
        RAZORPAY_KEYID_set: !!process.env.RAZORPAY_KEYID,
        RAZORPAY_KEY_SECRET_set: !!process.env.RAZORPAY_KEY_SECRET,
        RAZORPAY_KEY_SECRET_length: process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.length : 0,
        RAZORPAY_SECRET_set: !!process.env.RAZORPAY_SECRET,
        RAZORPAY_KEY_SECRET_KEY_set: !!process.env.RAZORPAY_KEY_SECRET_KEY,
        NEXT_PUBLIC_RAZORPAY_KEY_ID_set: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        NEXT_PUBLIC_RAZORPAY_KEY_ID_length: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.length : 0,
        RAZORPAY_WEBHOOK_SECRET_set: !!process.env.RAZORPAY_WEBHOOK_SECRET,
        NODE_ENV: process.env.NODE_ENV || null,
        VERCEL_ENV: process.env.VERCEL_ENV || null,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || null,
      },
      troubleshooting: {
        note: 'If configValid is false, verify environment variables in Vercel Dashboard',
        steps: [
          '1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
          '2. Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set',
          '3. Ensure they are enabled for Production environment',
          '4. REDEPLOY your application (env vars only apply to new deployments)',
          '5. Check Vercel Function Logs to see if variables load at runtime',
        ],
      },
    };

    return NextResponse.json(rsp, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Error' }, { status: 500 });
  }
}
