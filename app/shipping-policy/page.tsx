"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { shippingPolicy } from "@/lib/legal-data/shipping-policy"
import { motion } from "framer-motion"
import { Truck, Package, MapPin, Clock } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ShippingPolicyPage() {
  const [pincode, setPincode] = useState("")
  const [checkingPincode, setCheckingPincode] = useState(false)

  const handlePincodeCheck = () => {
    setCheckingPincode(true)
    // Simulate API call
    setTimeout(() => {
      setCheckingPincode(false)
      alert(`Delivery available to pincode ${pincode}!\nEstimated delivery: 7-15 business days`)
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-full mb-6">
              <Truck className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-4">
              Shipping Policy
            </h1>
            <p className="text-[#1A2642]/60 text-lg">
              Last updated: {shippingPolicy.lastUpdated}
            </p>
          </motion.div>

          {/* Quick Info */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 rounded-xl p-4 text-center"
            >
              <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-blue-900">Pan India</p>
              <p className="text-xs text-blue-700">Delivery</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 rounded-xl p-4 text-center"
            >
              <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-green-900">Free Shipping</p>
              <p className="text-xs text-green-700">Above ₹25,000</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-50 rounded-xl p-4 text-center"
            >
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-purple-900">7-15 Days</p>
              <p className="text-xs text-purple-700">Metro Cities</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-orange-50 rounded-xl p-4 text-center"
            >
              <Package className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-orange-900">Insured</p>
              <p className="text-xs text-orange-700">All Shipments</p>
            </motion.div>
          </div>

          {/* Pincode Checker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-[#D4AF37]/10 to-[#F4C430]/10 rounded-xl p-8 border border-[#D4AF37]/20 mb-12"
          >
            <h3 className="text-2xl font-bold text-[#1A2642] mb-4">
              {shippingPolicy.pincodeServiceability.title}
            </h3>
            <p className="text-[#1A2642]/70 mb-4">
              {shippingPolicy.pincodeServiceability.description}
            </p>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter your pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="max-w-xs"
                maxLength={6}
              />
              <Button
                onClick={handlePincodeCheck}
                disabled={pincode.length !== 6 || checkingPincode}
                className="bg-[#D4AF37] hover:bg-[#F4C430]"
              >
                {checkingPincode ? "Checking..." : "Check"}
              </Button>
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-8">
            {shippingPolicy.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-[#1A2642] mb-4">
                  {section.title}
                </h2>
                <div className="text-[#1A2642]/70 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center text-sm text-[#1A2642]/60"
          >
            <p>
              Shipping questions? Contact us at{" "}
              <a href="mailto:shipping@mitss.in" className="text-[#D4AF37] hover:underline">
                shipping@mitss.in
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
