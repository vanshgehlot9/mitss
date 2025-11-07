"use client"

import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function VideoShowcase() {
  const [isPlaying, setIsPlaying] = useState(false)

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
            See Our <span className="text-[#D4AF37]">Craftsmanship</span> in Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch how we transform raw materials into masterpieces
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl aspect-video bg-gradient-to-br from-[#1A2642] via-[#2A3652] to-[#1A2642] group cursor-pointer">
            {/* Video placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPlaying(true)}
                >
                  <div className="w-24 h-24 rounded-full bg-[#D4AF37] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-[#D4AF37]/50 group-hover:shadow-[#D4AF37]/80 transition-all">
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </div>
                </motion.div>
                <p className="text-white text-lg font-semibold">Watch Our Story</p>
                <p className="text-gray-300 text-sm mt-2">2:30 minutes</p>
              </div>
            </div>

            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }} />
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2642]/80 via-transparent to-transparent" />
          </div>

          {/* Features below video */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { title: "Expert Artisans", desc: "Skilled craftsmen with decades of experience" },
              { title: "Premium Materials", desc: "Only the finest wood and materials" },
              { title: "Attention to Detail", desc: "Every piece meticulously crafted" }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="font-bold mb-2 text-[#D4AF37]">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
