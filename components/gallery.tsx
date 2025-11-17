"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Instagram, Sparkles, Heart } from "lucide-react"
import Image from "next/image"

const galleryImages = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop",
]

export default function Gallery() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-[#FAF9F6] overflow-hidden" ref={ref}>
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-[#0D7377]/10 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-xl mb-6"
          >
            <Heart className="w-4 h-4 text-purple-600" />
            <span className="text-xs sm:text-sm font-semibold text-[#1A2642]">Customer Showcase</span>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Instagram className="w-8 h-8 sm:w-10 sm:h-10 text-gradient-to-r from-purple-600 to-pink-600" />
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-gradient">
                #MitssFurniture
              </span>
            </h2>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-[#1A2642]/70 max-w-3xl mx-auto leading-relaxed px-4">
            See how our customers are styling their homes with Mitss furniture and share your story with us
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative aspect-square overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
            >
              <Image
                src={image}
                alt={`Customer showcase ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A2642]/90 via-[#1A2642]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Instagram Hover Content */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="text-center text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Instagram className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-lg mb-1">View on Instagram</p>
                  <p className="text-sm text-white/80">Tap to see more</p>
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-center mt-16"
        >
          <a
            href="https://www.instagram.com/mitss.website/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] hover:bg-right-bottom text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Instagram className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">Follow Us on Instagram</span>
            <Sparkles className="w-5 h-5 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
          </a>
          
          <p className="mt-6 text-sm text-[#1A2642]/60">
            Tag us <span className="font-semibold text-purple-600">@mitss.website</span> to be featured
          </p>
        </motion.div>
      </div>
    </section>
  )
}
