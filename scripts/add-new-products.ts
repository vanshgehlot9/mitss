/**
 * Script to add new products to MongoDB
 * Run with: npx tsx scripts/add-new-products.ts
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';

const newProducts = [
  {
    name: "Premium Furniture Collection Set",
    description: "Luxurious complete furniture set featuring premium materials and exquisite craftsmanship. This exclusive collection includes multiple pieces designed to transform your space with elegance and sophistication. Perfect for those seeking high-end interior solutions.",
    category: "Living Room",
    price: 20000,
    originalPrice: 35000,
    rating: 4.9,
    reviews: 78,
    image: "/images/products/productimage1.png",
    badge: "Premium",
    inStock: true,
    featured: true,
    isExclusive: false,
    color: ["Natural Wood", "Walnut", "Dark Oak"],
    features: [
      "Premium quality materials",
      "Exquisite craftsmanship",
      "Complete furniture set",
      "Elegant design",
      "Durable construction",
      "Professional installation available"
    ],
    dimensions: {
      width: "Various",
      height: "Various",
      depth: "Various"
    },
    material: "Premium Wood & Metal",
    deliveryTime: "3-4 weeks",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Modern Accent Chair",
    description: "Stylish modern accent chair with comfortable cushioning and sleek design. Features sturdy construction with premium upholstery. Perfect addition to any living room, bedroom, or reading nook.",
    category: "Seating",
    price: 2000,
    originalPrice: 3500,
    rating: 4.5,
    reviews: 92,
    image: "/images/products/productimage2.png",
    badge: "Best Value",
    inStock: true,
    featured: true,
    isExclusive: false,
    color: ["Grey", "Beige", "Navy Blue"],
    features: [
      "Comfortable cushioning",
      "Sleek modern design",
      "Premium upholstery",
      "Sturdy construction",
      "Easy to assemble",
      "Perfect for any room"
    ],
    dimensions: {
      width: "65cm",
      height: "80cm",
      depth: "70cm"
    },
    material: "Fabric & Wood",
    deliveryTime: "1-2 weeks",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function addNewProducts() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const productsCollection = db.collection('products');

    // Check if products already exist
    for (const product of newProducts) {
      const existingProduct = await productsCollection.findOne({ name: product.name });
      
      if (existingProduct) {
        console.log(`Product "${product.name}" already exists. Updating...`);
        await productsCollection.updateOne(
          { name: product.name },
          { $set: { ...product, updatedAt: new Date() } }
        );
        console.log(`✅ Updated: ${product.name}`);
      } else {
        console.log(`Adding new product: ${product.name}`);
        await productsCollection.insertOne(product);
        console.log(`✅ Added: ${product.name} - ₹${product.price}`);
      }
    }

    console.log('\n✅ All products processed successfully!');
  } catch (error) {
    console.error('❌ Error adding products:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

addNewProducts();
