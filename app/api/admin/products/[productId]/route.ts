import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAdmin } from '@/lib/ensure-admin'
import { ObjectId } from 'mongodb'

/**
 * POST /api/admin/products/[productId]/duplicate
 * Duplicate a product
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    // Check admin authorization
    const authErr = await requireAdmin(request)
    if (authErr) return authErr

    const db = await getDatabase()
    const productsCollection = db.collection(process.env.PRODUCTS_COLLECTION || 'products')

    // Find the product to duplicate
    const originalProduct = await productsCollection.findOne({
      _id: new ObjectId(params.productId),
    })

    if (!originalProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create duplicate
    const duplicatedProduct = {
      ...originalProduct,
      _id: undefined, // MongoDB will generate new ID
      name: `${originalProduct.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await productsCollection.insertOne(duplicatedProduct)

    return NextResponse.json({
      success: true,
      message: 'Product duplicated successfully',
      productId: result.insertedId,
    })
  } catch (error) {
    console.error('Duplicate product error:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate product', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/products/[productId]/archive
 * Archive (soft delete) a product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    // Check admin authorization
    const authErr = await requireAdmin(request)
    if (authErr) return authErr

    const { archive } = await request.json()

    if (typeof archive !== 'boolean') {
      return NextResponse.json(
        { error: 'Archive flag must be boolean' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const productsCollection = db.collection(process.env.PRODUCTS_COLLECTION || 'products')

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(params.productId) },
      {
        $set: {
          archived: archive,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: archive ? 'Product archived' : 'Product restored',
    })
  } catch (error) {
    console.error('Archive product error:', error)
    return NextResponse.json(
      { error: 'Failed to archive product', details: (error as Error).message },
      { status: 500 }
    )
  }
}
