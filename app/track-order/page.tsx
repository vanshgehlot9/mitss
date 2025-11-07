"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Package, Truck, CheckCircle, MapPin, Phone, Clock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [trackingData, setTrackingData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock tracking data
    setTrackingData({
      orderNumber: orderNumber,
      orderDate: "25 Oct 2025",
      estimatedDelivery: "8 Nov 2025",
      status: "in_transit",
      currentLocation: "Mumbai Delivery Hub",
      deliveryPerson: {
        name: "Rajesh Kumar",
        phone: "+91 98765 43210"
      },
      timeline: [
        {
          status: "Order Placed",
          date: "25 Oct 2025, 10:30 AM",
          description: "Your order has been placed successfully",
          completed: true
        },
        {
          status: "Order Confirmed",
          date: "25 Oct 2025, 11:15 AM",
          description: "Your order has been confirmed and is being prepared",
          completed: true
        },
        {
          status: "Shipped",
          date: "27 Oct 2025, 9:00 AM",
          description: "Your order has been shipped from our warehouse",
          completed: true
        },
        {
          status: "In Transit",
          date: "2 Nov 2025, 2:30 PM",
          description: "Your order is on the way to delivery hub",
          completed: true,
          current: true
        },
        {
          status: "Out for Delivery",
          date: "Expected: 7 Nov 2025",
          description: "Your order will be out for delivery",
          completed: false
        },
        {
          status: "Delivered",
          date: "Expected: 8 Nov 2025",
          description: "Your order will be delivered",
          completed: false
        }
      ],
      items: [
        {
          name: "Royal Velvet Sofa",
          quantity: 1,
          image: "🛋️"
        },
        {
          name: "Coffee Table",
          quantity: 1,
          image: "🪑"
        }
      ]
    })

    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-[#1A2642] text-white py-20 pt-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Track Your <span className="text-[#D4AF37]">Order</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Enter your order details to see real-time tracking information
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tracking Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {!trackingData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-card p-8 rounded-2xl shadow-lg"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Enter Order Details</h2>
                <p className="text-muted-foreground">
                  Please enter your order number and phone number to track your order
                </p>
              </div>

              <form onSubmit={handleTrack} className="space-y-6">
                <div>
                  <Label htmlFor="orderNumber">Order Number *</Label>
                  <Input
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                    className="mt-2"
                    placeholder="e.g., ORD123456789"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can find this in your order confirmation email
                  </p>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="mt-2"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white h-12 text-lg"
                >
                  {isLoading ? (
                    "Searching..."
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Order Header */}
              <Card className="p-6 bg-gradient-to-r from-[#1A2642] to-[#2A3652] text-white">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Order #{trackingData.orderNumber}</h2>
                    <p className="text-gray-300">Placed on {trackingData.orderDate}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-600 text-white mb-2">
                      {trackingData.timeline.find((t: any) => t.current)?.status || "Processing"}
                    </Badge>
                    <p className="text-sm text-gray-300">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Est. Delivery: {trackingData.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Delivery Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Current Location</h3>
                      <p className="text-muted-foreground">{trackingData.currentLocation}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Delivery Person</h3>
                      <p className="font-semibold">{trackingData.deliveryPerson.name}</p>
                      <a 
                        href={`tel:${trackingData.deliveryPerson.phone}`}
                        className="text-[#D4AF37] text-sm hover:underline"
                      >
                        {trackingData.deliveryPerson.phone}
                      </a>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Timeline */}
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-8">Order Timeline</h3>
                <div className="relative">
                  {trackingData.timeline.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 mb-8 last:mb-0">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                          item.completed 
                            ? 'bg-green-600' 
                            : 'bg-gray-300 dark:bg-gray-700'
                        } ${item.current ? 'ring-4 ring-green-200' : ''}`}>
                          {item.completed ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <div className="w-3 h-3 bg-white rounded-full" />
                          )}
                        </div>
                        {index < trackingData.timeline.length - 1 && (
                          <div className={`w-0.5 h-16 ${
                            item.completed ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between">
                          <h4 className={`font-bold text-lg ${item.current ? 'text-[#D4AF37]' : ''}`}>
                            {item.status}
                          </h4>
                          {item.current && (
                            <Badge className="bg-[#D4AF37]">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{item.date}</p>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {trackingData.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-3xl">{item.image}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Track Another Order */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setTrackingData(null)}
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                >
                  Track Another Order
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
