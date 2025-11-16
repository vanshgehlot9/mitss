import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAdmin } from '@/lib/ensure-admin'

// Simple CSV parser
function parseCSV(content: string) {
  const lines = content.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must have header row and at least one data row')
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = lines[i].split(',').map((v) => v.trim())
    const row: any = {}

    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })

    rows.push(row)
  }

  return rows
}

/**
 * POST /api/admin/products/bulk-import
 * Bulk import products from CSV
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const authErr = await requireAdmin(request)
    if (authErr) return authErr

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      )
    }

    // Read file content
    const fileContent = await file.text()

    // Parse CSV
    let csvData: any[]
    try {
      csvData = parseCSV(fileContent)
    } catch (parseError) {
      return NextResponse.json(
        { error: 'CSV parsing error', details: (parseError as Error).message },
        { status: 400 }
      )
    }

    // Validate and transform data
    const productsToInsert: any[] = []
    const importErrors: string[] = []

    csvData.forEach((row, index) => {
      const rowErrors: string[] = []

      // Validate required fields
      if (!row.name?.trim()) rowErrors.push(`Row ${index + 2}: Name is required`)
      if (!row.category?.trim()) rowErrors.push(`Row ${index + 2}: Category is required`)
      if (!row.price || isNaN(parseFloat(row.price))) rowErrors.push(`Row ${index + 2}: Valid price is required`)

      if (rowErrors.length > 0) {
        importErrors.push(...rowErrors)
        return
      }

      // Parse variants if provided
      let variants: any[] = []
      if (row.variants?.trim()) {
        try {
          variants = JSON.parse(row.variants)
        } catch (e) {
          importErrors.push(`Row ${index + 2}: Invalid variants JSON`)
          return
        }
      }

      productsToInsert.push({
        name: row.name.trim(),
        category: row.category.trim(),
        price: parseFloat(row.price),
        description: row.description?.trim() || '',
        image: row.image?.trim() || '',
        stock: parseInt(row.stock) || 0,
        variants: variants,
        discount: parseFloat(row.discount) || 0,
        metaTitle: row.meta_title?.trim() || row.name.trim(),
        metaDescription: row.meta_description?.trim() || row.description?.trim() || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
      })
    })

    // Check for validation errors
    if (importErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: importErrors,
        },
        { status: 400 }
      )
    }

    if (productsToInsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid products to import' },
        { status: 400 }
      )
    }

    // Insert into database
    const db = await getDatabase()
    const productsCollection = db.collection(process.env.PRODUCTS_COLLECTION || 'products')

    const result = await productsCollection.insertMany(productsToInsert)
    const importedCount = Object.keys(result.insertedIds).length

    console.log(`Bulk imported ${importedCount} products`)

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} products`,
      importedCount,
      productIds: Object.values(result.insertedIds),
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Bulk import failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/products/bulk-import
 * Download CSV template
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const authErr = await requireAdmin(request)
    if (authErr) return authErr

    const csvTemplate = `name,category,price,description,image,stock,variants,discount,meta_title,meta_description
Wooden Dining Table,Dining,15000,Beautiful handcrafted wooden dining table,/images/dining-table.jpg,5,"[{""name"":""Color"",""options"":[""Natural"",""Dark Brown""]}]",10,Wooden Dining Table for Sale,Shop our premium wooden dining tables
Modern Coffee Table,Living,8000,Sleek modern coffee table with storage,/images/coffee-table.jpg,8,"[{""name"":""Material"",""options"":[""Wood"",""Glass""]}]",0,Modern Coffee Table,Contemporary coffee table designs`

    return new NextResponse(csvTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="products-template.csv"',
      },
    })
  } catch (error) {
    console.error('Template download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
