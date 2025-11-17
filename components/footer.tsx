"use client"

import { motion } from "framer-motion"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Heart, ArrowUp } from "lucide-react"
import Image from "next/image"

const footerLinks = {
  shop: [
    { name: "Living Room", href: "/products?category=Living Room" },
    { name: "Bedroom", href: "/products?category=Bedroom" },
    { name: "Dining Room", href: "/products?category=Dining" },
    { name: "Handicrafts", href: "/products?category=Handicrafts" },
    { name: "Custom Furniture", href: "/custom-design" },
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Our Artisans", href: "#testimonials" },
    { name: "Custom Design", href: "/custom-design" },
  ],
  support: [
    { name: "Help Center", href: "/help-center" },
    { name: "Contact Us", href: "/contact" },
    { name: "Track Order", href: "/track-order" },
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Returns & Refunds", href: "/return-refund" },
    { name: "My Account", href: "/account" },
  ],
  legal: [
    { name: "Terms & Conditions", href: "/terms-conditions" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Return & Refund", href: "/return-refund" },
    { name: "Shipping Policy", href: "/shipping-policy" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/mitss.website/", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
]

export default function Footer() {
  return (
    <>
      <footer id="footer" className="relative bg-gradient-to-b from-[#1A2642] to-[#0F1829] text-[#FAF9F6] overflow-hidden">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(212, 175, 55, 0.1) 35px, rgba(212, 175, 55, 0.1) 70px)`
        }} />

        <div className="relative container mx-auto px-3 sm:px-4 py-10 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12 md:mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                <Image src="/mitsslogo.png" alt="Mitss Logo" width={60} height={60} className="w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15" />
                <div>
                  <div className="font-serif text-xl sm:text-2xl font-bold text-[#D4AF37]">Mitss</div>
                  <div className="text-xs sm:text-sm text-[#D4AF37]/70">Crafted Heritage, Modern Design</div>
                </div>
              </div>
              <p className="text-[#FAF9F6]/70 mb-4 sm:mb-5 md:mb-6 leading-relaxed text-xs sm:text-sm">
                For over 25 years, Mitss has been crafting premium solid wood furniture that transforms houses into homes.
              </p>
              <div className="flex gap-2 sm:gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <motion.a key={social.label} href={social.href} aria-label={social.label} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 sm:w-10 sm:h-10 bg-[#FAF9F6]/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-[#D4AF37] text-[#FAF9F6] transition-all duration-300 border border-[#FAF9F6]/20">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.a>
                  )
                })}
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div>
                <h3 className="font-semibold text-[#D4AF37] mb-3 sm:mb-4 text-base sm:text-lg">Shop</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {footerLinks.shop.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-[#FAF9F6]/70 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center group">
                        <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[#D4AF37] mb-4 text-lg">Company</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-[#FAF9F6]/70 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center group">
                        <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[#D4AF37] mb-4 text-lg">Support</h3>
                <ul className="space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-[#FAF9F6]/70 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center group">
                        <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[#D4AF37] mb-4 text-lg">Legal</h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-[#FAF9F6]/70 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center group">
                        <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-l-4 border-[#D4AF37] rounded-lg p-4 sm:p-5 md:p-6 mb-8 sm:mb-10 md:mb-12">
            <h3 className="font-semibold text-[#D4AF37] mb-3 sm:mb-4 text-base sm:text-lg">Get in Touch</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <a href="tel:+919950036077" className="flex items-center gap-3 text-[#FAF9F6]/80 hover:text-[#D4AF37] transition-colors group">
                <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center group-hover:bg-[#D4AF37]/30 transition-colors">
                  <Phone className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-xs text-[#FAF9F6]/50">Call Us</div>
                  <div className="text-sm font-medium">+91 99500 36077</div>
                </div>
              </a>
              <a href="mailto:info@mitss.store" className="flex items-center gap-3 text-[#FAF9F6]/80 hover:text-[#D4AF37] transition-colors group">
                <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center group-hover:bg-[#D4AF37]/30 transition-colors">
                  <Mail className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-xs text-[#FAF9F6]/50">Email Us</div>
                  <div className="text-sm font-medium">info@mitss.store</div>
                </div>
              </a>
              <div className="flex items-start gap-3 text-[#FAF9F6]/80">
                <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-xs text-[#FAF9F6]/50 mb-1">Visit Us</div>
                  <div className="text-sm">Modern Celluloid Industries, Siwanchi Gate Rd, Pratap Nagar, Jodhpur</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-[#FAF9F6]/10">
            <div>
              <p className="text-sm text-[#FAF9F6]/50 mb-3">Secure Payment Methods</p>
              <div className="flex gap-3">
                <div className="bg-white rounded-lg px-4 py-2 text-sm font-bold text-[#1A2642] shadow-md">VISA</div>
                <div className="bg-white rounded-lg px-4 py-2 text-sm font-bold text-[#1A2642] shadow-md">MasterCard</div>
                <div className="bg-white rounded-lg px-4 py-2 text-sm font-bold text-[#1A2642] shadow-md">UPI</div>
                <div className="bg-white rounded-lg px-4 py-2 text-sm font-bold text-[#1A2642] shadow-md">Paytm</div>
              </div>
            </div>
          </div>

                    <div className="pt-8 border-t border-[#FAF9F6]/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#FAF9F6]/50">
              <p className="flex items-center gap-2">
               © {new Date().getFullYear()}. All rights reserved.
              </p>
              <p className="flex items-center gap-2">
                Website by{" "}
                <a 
                  href="https://www.shivkaradigital.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:underline font-semibold"
                >
                  Shivkara Digital
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <motion.button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }} 
          className="w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#D4AF37]/50 transition-shadow text-[#1A2642] group" 
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>
    </>
  )
}
