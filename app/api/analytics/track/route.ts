import { NextRequest, NextResponse } from 'next/server'
import { database, ref, push, set, get, update } from '@/lib/firebase-realtime'

export const dynamic = 'force-dynamic'

// Get visitor location from IP (using free ipapi.co service)
async function getLocationFromIP(ip: string) {
  try {
    // Skip for local IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: 'Local',
        city: 'Development',
        region: 'Local',
        latitude: 0,
        longitude: 0
      }
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'Mitss-Analytics/1.0' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch location')
    }
    
    const data = await response.json()
    
    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || 'UTC'
    }
  } catch (error) {
    console.error('Error fetching location:', error)
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      latitude: 0,
      longitude: 0
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      page, 
      event, 
      userId,
      phoneNumber,
      referrer,
      userAgent 
    } = body

    // Get visitor IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Get location data
    const location = await getLocationFromIP(ip)

    const timestamp = new Date().toISOString()
    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Create visitor session data
    const visitorData = {
      timestamp,
      date,
      ip,
      page,
      event: event || 'pageview',
      userId: userId || null,
      phoneNumber: phoneNumber || null,
      referrer: referrer || 'direct',
      userAgent: userAgent || 'unknown',
      location: {
        country: location.country,
        city: location.city,
        region: location.region,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone || 'UTC'
      }
    }

    // Store detailed visitor log
    const visitorsRef = ref(database, 'analytics/visitors')
    const newVisitorRef = push(visitorsRef)
    await set(newVisitorRef, visitorData)

    // Update daily stats
    const dailyStatsRef = ref(database, `analytics/daily/${date}`)
    const dailySnapshot = await get(dailyStatsRef)
    
    if (dailySnapshot.exists()) {
      const currentStats = dailySnapshot.val()
      await update(dailyStatsRef, {
        pageviews: (currentStats.pageviews || 0) + 1,
        uniqueVisitors: currentStats.uniqueVisitors || 1,
        lastUpdated: timestamp
      })
    } else {
      await set(dailyStatsRef, {
        date,
        pageviews: 1,
        uniqueVisitors: 1,
        visitors: {},
        countries: {},
        pages: {},
        createdAt: timestamp,
        lastUpdated: timestamp
      })
    }

    // Update page-specific stats
    const pageStatsPath = `analytics/daily/${date}/pages/${encodeURIComponent(page)}`
    const pageStatsRef = ref(database, pageStatsPath)
    const pageSnapshot = await get(pageStatsRef)
    
    await set(pageStatsRef, {
      count: (pageSnapshot.exists() ? pageSnapshot.val().count : 0) + 1
    })

    // Update country stats
    const countryStatsPath = `analytics/daily/${date}/countries/${location.country}`
    const countryStatsRef = ref(database, countryStatsPath)
    const countrySnapshot = await get(countryStatsRef)
    
    await set(countryStatsRef, {
      count: (countrySnapshot.exists() ? countrySnapshot.val().count : 0) + 1
    })

    // If phone number provided, track lead
    if (phoneNumber) {
      const leadsRef = ref(database, 'analytics/leads')
      const newLeadRef = push(leadsRef)
      await set(newLeadRef, {
        phoneNumber,
        page,
        timestamp,
        location: location,
        ip
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics tracked',
      visitorId: newVisitorRef.key
    })
  } catch (error: any) {
    console.error('Error tracking analytics:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
