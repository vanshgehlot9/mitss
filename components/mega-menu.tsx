"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { MegaMenuCategory } from "@/lib/navigation-data"
import { Badge } from "@/components/ui/badge"

interface MegaMenuProps {
  category: MegaMenuCategory
  isOpen: boolean
  onClose: () => void
}

export default function MegaMenu({ category, isOpen, onClose }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-[90] top-[80px]"
            onClick={onClose}
          />
          
          {/* Mega Menu */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 right-0 top-[80px] z-[100] max-h-[calc(100vh-80px)] overflow-y-auto mega-menu-scroll"
            onMouseLeave={onClose}
          >
            <div className="bg-white shadow-2xl border-t-4 border-[#D4AF37]">
              <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                  {category.sections.map((section, idx) => (
                    <div key={idx} className="space-y-3">
                      <h3 className="font-bold text-[#1A2642] text-sm uppercase tracking-wide border-b-2 border-[#D4AF37] pb-2">
                        {section.title}
                      </h3>
                      <ul className="space-y-2">
                        {section.items.map((item, itemIdx) => {
                          // Check if category has products by checking href
                          const hasProducts = item.href.includes("Dining") || 
                                            item.href.includes("Seating") || 
                                            item.href.includes("Living Room") ||
                                            item.href.includes("Chairs") ||
                                            item.href.includes("Tables")
                          
                          const finalHref = hasProducts ? item.href : "/coming-soon"
                          
                          return (
                            <li key={itemIdx}>
                              <Link
                                href={finalHref}
                                className="group flex items-center justify-between text-sm text-[#1A2642]/70 hover:text-[#D4AF37] transition-colors"
                                onClick={onClose}
                              >
                                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                  {item.name}
                                  {item.badge && (
                                    <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0">
                                      {item.badge}
                                    </Badge>
                                  )}
                                  {!hasProducts && (
                                    <Badge className="bg-gray-500 text-white text-[10px] px-1.5 py-0">
                                      Soon
                                    </Badge>
                                  )}
                                </span>
                                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
