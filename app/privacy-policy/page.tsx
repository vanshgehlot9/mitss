"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { privacyPolicy } from "@/lib/legal-data/privacy-policy"
import { motion } from "framer-motion"
import { Shield, Lock, Eye, Cookie } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function PrivacyPolicyPage() {
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
              <Shield className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-4">
              Privacy Policy
            </h1>
            <p className="text-[#1A2642]/60 text-lg">
              Last updated: {privacyPolicy.lastUpdated}
            </p>
          </motion.div>

          {/* Security Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 rounded-xl p-6 text-center"
            >
              <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-blue-900 mb-2">SSL Encrypted</h3>
              <p className="text-sm text-blue-700">Your data is securely transmitted</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 rounded-xl p-6 text-center"
            >
              <Eye className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-green-900 mb-2">No Data Selling</h3>
              <p className="text-sm text-green-700">We never sell your information</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-50 rounded-xl p-6 text-center"
            >
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-purple-900 mb-2">PCI Compliant</h3>
              <p className="text-sm text-purple-700">Secure payment processing</p>
            </motion.div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {privacyPolicy.sections.map((section, index) => (
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

          {/* Cookie Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <Cookie className="w-8 h-8 text-orange-600" />
              <h3 className="text-2xl font-bold text-[#1A2642]">
                Cookie Types We Use
              </h3>
            </div>
            <div className="space-y-4">
              {privacyPolicy.cookieTypes.map((cookie, index) => (
                <div key={index} className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-[#1A2642]">{cookie.name}</h4>
                    <Badge variant={cookie.canDisable ? "secondary" : "default"}>
                      {cookie.canDisable ? "Optional" : "Required"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#1A2642]/70 mb-2">{cookie.description}</p>
                  <p className="text-xs text-[#1A2642]/50">
                    Examples: {cookie.examples.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center text-sm text-[#1A2642]/60"
          >
            <p>
              Privacy concerns? Contact us at{" "}
              <a href="mailto:privacy@mitss.in" className="text-[#D4AF37] hover:underline">
                privacy@mitss.in
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
