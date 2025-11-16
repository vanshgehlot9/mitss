"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { products } from "@/lib/products-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ShoppingCart, Heart, Search, SlidersHorizontal, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import AdvancedFiltersPanel from "@/components/filters/advanced-filters-panel"

function SearchContent() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("popular")
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState<any>({})

  const { addToCart } = useCart()
  const { toast } = useToast()

  // Get unique categories and colors
  const categories = Array.from(new Set(products.map(p => p.category)))
  const allColors = Array.from(new Set(products.flatMap(p => p.color || [])))

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setPriceRange(newFilters.priceRange)
    setSelectedCategories(newFilters.categories)
    setSortBy(newFilters.sortBy)
  }

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    // Search query filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Price range filter
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
    
    // Color filter
    const matchesColor = selectedColors.length === 0 || 
                        (product.color && product.color.some(c => selectedColors.includes(c)))
    
    return matchesSearch && matchesPrice && matchesCategory && matchesColor
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "newest":
        return b.id - a.id
      default:
        return b.reviews - a.reviews // popular
    }
  })

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setPriceRange([0, 100000])
    setSelectedCategories([])
    setSelectedColors([])
    setSortBy("popular")
  }

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    })
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
    })
  }

  const activeFiltersCount = selectedCategories.length + selectedColors.length + 
    (priceRange[0] !== 0 || priceRange[1] !== 100000 ? 1 : 0)

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Search Products</h1>
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-[#D4AF37]">{activeFiltersCount}</Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <AdvancedFiltersPanel 
              onFilterChange={handleFilterChange}
              showMobileToggle={true}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-24 h-24 mx-auto mb-6 text-muted-foreground/30" />
                <h2 className="text-2xl font-semibold mb-4">No Products Found</h2>
                <p className="text-muted-foreground mb-8">
                  Try adjusting your filters or search query
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                    <Link href={`/products/${product.id}`}>
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.badge && (
                          <Badge className={`absolute top-3 left-3 ${product.badgeColor}`}>
                            {product.badge}
                          </Badge>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({product.reviews})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-[#D4AF37]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-32 text-center">
          <p>Loading search...</p>
        </div>
        <Footer />
      </main>
    }>
      <SearchContent />
    </Suspense>
  )
}
