#!/bin/bash

# Categories Component
cat > components/categories.tsx << 'EOF'
"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Sofa, Bed, UtensilsCrossed, Sparkles, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = [
  {
    name: "Living Room",
    icon: Sofa,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop",
    description: "Sofas, coffee tables, TV units & more"
  },
  {
    name: "Bedroom",
    icon: Bed,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
    description: "Beds, wardrobes, dressers & nightstands"
  },
  {
    name: "Dining",
    icon: UtensilsCrossed,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=800&auto=format&fit=crop",
    description: "Dining tables, chairs & cabinets"
  },
  {
    name: "Handicrafts & Decor",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
    description: "Wall art, sculptures & decorative pieces"
  },
  {
    name: "Custom Design",
    icon: Palette,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop",
    description: "Bespoke furniture tailored to your vision"
  },
]

export default function Categories() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="categories" className="py-20 bg-[#F8F5F2]" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#4A2C2A] mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-[#7A6E69] max-w-2xl mx-auto">
            Discover our curated collection of handcrafted wooden furniture for every room
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${category.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4A2C2A]/90 via-[#4A2C2A]/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-3">
                    <Icon className="w-8 h-8 text-[#EACDA3] mb-2" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm text-[#F8F5F2]/80 mb-4">{category.description}</p>
                  
                  <Button
                    size="sm"
                    className="bg-[#B72B2B] hover:bg-[#A02525] text-white rounded-full px-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                  >
                    Explore
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
EOF

# Theme Provider Component
cat > components/theme-provider.tsx << 'EOF'
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
EOF

echo "Components created successfully!"
