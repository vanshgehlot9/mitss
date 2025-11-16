/**
 * API Route: Mark Review as Helpful/Not Helpful
 * POST /api/reviews/helpful
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewId, helpful } = body

    if (!reviewId || typeof helpful !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Review ID and helpful flag are required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    // Update the helpful or notHelpful count
    const updateField = helpful ? 'helpful' : 'notHelpful'
    const result = await db.collection('reviews').updateOne(
      { _id: new ObjectId(reviewId) },
      { $inc: { [updateField]: 1 } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback'
    })
  } catch (error) {
    console.error('Error updating review helpfulness:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update review' },
      { status: 500 }
    )
  }
}
