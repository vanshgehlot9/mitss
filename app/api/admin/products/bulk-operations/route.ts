import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAdmin } from '@/lib/ensure-admin'
import { ObjectId } from 'mongodb'

/**
 * POST /api/admin/products/bulk-operations
 * Perform bulk operations on products
 * 
 * Operations:
 * - delete: Delete products
 * - archive: Archive products
 * - updatePrice: Update price for products
 * - updateCategory: Update category for products
 * - updateStock: Update stock for products
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const authErr = await requireAdmin(request)
    if (authErr) return authErr

    const { operation, productIds, data } = await request.json()

    if (!operation || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: operation and productIds array required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const productsCollection = db.collection(process.env.PRODUCTS_COLLECTION || 'products')

    // Convert string IDs to ObjectId
    const objectIds = productIds.map((id) => new ObjectId(id))

    let result: any
    let message = ''

    switch (operation) {
      case 'delete':
        result = await productsCollection.deleteMany({
          _id: { $in: objectIds },
        })
        message = `Deleted ${result.deletedCount} products`
        break

      case 'archive':
        result = await productsCollection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { archived: true, updatedAt: new Date() } }
        )
        message = `Archived ${result.modifiedCount} products`
        break

      case 'restore':
        result = await productsCollection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { archived: false, updatedAt: new Date() } }
        )
        message = `Restored ${result.modifiedCount} products`
        break

      case 'updatePrice':
        if (!data || data.price === undefined) {
          return NextResponse.json(
            { error: 'Price value required for updatePrice operation' },
            { status: 400 }
          )
        }
        result = await productsCollection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { price: parseFloat(data.price), updatedAt: new Date() } }
        )
        message = `Updated price for ${result.modifiedCount} products`
        break

      case 'updateCategory':
        if (!data || !data.category) {
          return NextResponse.json(
            { error: 'Category value required for updateCategory operation' },
            { status: 400 }
          )
        }
        result = await productsCollection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { category: data.category, updatedAt: new Date() } }
        )
        message = `Updated category for ${result.modifiedCount} products`
        break

      case 'updateStock':
        if (!data || data.stock === undefined) {
          return NextResponse.json(
            { error: 'Stock value required for updateStock operation' },
            { status: 400 }
          )
        }
        result = await productsCollection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { stock: parseInt(data.stock), updatedAt: new Date() } }
        )
        message = `Updated stock for ${result.modifiedCount} products`
        break

      case 'updateDiscount':
        if (!data || data.discount === undefined) {
          return NextResponse.json(
            { error: 'Discount value required for updateDiscount operation' },
            { status: 400 }
          )
        }
        result = await productsCollection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { discount: parseFloat(data.discount), updatedAt: new Date() } }
        )
        message = `Updated discount for ${result.modifiedCount} products`
        break

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        )
    }

    console.log(`Bulk operation ${operation}: ${message}`)

    return NextResponse.json({
      success: true,
      message,
      modifiedCount: result.modifiedCount || result.deletedCount || 0,
    })
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { error: 'Bulk operation failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/products/bulk-operations?operation=export
 * Export products to CSV
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const authErr = await requireAdmin(request)
    if (authErr) return authErr

    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')
    const category = searchParams.get('category')
    const archived = searchParams.get('archived') === 'true'

    if (operation !== 'export') {
      return NextResponse.json(
        { error: 'Only export operation is supported for GET' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const productsCollection = db.collection(process.env.PRODUCTS_COLLECTION || 'products')

    // Build query
    const query: any = { archived }
    if (category) {
      query.category = category
    }

    // Fetch products
    const products = await productsCollection.find(query).toArray()

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products to export' },
        { status: 404 }
      )
    }

    // Generate CSV
    const headers = [
      'name',
      'category',
      'price',
      'description',
      'image',
      'stock',
      'discount',
      'meta_title',
      'meta_description',
    ]

    const csvContent = [
      headers.join(','),
      ...products.map((product) =>
        [
          `"${product.name?.replace(/"/g, '""') || ''}"`,
          `"${product.category?.replace(/"/g, '""') || ''}"`,
          product.price || 0,
          `"${product.description?.replace(/"/g, '""') || ''}"`,
          `"${product.image?.replace(/"/g, '""') || ''}"`,
          product.stock || 0,
          product.discount || 0,
          `"${product.metaTitle?.replace(/"/g, '""') || ''}"`,
          `"${product.metaDescription?.replace(/"/g, '""') || ''}"`,
        ].join(',')
      ),
    ].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}
