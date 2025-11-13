'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface SearchSuggestion {
  id: string
  name: string
  category: string
  price: number
  image?: string
  type: 'product' | 'category'
}

interface SearchAutocompleteProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
}

export default function SearchAutocomplete({ 
  placeholder = "Search for products...",
  onSearch,
  className = ""
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches] = useState<string[]>([
    'Brass Diya',
    'Pooja Thali Set',
    'Copper Water Bottle',
    'Wall Hanging',
    'Decorative Bells'
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save recent search
  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    const updated = [
      trimmed,
      ...recentSearches.filter(s => s !== trimmed)
    ].slice(0, 5) // Keep only 5 recent searches

    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  // Debounced search function
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    
    try {
      // Simulated API call - replace with actual endpoint
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      // Fallback to mock data
      const allMockSuggestions: SearchSuggestion[] = [
        {
          id: '1',
          name: 'Brass Pooja Thali Set',
          category: 'Pooja Items',
          price: 2499,
          image: '/images/products/thali.jpg',
          type: 'product'
        },
        {
          id: '2',
          name: 'Copper Water Bottle',
          category: 'Utensils',
          price: 999,
          image: '/images/products/bottle.jpg',
          type: 'product'
        }
      ]
      const mockSuggestions = allMockSuggestions.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSuggestions(mockSuggestions)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query, fetchSuggestions])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const totalItems = suggestions.length + recentSearches.length + trendingSearches.length

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleSearch = () => {
    if (!query.trim()) return
    
    saveRecentSearch(query)
    setIsOpen(false)
    
    if (onSearch) {
      onSearch(query)
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.id}`)
    } else {
      router.push(`/products?category=${encodeURIComponent(suggestion.category)}`)
    }
    setQuery('')
    setIsOpen(false)
  }

  const handleSelectRecent = (search: string) => {
    setQuery(search)
    router.push(`/search?q=${encodeURIComponent(search)}`)
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              inputRef.current?.focus()
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-[500px] overflow-y-auto shadow-lg">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          )}

          {/* Product Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="border-b">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Products
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    selectedIndex === index ? 'bg-gray-50' : ''
                  }`}
                >
                  {suggestion.image && (
                    <Image
                      src={suggestion.image}
                      alt={suggestion.name}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  )}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{suggestion.name}</div>
                    <div className="text-xs text-gray-500">{suggestion.category}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    ₹{suggestion.price.toLocaleString('en-IN')}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="border-b">
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs h-6"
                >
                  Clear
                </Button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectRecent(search)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {!query && trendingSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Trending
              </div>
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectRecent(search)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query && suggestions.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 mb-2">No products found for "{query}"</p>
              <Button
                variant="link"
                size="sm"
                onClick={handleSearch}
                className="text-primary"
              >
                Search anyway
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
