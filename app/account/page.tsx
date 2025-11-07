"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion, AnimatePresence } from "framer-motion"
import { User, Package, MapPin, Heart, Settings, LogOut, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

// Mock user data
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+91 98765 43210",
  joinDate: "January 2024"
}

const mockOrders = [
  {
    id: "ORD123456",
    date: "Dec 15, 2024",
    status: "Delivered",
    total: "₹45,999",
    items: 2,
    products: ["Royal Velvet Sofa", "Marble Coffee Table"]
  },
  {
    id: "ORD123455",
    date: "Nov 28, 2024",
    status: "In Transit",
    total: "₹32,500",
    items: 1,
    products: ["Scandinavian Dining Set"]
  },
  {
    id: "ORD123454",
    date: "Nov 10, 2024",
    status: "Delivered",
    total: "₹15,799",
    items: 3,
    products: ["Bookshelf", "Study Chair", "Desk Lamp"]
  }
]

const mockAddresses = [
  {
    id: 1,
    type: "Home",
    name: "John Doe",
    address: "123 MG Road, Bangalore, Karnataka 560001",
    phone: "+91 98765 43210",
    isDefault: true
  },
  {
    id: 2,
    type: "Office",
    name: "John Doe",
    address: "456 Cyber Park, Whitefield, Bangalore 560066",
    phone: "+91 98765 43210",
    isDefault: false
  }
]

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: ""
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login
    toast.success("Login successful!")
    setIsLoggedIn(true)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords don't match!")
      return
    }
    // Mock registration
    toast.success("Account created successfully!")
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    toast.success("Logged out successfully")
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {!isLoggedIn ? (
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
                      <Input
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
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
                    <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                      Sign In
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
                      <Input
                        id="name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                      Create Account
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
                  <p className="text-white/80">Welcome back, {mockUser.name}!</p>
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
                  {mockOrders.map((order) => (
                    <Card key={order.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{order.id}</h3>
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              order.status === "Delivered" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Ordered on {order.date}
                          </p>
                          <p className="text-sm">
                            {order.items} item{order.items > 1 ? "s" : ""}: {order.products.join(", ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold mb-2">{order.total}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">View Details</Button>
                            {order.status === "In Transit" && (
                              <Button size="sm" className="bg-[#D4AF37] hover:bg-[#B8941F]">
                                Track Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                {/* Addresses Tab */}
                <TabsContent value="addresses" className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Saved Addresses</h2>
                    <Button className="bg-[#D4AF37] hover:bg-[#B8941F]">
                      Add New Address
                    </Button>
                  </div>
                  {mockAddresses.map((address) => (
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
                          <p className="text-sm text-muted-foreground">{address.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Remove</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
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
                          <Input id="profile-name" defaultValue={mockUser.name} className="mt-2" />
                        </div>
                        <div>
                          <Label htmlFor="profile-email">Email</Label>
                          <Input id="profile-email" type="email" defaultValue={mockUser.email} className="mt-2" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="profile-phone">Phone Number</Label>
                        <Input id="profile-phone" type="tel" defaultValue={mockUser.phone} className="mt-2" />
                      </div>
                      <div className="pt-4 border-t">
                        <h3 className="font-bold mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" className="mt-2" />
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="new-password">New Password</Label>
                              <Input id="new-password" type="password" className="mt-2" />
                            </div>
                            <div>
                              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                              <Input id="confirm-new-password" type="password" className="mt-2" />
                            </div>
                          </div>
                        </div>
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
