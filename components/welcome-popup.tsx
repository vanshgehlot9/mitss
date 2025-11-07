"use client"

import { useState, useEffect } from "react"
import { X, Phone } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user has already submitted their number
    const hasSubmitted = localStorage.getItem("mitss_phone_submitted")
    if (!hasSubmitted) {
      // Show popup after 1 second
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate phone number (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }

    setIsSubmitting(true)

    try {
      // Save to your API/database
      const response = await fetch("/api/save-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        // Mark as submitted in localStorage
        localStorage.setItem("mitss_phone_submitted", "true")
        setIsOpen(false)
      } else {
        setError("Something went wrong. Please try again.")
      }
    } catch (err) {
      // Even if API fails, save locally and close popup
      console.log("Phone number:", phoneNumber)
      localStorage.setItem("mitss_phone_submitted", "true")
      localStorage.setItem("mitss_phone_number", phoneNumber)
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem("mitss_phone_submitted", "true")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-4 bg-gradient-to-br from-[#FAF9F6] to-white border-2 border-[#D4AF37]/30 shadow-2xl rounded-3xl p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-[#1A2642] text-center font-serif">
            Welcome to Mitss! 🪵
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 py-4">
          <p className="text-center text-[#1A2642]/80 text-sm sm:text-base leading-relaxed">
            Get exclusive updates on our handcrafted furniture collections and special offers!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37]" />
              <Input
                type="tel"
                placeholder="Enter mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="pl-10 sm:pl-12 bg-white border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#1A2642] h-12 sm:h-14 rounded-xl text-sm sm:text-base"
                maxLength={10}
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs sm:text-sm text-center font-medium">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] hover:from-[#C09B2D] hover:to-[#D4AF37] text-[#1A2642] font-bold h-12 sm:h-14 rounded-xl text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? "Submitting..." : "Get Updates"}
            </Button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-[#1A2642]/60 hover:text-[#1A2642] text-xs sm:text-sm font-medium transition-colors"
            >
              Skip for now
            </button>
          </form>

          <p className="text-xs text-center text-[#1A2642]/50 leading-relaxed px-2">
            We respect your privacy. Your number will only be used for product updates.
          </p>
        </div>

        <button
          onClick={handleSkip}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full p-1 sm:p-1.5 bg-[#1A2642]/5 hover:bg-[#1A2642]/10 opacity-70 hover:opacity-100 transition-all duration-200"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-[#1A2642]" />
        </button>
      </DialogContent>
    </Dialog>
  )
}
