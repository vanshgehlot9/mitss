"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Phone, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PhonePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [phone, setPhone] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    // Show popup after 2 seconds on first visit
    const hasSeenPopup = sessionStorage.getItem("hasSeenPhonePopup")
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 10) {
      setIsSubmitted(true)
      sessionStorage.setItem("hasSeenPhonePopup", "true")
      
      // Close popup after 2 seconds
      setTimeout(() => {
        setIsOpen(false)
      }, 2000)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem("hasSeenPhonePopup", "true")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-[#1A2642]" />
              </button>

              {!isSubmitted ? (
                <>
                  {/* Header with Gold Gradient */}
                  <div className="bg-gradient-to-br from-[#1A2642] via-[#2A3A5A] to-[#0D7377] p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0D7377] opacity-20 rounded-full blur-2xl" />
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="relative z-10"
                    >
                      <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Gift className="w-8 h-8 text-[#1A2642]" />
                      </div>
                      <h2 className="text-2xl font-serif font-bold text-white mb-2">
                        Welcome to Mitss!
                      </h2>
                      <p className="text-[#FAF9F6]/90 text-sm">
                        Get exclusive offers & personalized consultation
                      </p>
                    </motion.div>
                  </div>

                  {/* Form */}
                  <div className="p-8">
                    <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#0D7377]/10 rounded-lg p-4 mb-6">
                      <p className="text-[#1A2642] font-semibold text-center flex items-center justify-center gap-2">
                        <span className="text-2xl">🎁</span>
                        <span>Get 10% OFF on your first order!</span>
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1A2642] mb-2">
                          Enter your phone number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A5568]" />
                          <Input
                            type="tel"
                            placeholder="Enter 10-digit number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            required
                            maxLength={10}
                            className="pl-12 pr-4 py-6 text-lg border-2 border-[#E8E8E8] focus:border-[#D4AF37] rounded-xl"
                          />
                        </div>
                        <p className="text-xs text-[#4A5568] mt-2">
                          We&apos;ll send you exclusive deals & updates via WhatsApp
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C09B2D] hover:from-[#C09B2D] hover:to-[#D4AF37] text-[#1A2642] font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Get My 10% Discount
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <button
                        onClick={handleClose}
                        className="text-sm text-[#4A5568] hover:text-[#1A2642] underline"
                      >
                        No thanks, I&apos;ll browse first
                      </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t border-[#E8E8E8]">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl mb-1">🔒</div>
                          <div className="text-xs text-[#4A5568]">100% Secure</div>
                        </div>
                        <div>
                          <div className="text-2xl mb-1">✓</div>
                          <div className="text-xs text-[#4A5568]">No Spam</div>
                        </div>
                        <div>
                          <div className="text-2xl mb-1">🎁</div>
                          <div className="text-xs text-[#4A5568]">Exclusive Deals</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-[#1A2642] mb-2">
                      Thank You!
                    </h3>
                    <p className="text-[#4A5568] mb-4">
                      Your 10% discount code will be sent to your phone shortly.
                    </p>
                    <div className="bg-[#D4AF37]/10 rounded-lg p-4">
                      <p className="text-sm text-[#1A2642] font-semibold">
                        Use code: <span className="text-[#D4AF37] text-lg">WELCOME10</span>
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
