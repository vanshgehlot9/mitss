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
          '1. Verify variables are LINKED to your project (if using org-level vars)',
          '   - In Vercel Dashboard → Settings → Environment Variables',
          '   - Look for "Link To Projects" section',
          '   - Make sure your project (mitss or mitss-projects) is selected',
          '2. If variables are project-level, verify they are set for "Production" environment',
          '3. **CRITICAL: REDEPLOY your application** - Environment variables only apply to new deployments',
          '   - Go to Deployments tab → Find latest deployment → Click "..." → "Redeploy"',
          '   - OR trigger a new deployment by pushing to your repository',
          '4. Wait for deployment to complete (2-5 minutes)',
          '5. Check this endpoint again after redeployment: /api/razorpay/check-env',
          '6. If still failing, check Vercel Function Logs to see actual runtime values',
        ],
        note: '⚠️ IMPORTANT: Even if variables are set in Vercel Dashboard, you MUST redeploy for them to be available at runtime. Environment variables are injected during deployment build, not at runtime.',
        commonIssues: [
          'Organization-level variables not linked to your project',
          'Variables set but deployment is older than when variables were added',
          'Variables not enabled for Production environment',
          'Typo in variable names (should be exactly: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)',
        ],
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error checking configuration',
    }, { status: 500 });
  }
}

