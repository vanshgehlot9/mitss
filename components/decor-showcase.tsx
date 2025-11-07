"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

const decorCategories = [
  {
    title: "Floor Lamps",
    image: "🏮",
    href: "/products?category=Living Room"
  },
  {
    title: "Hanging Lights",
    image: "💡",
    href: "/products?category=Living Room"
  },
  {
    title: "Home Temple",
    image: "🕉️",
    href: "/products?category=Handicrafts"
  },
  {
    title: "Serving Trays",
    image: "🍽️",
    href: "/products?category=Dining"
  },
  {
    title: "Wall Decor",
    image: "🖼️",
    href: "/products?category=Living Room"
  },
  {
    title: "Kitchen Racks",
    image: "🗄️",
    href: "/products?category=Dining"
  },
  {
    title: "Chopping Board",
    image: "🔪",
    href: "/products?category=Dining"
  },
  {
    title: "Artificial Plants",
    image: "🌿",
    href: "/products?category=Living Room"
  },
  {
    title: "Laptop Tables",
    image: "💻",
    href: "/products?category=Office"
  }
]

export default function DecorShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#FAF9F6] to-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A2642] mb-6 leading-tight">
              Beautify Every Corner with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">
                Elegance
              </span>
            </h2>
            <p className="text-lg text-[#1A2642]/70 mb-8 leading-relaxed">
              Explore timeless pieces for every nook and space
            </p>
            <div className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#F4C430] rounded-2xl px-8 py-4">
              <p className="text-2xl font-bold text-[#1A2642]">UPTO 60% OFF</p>
            </div>
          </motion.div>

          {/* Right Grid - Top Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {decorCategories.slice(0, 4).map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link href={category.href}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                    <div className="relative aspect-square bg-gradient-to-br from-[#F5EFE7] to-[#E8DCC4] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <span className="text-6xl">{category.image}</span>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-bold text-[#1A2642] group-hover:text-[#D4AF37] transition-colors">
                        {category.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {decorCategories.slice(4).map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Link href={category.href}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="relative aspect-square bg-gradient-to-br from-[#F5EFE7] to-[#E8DCC4] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <span className="text-6xl">{category.image}</span>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-sm text-[#1A2642] group-hover:text-[#D4AF37] transition-colors">
                      {category.title}
                    </h3>
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
