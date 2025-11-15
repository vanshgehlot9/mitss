"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Eye, Heart, Star, Search, SlidersHorizontal, X, Grid3x3, List, ChevronRight, LayoutGrid, Loader2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCart } from "@/lib/cart-context"
import { useProducts } from "@/hooks/use-products"
import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"

export default function AllProducts() {
  const { addToCart } = useCart()
  const { products, loading } = useProducts()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [sortBy, setSortBy] = useState("popular")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [itemsToShow, setItemsToShow] = useState(12)
  const [quickViewProduct, setQuickViewProduct] = useState<typeof products[0] | null>(null)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [compareList, setCompareList] = useState<string[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])

  // Helper function to get product ID (works with both _id and id)
  const getProductId = (product: any): string => {
    return product._id?.toString() || product.id?.toString() || ''
  }

  // Load preferences from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode') as "grid" | "list"
    const savedWishlist = localStorage.getItem('wishlist')
    const savedCompare = localStorage.getItem('compareList')
    const savedRecentlyViewed = localStorage.getItem('recentlyViewed')
    
    if (savedViewMode) setViewMode(savedViewMode)
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
    if (savedCompare) setCompareList(JSON.parse(savedCompare))
    if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed))
  }, [])

  // Get category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategories([categoryParam])
    }
  }, [searchParams])

  const categories = Array.from(new Set(products.map(p => p.category)))
  const colors = ["Navy Blue", "Emerald Green", "Burgundy", "Natural Walnut", "Dark Mahogany", "Honey Oak"]

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      return matchesSearch && matchesCategory && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "newest":
          return b.id - a.id
        case "discount":
          const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0
          const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0
          return discountB - discountA
        case "popular":
        default:
          return b.reviews - a.reviews
      }
    })

  const displayedProducts = filteredProducts.slice(0, itemsToShow)
  const hasMore = itemsToShow < filteredProducts.length

  const handleWhatsAppClick = (product: typeof products[0]) => {
    const isExclusive = (product as any).isExclusive
    const message = encodeURIComponent(
      `Hi! I'm interested in ${product.name}${!isExclusive ? ` (₹${product.price.toLocaleString('en-IN')})` : ''}. Can you provide more details?`
    )
    window.open(`https://wa.me/919950036077?text=${message}`, '_blank')
  }

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    })
    toast.success(`${product.name} added to cart!`)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    )
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedColors([])
    setPriceRange([0, 100000])
    setSearchQuery("")
  }

  const activeFiltersCount = selectedCategories.length + selectedColors.length + 
    (priceRange[0] !== 0 || priceRange[1] !== 100000 ? 1 : 0)

  const removeFilter = (type: 'category' | 'color' | 'price', value?: string) => {
    if (type === 'category' && value) {
      setSelectedCategories(prev => prev.filter(c => c !== value))
    } else if (type === 'color' && value) {
      setSelectedColors(prev => prev.filter(c => c !== value))
    } else if (type === 'price') {
      setPriceRange([0, 100000])
    }
  }

  const toggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode)
    localStorage.setItem('viewMode', mode)
  }

  const loadMore = () => {
    setItemsToShow(prev => prev + 12)
  }

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const newWishlist = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
      localStorage.setItem('wishlist', JSON.stringify(newWishlist))
      toast.success(newWishlist.includes(productId) ? 'Added to wishlist!' : 'Removed from wishlist')
      return newWishlist
    })
  }

  const toggleCompare = (productId: string) => {
    setCompareList(prev => {
      if (prev.includes(productId)) {
        const newList = prev.filter(id => id !== productId)
        localStorage.setItem('compareList', JSON.stringify(newList))
        toast.success('Removed from compare list')
        return newList
      } else if (prev.length < 4) {
        const newList = [...prev, productId]
        localStorage.setItem('compareList', JSON.stringify(newList))
        toast.success('Added to compare list')
        return newList
      } else {
        toast.error('You can compare up to 4 products only')
        return prev
      }
    })
  }

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed(prev => {
      const newViewed = [productId, ...prev.filter(id => id !== productId)].slice(0, 10)
      localStorage.setItem('recentlyViewed', JSON.stringify(newViewed))
      return newViewed
    })
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const recentlyViewedProducts = products.filter(p => {
    const productId = (p as any)._id?.toString() || p.id?.toString()
    return productId && recentlyViewed.includes(productId)
  })

  return (
    <>
      {/* Header Section with Breadcrumbs */}
      <div className="bg-[#1A2642] text-white py-12 pt-32">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#D4AF37]">All Products</span>
            {selectedCategories.length === 1 && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-300">{selectedCategories[0]}</span>
              </>
            )}
          </nav>
          
          <div className="flex items-center justify-between">
            <h1 className="text-4xl md:text-5xl font-bold">
              All <span className="text-[#D4AF37]">Products</span>
            </h1>
            
            {/* Compare Count */}
            {compareList.length > 0 && (
              <Button 
                variant="outline" 
                className="border-[#D4AF37] text-white hover:bg-[#D4AF37] relative"
                onClick={() => router.push('/compare')}
              >
                <LayoutGrid className="w-5 h-5 mr-2" />
                Compare
                <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-0.5 text-xs">
                  {compareList.length}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      )}

      {/* No Products State */}
      {!loading && products.length === 0 && (
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">🪑</div>
            <h2 className="text-2xl font-bold text-[#1A2642] mb-2">No Products Found</h2>
            <p className="text-gray-600 mb-6">
              Check back soon for our exclusive furniture collection!
            </p>
          </div>
        </div>
      )}

      {!loading && products.length > 0 && (
      <>
      {/* Main Content */}
      <div className="bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
            </Button>
          </div>

          {/* Left Sidebar - Filters */}
          <aside className={`
            lg:block lg:w-80 
            ${showFilters ? 'block' : 'hidden'}
            bg-white dark:bg-card rounded-xl p-6 shadow-sm h-fit sticky top-4
          `}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Filters</h2>
                {activeFiltersCount > 0 && (
                  <Badge className="bg-[#D4AF37] text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                )}
                {showFilters && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mb-6 pb-6 border-b">
                <p className="text-sm font-semibold mb-3">Active Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(cat => (
                    <Badge 
                      key={cat} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100 gap-1"
                      onClick={() => removeFilter('category', cat)}
                    >
                      {cat}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}
                  {selectedColors.map(color => (
                    <Badge 
                      key={color} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100 gap-1"
                      onClick={() => removeFilter('color', color)}
                    >
                      {color}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}
                  {(priceRange[0] !== 0 || priceRange[1] !== 100000) && (
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100 gap-1"
                      onClick={() => removeFilter('price')}
                    >
                      ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                      <X className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Price Range</h3>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={100000}
                step={1000}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Category</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="ml-2 text-sm cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <h3 className="font-semibold mb-4">Color</h3>
              <div className="space-y-3">
                {colors.map((color) => (
                  <div key={color} className="flex items-center">
                    <Checkbox
                      id={`color-${color}`}
                      checked={selectedColors.includes(color)}
                      onCheckedChange={() => toggleColor(color)}
                    />
                    <label
                      htmlFor={`color-${color}`}
                      className="ml-2 text-sm cursor-pointer"
                    >
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content - Search & Products */}
          <div className="flex-1">
            {/* Search Bar, View Toggle & Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-10 h-12 rounded-lg"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-white h-12 px-6"
                >
                  Search
                </Button>
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-2 border rounded-lg p-1 h-12 items-center">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => toggleViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#D4AF37] hover:bg-[#B8941F]' : ''}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => toggleViewMode('list')}
                  className={viewMode === 'list' ? 'bg-[#D4AF37] hover:bg-[#B8941F]' : ''}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-lg">
                  <SelectValue placeholder="Most Popular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="discount">Best Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {displayedProducts.length} of {filteredProducts.length} products
              </p>
            </div>

            {/* Products Grid or List */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
              : "flex flex-col gap-4"
            }>
              {displayedProducts.map((product, index) => (
                <motion.div
                  key={getProductId(product)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                                    <div className={`bg-white dark:bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}>
                    {/* Image Container */}
                    <Link 
                      href={`/products/${getProductId(product)}`}
                      onClick={() => addToRecentlyViewed(getProductId(product))}
                      className={viewMode === 'list' ? 'w-64 flex-shrink-0' : ''}
                    >
                      <div className={`relative overflow-hidden bg-gray-50 cursor-pointer ${
                        viewMode === 'list' ? 'h-full' : 'h-48'
                      }`}>
                        {/* Badge */}
                        <Badge 
                          className={`absolute top-2 left-2 z-10 border-0 text-white font-semibold px-2 py-0.5 text-xs ${
                            (product as any).isExclusive ? 'bg-[#D4AF37]' : 
                            product.badge === 'Featured' ? 'bg-blue-600' :
                            product.badge === 'Premium' ? 'bg-purple-600' :
                            product.badge === 'Popular' ? 'bg-orange-600' :
                            product.badge === 'Comfort' ? 'bg-purple-600' :
                            'bg-[#1A2642]'
                          }`}
                        >
                          {(product as any).isExclusive ? 'Exclusive' : product.badge || 'Available'}
                        </Badge>

                        {/* Action Buttons - Only show on hover for grid view */}
                        {viewMode === 'grid' && (
                          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button 
                              size="icon" 
                              className={`rounded-full text-white w-8 h-8 ${
                                wishlist.includes(getProductId(product))
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-[#D4AF37] hover:bg-[#B8941F]'
                              }`}
                              onClick={(e) => {
                                e.preventDefault()
                                toggleWishlist(getProductId(product))
                              }}
                            >
                              <Heart className={`w-3 h-3 ${wishlist.includes(getProductId(product)) ? 'fill-current' : ''}`} />
                            </Button>
                            <Button 
                              size="icon" 
                              className="rounded-full bg-[#D4AF37] hover:bg-[#B8941F] text-white w-8 h-8"
                              onClick={(e) => {
                                e.preventDefault()
                                setQuickViewProduct(product)
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        )}

                        {/* Product Image */}
                        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className={`p-3 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <div>
                        <p className="text-xs text-[#D4AF37] font-semibold mb-1">
                          {product.category}
                        </p>
                        <Link href={`/products/${getProductId(product)}`}>
                          <h3 className={`font-bold text-[#1A2642] dark:text-white hover:text-[#D4AF37] transition-colors mb-2 ${
                            viewMode === 'grid' ? 'text-sm line-clamp-2 h-10' : 'text-lg'
                          }`}>
                            {product.name}
                          </h3>
                        </Link>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating)
                                    ? 'fill-[#D4AF37] text-[#D4AF37]'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>

                        {/* Price */}
                        <div className="mb-3">
                          {(product as any).isExclusive && (product as any).exclusivePrice ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-[#D4AF37]">
                                {(product as any).exclusivePrice}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={viewMode === 'grid' ? 'text-lg font-bold text-[#D4AF37]' : 'text-2xl font-bold text-[#D4AF37]'}>
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                              {product.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{product.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons - Regular or Exclusive */}
                      {(product as any).isExclusive ? (
                        <Button 
                          className={`w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold rounded-lg ${
                            viewMode === 'grid' ? 'h-8 text-xs' : 'h-11'
                          }`}
                          onClick={() => handleWhatsAppClick(product)}
                        >
                          <MessageCircle className={viewMode === 'grid' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'} />
                          WhatsApp
                        </Button>
                      ) : (
                        <Button 
                          className={`w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white font-semibold rounded-lg ${
                            viewMode === 'grid' ? 'h-8 text-xs' : 'h-11'
                          }`}
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className={viewMode === 'grid' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'} />
                          Buy Now
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                >
                  Load More Products
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* No Products Found */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-2xl font-bold mb-2">No products found</p>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Section */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">
              Recently <span className="text-[#D4AF37]">Viewed</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentlyViewedProducts.slice(0, 5).map((product) => (
                <div key={getProductId(product)} className="group">
                  <Link
                    href={`/products/${getProductId(product)}`}
                  >
                    <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                  </div>
                    <div className="p-3">
                      <p className="text-xs text-[#D4AF37] font-semibold mb-1">{product.category}</p>
                      <h4 className="text-sm font-bold line-clamp-1 mb-2">{product.name}</h4>
                      <p className="text-[#D4AF37] font-bold">₹{product.price.toLocaleString('en-IN')}</p>
                    </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Quick View Modal */}
      <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {quickViewProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {quickViewProduct.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                {/* Product Image */}
                <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
                  {quickViewProduct.badge && (
                    <Badge className={`absolute top-4 left-4 z-10 border-0 text-white font-semibold px-3 py-1 ${
                      quickViewProduct.badge === 'Featured' ? 'bg-blue-600' :
                      quickViewProduct.badge === 'Premium' ? 'bg-purple-600' :
                      quickViewProduct.badge === 'Popular' ? 'bg-orange-600' :
                      'bg-[#D4AF37]'
                    }`}>
                      {quickViewProduct.badge}
                    </Badge>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={quickViewProduct.image} 
                      alt={quickViewProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                  <p className="text-sm text-[#D4AF37] font-semibold mb-2">
                    {quickViewProduct.category}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                      <span className="ml-1 text-lg font-semibold">{quickViewProduct.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({quickViewProduct.reviews} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-bold text-[#D4AF37]">
                      ₹{quickViewProduct.price.toLocaleString('en-IN')}
                    </span>
                    {quickViewProduct.originalPrice && (
                      <>
                        <span className="text-lg text-muted-foreground line-through">
                          ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                        </span>
                        <Badge className="bg-green-500 text-white">
                          {Math.round(((quickViewProduct.originalPrice - quickViewProduct.price) / quickViewProduct.originalPrice) * 100)}% OFF
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6 flex-1">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">
                      {quickViewProduct.description || "This is a premium quality handcrafted furniture piece, designed to bring elegance and comfort to your space. Made with finest materials and attention to detail."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white font-semibold h-12"
                      onClick={() => {
                        handleAddToCart(quickViewProduct)
                        setQuickViewProduct(null)
                      }}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                        onClick={() => {
                          toggleWishlist(getProductId(quickViewProduct))
                        }}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${wishlist.includes(getProductId(quickViewProduct)) ? 'fill-current' : ''}`} />
                        {wishlist.includes(getProductId(quickViewProduct)) ? 'In Wishlist' : 'Add to Wishlist'}
                      </Button>
                      
                      <Link href={`/products/${getProductId(quickViewProduct)}`}>
                        <Button
                          variant="outline"
                          className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                          onClick={() => {
                            setQuickViewProduct(null)
                            addToRecentlyViewed(getProductId(quickViewProduct))
                          }}
                        >
                          View Full Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </>
      )}
    </>
  )
}
