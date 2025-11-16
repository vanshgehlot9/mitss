"use client"

import { motion } from "framer-motion"
import { Star, TrendingDown, ShoppingCart, MessageCircle, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"

const stories = [
  {
    id: 1,
    title: "Allycia Premium Solid Wood Shoe Rack With 10 Cushioned Seats (Mango Wood...)",
    image: "👨‍🔧",
    discount: "41%",
    price: "₹16,989",
    originalPrice: "₹28,999",
    rating: 4.5,
    reviews: 19,
    description: "Handcrafted by skilled artisans"
  },
  {
    id: 2,
    title: "Avelis Premium Outdoor Chair with Rattan-Style Weave & PP Durability...",
    image: "🪑",
    discount: "24%",
    price: "₹4,589",
    originalPrice: "₹5,999",
    rating: 4.3,
    reviews: 71,
    description: "Sustainable outdoor furniture"
  },
  {
    id: 3,
    title: "Hamona Premium Ash Wood TV Unit With Drawers And Cabinets (Ash Wood, Walnu...",
    image: "📺",
    discount: "32%",
    price: "₹44,989",
    originalPrice: "₹66,982",
    rating: 4.0,
    reviews: 13,
    description: "Modern meets traditional design"
  },
  {
    id: 4,
    title: "Lorenz 3 Seater Sofa (Velvet, Dark Olive Green)",
    image: "🛋️",
    discount: "40%",
    price: "₹44,989",
    originalPrice: "₹74,682",
    rating: 4.5,
    reviews: 162,
    description: "Luxurious comfort redefined"
  },
  {
    id: 5,
    title: "Clouda Modern L Shaped Sofa Boucle Fabric (White)",
    image: "🛋️",
    discount: "27%",
    price: "₹6,689",
    originalPrice: "₹9,199",
    rating: 5.0,
    reviews: 20,
    description: "Contemporary elegance"
  }
]

export default function CraftStories() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { addToCart } = useCart()

  // Video mapping for specific products (only for craft stories section)
  const productVideos: Record<string, string> = {
    "Premium Furniture Collection Set": "/videos/premimumfurniturecollectionsets.mov",
    "Industrial Bar Stool": "/videos/barchair.mov",
    "Cross-Back Dining Chair": "/videos/crosschair.mov",
    "C-Shape Accent Table": "/videos/cshape.mov",
    // Add more product-video mappings here as needed
  }

    useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=7')
        if (!response.ok) throw new Error('Failed to fetch products')
        
        const data = await response.json()
        
        // Show only products with videos (4 products)
        const allowedProducts = [
          "Cross-Back Dining Chair",
          "Industrial Bar Stool",
          "C-Shape Accent Table",
          "Premium Furniture Collection Set"
        ]
        
        const productsWithVideos = data.data
          .filter((product: any) => allowedProducts.includes(product.name))
          .map((product: any) => ({
            ...product,
            craftStoryVideo: productVideos[product.name]
          }))
        
        setProducts(productsWithVideos)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setShowDialog(true)
  }

  const handleBuyNow = () => {
    if (selectedProduct) {
      addToCart({
        id: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.image,
        category: selectedProduct.category
      })
      toast.success(`${selectedProduct.name} added to cart!`)
      setShowDialog(false)
      window.location.href = '/checkout'
    }
  }

  const handleWhatsAppContact = () => {
    if (selectedProduct) {
      const message = `Hi, I'm interested in the ${selectedProduct.name}. Can you provide more details about pricing and customization?`
      window.open(`https://wa.me/919950036077?text=${encodeURIComponent(message)}`, '_blank')
      setShowDialog(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-6 pb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-4">
            Stories Behind the <span className="text-[#D4AF37]">Style</span>
          </h2>
          <p className="text-lg text-[#1A2642]/60 max-w-2xl mx-auto">
            Every piece tells a story of craftsmanship and dedication
          </p>
        </motion.div>

        <div className="relative">
          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory scrollbar-hide">
            {products.map((product, index) => {
              const discount = product.originalPrice 
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0
              
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-64 md:w-72 snap-start group"
                >
                  <div 
                    onClick={() => handleProductClick(product)}
                    className="cursor-pointer"
                  >
                    <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                      {/* Video/Image */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#F5EFE7] to-[#E8DCC4] overflow-hidden">
                        {product.craftStoryVideo ? (
                          <video
                            src={product.craftStoryVideo}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 256px, 288px"
                          />
                        )}
                        
                        {/* Discount Badge or Exclusive Badge */}
                        {product.isExclusive ? (
                          <div className="absolute top-3 md:top-4 left-3 md:left-4">
                            <div className="bg-[#D4AF37] text-black px-2 md:px-3 py-1 rounded-lg font-bold text-xs md:text-sm">
                              Exclusive
                            </div>
                          </div>
                        ) : discount > 0 && (
                          <div className="absolute top-3 md:top-4 left-3 md:left-4">
                            <div className="bg-green-500 text-white px-2 md:px-3 py-1 rounded-lg font-bold flex items-center gap-1 text-xs md:text-sm">
                              <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                              {discount}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 md:p-5">
                        <h3 className="font-bold text-[#1A2642] mb-2 line-clamp-2 text-sm group-hover:text-[#D4AF37] transition-colors min-h-[2.5rem]">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center bg-orange-50 px-2 py-1 rounded">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating)
                                    ? "fill-orange-400 text-orange-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">({product.reviews})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          {product.isExclusive ? (
                            <span className="text-sm md:text-base font-bold text-[#D4AF37]">
                              {product.exclusivePrice || "Contact for Price"}
                            </span>
                          ) : (
                            <>
                              <span className="text-lg md:text-xl font-bold text-[#1A2642]">₹{product.price.toLocaleString()}</span>
                              {product.originalPrice && (
                                <span className="text-xs md:text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#1A2642]/60 italic line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Product Image/Video */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-[#F5EFE7] to-[#E8DCC4]">
              {selectedProduct?.craftStoryVideo ? (
                <video
                  src={selectedProduct.craftStoryVideo}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              ) : selectedProduct?.image && (
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              {selectedProduct?.isExclusive ? (
                <>
                  <span className="text-xl font-bold text-[#D4AF37]">
                    {selectedProduct.exclusivePrice || "Contact for Custom Price"}
                  </span>
                  <Badge className="bg-[#D4AF37] text-black">
                    Exclusive
                  </Badge>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-[#D4AF37]">
                    ₹{selectedProduct?.price.toLocaleString()}
                  </span>
                  {selectedProduct?.originalPrice && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{selectedProduct.originalPrice.toLocaleString()}
                      </span>
                      <Badge className="bg-green-500">
                        {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                      </Badge>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {selectedProduct?.description}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {selectedProduct?.isExclusive ? (
                <Button
                  onClick={handleWhatsAppContact}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact on WhatsApp
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleBuyNow}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDialog(false)
                      window.location.href = `/products/${selectedProduct._id}`
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    View Details
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
