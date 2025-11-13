"use client"

import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { ShoppingBag, Truck, CreditCard, MapPin, User, Mail, Phone, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { toast } from "sonner"

export default function CheckoutPage() {
  const { cart, getTotalPrice } = useCart()
  const { user, userData } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue checkout")
      router.push("/account?redirect=/checkout")
    }
  }, [user, router])
  
  const [formData, setFormData] = useState({
    // Personal Info - prefill from user data
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    
    // Shipping Address
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    
    // Billing
    sameAsShipping: true,
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingPincode: "",
    
    // Additional
    deliveryInstructions: "",
    gstNumber: "",
  })

  // Load user data when available
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        firstName: userData.displayName?.split(' ')[0] || '',
        lastName: userData.displayName?.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
        phone: userData.phoneNumber || '',
      }))

      // Load default address if available
      const defaultAddress = userData.addresses?.find(addr => addr.isDefault)
      if (defaultAddress) {
        setFormData(prev => ({
          ...prev,
          address: defaultAddress.address,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
          phone: defaultAddress.phone,
        }))
      }
    }
  }, [userData])

  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 25000 ? 0 : 1500
  const gst = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + shipping + gst

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("Please enter your full name")
      return false
    }
    if (!formData.email || !formData.phone) {
      toast.error("Please enter your contact information")
      return false
    }
    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error("Please complete your shipping address")
      return false
    }
    if (formData.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode")
      return false
    }
    if (!agreedToTerms) {
      toast.error("Please agree to terms and conditions")
      return false
    }
    return true
  }

  const handleProceedToPayment = () => {
    if (!validateForm()) return

    // Save checkout data to localStorage
    localStorage.setItem("checkoutData", JSON.stringify({
      formData,
      cart,
      pricing: { subtotal, shipping, gst, total }
    }))

    // Navigate to payment page
    router.push("/payment")
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag className="w-20 h-20 text-[#1A2642]/20 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-[#1A2642] mb-4">Your cart is empty</h2>
            <p className="text-[#1A2642]/60 mb-8">Add some products to checkout</p>
            <Link href="/products">
              <Button className="bg-[#D4AF37] hover:bg-[#F4C430]">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-12 text-center"
          >
            Checkout
          </motion.h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-[#D4AF37]" />
                  <h2 className="text-2xl font-bold text-[#1A2642]">Personal Information</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-[#D4AF37]" />
                  <h2 className="text-2xl font-bold text-[#1A2642]">Shipping Address</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House no., Building name, Street"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="apartment">Apartment, Suite, etc. (Optional)</Label>
                    <Input
                      id="apartment"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="Nearby landmark for easy delivery"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                    <textarea
                      id="deliveryInstructions"
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={handleInputChange}
                      className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                      placeholder="Any specific instructions for delivery..."
                    />
                  </div>
                </div>
              </motion.div>

              {/* GST Details (Optional) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
              >
                <h3 className="text-xl font-bold text-[#1A2642] mb-4">GST Details (Optional)</h3>
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="Enter GST number for business purchase"
                  />
                  <p className="text-sm text-[#1A2642]/60 mt-2">
                    Provide GST number if you need a GST invoice
                  </p>
                </div>
              </motion.div>

              {/* Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3"
              >
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-[#1A2642]/70 cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms-conditions" className="text-[#D4AF37] hover:underline">
                    Terms & Conditions
                  </Link>
                  ,{" "}
                  <Link href="/privacy-policy" className="text-[#D4AF37] hover:underline">
                    Privacy Policy
                  </Link>
                  , and{" "}
                  <Link href="/return-refund" className="text-[#D4AF37] hover:underline">
                    Return Policy
                  </Link>
                </label>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 sticky top-24"
              >
                <h2 className="text-2xl font-bold text-[#1A2642] mb-6">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-[#FAF9F6] rounded-lg flex items-center justify-center text-2xl">
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-[#1A2642]">{item.name}</h4>
                        <p className="text-xs text-[#1A2642]/60">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-[#D4AF37]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-[#1A2642]/70">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#1A2642]/70">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#1A2642]/70">
                    <span>GST (18%)</span>
                    <span>₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-[#1A2642]">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    Add ₹{(25000 - subtotal).toLocaleString('en-IN')} more to get free shipping!
                  </div>
                )}

                <Button
                  onClick={handleProceedToPayment}
                  className="w-full mt-6 bg-[#D4AF37] hover:bg-[#F4C430] text-white font-bold py-6"
                  size="lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </Button>

                <p className="text-xs text-center text-[#1A2642]/60 mt-4">
                  Secure checkout powered by Razorpay
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
