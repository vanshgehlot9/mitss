'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { X, SlidersHorizontal } from 'lucide-react'

interface ProductFiltersProps {
  onFilterChange: (filters: FilterValues) => void
  categories: string[]
  priceRange: { min: number; max: number }
}

export interface FilterValues {
  categories: string[]
  priceRange: [number, number]
  rating: number
  availability: 'all' | 'in_stock' | 'out_of_stock'
  sortBy: string
}

export default function ProductFilters({ 
  onFilterChange, 
  categories, 
  priceRange 
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    categories: [],
    priceRange: [priceRange.min, priceRange.max],
    rating: 0,
    availability: 'all',
    sortBy: 'newest'
  })

  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    updateFilter('categories', newCategories)
  }

  const clearFilters = () => {
    const defaultFilters: FilterValues = {
      categories: [],
      priceRange: [priceRange.min, priceRange.max],
      rating: 0,
      availability: 'all',
      sortBy: 'newest'
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const activeFilterCount = 
    filters.categories.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0) +
    ((filters.priceRange[0] !== priceRange.min || filters.priceRange[1] !== priceRange.max) ? 1 : 0)

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-primary text-white rounded-full px-2 py-0.5 text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block space-y-4`}>
        {/* Active Filters Count */}
        {activeFilterCount > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sort By */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sort By</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'price_low', label: 'Price: Low to High' },
              { value: 'price_high', label: 'Price: High to Low' },
              { value: 'popularity', label: 'Most Popular' },
              { value: 'rating', label: 'Highest Rated' },
              { value: 'name', label: 'Name: A to Z' }
            ].map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`sort-${option.value}`}
                  name="sort"
                  value={option.value}
                  checked={filters.sortBy === option.value}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="mr-2"
                />
                <label htmlFor={`sort-${option.value}`} className="text-sm cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Price Range</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              min={priceRange.min}
              max={priceRange.max}
              step={1000}
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              className="mb-4"
            />
            <div className="flex items-center justify-between text-sm">
              <span>₹{filters.priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <Checkbox
                  id={`cat-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <label
                  htmlFor={`cat-${category}`}
                  className="ml-2 text-sm cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rating Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Minimum Rating</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <input
                  type="radio"
                  id={`rating-${rating}`}
                  name="rating"
                  value={rating}
                  checked={filters.rating === rating}
                  onChange={() => updateFilter('rating', rating)}
                  className="mr-2"
                />
                <label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center">
                  <span className="text-yellow-500 mr-1">{'★'.repeat(rating)}</span>
                  <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
                  <span className="ml-2">& Up</span>
                </label>
              </div>
            ))}
            <div className="flex items-center">
              <input
                type="radio"
                id="rating-all"
                name="rating"
                value={0}
                checked={filters.rating === 0}
                onChange={() => updateFilter('rating', 0)}
                className="mr-2"
              />
              <label htmlFor="rating-all" className="text-sm cursor-pointer">
                All Ratings
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { value: 'all', label: 'All Products' },
              { value: 'in_stock', label: 'In Stock Only' },
              { value: 'out_of_stock', label: 'Out of Stock' }
            ].map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`avail-${option.value}`}
                  name="availability"
                  value={option.value}
                  checked={filters.availability === option.value}
                  onChange={(e) => updateFilter('availability', e.target.value as any)}
                  className="mr-2"
                />
                <label htmlFor={`avail-${option.value}`} className="text-sm cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
