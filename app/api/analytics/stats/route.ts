import { NextRequest, NextResponse } from 'next/server'
import { database, ref, get } from '@/lib/firebase-realtime'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30' // days
    const days = parseInt(range)

    // Get date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch daily analytics data
    const analyticsRef = ref(database, 'analytics/daily')
    const snapshot = await get(analyticsRef)

    let dailyData: any[] = []
    let totalPageviews = 0
    let totalVisitors = 0
    const countriesMap = new Map<string, number>()
    const pagesMap = new Map<string, number>()
    const citiesMap = new Map<string, number>()

    if (snapshot.exists()) {
      const data = snapshot.val()
      
      // Process each day
      Object.entries(data).forEach(([date, dayData]: [string, any]) => {
        const dayDate = new Date(date)
        
        // Only include days in range
        if (dayDate >= startDate && dayDate <= endDate) {
          const pageviews = dayData.pageviews || 0
          const visitors = dayData.uniqueVisitors || 0
          
          totalPageviews += pageviews
          totalVisitors += visitors

          dailyData.push({
            date,
            pageviews,
            visitors,
            dateFormatted: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          })

          // Aggregate countries
          if (dayData.countries) {
            Object.entries(dayData.countries).forEach(([country, countryData]: [string, any]) => {
              countriesMap.set(country, (countriesMap.get(country) || 0) + (countryData.count || 0))
            })
          }

          // Aggregate pages
          if (dayData.pages) {
            Object.entries(dayData.pages).forEach(([page, pageData]: [string, any]) => {
              pagesMap.set(decodeURIComponent(page), (pagesMap.get(decodeURIComponent(page)) || 0) + (pageData.count || 0))
            })
          }
        }
      })
    }

    // Sort daily data by date
    dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Get top countries
    const topCountries = Array.from(countriesMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get top pages
    const topPages = Array.from(pagesMap.entries())
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Fetch recent visitors for location data
    const visitorsRef = ref(database, 'analytics/visitors')
    const visitorsSnapshot = await get(visitorsRef)
    
    const recentVisitors: any[] = []
    const visitorLocations: any[] = []
    
    if (visitorsSnapshot.exists()) {
      const visitors = visitorsSnapshot.val()
      const visitorArray = Object.entries(visitors).map(([id, data]: [string, any]) => ({
        id,
        ...data,
        timestamp: new Date(data.timestamp).getTime()
      }))
      
      // Sort by timestamp descending
      visitorArray.sort((a, b) => b.timestamp - a.timestamp)
      
      // Get recent 50 visitors
      const recent = visitorArray.slice(0, 50)
      
      recent.forEach(visitor => {
        recentVisitors.push({
          timestamp: new Date(visitor.timestamp).toISOString(),
          page: visitor.page,
          country: visitor.location?.country || 'Unknown',
          city: visitor.location?.city || 'Unknown',
          ip: visitor.ip,
          event: visitor.event
        })
        
        // Add to map locations
        if (visitor.location?.latitude && visitor.location?.longitude) {
          const key = `${visitor.location.city}, ${visitor.location.country}`
          if (!visitorLocations.find(v => v.location === key)) {
            visitorLocations.push({
              location: key,
              latitude: visitor.location.latitude,
              longitude: visitor.location.longitude,
              count: 1
            })
          }
        }
      })
    }

    // Fetch leads (phone numbers collected)
    const leadsRef = ref(database, 'analytics/leads')
    const leadsSnapshot = await get(leadsRef)
    
    let totalLeads = 0
    const recentLeads: any[] = []
    
    if (leadsSnapshot.exists()) {
      const leads = leadsSnapshot.val()
      const leadsArray = Object.entries(leads).map(([id, data]: [string, any]) => ({
        id,
        ...data
      }))
      
      totalLeads = leadsArray.length
      
      // Get recent 10 leads
      recentLeads.push(...leadsArray
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
        .map((lead: any) => ({
          phoneNumber: lead.phoneNumber,
          page: lead.page,
          timestamp: lead.timestamp,
          country: lead.location?.country || 'Unknown',
          city: lead.location?.city || 'Unknown'
        }))
      )
    }

    // Calculate growth rates
    const halfwayIndex = Math.floor(dailyData.length / 2)
    const firstHalf = dailyData.slice(0, halfwayIndex)
    const secondHalf = dailyData.slice(halfwayIndex)
    
    const firstHalfViews = firstHalf.reduce((sum, day) => sum + day.pageviews, 0)
    const secondHalfViews = secondHalf.reduce((sum, day) => sum + day.pageviews, 0)
    
    const growthRate = firstHalfViews > 0 
      ? ((secondHalfViews - firstHalfViews) / firstHalfViews) * 100
      : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalPageviews,
        totalVisitors,
        totalLeads,
        avgPageviewsPerDay: dailyData.length > 0 ? Math.round(totalPageviews / dailyData.length) : 0,
        growthRate: Math.round(growthRate * 10) / 10,
        conversionRate: totalVisitors > 0 ? Math.round((totalLeads / totalVisitors) * 100 * 10) / 10 : 0
      },
      dailyData,
      topCountries,
      topPages,
      recentVisitors,
      visitorLocations,
      recentLeads
    })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
