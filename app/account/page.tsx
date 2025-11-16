"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion, AnimatePresence } from "framer-motion"
import { User, Package, MapPin, Heart, Settings, LogOut, Eye, EyeOff, Mail, Phone, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import Image from "next/image"

function AccountContent() {
  const { user, userData, login, register, logout, loginWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: ""
  })

  // Fetch user orders when logged in
  useEffect(() => {
    if (user) {
      fetchOrders()
      // Redirect if there was a redirect URL
      if (redirectUrl) {
        setTimeout(() => {
          router.push(redirectUrl)
        }, 1000)
      }
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user) return
    
    setLoadingOrders(true)
    try {
      const response = await fetch(`/api/orders?userId=${user.uid}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const downloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/invoice?orderId=${orderId}&format=pdf`)
      
      if (!response.ok) {
        toast.error('Failed to download invoice')
        return
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Invoice downloaded successfully')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error('Error downloading invoice')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await login(loginData.email, loginData.password)
    } catch (error) {
      // Error handling is done in auth context
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords don't match!")
      return
    }
    
    if (registerData.password.length < 6) {
      toast.error("Password should be at least 6 characters")
      return
    }
    
    setLoading(true)
    try {
      await register(registerData.email, registerData.password, registerData.name, registerData.phone)
    } catch (error) {
      // Error handling is done in auth context
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (error) {
      // Error handling is done in auth context
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setOrders([])
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {!user ? (
        // Login/Register Screen
        <div className="min-h-screen flex items-center justify-center py-32 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  {authMode === "login" ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-muted-foreground">
                  {authMode === "login" 
                    ? "Sign in to access your account" 
                    : "Join Mitss family today"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {authMode === "login" ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleLogin}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                          className="pl-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleRegister}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative mt-2">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reg-email">Email</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-email"
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          type="password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-sm text-[#D4AF37] hover:underline"
                >
                  {authMode === "login" 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </Card>
          </motion.div>
        </div>
      ) : (
        // Dashboard Screen
        <>
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white py-16 pt-32">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">My Account</h1>
                  <p className="text-white/80">Welcome back, {userData?.displayName || user.email}!</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#D4AF37]"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          <section className="py-12">
            <div className="container mx-auto px-4">
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="orders">
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="addresses">
                    <MapPin className="w-4 h-4 mr-2" />
                    Addresses
                  </TabsTrigger>
                  <TabsTrigger value="wishlist">
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Order History</h2>
                  {loadingOrders ? (
                    <Card className="p-12 text-center">
                      <p>Loading orders...</p>
                    </Card>
                  ) : orders.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                      <Button className="bg-[#D4AF37] hover:bg-[#B8941F]">
                        Browse Products
                      </Button>
                    </Card>
                  ) : (
                    orders.map((order: any) => (
                      <Card key={order.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                              <span className={`text-xs px-3 py-1 rounded-full ${
                                order.status === "delivered" 
                                  ? "bg-green-100 text-green-700" 
                                  : order.status === "shipped"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Ordered on {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm">
                              {order.items.length} item{order.items.length > 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold mb-2">₹{order.pricing.total.toLocaleString()}</p>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/track-order?id=${order.id}`)}
                              >
                                View Details
                              </Button>
                              {order.paymentStatus === "captured" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => downloadInvoice(order.id)}
                                  className="flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                  Invoice
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Addresses Tab */}
                <TabsContent value="addresses" className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Saved Addresses</h2>
                    <Button className="bg-[#D4AF37] hover:bg-[#B8941F]">
                      Add New Address
                    </Button>
                  </div>
                  {!userData?.addresses || userData.addresses.length === 0 ? (
                    <Card className="p-12 text-center">
                      <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No addresses saved</h3>
                      <p className="text-muted-foreground">Add an address for faster checkout</p>
                    </Card>
                  ) : (
                    userData.addresses.map((address: any) => (
                      <Card key={address.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold">{address.type}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="font-medium mb-1">{address.name}</p>
                            <p className="text-sm text-muted-foreground mb-1">{address.address}</p>
                            <p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.pincode}</p>
                            <p className="text-sm text-muted-foreground">{address.phone}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">Remove</Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Wishlist Tab */}
                <TabsContent value="wishlist">
                  <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                  <Card className="p-12 text-center">
                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground mb-6">
                      Save your favorite items for later
                    </p>
                    <Button className="bg-[#D4AF37] hover:bg-[#B8941F]">
                      Browse Products
                    </Button>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                  <Card className="p-6">
                    <form className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="profile-name">Full Name</Label>
                          <Input 
                            id="profile-name" 
                            defaultValue={userData?.displayName || ''} 
                            className="mt-2" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="profile-email">Email</Label>
                          <Input 
                            id="profile-email" 
                            type="email" 
                            defaultValue={userData?.email || ''} 
                            className="mt-2" 
                            disabled
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="profile-phone">Phone Number</Label>
                        <Input 
                          id="profile-phone" 
                          type="tel" 
                          defaultValue={userData?.phoneNumber || ''} 
                          className="mt-2" 
                        />
                      </div>
                      <Button className="bg-[#D4AF37] hover:bg-[#B8941F]">
                        Save Changes
                      </Button>
                    </form>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-32 text-center">
          <p>Loading...</p>
        </div>
        <Footer />
      </main>
    }>
      <AccountContent />
    </Suspense>
  )
}
