"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Gift, Percent } from "lucide-react"
import { toast } from "sonner"

export default function ExitIntentPopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('exitPopupSeen')
    if (hasSeenPopup) return

    let mouseY = 0
    let timeoutId: NodeJS.Timeout
    let hasTriggered = false

    const handleMouseMove = (e: MouseEvent) => {
      mouseY = e.clientY

      // If mouse moves to top of screen (exit intent) - only trigger once
      if (mouseY < 10 && !hasTriggered) {
        hasTriggered = true
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setShowPopup(true)
          localStorage.setItem('exitPopupSeen', 'true')
        }, 500)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeoutId)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Save to localStorage or send to API
    const discountData = { email, phoneNumber, timestamp: new Date().toISOString() }
    localStorage.setItem('firstBuyerDiscount', JSON.stringify(discountData))
    
    toast.success("🎉 Congratulations! Your 15% discount code: FIRST15")
    setShowPopup(false)
  }

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">Special Discount Offer</DialogTitle>
        <div className="relative bg-gradient-to-br from-[#D4AF37] to-[#B8941F] text-white p-8 pb-6">
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-2">WAIT!</h2>
            <p className="text-xl mb-1">Don't Leave Empty Handed!</p>
          </div>
        </div>

        <div className="p-8 pt-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-6 py-3 rounded-full mb-4">
              <Percent className="w-5 h-5" />
              <span className="font-bold text-lg">Get 15% OFF</span>
            </div>
            <p className="text-muted-foreground">
              On your first purchase! Sign up now and start saving.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="h-12"
            />
            <Button
              type="submit"
              className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white h-12 text-lg font-semibold"
            >
              Claim My Discount
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            *Valid for first-time customers only. T&C apply.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
