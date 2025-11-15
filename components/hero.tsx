"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative min-h-screen h-screen w-full overflow-hidden">
      {/* Background with video */}
      <div className="absolute inset-0 z-0">
        {/* Gradient background as base */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#1A2642] via-[#2A3652] to-[#1A2642]"
        />
        
        {/* Video overlay */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          onCanPlay={(e) => e.currentTarget.play()}
        >
          <source src="/Cinematic_Woodworking_Craftsmanship_Video_Generated.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Modern gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A2642]/70 via-[#1A2642]/40 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A2642]/60 via-transparent to-transparent z-10" />

      <div className="relative z-20 h-full flex items-center pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Modern badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.6, delay: 0.3 }} 
                className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#FAF9F6]/10 backdrop-blur-xl border border-[#D4AF37]/30"
              >
                <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
                <span className="text-[#FAF9F6] text-xs sm:text-sm font-medium tracking-wide">Handcrafted Since 1998</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.4 }} 
                className="font-serif text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#FAF9F6] mb-3 sm:mb-4 md:mb-6 leading-[1.15] sm:leading-[1.1] tracking-tight"
              >
                Crafted by Hands,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4C430] to-[#D4AF37] animate-gradient">
                  Designed for Homes
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.6 }} 
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#FAF9F6]/90 mb-6 sm:mb-8 md:mb-10 font-light leading-relaxed max-w-3xl"
              >
                Authentic wooden furniture & handicrafts by Mitss.
                <br className="hidden sm:block" />
                <span className="text-[#D4AF37] font-medium">100% Solid Wood. Zero Compromise.</span>
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.8 }} 
                className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12"
              >
                <Button 
                  size="lg" 
                  className="group relative bg-gradient-to-r from-[#D4AF37] to-[#F4C430] hover:from-[#F4C430] hover:to-[#D4AF37] text-[#1A2642] px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-[#D4AF37]/60 transition-all duration-500 font-semibold overflow-hidden w-full sm:w-auto"
                >
                  <span className="relative z-10">Explore Collection</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="group bg-[#FAF9F6]/5 backdrop-blur-sm border-2 border-[#FAF9F6]/30 text-[#FAF9F6] hover:bg-[#FAF9F6] hover:text-[#1A2642] hover:border-[#FAF9F6] px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl transition-all duration-500 font-semibold w-full sm:w-auto"
                >
                  Custom Order
                </Button>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl">
                <div className="flex items-center gap-2 bg-[#FAF9F6]/5 backdrop-blur-md px-3 sm:px-3 py-2.5 rounded-xl border border-[#FAF9F6]/10 hover:border-[#D4AF37]/50 transition-all duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span className="text-[#FAF9F6]/90 text-xs sm:text-sm font-medium">Free Delivery</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAF9F6]/5 backdrop-blur-md px-3 sm:px-3 py-2.5 rounded-xl border border-[#FAF9F6]/10 hover:border-[#D4AF37]/50 transition-all duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span className="text-[#FAF9F6]/90 text-xs sm:text-sm font-medium">10-Yr Warranty</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAF9F6]/5 backdrop-blur-md px-3 sm:px-3 py-2.5 rounded-xl border border-[#FAF9F6]/10 hover:border-[#D4AF37]/50 transition-all duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span className="text-[#FAF9F6]/90 text-xs sm:text-sm font-medium">Certified</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.5 }} className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="text-[#FAF9F6]/80 text-sm font-medium group-hover:text-[#D4AF37] transition-colors">Scroll to Explore</span>
          <div className="w-8 h-12 border-2 border-[#D4AF37] rounded-full p-2 group-hover:border-[#F4C430] transition-colors">
            <motion.div 
              animate={{ y: [0, 16, 0] }} 
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 bg-[#D4AF37] rounded-full mx-auto group-hover:bg-[#F4C430]"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
