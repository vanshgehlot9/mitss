"use client"

import { motion } from "framer-motion"
import { MessageCircle, Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  description: string
  category: string
  price: number
  image: string
  rating?: number
  reviews?: number
  isExclusive?: boolean
  exclusivePrice?: string
  badge?: string
}

interface ProductsGridProps {
  products?: Product[]
}

export default function ProductsGrid({ products = [] }: ProductsGridProps) {
  const { addToCart } = useCart()

    const handleWhatsAppClick = (product: Product) => {
    const message = `Hi, I'm interested in the ${product.name}. Can you provide more details?`
    window.open(`https://wa.me/919950036077?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    })
    toast.success(`${product.name} added to cart!`)
  }

  if (products.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-[#1A2642] mb-4">No Products Available</h3>
            <p className="text-gray-600">Products will be displayed here once added to the catalog.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Our <span className="text-[#D4AF37]">Products</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Handcrafted wooden furniture pieces for your dream home
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#FAF9F6] to-[#F5F5DC]">
                <div className="absolute top-3 right-3 z-10">
                  <Badge className={`${product.isExclusive ? 'bg-[#D4AF37]' : 'bg-[#1A2642]'} text-white border-0 shadow-lg px-3 py-1 text-xs font-semibold`}>
                    {product.isExclusive ? 'Exclusive Product' : product.badge || 'Available'}
                  </Badge>
                </div>

                <Link href={`/products/${product.id}`}>
                  <div className="relative w-full h-full cursor-pointer">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-30">🪑</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-[#D4AF37] font-semibold mb-1 uppercase tracking-wide">
                  {product.category}
                </p>
                
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-bold text-[#1A2642] mb-2 hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                  {product.description}
                </p>

                {product.rating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating!)
                              ? "fill-[#D4AF37] text-[#D4AF37]"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {product.reviews && (
                      <span className="text-xs text-gray-500">
                        ({product.reviews})
                      </span>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  {product.isExclusive && product.exclusivePrice ? (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-1">
                        {product.exclusivePrice}
                      </span>
                      <span className="text-xs text-[#D4AF37]">
                        Custom pricing available
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-[#D4AF37]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {product.isExclusive ? (
                  <Button
                    onClick={() => handleWhatsAppClick(product)}
                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white group/btn transition-all duration-300"
                  >
                    <MessageCircle className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                    Contact on WhatsApp
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white group/btn transition-all duration-300"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                    Buy Now
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
