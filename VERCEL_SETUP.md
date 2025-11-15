# Vercel Deployment Setup Guide

## Issue: Products Not Showing on Vercel
Your products work locally but don't appear on the deployed site (mitss.store) because the environment variables are not configured in Vercel.

## Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your project: **mitss**
3. Click on **Settings**
4. Click on **Environment Variables**

### Step 2: Add Required Environment Variables

Add each of these variables with their corresponding values:

#### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBZRfuBU0vJI2kHAF6_iTHl8-EV64C9mFA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mitss-ecommerce.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mitss-ecommerce
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mitss-ecommerce.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=430857077754
NEXT_PUBLIC_FIREBASE_APP_ID=1:430857077754:web:b6a87c2f14d3e33b0ee8ea
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-76EQPGCS06
NEXT_PUBLIC_FIREBASE_DATABASE_ID=mitss-ecommerce
```

#### MongoDB Configuration
```
MONGODB_URI=mongodb://shivkaradigitaldb2:AGlNFLKc_c2SwY5IsubIWfTi2FZuzxWTRJumSZuNHQythjpW@492ff772-c172-447d-b025-952b72299eae.asia-south1.firestore.goog:443/default?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false
DATABASE_NAME=default
PRODUCTS_COLLECTION=products
ORDERS_COLLECTION=orders
CUSTOMERS_COLLECTION=customers
```

#### Razorpay Configuration
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_5kZVj8CFVU5h9p
RAZORPAY_KEY_SECRET=8BBT8fPY9MNO5KD1eQjQrVmc
```

#### Email Configuration (Optional - for order notifications)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### Step 3: Deploy
After adding all environment variables:
1. Click **Save**
2. Go to **Deployments** tab
3. Click on the three dots (⋯) next to the latest deployment
4. Click **Redeploy**
5. Check "Use existing Build Cache" (optional)
6. Click **Redeploy**

### Step 4: Verify Products Load
1. Wait for deployment to complete
2. Visit https://mitss.store
3. Products should now appear automatically

## How Auto-Seeding Works

The API route `/api/products` now automatically seeds initial products if the database is empty:
- When products are fetched and MongoDB has 0 products
- It automatically inserts all products from `lib/initial-products.ts`
- This happens automatically on the first request

## Testing in Vercel

After deployment, you can test:
1. **Homepage**: Should show featured products
2. **Products Page**: Should show all products grid
3. **Admin Panel**: Should be able to add new products

## Important Notes

⚠️ **Security**: Make sure to keep your environment variables private. Never commit `.env.local` to Git.

✅ **Auto-Seeding**: Products will automatically populate on first visit if database is empty

✅ **Production Ready**: All sensitive keys are environment variables

## Troubleshooting

### If products still don't show:
1. Check Vercel Function Logs:
   - Go to your project → Deployments → Click latest → View Function Logs
   - Look for "No products found, auto-seeding..." message

2. Check MongoDB connection:
   - Verify MongoDB URI is correct
   - Ensure database is accessible from Vercel's IP ranges

3. Check console errors:
   - Open browser DevTools → Console
   - Look for API errors

### Manual Seed (if needed):
Visit: `https://mitss.store/api/seed-products` (POST request)
Or use this curl command:
```bash
curl -X POST https://mitss.store/api/seed-products
```

## Support
If issues persist, check:
- MongoDB connection string is valid
- All environment variables are set correctly
- Function logs in Vercel dashboard
