'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Mail, Phone, Clock } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2642]">Support Center</h1>
          <p className="text-gray-500 mt-1">Customer support and help desk management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Active Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1A2642]">0</div>
              <p className="text-sm text-gray-500 mt-1">Pending support requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1A2642]">0</div>
              <p className="text-sm text-gray-500 mt-1">Unread messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1A2642]">--</div>
              <p className="text-sm text-gray-500 mt-1">Average response time</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#1A2642] mb-2">Support Center Under Development</h3>
              <p className="text-gray-500">
                Customer support features are being developed and will be available soon.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
