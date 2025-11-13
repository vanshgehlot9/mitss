import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'default')
    const products = db.collection(process.env.PRODUCTS_COLLECTION || 'products')

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    // Build query
    const query: any = {}
    if (category) {
      query.category = category
    }

    // Fetch products
    const productsList = await products
      .find(query)
      .limit(limit)
      .skip(skip)
      .toArray()

    // Get total count
    const total = await products.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: productsList,
      total,
      limit,
      skip
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'default')
    const products = db.collection(process.env.PRODUCTS_COLLECTION || 'products')

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'category', 'price', 'description']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Add timestamps
    const productData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await products.insertOne(productData)

    return NextResponse.json({
      success: true,
      data: {
        ...productData,
        _id: result.insertedId
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
