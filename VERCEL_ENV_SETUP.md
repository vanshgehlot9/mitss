# Vercel Environment Variables Setup

## Critical: Add Razorpay Credentials to Vercel

The "Payment gateway configuration error" occurs because Razorpay environment variables are missing from your Vercel deployment.

## Steps to Fix:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/
- Select your project: **mitss** (vanshgehlot9's workspace)

### 2. Add Environment Variables
Navigate to: **Settings** → **Environment Variables**

Add the following variables:

```
RAZORPAY_KEY_ID=rzp_test_RfFWI9Ba2Hz1e1
RAZORPAY_KEY_SECRET=tu0VmwxBseiqE2KKcKszfVHj
RAZORPAY_WEBHOOK_SECRET=mitss_webhook_2025
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RfFWI9Ba2Hz1e1
```

### 3. Select Environment Scope
For each variable, select:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

### 4. Redeploy
After adding variables:
- Go to **Deployments** tab
- Click on the latest deployment
- Click **"Redeploy"** button
- Or push a new commit to trigger automatic deployment

## Other Required Environment Variables

Ensure these are also added to Vercel:

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDV3FaMiHOv5rh7nMt93NvxabyNYk8Yd-4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mitss-ecommerce.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mitss-ecommerce
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mitss-ecommerce.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=292288357672
NEXT_PUBLIC_FIREBASE_APP_ID=1:292288357672:web:9269f100d06b0a5d951c1d
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-VCKY84PLMP
```

### Admin Configuration
```
NEXT_PUBLIC_SUPER_ADMIN_EMAILS=gehlotvansh560@gmail.com
```

### MongoDB (Optional - fallback system works without it)
```
MONGODB_URI=mongodb://shivkaradigitaldb2:AGlNFLKc_c2SwY5IsubIWfTi2FZuzxWTRJumSZuNHQythjpW@492ff772-c172-447d-b025-952b72299eae.asia-south1.firestore.goog:443/default?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false
DATABASE_NAME=default
```

## Verification

After redeployment, test payment at:
https://mitss.store/payment

The payment gateway should now work correctly with Razorpay checkout.

## Quick Fix Command

You can also add variables via Vercel CLI:
```bash
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
vercel env add RAZORPAY_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID
```

Then redeploy:
```bash
vercel --prod
```

## Notes

- **Test Mode**: Currently using Razorpay test credentials (rzp_test_...)
- **Production Mode**: Replace with live credentials (rzp_live_...) when going live
- **Webhook Secret**: Can be generated from Razorpay Dashboard → Settings → Webhooks
