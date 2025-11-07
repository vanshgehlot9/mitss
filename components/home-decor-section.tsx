"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const decorItems = [
  {
    title: "Mirrors",
    price: "From ₹989",
    image: "🪞",
    bgColor: "from-orange-100 to-orange-50"
  },
  {
    title: "Wall Paintings",
    price: "From ₹299",
    image: "🎨",
    bgColor: "from-blue-100 to-blue-50"
  },
  {
    title: "Serving Trays",
    price: "From ₹323",
    image: "🍽️",
    bgColor: "from-amber-100 to-amber-50"
  },
  {
    title: "Vases",
    price: "From ₹299",
    image: "🏺",
    bgColor: "from-purple-100 to-purple-50"
  },
  {
    title: "Sculptures",
    price: "From ₹899",
    image: "🗿",
    bgColor: "from-gray-100 to-gray-50"
  },
  {
    title: "Flowers",
    price: "From ₹449",
    image: "🌻",
    bgColor: "from-yellow-100 to-yellow-50"
  },
  {
    title: "Wall Clocks",
    price: "From ₹799",
    image: "🕐",
    bgColor: "from-rose-100 to-rose-50"
  },
  {
    title: "Decorative Plates",
    price: "From ₹599",
    image: "🎭",
    bgColor: "from-indigo-100 to-indigo-50"
  }
]

export default function HomeDecorSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#FAF9F6]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-2">
              Home <span className="text-[#D4AF37]">Decor</span>
            </h2>
            <p className="text-lg text-[#1A2642]/60">Because every detail matters</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/products">
              <Button 
                variant="outline" 
                className="group border-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white text-[#D4AF37]"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {decorItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Link href="/products">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className={`relative aspect-square bg-gradient-to-br ${item.bgColor} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                      <span className="text-7xl opacity-80">{item.image}</span>
                    </div>
                  </div>

                  <div className="p-5 text-center">
                    <h3 className="font-bold text-lg text-[#1A2642] mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#1A2642]/60 font-semibold">{item.price}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
