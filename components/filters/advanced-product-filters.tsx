"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Star, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ProductFilters {
  priceRange: [number, number]
  categories: string[]
  minRating: number
  availability: "all" | "in-stock" | "out-of-stock"
  sortBy: string
}

interface AdvancedProductFiltersProps {
  onFilterChange: (filters: ProductFilters) => void
  categories?: string[]
  priceRange?: { min: number; max: number }
  className?: string
  showMobileToggle?: boolean
}

export default function AdvancedProductFilters({
  onFilterChange,
  categories = [
    "Pooja Items",
    "Utensils",
    "Decorative",
    "Wall Hanging",
    "Kitchen",
    "Gifts",
  ],
  priceRange = { min: 0, max: 50000 },
  className,
  showMobileToggle = true,
}: AdvancedProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [filters, setFilters] = useState<ProductFilters>({
    priceRange: [priceRange.min, priceRange.max],
    categories: [],
    minRating: 0,
    availability: "all",
    sortBy: "newest",
  })

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
    rating: true,
    availability: true,
  })

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ]

  const ratingOptions = [
    { value: 4, label: "4★ & up" },
    { value: 3, label: "3★ & up" },
    { value: 2, label: "2★ & up" },
    { value: 1, label: "1★ & up" },
  ]

  useEffect(() => {
    onFilterChange(filters)
  }, [filters])

  const handlePriceChange = (value: number[]) => {
    setFilters({ ...filters, priceRange: [value[0], value[1]] })
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    setFilters({ ...filters, categories: newCategories })
  }

  const handleRatingChange = (rating: number) => {
    setFilters({ ...filters, minRating: rating === filters.minRating ? 0 : rating })
  }

  const handleAvailabilityChange = (availability: "all" | "in-stock" | "out-of-stock") => {
    setFilters({ ...filters, availability })
  }

  const handleSortChange = (sortBy: string) => {
    setFilters({ ...filters, sortBy })
  }

  const clearFilters = () => {
    setFilters({
      priceRange: [priceRange.min, priceRange.max],
      categories: [],
      minRating: 0,
      availability: "all",
      sortBy: "newest",
    })
  }

  const activeFilterCount = () => {
    let count = 0
    if (filters.priceRange[0] !== priceRange.min || filters.priceRange[1] !== priceRange.max) count++
    count += filters.categories.length
    if (filters.minRating > 0) count++
    if (filters.availability !== "all") count++
    return count
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] })
  }

  const activeCount = activeFilterCount()

  return (
    <div className={cn("space-y-4", className)}>
      {/* Sort & Filter Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Label className="text-sm text-[#1A2642]/60 mb-2 block">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showMobileToggle && (
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {(isOpen || !showMobileToggle) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                    {activeCount > 0 && (
                      <Badge variant="secondary">{activeCount} active</Badge>
                    )}
                  </CardTitle>
                  {activeCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Active Filters */}
                {activeCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => handleCategoryToggle(cat)}
                      >
                        {cat}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                    {(filters.priceRange[0] !== priceRange.min ||
                      filters.priceRange[1] !== priceRange.max) && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() =>
                          setFilters({
                            ...filters,
                            priceRange: [priceRange.min, priceRange.max],
                          })
                        }
                      >
                        ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    )}
                    {filters.minRating > 0 && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => setFilters({ ...filters, minRating: 0 })}
                      >
                        {filters.minRating}★ & up
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    )}
                    {filters.availability !== "all" && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => setFilters({ ...filters, availability: "all" })}
                      >
                        {filters.availability === "in-stock" ? "In Stock" : "Out of Stock"}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    )}
                  </div>
                )}

                <Separator />

                {/* Price Range */}
                <div>
                  <button
                    onClick={() => toggleSection("price")}
                    className="flex items-center justify-between w-full mb-4"
                  >
                    <Label className="text-base font-semibold cursor-pointer">
                      Price Range
                    </Label>
                    {expandedSections.price ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedSections.price && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4"
                      >
                        <Slider
                          min={priceRange.min}
                          max={priceRange.max}
                          step={100}
                          value={filters.priceRange}
                          onValueChange={handlePriceChange}
                          className="my-6"
                        />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#1A2642]/60">
                            ₹{filters.priceRange[0].toLocaleString()}
                          </span>
                          <span className="text-[#1A2642]/60">
                            ₹{filters.priceRange[1].toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Separator />

                {/* Categories */}
                <div>
                  <button
                    onClick={() => toggleSection("category")}
                    className="flex items-center justify-between w-full mb-4"
                  >
                    <Label className="text-base font-semibold cursor-pointer">
                      Categories
                    </Label>
                    {expandedSections.category ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedSections.category && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3"
                      >
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={filters.categories.includes(category)}
                              onCheckedChange={() => handleCategoryToggle(category)}
                            />
                            <Label
                              htmlFor={`category-${category}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {category}
                            </Label>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Separator />

                {/* Rating Filter */}
                <div>
                  <button
                    onClick={() => toggleSection("rating")}
                    className="flex items-center justify-between w-full mb-4"
                  >
                    <Label className="text-base font-semibold cursor-pointer">
                      Customer Rating
                    </Label>
                    {expandedSections.rating ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedSections.rating && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2"
                      >
                        {ratingOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleRatingChange(option.value)}
                            className={cn(
                              "flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors",
                              filters.minRating === option.value && "bg-[#D4AF37]/10 border border-[#D4AF37]"
                            )}
                          >
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-4 h-4",
                                    i < option.value
                                      ? "fill-[#D4AF37] text-[#D4AF37]"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm">{option.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Separator />

                {/* Availability */}
                <div>
                  <button
                    onClick={() => toggleSection("availability")}
                    className="flex items-center justify-between w-full mb-4"
                  >
                    <Label className="text-base font-semibold cursor-pointer">
                      Availability
                    </Label>
                    {expandedSections.availability ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedSections.availability && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2"
                      >
                        {[
                          { value: "all", label: "All Products" },
                          { value: "in-stock", label: "In Stock Only" },
                          { value: "out-of-stock", label: "Out of Stock" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleAvailabilityChange(
                                option.value as "all" | "in-stock" | "out-of-stock"
                              )
                            }
                            className={cn(
                              "flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm",
                              filters.availability === option.value &&
                                "bg-[#D4AF37]/10 border border-[#D4AF37]"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
