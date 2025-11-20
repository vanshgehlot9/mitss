'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Eye, Users, TrendingUp, Globe, MapPin, Phone, Activity, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

const COLORS = ['#D4AF37', '#0D7377', '#14FFEC', '#F4C430', '#1A2642']

export default function TrafficAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadAnalytics()
  }, [range])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/stats?range=${range}`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-[#1A2642]">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-[#1A2642]">No analytics data available</p>
      </div>
    )
  }

  const { stats: summary, dailyData, topCountries, topPages, recentVisitors, visitorLocations, recentLeads } = stats

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1A2642] mb-2">Website Traffic Analytics</h1>
            <p className="text-[#1A2642]/60">Track visitor behavior and geographic insights</p>
          </div>
          
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-l-4 border-l-[#D4AF37]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#1A2642]/60 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Total Pageviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#1A2642]">{summary.totalPageviews.toLocaleString()}</p>
                <p className="text-xs text-[#1A2642]/60 mt-1">
                  {summary.avgPageviewsPerDay} avg/day
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-l-4 border-l-[#0D7377]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#1A2642]/60 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Unique Visitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#1A2642]">{summary.totalVisitors.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {summary.growthRate}% growth
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-l-4 border-l-[#14FFEC]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#1A2642]/60 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Total Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#1A2642]">{summary.totalLeads.toLocaleString()}</p>
                <p className="text-xs text-[#1A2642]/60 mt-1">
                  {summary.conversionRate}% conversion rate
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-l-4 border-l-[#F4C430]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#1A2642]/60 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#1A2642]">{topCountries.length}</p>
                <p className="text-xs text-[#1A2642]/60 mt-1">
                  Unique locations
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pageviews Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#D4AF37]" />
                Daily Pageviews & Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                  <XAxis dataKey="dateFormatted" stroke="#1A2642" fontSize={12} />
                  <YAxis stroke="#1A2642" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="pageviews" stroke="#D4AF37" strokeWidth={2} name="Pageviews" />
                  <Line type="monotone" dataKey="visitors" stroke="#0D7377" strokeWidth={2} name="Visitors" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0D7377]" />
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCountries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                  <XAxis dataKey="country" stroke="#1A2642" fontSize={12} />
                  <YAxis stroke="#1A2642" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#0D7377" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages & Recent Visitors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#D4AF37]" />
                Most Visited Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPages.map((page: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1A2642] truncate">{page.page}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#D4AF37]">{page.count}</p>
                        <p className="text-xs text-[#1A2642]/60">views</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Visitors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#14FFEC]" />
                Recent Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recentVisitors.slice(0, 10).map((visitor: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-[#FAF9F6] rounded-lg border border-[#D4AF37]/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3 text-[#D4AF37]" />
                        <p className="text-sm font-medium text-[#1A2642] truncate">
                          {visitor.city}, {visitor.country}
                        </p>
                      </div>
                      <p className="text-xs font-mono text-[#0D7377] mb-1">
                        IP: {visitor.ip}
                      </p>
                      <p className="text-xs text-[#1A2642]/60 truncate">
                        📄 {visitor.page}
                      </p>
                      <p className="text-xs text-[#1A2642]/40 mt-1">
                        🕒 {new Date(visitor.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        {recentLeads && recentLeads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#F4C430]" />
                Recent Leads (Phone Numbers Collected)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentLeads.map((lead: any, index: number) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-[#D4AF37]/10 to-[#0D7377]/10 rounded-lg border border-[#D4AF37]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-[#D4AF37]" />
                      <p className="font-bold text-[#1A2642]">{lead.phoneNumber}</p>
                    </div>
                    <p className="text-xs text-[#1A2642]/60 mb-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {lead.city}, {lead.country}
                    </p>
                    <p className="text-xs text-[#1A2642]/60 mb-1 truncate">
                      Page: {lead.page}
                    </p>
                    <p className="text-xs text-[#1A2642]/40">
                      {new Date(lead.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
