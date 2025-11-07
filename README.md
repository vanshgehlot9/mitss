# MITSS Furniture E-commerce Website

## Product Types

### Regular Products
- **Buy Now** button (gold)
- Fixed pricing
- Add to cart functionality
- Example: Cross-Back Dining Chair, Geometric Side Tables

### Exclusive Products
- **Contact on WhatsApp** button (green)
- Custom pricing through contact
- "Exclusive Product" badge (gold)
- Example: Industrial Bar Stool, C-Shape Table, Metal Chair

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env.local` file with:
```bash
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=default
PRODUCTS_COLLECTION=products
```

### 3. Add Product Images
Save your product images in `/public/images/products/`

Example:
- `/public/images/products/exclusiveproduct1.png`
- `/public/images/products/exclusiveproduct2.png`
- etc.

### 4. Start Development Server
```bash
npm run dev
```

### 5. Seed Initial Products (one time)
```bash
curl -X POST http://localhost:3000/api/seed-products
```

## View Website

- **Homepage**: http://localhost:3000
- **All Products**: http://localhost:3000/products
- **Admin (Add Products)**: http://localhost:3000/admin/add-product

## Features

✅ **Dual Product Types**
   - Regular products: Buy Now button only
   - Exclusive products: WhatsApp Contact button only
✅ WhatsApp integration (+91-9314444747)  
✅ MongoDB database with Firestore  
✅ Featured products on homepage  
✅ Product filtering and sorting  
✅ Shopping cart functionality  
✅ Mobile responsive design  

## Admin Panel

Access: `/admin/add-product`

Features:
- Add new products
- Upload images to `/public/images/products/` manually
- Set product type (Regular or Exclusive)
- Custom pricing for exclusive products

## Tech Stack

- Next.js 14+
- React 19
- TypeScript
- MongoDB
- Cloudinary
- Tailwind CSS
- Shadcn/ui Components
