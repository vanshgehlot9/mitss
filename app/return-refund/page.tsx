"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { returnRefundPolicy } from "@/lib/legal-data/return-refund"
import { motion } from "framer-motion"
import { RotateCcw } from "lucide-react"

export default function ReturnRefundPage() {
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
              <RotateCcw className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-4">
              Return & Refund Policy
            </h1>
            <p className="text-[#1A2642]/60 text-lg">
              Last updated: {returnRefundPolicy.lastUpdated}
            </p>
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold text-lg">
                ⚠️ No Returnable Item - All Sales Are Final
              </p>
              <p className="text-red-700 text-sm mt-2">
                Exceptions apply only for damaged or defective products received during delivery
              </p>
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-8">
            {returnRefundPolicy.sections.map((section, index) => (
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

          {/* Warranty Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-[#D4AF37]/10 to-[#F4C430]/10 rounded-xl p-8 border border-[#D4AF37]/20"
          >
            <h3 className="text-2xl font-bold text-[#1A2642] mb-4">
              {returnRefundPolicy.warrantyInfo.title}
            </h3>
            <ul className="space-y-3">
              {returnRefundPolicy.warrantyInfo.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-3 text-[#1A2642]/70">
                  <span className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center text-sm text-[#1A2642]/60"
          >
            <p>
              Need help with returns? Contact us at{" "}
              <a href="mailto:returns@mitss.in" className="text-[#D4AF37] hover:underline">
                returns@mitss.in
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
