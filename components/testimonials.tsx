"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Star, Quote, Sparkles, ThumbsUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Mumbai, Maharashtra",
    rating: 5,
    text: "Absolutely stunning craftsmanship! The teak dining set we ordered exceeded all expectations. The attention to detail is remarkable, and you can feel the quality in every joint and finish.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    product: "Royal Teak Dining Set"
  },
  {
    name: "Priya Sharma",
    location: "Delhi, NCR",
    rating: 5,
    text: "The custom wardrobe designed by Mitss perfectly fits our bedroom. The team understood our vision and delivered beyond expectations. Worth every rupee!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    product: "Custom Carved Wardrobe"
  },
  {
    name: "Amit Patel",
    location: "Ahmedabad, Gujarat",
    rating: 5,
    text: "I've purchased furniture from many places, but Mitss stands out. The solid wood quality, traditional craftsmanship, and modern designs are unmatched. Highly recommended!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    product: "Heritage Bedroom Set"
  },
  {
    name: "Sneha Reddy",
    location: "Bangalore, Karnataka",
    rating: 5,
    text: "The installation team was professional and careful. Our new sofa set has become the centerpiece of our living room. Guests always compliment the beautiful woodwork!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    product: "Luxury Sofa Set"
  },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-[#1A2642] via-[#1A2642] to-[#0F1829] overflow-hidden" ref={ref}>
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#D4AF37] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#0D7377] to-transparent rounded-full blur-3xl" />
      </div>

      {/* Animated Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.15) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 backdrop-blur-xl mb-6"
          >
            <ThumbsUp className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold text-[#FAF9F6]">Customer Reviews</span>
          </motion.div>
          
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6">
            <span className="text-[#FAF9F6]">What Our </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#F4C430] to-[#D4AF37] animate-gradient">
              Customers Say
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#FAF9F6]/70 max-w-3xl mx-auto leading-relaxed px-4">
            Hear from our valued customers about their experience
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-[#FAF9F6]/10 shadow-xl overflow-hidden"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#0D7377]/5 pointer-events-none" />
            
            {/* Quote Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute top-6 right-6"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#F4C430]/20 flex items-center justify-center">
                <Quote className="w-7 h-7 text-[#D4AF37]" />
              </div>
            </motion.div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
              <div className="flex-shrink-0">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#F4C430] rounded-full blur-lg opacity-50" />
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-[#D4AF37] shadow-xl">
                    <Image
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-[#D4AF37] to-[#F4C430] rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex justify-center md:justify-start gap-1 mb-6"
                >
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                    >
                      <Star className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-[#FAF9F6] text-xl md:text-2xl leading-relaxed mb-8 font-light"
                >
                  &quot;{testimonials[currentIndex].text}&quot;
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="mb-4"
                >
                  <h4 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-[#FAF9F6]/60 text-sm mt-1">
                    {testimonials[currentIndex].location}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="inline-block bg-gradient-to-r from-[#D4AF37]/20 to-[#F4C430]/20 px-6 py-3 rounded-full border border-[#D4AF37]/30"
                >
                  <p className="text-[#D4AF37] text-sm font-semibold">
                    Purchased: {testimonials[currentIndex].product}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center items-center gap-6 mt-12">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="bg-[#FAF9F6]/5 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#F4C430] hover:text-white hover:border-transparent rounded-full w-14 h-14 transition-all duration-300 backdrop-blur-xl"
            >
              <ChevronLeft className="w-7 h-7" />
            </Button>

            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all duration-500 ${
                    index === currentIndex
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#F4C430] w-12 h-4"
                      : "bg-[#FAF9F6]/20 hover:bg-[#FAF9F6]/40 w-4 h-4"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="bg-[#FAF9F6]/5 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#F4C430] hover:text-white hover:border-transparent rounded-full w-14 h-14 transition-all duration-300 backdrop-blur-xl"
            >
              <ChevronRight className="w-7 h-7" />
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-center mt-20"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-8 bg-[#FAF9F6]/5 backdrop-blur-xl rounded-3xl px-12 py-8 border border-[#FAF9F6]/10">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" />
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">
                  4.9/5
                </div>
              </div>
              <div className="text-sm text-[#FAF9F6]/60 font-medium">Average Rating</div>
            </motion.div>
            
            <div className="w-px h-16 bg-[#FAF9F6]/20" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-[#D4AF37]" />
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">
                  2,500+
                </div>
              </div>
              <div className="text-sm text-[#FAF9F6]/60 font-medium">Happy Customers</div>
            </motion.div>
            
            <div className="w-px h-16 bg-[#FAF9F6]/20" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <ThumbsUp className="w-6 h-6 text-[#D4AF37]" />
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">
                  98%
                </div>
              </div>
              <div className="text-sm text-[#FAF9F6]/60 font-medium">Satisfaction Rate</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
