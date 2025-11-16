'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedFiltersProps {
  onFilterChange?: (filters: FilterState) => void
  className?: string
  showMobileToggle?: boolean
}

interface FilterState {
  priceRange: [number, number]
  categories: string[]
  materials: string[]
  styles: string[]
  rooms: string[]
  colors: string[]
  sortBy: string
  availability: 'all' | 'in-stock' | 'out-of-stock'
}

const CATEGORIES = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Dining',
  'Bathroom',
  'Home Office',
  'Outdoor',
]

const MATERIALS = [
  'Wood',
  'Metal',
  'Glass',
  'Fabric',
  'Leather',
  'Ceramic',
  'Plastic',
  'Stone',
]

const STYLES = [
  'Modern',
  'Contemporary',
  'Traditional',
  'Minimalist',
  'Rustic',
  'Industrial',
  'Mid-Century',
  'Bohemian',
]

const ROOMS = [
  'Bedroom',
  'Living Room',
  'Kitchen',
  'Dining Room',
  'Bathroom',
  'Home Office',
  'Hallway',
]

const COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#808080' },
  { name: 'Brown', value: '#8B4513' },
  { name: 'Beige', value: '#F5F5DC' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#008000' },
  { name: 'Red', value: '#FF0000' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name-asc', label: 'Name: A to Z' },
]

export default function AdvancedFiltersPanel({
  onFilterChange,
  className,
  showMobileToggle = true,
}: AdvancedFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(!showMobileToggle)
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000],
    categories: [],
    materials: [],
    styles: [],
    rooms: [],
    colors: [],
    sortBy: 'newest',
    availability: 'all',
  })

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
    material: false,
    style: false,
    room: false,
    color: false,
    sort: true,
  })

  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length
    if (value === 'all') return count
    if (Array.isArray(value) && value.length === 0) return count
    return count + 1
  }, 0)

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const toggleCategory = (category: string, checked: boolean) => {
    const updated = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category)
    updateFilter('categories', updated)
  }

  const toggleMaterial = (material: string, checked: boolean) => {
    const updated = checked
      ? [...filters.materials, material]
      : filters.materials.filter(m => m !== material)
    updateFilter('materials', updated)
  }

  const toggleStyle = (style: string, checked: boolean) => {
    const updated = checked
      ? [...filters.styles, style]
      : filters.styles.filter(s => s !== style)
    updateFilter('styles', updated)
  }

  const toggleRoom = (room: string, checked: boolean) => {
    const updated = checked
      ? [...filters.rooms, room]
      : filters.rooms.filter(r => r !== room)
    updateFilter('rooms', updated)
  }

  const toggleColor = (color: string, checked: boolean) => {
    const updated = checked
      ? [...filters.colors, color]
      : filters.colors.filter(c => c !== color)
    updateFilter('colors', updated)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 100000],
      categories: [],
      materials: [],
      styles: [],
      rooms: [],
      colors: [],
      sortBy: 'newest',
      availability: 'all',
    })
    onFilterChange?.({
      priceRange: [0, 100000],
      categories: [],
      materials: [],
      styles: [],
      rooms: [],
      colors: [],
      sortBy: 'newest',
      availability: 'all',
    })
  }

  const FilterSection = ({
    title,
    id,
    children,
  }: {
    title: string
    id: keyof typeof expandedSections
    children: React.ReactNode
  }) => (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <span className="font-semibold text-sm">{title}</span>
        {expandedSections[id] ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {expandedSections[id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const filtersPanel = (
    <Card className={cn("h-fit", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Sort */}
        <FilterSection title="Sort By" id="sort">
          <Select value={filters.sortBy} onValueChange={(val) => updateFilter('sortBy', val)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" id="price">
          <div className="space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={(val) => updateFilter('priceRange', val as [number, number])}
              min={0}
              max={100000}
              step={1000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span>₹{filters.priceRange[0].toLocaleString()}</span>
              <span>₹{filters.priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection title="Availability" id="sort">
          <div className="space-y-3">
            {[
              { value: 'all', label: 'All Products' },
              { value: 'in-stock', label: 'In Stock' },
              { value: 'out-of-stock', label: 'Out of Stock' },
            ].map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`availability-${option.value}`}
                  checked={filters.availability === option.value}
                  onCheckedChange={() => updateFilter('availability', option.value)}
                />
                <Label htmlFor={`availability-${option.value}`} className="cursor-pointer text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Categories */}
        <FilterSection title="Category" id="category">
          <div className="space-y-3">
            {CATEGORIES.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => toggleCategory(category, checked as boolean)}
                />
                <Label htmlFor={`category-${category}`} className="cursor-pointer text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Materials */}
        <FilterSection title="Material" id="material">
          <div className="space-y-3">
            {MATERIALS.map(material => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={`material-${material}`}
                  checked={filters.materials.includes(material)}
                  onCheckedChange={(checked) => toggleMaterial(material, checked as boolean)}
                />
                <Label htmlFor={`material-${material}`} className="cursor-pointer text-sm">
                  {material}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Styles */}
        <FilterSection title="Style" id="style">
          <div className="space-y-3">
            {STYLES.map(style => (
              <div key={style} className="flex items-center space-x-2">
                <Checkbox
                  id={`style-${style}`}
                  checked={filters.styles.includes(style)}
                  onCheckedChange={(checked) => toggleStyle(style, checked as boolean)}
                />
                <Label htmlFor={`style-${style}`} className="cursor-pointer text-sm">
                  {style}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Room Type */}
        <FilterSection title="Room Type" id="room">
          <div className="space-y-3">
            {ROOMS.map(room => (
              <div key={room} className="flex items-center space-x-2">
                <Checkbox
                  id={`room-${room}`}
                  checked={filters.rooms.includes(room)}
                  onCheckedChange={(checked) => toggleRoom(room, checked as boolean)}
                />
                <Label htmlFor={`room-${room}`} className="cursor-pointer text-sm">
                  {room}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Colors */}
        <FilterSection title="Color" id="color">
          <div className="grid grid-cols-4 gap-3">
            {COLORS.map(color => (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name, !filters.colors.includes(color.name))}
                className={cn(
                  'h-10 rounded-lg border-2 transition-all hover:scale-105',
                  filters.colors.includes(color.name)
                    ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400'
                    : 'border-gray-200'
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </FilterSection>
      </CardContent>
    </Card>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      {showMobileToggle && (
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      )}

      {/* Desktop View */}
      <div className="hidden md:block">{filtersPanel}</div>

      {/* Mobile View */}
      {showMobileToggle && isMobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden mb-4"
        >
          {filtersPanel}
        </motion.div>
      )}
    </>
  )
}
