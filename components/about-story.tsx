"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { Award, Heart, Leaf, Users, ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image"

export default function AboutStory() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const stats = [
    { icon: Users, value: "50+", label: "Master Artisans", color: "from-[#D4AF37] to-[#F4C430]" },
    { icon: Award, value: "25", label: "Years Legacy", color: "from-[#0D7377] to-[#14FFEC]" },
    { icon: Heart, value: "10,000+", label: "Happy Homes", color: "from-[#D4AF37] to-[#F4C430]" },
    { icon: Leaf, value: "100%", label: "Eco-Friendly", color: "from-[#0D7377] to-[#14FFEC]" },
  ]

  const images = [
    "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565120130276-dfbd9a7a3ad7?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop"
  ]

  return (
    <section id="about" className="relative py-24 bg-gradient-to-br from-[#FAF9F6] via-[#F5F1E8] to-[#FAF9F6] overflow-hidden" ref={ref}>
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-[#0D7377]/10 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl group"
                >
                  <Image
                    src={images[0]}
                    alt="Woodworking craftsmanship"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2642]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group"
                >
                  <Image
                    src={images[1]}
                    alt="Furniture detail"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2642]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </div>
              
              <div className="space-y-6 mt-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group"
                >
                  <Image
                    src={images[2]}
                    alt="Wood texture"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2642]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl group"
                >
                  <Image
                    src={images[3]}
                    alt="Artisan at work"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2642]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl px-8 py-4 border-2 border-[#D4AF37]/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F4C430] flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#1A2642]">25+</div>
                  <div className="text-sm text-[#1A2642]/70">Years of Excellence</div>
                </div>
              </div>
            </motion.div>

            {/* Decorative Blobs */}
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-[#0D7377]/20 to-transparent rounded-full blur-3xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 backdrop-blur-xl">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs sm:text-sm font-semibold text-[#1A2642]">Our Story</span>
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8"
            >
              <span className="text-[#1A2642]">Our Story,</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#F4C430] to-[#D4AF37] animate-gradient">
                Your Comfort.
              </span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-6 text-[#1A2642]/80 leading-relaxed mb-10"
            >
              <p className="text-lg md:text-xl">
                For over 25 years, <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">Mitss</span> has been synonymous with authentic craftsmanship and timeless design. What began as a small workshop in the heart of India has grown into a legacy of trust, quality, and artistry.
              </p>
              <p className="text-base md:text-lg">
                Every piece that leaves our workshop carries the soul of our master artisans—craftsmen who have inherited their skills through generations. We source only the finest sustainably harvested solid wood, ensuring that each furniture piece isn&apos;t just beautiful, but also built to last a lifetime.
              </p>
              <p className="text-base md:text-lg">
                From the first sketch to the final polish, we pour passion into every detail. Our commitment to traditional techniques, combined with contemporary design sensibilities, creates furniture that feels at home in modern spaces while honoring our rich heritage.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="group text-center p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-[#1A2642]/5"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`font-bold text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r ${stat.color} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-[#1A2642]/70 font-medium">{stat.label}</div>
                  </motion.div>
                )
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-[#1A2642] to-[#0F1829] hover:from-[#0F1829] hover:to-[#1A2642] text-white px-10 py-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-[#D4AF37]/20"
              >
                <span className="relative z-10 flex items-center gap-2 text-lg font-semibold">
                  Know Our Craft
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
