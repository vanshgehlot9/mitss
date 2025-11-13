import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || "default")
    
    // Update all products to be exclusive
    const result = await db.collection("products").updateMany(
      {},
      { 
        $set: { 
          isExclusive: true,
          exclusivePrice: "Contact for Custom Price"
        } 
      }
    )
    
    // Get all updated products
    const products = await db.collection("products").find({}).toArray()
    
    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} products to exclusive`,
      products: products.map(p => ({
        name: p.name,
        isExclusive: p.isExclusive,
        exclusivePrice: p.exclusivePrice
      }))
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
