import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise()
    const db = client.db(process.env.DATABASE_NAME || 'default')
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray()
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      database: process.env.DATABASE_NAME || 'default',
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('MongoDB connection error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect to MongoDB',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
