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
      <SheetContent className="w-full sm:max-w-lg flex flex-col bg-[#FAF9F6]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4C430] flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[#1A2642]">Shopping Cart</div>
              {cart.length > 0 && (
                <div className="text-sm font-normal text-gray-500">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}</div>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#F5EFE7] to-[#E8DCC4] flex items-center justify-center mb-6">
              <ShoppingCart className="w-16 h-16 text-[#D4AF37]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A2642] mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some beautiful furniture pieces to get started!</p>
            <Link href="/products" onClick={() => setOpen(false)} className="w-full max-w-xs">
              <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] hover:from-[#B8941F] hover:to-[#D4AF37] text-white h-12 font-semibold">
                Browse Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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
                    className="flex gap-3 mb-3 p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-[#F5EFE7] to-[#E8DCC4] flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl opacity-40">🪑</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-sm mb-1 line-clamp-2 text-[#1A2642]">{item.name}</h4>
                        <p className="text-xs text-[#D4AF37] font-medium mb-2">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 border border-gray-200 rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-gray-500 line-through mb-1">
                          ₹{((item.price * 1.5) * item.quantity).toLocaleString('en-IN')}
                        </p>
                        <p className="font-bold text-[#D4AF37] text-lg">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        ₹{item.price.toLocaleString('en-IN')} each
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t pt-4 space-y-4 bg-white">
              <div className="bg-gradient-to-r from-[#F5EFE7] to-[#E8DCC4] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-semibold text-[#1A2642]">₹{getTotalPrice().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-300 my-2"></div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#1A2642]">Total:</span>
                  <span className="text-2xl font-bold text-[#D4AF37]">₹{getTotalPrice().toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">All taxes included</p>
              </div>

              <div className="space-y-2">
                <Link href="/checkout" onClick={() => setOpen(false)} className="block">
                  <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] hover:from-[#B8941F] hover:to-[#D4AF37] text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white" onClick={() => setOpen(false)}>
                  Continue Shopping
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span>🔒</span>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📦</span>
                  <span>Free Shipping</span>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
