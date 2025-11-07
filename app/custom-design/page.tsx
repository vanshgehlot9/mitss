"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Palette, Ruler, Calendar, Upload, CheckCircle2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export default function CustomDesignPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    category: "",
    dimensions: { length: "", width: "", height: "" },
    material: "",
    finish: "",
    color: "",
    budget: "",
    timeline: "",
    description: "",
    name: "",
    email: "",
    phone: "",
    address: ""
  })

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    toast.success("Design request submitted! Our team will contact you within 24 hours.")
    // Reset form or redirect
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A2642] via-[#D4AF37] to-[#1A2642] text-white py-20 pt-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Custom <span className="text-[#FFD700]">Design Portal</span>
            </h1>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto">
              Bring your vision to life! Design your perfect furniture piece with our expert craftsmen
            </p>
          </motion.div>
        </div>
      </div>

      {/* Steps Indicator */}
      <section className="py-8 bg-white dark:bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > s ? 'bg-[#D4AF37]' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-4 text-sm">
            <span className={step === 1 ? 'font-bold text-[#D4AF37]' : 'text-muted-foreground'}>Design</span>
            <span className={step === 2 ? 'font-bold text-[#D4AF37]' : 'text-muted-foreground'}>Specifications</span>
            <span className={step === 3 ? 'font-bold text-[#D4AF37]' : 'text-muted-foreground'}>Budget & Timeline</span>
            <span className={step === 4 ? 'font-bold text-[#D4AF37]' : 'text-muted-foreground'}>Contact Info</span>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-8">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Choose Furniture Category</h2>
                  <p className="text-muted-foreground">What would you like us to create?</p>
                </div>

                <RadioGroup value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Living Room', 'Bedroom', 'Dining', 'Office', 'Storage', 'Outdoor'].map((cat) => (
                      <label key={cat} className="cursor-pointer">
                        <div className={`border-2 rounded-xl p-6 text-center transition-all ${
                          formData.category === cat ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-200 hover:border-[#D4AF37]/50'
                        }`}>
                          <RadioGroupItem value={cat} className="sr-only" />
                          <div className="text-4xl mb-2">🪑</div>
                          <p className="font-semibold">{cat}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>

                <div>
                  <Label htmlFor="description">Describe Your Vision</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-2"
                    rows={4}
                    placeholder="Tell us about your dream furniture piece... style, features, inspiration, etc."
                  />
                </div>

                <div>
                  <Label>Upload Reference Images (Optional)</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                    <Button variant="outline" className="mt-4">Browse Files</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Specifications</h2>
                  <p className="text-muted-foreground">Provide dimensions and material preferences</p>
                </div>

                <div>
                  <Label>Dimensions (in inches)</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Input
                        placeholder="Length"
                        value={formData.dimensions.length}
                        onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, length: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Width"
                        value={formData.dimensions.width}
                        onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, width: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Height"
                        value={formData.dimensions.height}
                        onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, height: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Material Preference</Label>
                  <Select value={formData.material} onValueChange={(val) => setFormData({...formData, material: val})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teak">Teak Wood</SelectItem>
                      <SelectItem value="sheesham">Sheesham Wood</SelectItem>
                      <SelectItem value="mango">Mango Wood</SelectItem>
                      <SelectItem value="oak">Oak Wood</SelectItem>
                      <SelectItem value="walnut">Walnut</SelectItem>
                      <SelectItem value="pine">Pine Wood</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Finish Type</Label>
                  <Select value={formData.finish} onValueChange={(val) => setFormData({...formData, finish: val})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select finish" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="matte">Matte</SelectItem>
                      <SelectItem value="glossy">Glossy</SelectItem>
                      <SelectItem value="distressed">Distressed</SelectItem>
                      <SelectItem value="lacquered">Lacquered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Color Preference</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="e.g., Dark Walnut, Natural Wood, White, etc."
                    className="mt-2"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Budget & Timeline</h2>
                  <p className="text-muted-foreground">Help us understand your requirements</p>
                </div>

                <div>
                  <Label>Budget Range</Label>
                  <Select value={formData.budget} onValueChange={(val) => setFormData({...formData, budget: val})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-25k">Under ₹25,000</SelectItem>
                      <SelectItem value="25k-50k">₹25,000 - ₹50,000</SelectItem>
                      <SelectItem value="50k-1l">₹50,000 - ₹1,00,000</SelectItem>
                      <SelectItem value="1l-2l">₹1,00,000 - ₹2,00,000</SelectItem>
                      <SelectItem value="above-2l">Above ₹2,00,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Expected Timeline</Label>
                  <Select value={formData.timeline} onValueChange={(val) => setFormData({...formData, timeline: val})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="When do you need it?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent (1-2 weeks)</SelectItem>
                      <SelectItem value="1month">Within 1 month</SelectItem>
                      <SelectItem value="2months">1-2 months</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-[#D4AF37]/10 p-6 rounded-xl">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#D4AF37]" />
                    Free Consultation Included
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Our design experts will schedule a free consultation to discuss your project, 
                    provide professional recommendations, and create detailed 3D renderings.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
                  <p className="text-muted-foreground">We'll reach out to discuss your project</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="bg-green-50 dark:bg-green-950 p-6 rounded-xl border border-green-200">
                  <h3 className="font-bold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    What Happens Next?
                  </h3>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <li>✓ Our team reviews your design request within 24 hours</li>
                    <li>✓ We schedule a free consultation call to discuss details</li>
                    <li>✓ Receive detailed quote and 3D design mockups</li>
                    <li>✓ Upon approval, we start crafting your custom piece</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={step === 1}
              >
                Previous
              </Button>
              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Submit Request
                </Button>
              )}
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
