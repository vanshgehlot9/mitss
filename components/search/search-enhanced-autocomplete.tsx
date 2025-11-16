'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, TrendingUp, Lightbulb, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SearchSuggestion {
  text: string
  type: 'product' | 'category' | 'suggestion'
  popularity?: number
  image?: string
  id?: string
}

interface SearchEnhancedAutocompleteProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
}

export default function SearchEnhancedAutocomplete({
  placeholder = "Search for products...",
  onSearch,
  className = ""
}: SearchEnhancedAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [didYouMean, setDidYouMean] = useState<string | null>(null)
  const [suggestedFilters, setSuggestedFilters] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [noResults, setNoResults] = useState(false)

  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches and trending from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
    
    // Load trending searches from analytics
    fetchTrendingSearches()
  }, [])

  const fetchTrendingSearches = async () => {
    try {
      const response = await fetch('/api/search-analytics?action=trending')
      const data = await response.json()
      if (data.success && data.data) {
        setTrendingSearches(data.data.slice(0, 5).map((item: any) => item.query))
      }
    } catch (error) {
      console.error('Failed to fetch trending searches:', error)
    }
  }

  // Save recent search
  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    const updated = [
      trimmed,
      ...recentSearches.filter(s => s !== trimmed)
    ].slice(0, 5)

    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  // Fetch suggestions with debounce
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      setDidYouMean(null)
      setSuggestedFilters(null)
      setNoResults(false)
      return
    }

    setIsLoading(true)
    try {
      // Fetch autocomplete suggestions
      const suggestionsResponse = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`
      )
      const suggestionsData = await suggestionsResponse.json()

      // Fetch main search results
      const searchResponse = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`
      )
      const searchData = await searchResponse.json()

      // Combine results
      const combined: SearchSuggestion[] = []

      // Add "Did you mean?" if available
      if (searchData.suggestions?.didYouMean) {
        setDidYouMean(searchData.suggestions.didYouMean)
        combined.push({
          text: `Did you mean "${searchData.suggestions.didYouMean}"?`,
          type: 'suggestion',
        })
      } else {
        setDidYouMean(null)
      }

      // Add suggested filters
      if (searchData.suggestions?.suggestedFilters) {
        setSuggestedFilters(searchData.suggestions.suggestedFilters)
      }

      // Add products from search
      if (searchData.data && searchData.data.length > 0) {
        combined.push(...searchData.data.map((product: any) => ({
          text: product.name,
          type: 'product' as const,
          id: product._id,
          image: product.image,
          popularity: product.reviews?.length || 0,
        })))
      }

      // Add autocomplete suggestions
      if (suggestionsData.suggestions && suggestionsData.suggestions.length > 0) {
        combined.push(...suggestionsData.suggestions.map((s: any) => ({
          text: s.text,
          type: s.type as 'category' | 'product',
          popularity: s.popularity,
        })))
      }

      // Check if no results
      if (searchData.total === 0) {
        setNoResults(true)
      } else {
        setNoResults(false)
      }

      setSuggestions(combined)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      if (value.trim()) {
        fetchSuggestions(value)
        setIsOpen(true)
      } else {
        setSuggestions([])
        setIsOpen(false)
      }
    }, 300)
  }

  const handleSearch = (searchQuery: string) => {
    const query = searchQuery.trim()
    if (!query) return

    saveRecentSearch(query)

    // Track search
    fetch('/api/search-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        resultsCount: suggestions.length,
        filters: suggestedFilters,
      }),
    }).catch(console.error)

    onSearch?.(query)
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsOpen(false)
    setQuery('')
  }

  const handleSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product' && suggestion.id) {
      router.push(`/products/${suggestion.id}`)
      setIsOpen(false)
      setQuery('')
    } else {
      handleSearch(suggestion.text)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex])
        } else if (query.trim()) {
          handleSearch(query)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setSuggestions([])
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border border-gray-300 border-t-gray-600" />
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {/* Did you mean section */}
              {didYouMean && (
                <div className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleSearch(didYouMean)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
                  >
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span>Did you mean <strong>"{didYouMean}"</strong>?</span>
                  </button>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  onClick={() => handleSelect(suggestion)}
                  className={cn(
                    "w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-100",
                    selectedIndex === index && "bg-gray-100",
                    suggestion.type === 'suggestion' && "bg-blue-50"
                  )}
                >
                  {suggestion.type === 'product' && suggestion.image && (
                    <Image
                      src={suggestion.image}
                      alt={suggestion.text}
                      width={32}
                      height={32}
                      className="rounded object-cover"
                    />
                  )}
                  {suggestion.type === 'category' && (
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-semibold">
                      C
                    </div>
                  )}
                  {suggestion.type === 'suggestion' && (
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {suggestion.text}
                    </p>
                    {suggestion.popularity && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {suggestion.popularity} views
                      </p>
                    )}
                  </div>
                </button>
              ))}

              {/* Suggested filters */}
              {suggestedFilters && (
                <div className="px-4 py-3 border-t bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Suggested Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedFilters.categories?.map((cat: string) => (
                      <button
                        key={cat}
                        onClick={() => handleSearch(`${query} ${cat}`)}
                        className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : noResults ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No results found for "{query}"</p>
              {didYouMean && (
                <Button
                  variant="link"
                  onClick={() => handleSearch(didYouMean)}
                  className="mt-2"
                >
                  Search for "{didYouMean}" instead?
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="px-4 py-3 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Recent Searches
                    </p>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(search)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <Clock className="h-3 w-3 text-gray-400" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending searches */}
              {trendingSearches.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-2 mb-2">
                    <TrendingUp className="h-3 w-3" />
                    Trending Now
                  </p>
                  <div className="space-y-1">
                    {trendingSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(search)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
