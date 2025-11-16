import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

/**
 * POST /api/search-analytics
 * Track search queries for analytics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, query, originalQuery, resultsCount, filters, timestamp } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const analyticsCollection = db.collection('search_analytics')

    await analyticsCollection.insertOne({
      userId: userId || 'guest',
      query,
      originalQuery,
      resultsCount,
      filters: filters || {},
      timestamp: new Date(timestamp) || new Date(),
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'Search tracked',
    })
  } catch (error) {
    console.error('Search analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to track search' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/search-analytics
 * Get search analytics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const db = await getDatabase()
    const analyticsCollection = db.collection('search_analytics')

    switch (action) {
      case 'top-searches':
        const topSearches = await analyticsCollection
          .aggregate([
            {
              $group: {
                _id: '$query',
                count: { $sum: 1 },
                avgResults: { $avg: '$resultsCount' },
              },
            },
            {
              $sort: { count: -1 },
            },
            {
              $limit: 20,
            },
            {
              $project: {
                query: '$_id',
                searchCount: '$count',
                avgResults: { $round: ['$avgResults', 0] },
              },
            },
          ])
          .toArray()

        return NextResponse.json({
          success: true,
          data: topSearches,
        })

      case 'trending':
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const trendingSearches = await analyticsCollection
          .aggregate([
            {
              $match: {
                timestamp: { $gte: last24h },
              },
            },
            {
              $group: {
                _id: '$query',
                count: { $sum: 1 },
                lastSeen: { $max: '$timestamp' },
              },
            },
            {
              $sort: { count: -1, lastSeen: -1 },
            },
            {
              $limit: 10,
            },
            {
              $project: {
                query: '$_id',
                count: 1,
              },
            },
          ])
          .toArray()

        return NextResponse.json({
          success: true,
          data: trendingSearches,
        })

      case 'no-results':
        const noResultsSearches = await analyticsCollection
          .aggregate([
            {
              $match: {
                resultsCount: 0,
              },
            },
            {
              $group: {
                _id: '$query',
                count: { $sum: 1 },
              },
            },
            {
              $sort: { count: -1 },
            },
            {
              $limit: 20,
            },
            {
              $project: {
                query: '$_id',
                noResultsCount: '$count',
              },
            },
          ])
          .toArray()

        return NextResponse.json({
          success: true,
          data: noResultsSearches,
        })

      case 'stats':
      default:
        const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const stats = await analyticsCollection
          .aggregate([
            {
              $facet: {
                totalSearches: [
                  {
                    $count: 'count',
                  },
                ],
                recentSearches: [
                  {
                    $match: {
                      timestamp: { $gte: last7days },
                    },
                  },
                  {
                    $count: 'count',
                  },
                ],
                avgResultsPerSearch: [
                  {
                    $group: {
                      _id: null,
                      avg: { $avg: '$resultsCount' },
                    },
                  },
                ],
                uniqueQueries: [
                  {
                    $group: {
                      _id: '$query',
                    },
                  },
                  {
                    $count: 'count',
                  },
                ],
              },
            },
          ])
          .toArray()

        const result = stats[0] || {}
        return NextResponse.json({
          success: true,
          data: {
            totalSearches: result.totalSearches?.[0]?.count || 0,
            recentSearches: result.recentSearches?.[0]?.count || 0,
            avgResultsPerSearch: result.avgResultsPerSearch?.[0]?.avg || 0,
            uniqueQueries: result.uniqueQueries?.[0]?.count || 0,
          },
        })
    }
  } catch (error) {
    console.error('Search analytics GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}
