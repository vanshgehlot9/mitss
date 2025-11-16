"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, Search, Phone, Heart, ChevronDown, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CartDrawer from "@/components/cart-drawer"
import MegaMenu from "@/components/mega-menu"
import SearchEnhancedAutocomplete from "@/components/search/search-enhanced-autocomplete"
import { megaMenuData } from "@/lib/navigation-data"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"

const simpleLinks = [
  { name: "Home", href: "/" },
  { name: "Help Center", href: "/help-center" },
  { name: "Contact", href: "/contact" },
]

export default function Navigation() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
        isScrolled 
          ? "bg-[#1A2642]/95 backdrop-blur-xl shadow-lg py-3" 
          : "bg-[#1A2642]/90 backdrop-blur-md py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0 z-[70]" 
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <Image
                src="/mitsslogo.png"
                alt="Mitss Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="font-serif text-base sm:text-lg font-bold text-[#D4AF37]">Mitss</div>
              <div className="text-[8px] sm:text-[9px] text-[#FAF9F6]/50 tracking-wider uppercase -mt-1 hidden xs:block">Crafted Heritage</div>
            </div>
          </Link>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {/* Simple Links */}
            {simpleLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[#FAF9F6] hover:text-[#D4AF37] transition-colors duration-200 font-medium text-sm whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}

            {/* Mega Menu Links */}
            {megaMenuData.map((category) => (
              <div
                key={category.name}
                className="relative"
                onMouseEnter={() => setActiveMenu(category.name)}
              >
                <button
                  className="text-[#FAF9F6] hover:text-[#D4AF37] transition-colors duration-200 font-medium text-sm flex items-center gap-1 whitespace-nowrap"
                >
                  {category.name}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                
                <MegaMenu
                  category={category}
                  isOpen={activeMenu === category.name}
                  onClose={() => setActiveMenu(null)}
                />
              </div>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#FAF9F6] hover:text-[#D4AF37] hover:bg-transparent w-9 h-9 sm:w-10 sm:h-10"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Link href="/account">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-[#FAF9F6] hover:text-[#D4AF37] hover:bg-transparent hidden sm:flex"
                title="My Account"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-[#FAF9F6] hover:text-[#D4AF37] hover:bg-transparent hidden sm:flex"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </Link>
            {mounted && <CartDrawer />}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-[#FAF9F6] hover:text-[#D4AF37] w-9 h-9 sm:w-10 sm:h-10">
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#1A2642] text-[#FAF9F6] w-[85vw] sm:w-[380px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-3 mt-6 pb-6">
                  {/* Logo Header */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#FAF9F6]/20">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src="/mitsslogo.png"
                        alt="Mitss Logo"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div>
                      <div className="font-serif text-lg font-bold text-[#D4AF37]">Mitss</div>
                      <div className="text-[9px] text-[#FAF9F6]/50 tracking-wider uppercase -mt-1">Crafted Heritage</div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="space-y-2 mb-2">
                    {/* Mobile Search Button */}
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-[#FAF9F6]/20 bg-transparent hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37] text-[#FAF9F6] h-11"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setSearchOpen(true)
                      }}
                    >
                      <Search className="w-4 h-4" />
                      <span className="text-sm font-medium">Search Products</span>
                    </Button>

                    {/* Mobile Account Button */}
                    <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 border-[#FAF9F6]/20 bg-transparent hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37] text-[#FAF9F6] h-11"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">My Account</span>
                      </Button>
                    </Link>

                    {/* Mobile Wishlist Button */}
                    <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 border-[#FAF9F6]/20 bg-transparent hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37] text-[#FAF9F6] h-11"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">Wishlist</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1 mt-3">
                    <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-3 px-1">
                      Main Menu
                    </div>
                    {simpleLinks.map((link) => (
                      <Link 
                        key={link.name} 
                        href={link.href} 
                        className="flex items-center justify-between px-3 py-3 text-[#FAF9F6] hover:text-[#D4AF37] hover:bg-[#FAF9F6]/5 rounded-lg transition-all duration-200 group" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="font-medium">{link.name}</span>
                        <ChevronDown className="w-4 h-4 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>

                  {/* Product Categories */}
                  <div className="space-y-1 mt-4">
                    <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-3 px-1">
                      Shop by Category
                    </div>
                    {megaMenuData.map((category) => (
                      <Link 
                        key={category.name} 
                        href={category.href} 
                        className="flex items-center justify-between px-3 py-3 text-[#FAF9F6] hover:text-[#D4AF37] hover:bg-[#FAF9F6]/5 rounded-lg transition-all duration-200 group" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="font-medium">{category.name}</span>
                        <ChevronDown className="w-4 h-4 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <SearchEnhancedAutocomplete
              placeholder="Search for furniture..."
              onSearch={() => setSearchOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </motion.nav>
  )
}
