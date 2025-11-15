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
import { getStatesList, getDistrictsList, getPincode } from "@/lib/pincode-data"
import { Select } from "@/components/ui/select-native"

export default function CheckoutPage() {
  const { cart, getTotalPrice } = useCart()
  const { user, userData } = useAuth()
  const router = useRouter()
  const [isGuestCheckout, setIsGuestCheckout] = useState(false)

  // Helper function to get product ID (works with both _id and id)
  const getProductId = (product: any): string => {
    return product._id?.toString() || product.id?.toString() || ''
  }

  // Check if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      toast.error("Your cart is empty")
      router.push("/products")
    }
  }, [cart, router])
  
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
    district: "",
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

  // Load user data when available (only for logged in users)
  useEffect(() => {
    if (user && userData) {
      setIsGuestCheckout(false)
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
    } else {
      // Guest checkout
      setIsGuestCheckout(true)
    }
  }, [user, userData])

  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])

  const subtotal = getTotalPrice()
  const shipping = 0 // Free shipping on all orders
  const gst = 0 // GST is already included in product prices
  const total = subtotal + shipping

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = e.target.value
    setFormData({ 
      ...formData, 
      state: selectedState,
      district: '',
      pincode: ''
    })
    
    if (selectedState) {
      const districts = getDistrictsList(selectedState)
      setAvailableDistricts(districts)
    } else {
      setAvailableDistricts([])
    }
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrict = e.target.value
    const pincode = getPincode(formData.state, selectedDistrict)
    
    setFormData({
      ...formData,
      district: selectedDistrict,
      city: selectedDistrict, // Auto-fill city with district name
      pincode: pincode
    })
    
    if (pincode) {
      toast.success(`Pincode ${pincode} auto-filled for ${selectedDistrict}`)
    }
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

    // Calculate GST (18% of subtotal)
    const gst = Math.round((subtotal * 0.18) * 100) / 100

    // Save checkout data to localStorage (works for both guest and logged-in users)
    localStorage.setItem("checkoutData", JSON.stringify({
      formData,
      cart,
      pricing: { 
        subtotal, 
        shipping, 
        gst,
        total 
      },
      isGuest: isGuestCheckout,
      userId: user?.uid || null
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
            className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-8 text-center"
          >
            Checkout
          </motion.h1>

          {/* Guest Checkout Info Banner */}
          {isGuestCheckout && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-6 mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1A2642] mb-2">
                    Checking out as Guest
                  </h3>
                  <p className="text-sm text-[#1A2642]/70 mb-3">
                    You're checking out without an account. Create an account after purchase to track orders and enjoy faster checkout next time.
                  </p>
                  <Link href="/account?redirect=/checkout">
                    <Button variant="outline" size="sm" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white">
                      Login / Sign Up Instead
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

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
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleStateChange}
                        required
                      >
                        <option value="">Select State</option>
                        {getStatesList().map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="district">District *</Label>
                      <Select
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleDistrictChange}
                        disabled={!formData.state}
                        required
                      >
                        <option value="">Select District</option>
                        {availableDistricts.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City/Town *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
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
                        placeholder="Auto-filled based on district"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.pincode ? `Pincode for ${formData.district || 'selected district'}` : 'Select district to auto-fill'}
                      </p>
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
                    <div key={getProductId(item)} className="flex gap-4">
                      <div className="relative w-16 h-16 bg-[#FAF9F6] rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
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
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-[#1A2642]">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-[#1A2642]/60 text-right">All taxes included</p>
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
