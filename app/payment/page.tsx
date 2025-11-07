"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { CreditCard, Smartphone, Building2, Wallet, DollarSign, Shield, Lock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function PaymentPage() {
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem("checkoutData")
    if (!data) {
      router.push("/checkout")
      return
    }
    setCheckoutData(JSON.parse(data))
  }, [router])

  const handlePayment = async () => {
    setProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Save order details
    const orderData = {
      orderId: `MITSS${Date.now()}`,
      ...checkoutData,
      paymentMethod,
      status: "paid",
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem("lastOrder", JSON.stringify(orderData))
    localStorage.removeItem("checkoutData")
    localStorage.removeItem("cart") // Clear cart
    
    toast.success("Payment successful!")
    router.push("/order-confirmation")
  }

  if (!checkoutData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const { formData, pricing } = checkoutData

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-full mb-6">
              <Lock className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-4">
              Secure Payment
            </h1>
            <p className="text-[#1A2642]/60">Your information is encrypted and secure</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-[#1A2642] mb-6">Choose Payment Method</h2>
                
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  {/* Credit/Debit Card */}
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="w-6 h-6 text-[#D4AF37]" />
                        <span className="font-semibold">Credit / Debit Card</span>
                      </Label>
                      <div className="flex gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6" />
                      </div>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="space-y-4 mt-4 pt-4 border-t">
                        <div>
                          <Label>Card Number</Label>
                          <Input placeholder="1234 5678 9012 3456" maxLength={19} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Expiry Date</Label>
                            <Input placeholder="MM/YY" maxLength={5} />
                          </div>
                          <div>
                            <Label>CVV</Label>
                            <Input placeholder="123" maxLength={3} type="password" />
                          </div>
                        </div>
                        <div>
                          <Label>Cardholder Name</Label>
                          <Input placeholder="Name on card" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* UPI */}
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Smartphone className="w-6 h-6 text-[#D4AF37]" />
                        <span className="font-semibold">UPI</span>
                      </Label>
                      <div className="flex gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-6" />
                      </div>
                    </div>
                    {paymentMethod === 'upi' && (
                      <div className="mt-4 pt-4 border-t">
                        <Label>UPI ID</Label>
                        <Input placeholder="yourname@upi" />
                      </div>
                    )}
                  </div>

                  {/* Net Banking */}
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Label htmlFor="netbanking" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Building2 className="w-6 h-6 text-[#D4AF37]" />
                        <span className="font-semibold">Net Banking</span>
                      </Label>
                    </div>
                    {paymentMethod === 'netbanking' && (
                      <div className="mt-4 pt-4 border-t">
                        <Label>Select Bank</Label>
                        <select className="w-full px-3 py-2 border rounded-md">
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>SBI</option>
                          <option>Axis Bank</option>
                          <option>Kotak Bank</option>
                          <option>Other Banks</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Wallets */}
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Wallet className="w-6 h-6 text-[#D4AF37]" />
                        <span className="font-semibold">Wallets</span>
                      </Label>
                      <span className="text-xs text-[#1A2642]/60">Paytm, PhonePe, etc.</span>
                    </div>
                  </div>

                  {/* EMI */}
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'emi' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="emi" id="emi" />
                      <Label htmlFor="emi" className="flex items-center gap-3 cursor-pointer flex-1">
                        <DollarSign className="w-6 h-6 text-[#D4AF37]" />
                        <span className="font-semibold">EMI Options</span>
                      </Label>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        No Cost EMI
                      </span>
                    </div>
                    {paymentMethod === 'emi' && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <Label>Select EMI Tenure</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {[3, 6, 9, 12, 18, 24].map((months) => (
                            <button
                              key={months}
                              className="border-2 border-gray-200 rounded-lg p-3 hover:border-[#D4AF37] transition-all"
                            >
                              <div className="font-bold text-[#1A2642]">{months} Months</div>
                              <div className="text-sm text-[#1A2642]/60">
                                ₹{Math.round(pricing.total / months).toLocaleString('en-IN')}/mo
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* COD */}
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                        <DollarSign className="w-6 h-6 text-[#D4AF37]" />
                        <span className="font-semibold">Cash on Delivery</span>
                      </Label>
                      <span className="text-xs text-[#1A2642]/60">₹50 charges apply</span>
                    </div>
                    {paymentMethod === 'cod' && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-[#1A2642]/70">
                          Pay ₹{(pricing.total + 50).toLocaleString('en-IN')} (including ₹50 COD charges) in cash at the time of delivery
                        </p>
                      </div>
                    )}
                  </div>
                </RadioGroup>

                {/* Security Features */}
                <div className="mt-8 flex items-center justify-center gap-8 text-sm text-[#1A2642]/60">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-600" />
                    <span>PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>100% Secure</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24"
              >
                <h3 className="font-bold text-lg text-[#1A2642] mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#1A2642]/70">Subtotal</span>
                    <span>₹{pricing.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1A2642]/70">Shipping</span>
                    <span>{pricing.shipping === 0 ? 'FREE' : `₹${pricing.shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1A2642]/70">GST (18%)</span>
                    <span>₹{pricing.gst.toLocaleString('en-IN')}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between">
                      <span className="text-[#1A2642]/70">COD Charges</span>
                      <span>₹50</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#D4AF37]">
                      ₹{(pricing.total + (paymentMethod === 'cod' ? 50 : 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="text-xs text-[#1A2642]/60">
                    <p className="font-semibold mb-1">Delivery Address:</p>
                    <p>{formData.firstName} {formData.lastName}</p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full mt-6 bg-[#D4AF37] hover:bg-[#F4C430] text-white font-bold py-6"
                  size="lg"
                >
                  {processing ? "Processing..." : `Pay ₹${(pricing.total + (paymentMethod === 'cod' ? 50 : 0)).toLocaleString('en-IN')}`}
                </Button>

                <p className="text-xs text-center text-[#1A2642]/60 mt-4">
                  By completing this purchase you agree to our Terms & Conditions
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
