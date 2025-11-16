"use client"

import { motion } from "framer-motion"
import { Clock, ArrowLeft, Bell, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { toast } from "sonner"
import { useState } from "react"

export default function ComingSoonPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Save email to localStorage
      const notifications = JSON.parse(localStorage.getItem('comingSoonNotifications') || '[]')
      if (!notifications.includes(email)) {
        notifications.push(email)
        localStorage.setItem('comingSoonNotifications', JSON.stringify(notifications))
      }

      toast.success("Thank you! We'll notify you when this section is available.")
      setEmail("")
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] mb-6">
                <Clock className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Coming Soon
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                We're working hard to bring you this collection!
              </p>
              <p className="text-lg text-muted-foreground">
                This section will be available soon with amazing furniture pieces crafted with care and precision.
              </p>
            </motion.div>

            {/* Current Available Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12 p-6 rounded-2xl bg-[#1A2642] border border-border"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#D4AF37]">
                Currently Available
              </h2>
              <p className="text-muted-foreground mb-6">
                While we prepare this section, explore our current collection:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-background/50">
                  <h3 className="font-semibold mb-2">🪑 Seating</h3>
                  <p className="text-sm text-muted-foreground">Chairs, Bar Stools & More</p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <h3 className="font-semibold mb-2">🏠 Living Room</h3>
                  <p className="text-sm text-muted-foreground">Tables & Accent Pieces</p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <h3 className="font-semibold mb-2">🍽️ Dining Room</h3>
                  <p className="text-sm text-muted-foreground">Dining Chairs & Sets</p>
                </div>
              </div>
            </motion.div>

            {/* Notify Me Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
                  <Bell className="w-5 h-5 text-[#D4AF37]" />
                  Get Notified When Available
                </h3>
                <form onSubmit={handleNotify} className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
                  >
                    {loading ? "..." : "Notify Me"}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Contact Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <h3 className="text-xl font-semibold mb-4">Need Something Specific?</h3>
              <p className="text-muted-foreground mb-6">
                We offer custom furniture design and can create pieces tailored to your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.open('https://wa.me/919950036077?text=Hi, I\'m interested in custom furniture', '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  WhatsApp Us
                </Button>
                <Link href="/contact">
                  <Button variant="outline">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Back to Products */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/products">
                <Button variant="ghost" className="group">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Browse Available Products
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
