"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Shield, Lock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function PaymentPage() {
  const router = useRouter()
  const { user, userData } = useAuth()
  const { clearCart } = useCart()
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem("checkoutData")
    if (!data) {
      router.push("/checkout")
      return
    }
    
    const parsedData = JSON.parse(data)
    setCheckoutData(parsedData)
    
    // If not guest checkout and no user, redirect to login
    if (!parsedData.isGuest && !user) {
      toast.error("Please login to continue")
      router.push("/account?redirect=/payment")
      return
    }
  }, [router, user])

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (!checkoutData) return
    
    setProcessing(true)
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway')
        setProcessing(false)
        return
      }

      // Prepare order data
      const { formData, cart, pricing, isGuest } = checkoutData
      
      // Format phone number to 10 digits only (remove any +91, spaces, or special characters)
      const formatPhoneNumber = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '')
        return cleaned.length > 10 ? cleaned.slice(-10) : cleaned
      }

      // Validate phone number
      const phoneNumber = formatPhoneNumber(formData.phone)
      if (phoneNumber.length !== 10) {
        toast.error('Please enter a valid 10-digit phone number')
        setProcessing(false)
        return
      }

      // Create Razorpay order
      const orderPayload = {
        amount: pricing.total,
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: phoneNumber,
        },
        items: cart.map((item: any) => ({
          productId: String(item.id),
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          phone: phoneNumber,
          email: formData.email,
          addressLine1: formData.address,
          addressLine2: formData.apartment || '',
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          country: 'India',
        },
      }

      console.log('Creating Razorpay order with payload:', orderPayload)

      const razorpayResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      const razorpayData = await razorpayResponse.json()
      console.log('Razorpay API response:', razorpayData)

      if (!razorpayResponse.ok) {
        console.error('Razorpay order creation failed. Status:', razorpayResponse.status)
        console.error('Error details:', razorpayData)
        throw new Error(razorpayData.message || razorpayData.error || 'Failed to create payment order')
      }

      // Verify razorpay response has required fields
      if (!razorpayData.success || !razorpayData.razorpayOrderId) {
        console.error('Invalid Razorpay response structure:', razorpayData)
        throw new Error('Invalid payment gateway response')
      }

      console.log('Razorpay order created successfully:', razorpayData.razorpayOrderId)

      // Initialize Razorpay
      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'Mitss - Crafted Heritage',
        description: `Order for ${cart.length} item(s)`,
        order_id: razorpayData.razorpayOrderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formatPhoneNumber(formData.phone),
        },
        notes: {
          shipping_address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          customer_name: `${formData.firstName} ${formData.lastName}`,
        },
        theme: {
          color: '#D4AF37',
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error('Payment verification failed')
            }

            // Create order in database
            const orderPayload = {
              userId: isGuest ? null : user?.uid,
              userEmail: isGuest ? formData.email : user?.email,
              userName: isGuest ? `${formData.firstName} ${formData.lastName}` : (userData?.displayName || `${formData.firstName} ${formData.lastName}`),
              isGuestOrder: isGuest,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              items: cart.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                category: item.category
              })),
              shippingAddress: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                apartment: formData.apartment,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                landmark: formData.landmark
              },
              billingAddress: formData.sameAsShipping ? {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: formData.address,
                apartment: formData.apartment,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
              } : {
                address: formData.billingAddress,
                city: formData.billingCity,
                state: formData.billingState,
                pincode: formData.billingPincode
              },
              paymentMethod: 'razorpay',
              paymentStatus: 'paid',
              pricing: {
                subtotal: pricing?.subtotal || 0,
                shipping: pricing?.shipping || 0,
                gst: pricing?.gst || 0,
                total: pricing?.total || 0
              },
              customerInfo: {
                deliveryInstructions: formData?.deliveryInstructions || '',
                gstNumber: formData?.gstNumber || ''
              }
            }

            console.log('Creating order with payload:', orderPayload)
            
            // Use Realtime Database (Firestore is not working)
            const orderResponse = await fetch('/api/orders-rtdb', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderPayload)
            })

            const orderResult = await orderResponse.json()
            console.log('Order creation result:', orderResult)

            if (!orderResponse.ok) {
              console.error('Order creation failed:', orderResult)
              throw new Error(orderResult.error || orderResult.details || 'Failed to create order')
            }

            // Save order info
            localStorage.setItem("lastOrder", JSON.stringify({
              orderId: orderResult.orderId,
              orderNumber: orderResult.orderNumber,
              ...orderPayload,
              formData,
              cart,
              pricing,
              isGuest: isGuest,
              status: "paid",
              timestamp: new Date().toISOString()
            }))

            // Clear checkout data and cart
            localStorage.removeItem("checkoutData")
            clearCart()

            toast.success("Payment successful! Order placed.")
            router.push("/order-confirmation")
          } catch (error: any) {
            console.error('Order creation error:', error)
            toast.error(error.message || 'Order creation failed')
            setProcessing(false)
          }
        },
        modal: {
          ondismiss: function() {
            setProcessing(false)
            toast.error('Payment cancelled')
          }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
      
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || "Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (!checkoutData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const { formData, cart } = checkoutData
  
  // Recalculate pricing to ensure no GST is included (in case of cached old data)
  const subtotal = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
  const shipping = 0 // Free shipping on all orders
  const total = subtotal + shipping
  
  const pricing = {
    subtotal,
    shipping,
    total
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#D4AF37]/10 rounded-full mb-4 sm:mb-6">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A2642] mb-3 sm:mb-4">
              Secure Payment
            </h1>
            <p className="text-sm sm:text-base text-[#1A2642]/60">Your information is encrypted and secure</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Payment Information */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A2642] mb-4 sm:mb-6">Secure Payment</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* Payment Gateway Info */}
                  <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#F4C430]/10 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border-2 border-[#D4AF37]/20">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-[#1A2642] mb-1 sm:mb-2">Powered by Razorpay</h3>
                        <p className="text-[#1A2642]/70 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                          Complete your payment securely through Razorpay. All payment methods are supported:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Credit/Debit Cards</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>UPI</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Net Banking</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Wallets</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>EMI Options</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Cash on Delivery</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accepted Payment Methods */}
                  <div>
                    <p className="text-sm text-[#1A2642]/60 mb-3">We accept all major payment methods:</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-8" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-8" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-8" />
                      <span className="text-xs text-[#1A2642]/60 font-semibold px-3 py-1 bg-gray-100 rounded">Paytm</span>
                      <span className="text-xs text-[#1A2642]/60 font-semibold px-3 py-1 bg-gray-100 rounded">PhonePe</span>
                      <span className="text-xs text-[#1A2642]/60 font-semibold px-3 py-1 bg-gray-100 rounded">Google Pay</span>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-[#1A2642]/60 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="hidden sm:inline">SSL Encrypted</span>
                    <span className="sm:hidden">Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="hidden sm:inline">PCI DSS Compliant</span>
                    <span className="sm:hidden">Protected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
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
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-24"
              >
                <h3 className="font-bold text-base sm:text-lg text-[#1A2642] mb-3 sm:mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#1A2642]/70">Subtotal</span>
                    <span>₹{pricing.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1A2642]/70">Shipping</span>
                    <span className={(pricing.shipping || 0) === 0 ? "text-green-600 font-semibold" : ""}>
                      {(pricing.shipping || 0) === 0 ? 'FREE' : `₹${(pricing.shipping || 0).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#D4AF37]">
                      ₹{pricing.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-[#1A2642]/60 pt-1">All taxes included</p>
                </div>

                <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
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
                  className="w-full mt-4 sm:mt-6 bg-[#D4AF37] hover:bg-[#F4C430] text-white font-bold py-4 sm:py-6 text-sm sm:text-base"
                  size="lg"
                >
                  {processing ? "Processing..." : `Pay Now ₹${pricing.total.toLocaleString('en-IN')}`}
                </Button>

                <p className="text-xs text-center text-[#1A2642]/60 mt-3 sm:mt-4">
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
