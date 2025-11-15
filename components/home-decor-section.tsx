"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

const decorItems = [
  {
    title: "Mirrors",
    price: "From ₹989",
    image: "🪞",
    bgColor: "from-orange-100 to-orange-50"
  },
  {
    title: "Wall Paintings",
    price: "From ₹299",
    image: "🎨",
    bgColor: "from-blue-100 to-blue-50"
  },
  {
    title: "Serving Trays",
    price: "From ₹323",
    image: "🍽️",
    bgColor: "from-amber-100 to-amber-50"
  },
  {
    title: "Vases",
    price: "From ₹299",
    image: "🏺",
    bgColor: "from-purple-100 to-purple-50"
  },
  {
    title: "Sculptures",
    price: "From ₹899",
    image: "🗿",
    bgColor: "from-gray-100 to-gray-50"
  },
  {
    title: "Flowers",
    price: "From ₹449",
    image: "🌻",
    bgColor: "from-yellow-100 to-yellow-50"
  },
  {
    title: "Wall Clocks",
    price: "From ₹799",
    image: "🕐",
    bgColor: "from-rose-100 to-rose-50"
  },
  {
    title: "Decorative Plates",
    price: "From ₹599",
    image: "🎭",
    bgColor: "from-indigo-100 to-indigo-50"
  }
]

export default function HomeDecorSection() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products?limit=8')
        const data = await response.json()
        if (data.success) {
          setProducts(data.data.slice(0, 8))
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-[#FAF9F6]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#FAF9F6]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-2">
              Home <span className="text-[#D4AF37]">Decor</span>
            </h2>
            <p className="text-lg text-[#1A2642]/60">Because every detail matters</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/products">
              <Button 
                variant="outline" 
                className="group border-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white text-[#D4AF37]"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Link href={`/products/${product._id}`}>
                <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="relative aspect-square bg-gradient-to-br from-[#F5EFE7] to-[#E8DCC4] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {product.badge && (
                      <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-[#D4AF37] text-white px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-bold shadow-lg">
                        {product.badge}
                      </div>
                    )}
                  </div>

                  <div className="p-3 md:p-5 text-center">
                    <h3 className="font-bold text-sm md:text-base lg:text-lg text-[#1A2642] mb-1 md:mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-base md:text-lg font-bold text-[#1A2642]">₹{product.price.toLocaleString()}</p>
                      {product.originalPrice && (
                        <p className="text-xs md:text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
