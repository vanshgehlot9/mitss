import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST() {
  try {
    const db = await getDatabase();
    const productsCollection = db.collection('products');

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

    const results = [];

    for (const product of newProducts) {
      const existingProduct = await productsCollection.findOne({ name: product.name });
      
      if (existingProduct) {
        await productsCollection.updateOne(
          { name: product.name },
          { $set: { ...product, updatedAt: new Date() } }
        );
        results.push({ name: product.name, action: 'updated' });
      } else {
        await productsCollection.insertOne(product);
        results.push({ name: product.name, action: 'added', price: product.price });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Products processed successfully',
      results,
    });
  } catch (error: any) {
    console.error('Error adding products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
