/**
 * Public endpoint to check Razorpay environment variable status
 * This endpoint is public (no auth required) to help diagnose configuration issues
 * It returns boolean status only - no secret values exposed
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check all possible environment variable names
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keyId = process.env.RAZORPAY_KEY_ID || 
                  process.env.RAZORPAY_KEY || 
                  process.env.RAZORPAY_KEYID ||
                  (publicKeyId && publicKeyId.startsWith('rzp_') ? publicKeyId : null);
    
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 
                      process.env.RAZORPAY_SECRET ||
                      process.env.RAZORPAY_KEY_SECRET_KEY;

    const configValid = !!(keyId && keySecret);

    return NextResponse.json({
      success: true,
      configValid,
      status: configValid ? '✅ Razorpay is properly configured' : '❌ Razorpay configuration missing',
      resolved: {
        keyId_found: !!keyId,
        keyId_length: keyId?.length || 0,
        keyId_prefix: keyId?.substring(0, 7) || 'N/A',
        keySecret_found: !!keySecret,
        keySecret_length: keySecret?.length || 0,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
        VERCEL: process.env.VERCEL || 'not set',
      },
      checkedVariables: {
        RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
        RAZORPAY_KEY: !!process.env.RAZORPAY_KEY,
        RAZORPAY_KEYID: !!process.env.RAZORPAY_KEYID,
        RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
        RAZORPAY_SECRET: !!process.env.RAZORPAY_SECRET,
        NEXT_PUBLIC_RAZORPAY_KEY_ID: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      troubleshooting: configValid ? null : {
        issue: 'Environment variables are not detected at runtime',
        steps: [
          '1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
          '2. Add RAZORPAY_KEY_ID (should start with "rzp_")',
          '3. Add RAZORPAY_KEY_SECRET (your secret key from Razorpay dashboard)',
          '4. Ensure both are enabled for "Production" environment',
          '5. **CRITICAL: REDEPLOY your application** - Environment variables only apply to new deployments',
          '6. Go to Deployments tab → Click "..." on latest deployment → "Redeploy"',
          '7. Wait for deployment to complete, then test again',
        ],
        note: 'If you already added variables but still see this error, you MUST redeploy for them to take effect!',
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error checking configuration',
    }, { status: 500 });
  }
}

