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
    <section id="categories" className="py-24 bg-gradient-to-b from-[#FAF9F6] to-white relative overflow-hidden" ref={ref}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A2642]/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37]/10 to-[#F4C430]/10 border border-[#D4AF37]/20"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#1A2642] text-xs sm:text-sm font-medium">Explore Collections</span>
          </motion.div>
          
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1A2642] mb-4 sm:mb-6 leading-tight">
            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">Category</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#1A2642]/60 max-w-3xl mx-auto leading-relaxed px-4">
            Discover our curated collection of handcrafted wooden furniture for every room
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-[#FAF9F6]"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${category.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2642]/95 via-[#1A2642]/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Decorative gradient overlay */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-xl group-hover:w-32 group-hover:h-32 transition-all duration-500" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-[#D4AF37] drop-shadow-lg" />
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-1 group-hover:text-[#D4AF37] transition-colors duration-300">{category.name}</h3>
                  <p className="text-xs text-[#FAF9F6]/70 mb-3 leading-relaxed">{category.description}</p>
                  
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#D4AF37] to-[#F4C430] hover:from-[#F4C430] hover:to-[#D4AF37] text-[#1A2642] rounded-xl px-6 py-1.5 text-xs opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 font-semibold shadow-lg"
                  >
                    Explore →
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
