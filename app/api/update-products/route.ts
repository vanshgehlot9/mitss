import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || "default")
    const collection = db.collection(process.env.PRODUCTS_COLLECTION || "products")

    // Update Cross-Back Dining Chair
    const result1 = await collection.updateOne(
      { name: "Cross-Back Dining Chair" },
      {
        $set: {
          price: 2500,
          originalPrice: 4999,
          isExclusive: false,
          color: ["Natural Wood", "Black", "White"],
          features: [
            "Elegant cross-back design",
            "Natural wooden seat",
            "Black metal frame",
            "Handcrafted with premium materials",
            "Suitable for indoor use",
            "Easy to maintain"
          ],
          dimensions: {
            width: "45cm",
            height: "90cm",
            depth: "50cm"
          },
          material: "Wood & Metal",
          deliveryTime: "2-3 weeks",
          updatedAt: new Date(),
        },
        $unset: {
          exclusivePrice: ""
        }
      }
    )

    // Update Industrial Metal Chair
    const result2 = await collection.updateOne(
      { name: "Industrial Metal Chair" },
      {
        $set: {
          price: 1700,
          originalPrice: 3499,
          isExclusive: false,
          color: ["Black", "Grey", "Brown"],
          features: [
            "Classic industrial design",
            "Vintage finish",
            "Stackable design",
            "Durable powder-coated steel",
            "Perfect for cafes and restaurants",
            "Easy to clean"
          ],
          dimensions: {
            width: "40cm",
            height: "85cm",
            depth: "45cm"
          },
          material: "Metal",
          deliveryTime: "2-3 weeks",
          updatedAt: new Date(),
        },
        $unset: {
          exclusivePrice: ""
        }
      }
    )

    return NextResponse.json(
      {
        message: "Products updated successfully",
        crossBackChair: result1.modifiedCount > 0 ? "Updated" : "Not found",
        industrialMetalChair: result2.modifiedCount > 0 ? "Updated" : "Not found",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update products error:", error)
    return NextResponse.json(
      { error: "Failed to update products" },
      { status: 500 }
    )
  }
}
