'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating?: number
  reviews?: number
  inStock?: boolean
}

interface ProductRecommendationsProps {
  currentProductId?: string
  currentCategory?: string
  type: 'similar' | 'also-bought' | 'trending' | 'related'
  title?: string
  maxItems?: number
}

export default function ProductRecommendations({
  currentProductId,
  currentCategory,
  type,
  title,
  maxItems = 8
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 4

  useEffect(() => {
    loadRecommendations()
  }, [currentProductId, currentCategory, type])

  const loadRecommendations = async () => {
    try {
      const params = new URLSearchParams({
        type,
        ...(currentProductId && { productId: currentProductId }),
        ...(currentCategory && { category: currentCategory }),
        limit: maxItems.toString()
      })

      const response = await fetch(`/api/recommendations?${params}`)
      const data = await response.json()

      if (data.success) {
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentIndex(Math.max(0, currentIndex - itemsPerView))
    } else {
      setCurrentIndex(
        Math.min(recommendations.length - itemsPerView, currentIndex + itemsPerView)
      )
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'similar':
        return 'Similar Products'
      case 'also-bought':
        return 'Customers Also Bought'
      case 'trending':
        return 'Trending Now'
      case 'related':
        return 'You May Also Like'
      default:
        return 'Recommended For You'
    }
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  const visibleProducts = recommendations.slice(currentIndex, currentIndex + itemsPerView)
  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex + itemsPerView < recommendations.length

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">{title || getDefaultTitle()}</h2>
        
        {recommendations.length > itemsPerView && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="wait">
            {visibleProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-xl transition-shadow duration-300 h-full">
                  <CardContent className="p-0">
                    <Link href={`/products/${product.id}`}>
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        <Image
                          src={product.image || '/images/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </div>
                        )}

                        {product.inStock === false && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold">
                              Out of Stock
                            </span>
                          </div>
                        )}

                        <button
                          className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          onClick={(e) => {
                            e.preventDefault()
                            // Add to wishlist logic
                          }}
                        >
                          <Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="mb-2">
                          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>

                        {product.rating && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating || 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            {product.reviews && (
                              <span className="text-xs text-gray-500">({product.reviews})</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-bold text-primary">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.preventDefault()
                            // Add to cart logic
                          }}
                          disabled={product.inStock === false}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Indicator */}
      {recommendations.length > itemsPerView && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(recommendations.length / itemsPerView) }).map((_, i) => (
            <button
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / itemsPerView) === i
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(i * itemsPerView)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
