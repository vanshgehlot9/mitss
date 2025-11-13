'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Users,
  BarChart3,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Plus
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'

interface Campaign {
  id: string
  name: string
  type: 'email' | 'whatsapp' | 'sms'
  status: 'draft' | 'scheduled' | 'sent' | 'active'
  subject?: string
  message: string
  audience: string
  scheduledDate?: Date
  sentDate?: Date
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    conversions: number
  }
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Summer Sale 2024',
      type: 'email',
      status: 'sent',
      subject: 'Exclusive Summer Discounts - Up to 40% Off!',
      message: 'Dear valued customer, our summer collection is now available...',
      audience: 'All Customers',
      sentDate: new Date('2024-01-15'),
      stats: {
        sent: 1250,
        delivered: 1235,
        opened: 890,
        clicked: 345,
        conversions: 67
      }
    },
    {
      id: '2',
      name: 'New Arrivals Notification',
      type: 'whatsapp',
      status: 'active',
      message: 'Check out our latest handicraft collection! 🎨',
      audience: 'VIP Customers',
      scheduledDate: new Date('2024-02-01'),
      stats: {
        sent: 340,
        delivered: 335,
        opened: 280,
        clicked: 125,
        conversions: 23
      }
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    type: 'email',
    status: 'draft',
    audience: 'All Customers',
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      conversions: 0
    }
  })

  const [automationRules, setAutomationRules] = useState([
    {
      id: '1',
      name: 'Welcome Email',
      trigger: 'New Customer Registration',
      action: 'Send Welcome Email',
      active: true
    },
    {
      id: '2',
      name: 'Abandoned Cart',
      trigger: 'Cart Abandoned for 24 hours',
      action: 'Send Reminder Email',
      active: true
    },
    {
      id: '3',
      name: 'Order Confirmation',
      trigger: 'Order Placed',
      action: 'Send Confirmation Email + WhatsApp',
      active: true
    },
    {
      id: '4',
      name: 'Re-engagement',
      trigger: 'No purchase in 90 days',
      action: 'Send Special Offer',
      active: false
    }
  ])

  const createCampaign = () => {
    if (!newCampaign.name || !newCampaign.message) {
      toast.error('Please fill all required fields')
      return
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name || '',
      type: newCampaign.type || 'email',
      status: 'draft',
      subject: newCampaign.subject,
      message: newCampaign.message || '',
      audience: newCampaign.audience || 'All Customers',
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        conversions: 0
      }
    }

    setCampaigns([...campaigns, campaign])
    setShowCreateModal(false)
    setNewCampaign({
      type: 'email',
      status: 'draft',
      audience: 'All Customers',
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        conversions: 0
      }
    })
    toast.success('Campaign created successfully')
  }

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id))
    toast.success('Campaign deleted')
  }

  const toggleAutomation = (id: string) => {
    setAutomationRules(automationRules.map(rule =>
      rule.id === id ? { ...rule, active: !rule.active } : rule
    ))
    toast.success('Automation rule updated')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
      sent: 'bg-green-100 text-green-800 border-green-300',
      active: 'bg-purple-100 text-purple-800 border-purple-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />
      case 'whatsapp':
        return <MessageSquare className="h-5 w-5" />
      case 'sms':
        return <Send className="h-5 w-5" />
      default:
        return <Mail className="h-5 w-5" />
    }
  }

  // Calculate totals
  const totalStats = campaigns.reduce((acc, campaign) => ({
    sent: acc.sent + campaign.stats.sent,
    delivered: acc.delivered + campaign.stats.delivered,
    opened: acc.opened + campaign.stats.opened,
    clicked: acc.clicked + campaign.stats.clicked,
    conversions: acc.conversions + campaign.stats.conversions
  }), { sent: 0, delivered: 0, opened: 0, clicked: 0, conversions: 0 })

  const openRate = totalStats.sent > 0 ? (totalStats.opened / totalStats.sent * 100) : 0
  const clickRate = totalStats.sent > 0 ? (totalStats.clicked / totalStats.sent * 100) : 0
  const conversionRate = totalStats.sent > 0 ? (totalStats.conversions / totalStats.sent * 100) : 0

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage campaigns and customer engagement</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sent</p>
                  <p className="text-2xl font-bold mt-2">{totalStats.sent}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold mt-2">{totalStats.delivered}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalStats.sent > 0 ? ((totalStats.delivered / totalStats.sent) * 100).toFixed(1) : 0}% delivery rate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-500">Opened</p>
                <p className="text-2xl font-bold mt-2">{totalStats.opened}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {openRate.toFixed(1)}% open rate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-500">Clicked</p>
                <p className="text-2xl font-bold mt-2">{totalStats.clicked}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {clickRate.toFixed(1)}% click rate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-500">Conversions</p>
                <p className="text-2xl font-bold mt-2 text-primary">{totalStats.conversions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {conversionRate.toFixed(1)}% conversion rate
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign List</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No campaigns created yet</p>
                <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                  Create Your First Campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-6 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                          {getTypeIcon(campaign.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)} • {campaign.audience}
                          </p>
                          {campaign.subject && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Subject:</strong> {campaign.subject}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${getStatusColor(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {(campaign.status === 'sent' || campaign.status === 'active') && (
                      <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Sent</p>
                          <p className="text-lg font-semibold">{campaign.stats.sent}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Delivered</p>
                          <p className="text-lg font-semibold">{campaign.stats.delivered}</p>
                          <p className="text-xs text-gray-400">
                            {((campaign.stats.delivered / campaign.stats.sent) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Opened</p>
                          <p className="text-lg font-semibold">{campaign.stats.opened}</p>
                          <p className="text-xs text-gray-400">
                            {((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Clicked</p>
                          <p className="text-lg font-semibold">{campaign.stats.clicked}</p>
                          <p className="text-xs text-gray-400">
                            {((campaign.stats.clicked / campaign.stats.sent) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Conversions</p>
                          <p className="text-lg font-semibold text-primary">{campaign.stats.conversions}</p>
                          <p className="text-xs text-gray-400">
                            {((campaign.stats.conversions / campaign.stats.sent) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}

                    {campaign.sentDate && (
                      <p className="text-xs text-gray-400 mt-2">
                        Sent on {campaign.sentDate.toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Automation */}
        <Card>
          <CardHeader>
            <CardTitle>Email Automation Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automationRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant={rule.active ? 'default' : 'outline'}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      <strong>Trigger:</strong> {rule.trigger} → <strong>Action:</strong> {rule.action}
                    </p>
                  </div>
                  <Switch
                    checked={rule.active}
                    onCheckedChange={() => toggleAutomation(rule.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Email Campaign</h3>
              <p className="text-sm text-gray-500">Send newsletters and promotional emails</p>
              <Button className="mt-4 w-full" variant="outline">
                Create Email Campaign
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">WhatsApp Broadcast</h3>
              <p className="text-sm text-gray-500">Reach customers via WhatsApp</p>
              <Button className="mt-4 w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">SMS Campaign</h3>
              <p className="text-sm text-gray-500">Send bulk SMS notifications</p>
              <Button className="mt-4 w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Create Campaign Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Design and schedule your marketing campaign
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Campaign Name *</Label>
                  <Input
                    placeholder="e.g., Summer Sale 2024"
                    value={newCampaign.name || ''}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Campaign Type *</Label>
                  <Select
                    value={newCampaign.type}
                    onValueChange={(value: any) => setNewCampaign({ ...newCampaign, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp" disabled>WhatsApp (Coming Soon)</SelectItem>
                      <SelectItem value="sms" disabled>SMS (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Target Audience *</Label>
                <Select
                  value={newCampaign.audience}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, audience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Customers">All Customers</SelectItem>
                    <SelectItem value="VIP Customers">VIP Customers</SelectItem>
                    <SelectItem value="High Value">High Value Customers</SelectItem>
                    <SelectItem value="New Customers">New Customers</SelectItem>
                    <SelectItem value="Inactive Customers">Inactive Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newCampaign.type === 'email' && (
                <div>
                  <Label>Email Subject *</Label>
                  <Input
                    placeholder="Enter email subject line"
                    value={newCampaign.subject || ''}
                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label>Message Content *</Label>
                <Textarea
                  placeholder="Write your campaign message..."
                  rows={6}
                  value={newCampaign.message || ''}
                  onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use personalization: {'{name}'}, {'{email}'}, {'{orderTotal}'}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a UI demonstration. Email sending functionality requires integration with services like SendGrid, Mailchimp, or AWS SES.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={createCampaign}>
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
