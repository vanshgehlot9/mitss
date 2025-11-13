import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { initialProducts } from "@/lib/initial-products"

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || "default")
    const collection = db.collection(process.env.PRODUCTS_COLLECTION || "products")

    // Check if products already exist
    const existingCount = await collection.countDocuments()
    
    if (existingCount > 0) {
      return NextResponse.json(
        { message: "Products already seeded", count: existingCount },
        { status: 200 }
      )
    }

    // Insert initial products
    const productsWithTimestamps = initialProducts.map(product => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    const result = await collection.insertMany(productsWithTimestamps)

    return NextResponse.json(
      {
        message: "Initial products seeded successfully",
        insertedCount: result.insertedCount,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Seed products error:", error)
    return NextResponse.json(
      { error: "Failed to seed products" },
      { status: 500 }
    )
  }
}
