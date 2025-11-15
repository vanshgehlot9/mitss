"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { CheckCircle, Package, Truck, Home, Download, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import confetti from "canvas-confetti"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    const data = localStorage.getItem("lastOrder")
    if (!data) {
      router.push("/")
      return
    }
    setOrderData(JSON.parse(data))

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [router])

  if (!orderData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const { orderId, formData, cart, pricing } = orderData

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle className="w-16 h-16 text-green-600" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-4">
              Order Confirmed!
            </h1>
            <p className="text-xl text-[#1A2642]/70 mb-2">
              Thank you for your purchase, {formData.firstName}!
            </p>
            <p className="text-[#1A2642]/60">
              Order ID: <span className="font-mono font-bold text-[#D4AF37]">{orderId}</span>
            </p>
          </motion.div>

          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8"
          >
            <h2 className="text-2xl font-bold text-[#1A2642] mb-6">What's Next?</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A2642]">Order Confirmed</h3>
                  <p className="text-sm text-[#1A2642]/60">Your order has been received and is being processed</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A2642]">Preparing Your Order</h3>
                  <p className="text-sm text-[#1A2642]/60">We'll pack your items with care (1-2 business days)</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A2642]">On the Way</h3>
                  <p className="text-sm text-[#1A2642]/60">Your order will be shipped soon (7-15 days estimated)</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A2642]">Delivered to You</h3>
                  <p className="text-sm text-[#1A2642]/60">Enjoy your new furniture!</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8"
          >
            <h2 className="text-2xl font-bold text-[#1A2642] mb-6">Order Details</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map((item: any, index: number) => (
                <div key={`${item.id}-${index}`} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-20 h-20 bg-[#FAF9F6] rounded-lg flex items-center justify-center text-3xl">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1A2642]">{item.name}</h4>
                    <p className="text-sm text-[#1A2642]/60">Quantity: {item.quantity}</p>
                    <p className="text-sm text-[#1A2642]/60">Category: {item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#D4AF37]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-[#1A2642]/70">
                <span>Subtotal</span>
                <span>₹{pricing.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#1A2642]/70">
                <span>Shipping</span>
                <span>{pricing?.shipping === 0 ? 'FREE' : `₹${(pricing?.shipping || 0).toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between text-[#1A2642]/70">
                <span>GST (18%)</span>
                <span>₹{(pricing?.gst || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-[#1A2642] pt-2 border-t">
                <span>Total Paid</span>
                <span className="text-[#D4AF37]">₹{(pricing?.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </motion.div>

          {/* Delivery Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8"
          >
            <h2 className="text-2xl font-bold text-[#1A2642] mb-4">Delivery Address</h2>
            <div className="text-[#1A2642]/70">
              <p className="font-semibold text-[#1A2642]">{formData.firstName} {formData.lastName}</p>
              <p>{formData.address}</p>
              {formData.apartment && <p>{formData.apartment}</p>}
              <p>{formData.city}, {formData.state} - {formData.pincode}</p>
              {formData.landmark && <p>Landmark: {formData.landmark}</p>}
              <p className="mt-2">
                <Mail className="w-4 h-4 inline mr-2" />
                {formData.email}
              </p>
              <p>
                <Phone className="w-4 h-4 inline mr-2" />
                {formData.phone}
              </p>
            </div>
          </motion.div>

          {/* Confirmation Email Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8"
          >
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Confirmation Email Sent</h3>
                <p className="text-blue-800 text-sm">
                  We've sent a confirmation email to <strong>{formData.email}</strong> with your order details and tracking information.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Guest User Notice */}
          {orderData.isGuest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-[#D4AF37]/10 border-l-4 border-[#D4AF37] p-6 rounded-r-lg mb-8"
            >
              <div className="flex items-start gap-3">
                <Package className="w-6 h-6 text-[#D4AF37] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-[#1A2642] mb-2">Track Your Order</h3>
                  <p className="text-[#1A2642]/70 text-sm mb-3">
                    Save your Order ID: <span className="font-mono font-bold text-[#D4AF37]">{orderId}</span> to track your order status.
                  </p>
                  <Link href="/track-order">
                    <Button size="sm" variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white">
                      Track Order Status
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
            
            <Link href="/products">
              <Button className="bg-[#D4AF37] hover:bg-[#F4C430] w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>

          {/* Customer Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center text-sm text-[#1A2642]/60"
          >
            <p className="mb-2">Need help with your order?</p>
            <p>
              Contact us at{" "}
              <a href="mailto:support@mitss.in" className="text-[#D4AF37] hover:underline">
                support@mitss.in
              </a>
              {" "}or call{" "}
              <a href="tel:+919314444747" className="text-[#D4AF37] hover:underline">
                +91-9314444747
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
