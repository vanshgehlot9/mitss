"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Gift, Heart, Users, Share2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function GiftRegistryPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 text-white py-20 pt-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Gift <span className="text-yellow-300">Registry</span>
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Create your dream furniture wishlist for weddings, housewarmings, or special occasions
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Easy to Create</h3>
              <p className="text-muted-foreground">Build your wishlist in minutes</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Share with Guests</h3>
              <p className="text-muted-foreground">Send via email or social media</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Group Gifting</h3>
              <p className="text-muted-foreground">Multiple people can contribute</p>
            </Card>
          </div>

          {/* Create Registry Form */}
          <div className="max-w-3xl mx-auto">
            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Create Your <span className="text-[#D4AF37]">Registry</span>
              </h2>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="occasion">Occasion *</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="housewarming">Housewarming</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="eventDate">Event Date *</Label>
                  <Input id="eventDate" type="date" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="message">Personal Message</Label>
                  <Textarea
                    id="message"
                    className="mt-2"
                    rows={4}
                    placeholder="Share your story or special message with gift givers..."
                  />
                </div>

                <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white h-12 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Registry
                </Button>
              </form>
            </Card>

            {/* Benefits */}
            <div className="mt-12 bg-gradient-to-r from-[#1A2642] to-[#2A3652] text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6 text-center">Registry Benefits</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Badge className="bg-[#D4AF37] mt-1">✓</Badge>
                  <div>
                    <h4 className="font-bold mb-1">No Duplicate Gifts</h4>
                    <p className="text-sm text-gray-300">Items are marked as purchased automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-[#D4AF37] mt-1">✓</Badge>
                  <div>
                    <h4 className="font-bold mb-1">Free Delivery</h4>
                    <p className="text-sm text-gray-300">On all registry purchases above ₹25,000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-[#D4AF37] mt-1">✓</Badge>
                  <div>
                    <h4 className="font-bold mb-1">Extended Returns</h4>
                    <p className="text-sm text-gray-300">90-day return policy for registry items</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-[#D4AF37] mt-1">✓</Badge>
                  <div>
                    <h4 className="font-bold mb-1">Completion Discount</h4>
                    <p className="text-sm text-gray-300">20% off remaining items after your event</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
