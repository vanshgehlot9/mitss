"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { termsAndConditions } from "@/lib/legal-data/terms-conditions"
import { motion } from "framer-motion"
import { FileText, Scale, AlertCircle } from "lucide-react"

export default function TermsConditionsPage() {
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
              <Scale className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-4">
              Terms & Conditions
            </h1>
            <p className="text-[#1A2642]/60 text-lg">
              Last updated: {termsAndConditions.lastUpdated}
            </p>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg mb-12"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Please Read Carefully</h3>
                <p className="text-amber-800 text-sm">
                  By using our website and placing an order, you agree to these terms and conditions.
                  If you do not agree, please do not use our services.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-8">
            {termsAndConditions.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-[#1A2642] mb-4 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-[#D4AF37]" />
                  {section.title}
                </h2>
                <div className="text-[#1A2642]/70 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center text-sm text-[#1A2642]/60"
          >
            <p>
              For any questions or clarifications regarding these terms, please contact us at{" "}
              <a href="mailto:support@mitss.in" className="text-[#D4AF37] hover:underline">
                support@mitss.in
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
