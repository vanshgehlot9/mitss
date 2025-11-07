"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"
import Image from "next/image"

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-[#FAF9F6] hover:text-[#D4AF37] hover:bg-[#FAF9F6]/5 rounded-xl transition-all duration-300 relative"
        >
          <ShoppingCart className="w-5 h-5" />
          {getTotalItems() > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-[#1A2642] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
            >
              {getTotalItems()}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#D4AF37]" />
            Shopping Cart
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6">
              <ShoppingCart className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add some beautiful furniture to get started!</p>
            <Button onClick={() => setOpen(false)} className="bg-[#D4AF37] hover:bg-[#B8941F]">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-6">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4 mb-4 p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-[#1A2642] to-[#2A3652] flex-shrink-0">
                      <span className="text-4xl absolute inset-0 flex items-center justify-center">
                        🪑
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-[#D4AF37]">₹{item.price.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-2xl text-[#D4AF37]">₹{getTotalPrice().toLocaleString('en-IN')}</span>
              </div>

              <div className="space-y-2">
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white h-12 text-lg">
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
                  Continue Shopping
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                🔒 Secure checkout powered by{" "}
                <a href="https://www.shivkaradigital.com" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline">
                  Shivkara Digital
                </a>
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
