import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { initialProducts } from '@/lib/initial-products'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || 'default')
    const products = db.collection(process.env.PRODUCTS_COLLECTION || 'products')

    const product = await products.findOne({ _id: new ObjectId(id) })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('MongoDB Error - Using fallback for product:', error)
    
    // FALLBACK: Try to find product in initial products
    const { id } = await params
    
    // Try to parse as numeric ID first
    const numericId = parseInt(id)
    if (!isNaN(numericId) && numericId > 0 && numericId <= initialProducts.length) {
      const product = {
        ...initialProducts[numericId - 1],
        id: numericId,
        _id: `fallback-${numericId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return NextResponse.json({
        success: true,
        data: product,
        fallback: true
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || 'default')
    const products = db.collection(process.env.PRODUCTS_COLLECTION || 'products')

    const body = await request.json()

    // Update timestamps
    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    const result = await products.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || 'default')
    const products = db.collection(process.env.PRODUCTS_COLLECTION || 'products')

    const result = await products.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
