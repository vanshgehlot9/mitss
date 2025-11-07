"use client"

import { motion } from "framer-motion"
import { Truck, Shield, Headphones, Award, Ruler, Palette } from "lucide-react"

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Free shipping on all orders over ₹25,000 across the country",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Shield,
    title: "5 Year Warranty",
    description: "Comprehensive warranty coverage on all our products",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer service for your convenience",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Handcrafted with finest materials and expert craftsmanship",
    color: "from-[#D4AF37] to-yellow-500"
  },
  {
    icon: Ruler,
    title: "Custom Sizing",
    description: "Tailored dimensions to perfectly fit your space",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Palette,
    title: "Design Consultation",
    description: "Free interior design advice from our experts",
    color: "from-indigo-500 to-purple-500"
  }
]

export default function ProductFeatures() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-[#D4AF37]">MITSS</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience unparalleled service and quality with every purchase
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 hover:shadow-xl transition-all duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-6`}>
                      <div className="w-full h-full bg-background rounded-xl flex items-center justify-center">
                        <Icon className="w-8 h-8 text-[#D4AF37]" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-[#D4AF37] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
