"use client"

import { motion } from "framer-motion"
import { Sofa, Bed, UtensilsCrossed, Palette, Sparkles, Armchair } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = [
  {
    icon: Sofa,
    name: "Living Room",
    description: "Sofas, coffee tables, and entertainment units",
    count: "120+ items",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Bed,
    name: "Bedroom",
    description: "Beds, wardrobes, and nightstands",
    count: "95+ items",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: UtensilsCrossed,
    name: "Dining",
    description: "Tables, chairs, and dining sets",
    count: "80+ items",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Armchair,
    name: "Office",
    description: "Desks, chairs, and storage solutions",
    count: "65+ items",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Palette,
    name: "Handicrafts",
    description: "Artisan decor and unique pieces",
    count: "150+ items",
    color: "from-[#D4AF37] to-yellow-500"
  },
  {
    icon: Sparkles,
    name: "Custom Design",
    description: "Bespoke furniture solutions",
    count: "Made to order",
    color: "from-indigo-500 to-purple-500"
  }
]

export default function ProductCategories() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Browse by <span className="text-[#D4AF37]">Category</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find exactly what you're looking for in our organized collections
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} p-0.5 mb-6`}>
                      <div className="w-full h-full bg-background rounded-xl flex items-center justify-center">
                        <Icon className="w-8 h-8 text-[#D4AF37]" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">{category.description}</p>
                    <p className="text-sm text-[#D4AF37] font-semibold mb-6">{category.count}</p>

                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-[#D4AF37] group-hover:text-white group-hover:border-[#D4AF37] transition-all"
                    >
                      Explore Collection
                    </Button>
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
