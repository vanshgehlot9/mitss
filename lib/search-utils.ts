// Advanced search and filter utilities

export interface SearchFilters {
  query?: string
  categories?: string[]
  priceRange?: {
    min: number
    max: number
  }
  rating?: number // Minimum rating (1-5)
  availability?: 'in_stock' | 'out_of_stock' | 'pre_order' | 'all'
  sortBy?: 'price_low' | 'price_high' | 'popularity' | 'newest' | 'rating' | 'name'
  page?: number
  limit?: number
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'query'
  text: string
  productId?: number
  category?: string
  count?: number
}

// Search query normalization and typo tolerance
export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
}

// Common typo corrections and synonyms
const SEARCH_SYNONYMS: Record<string, string[]> = {
  'sofa': ['couch', 'settee', 'divan'],
  'table': ['desk', 'stand'],
  'chair': ['seat', 'stool'],
  'bed': ['cot', 'bedframe'],
  'cabinet': ['cupboard', 'wardrobe', 'closet'],
  'shelf': ['rack', 'bookcase'],
  'wood': ['wooden', 'timber'],
  'leather': ['hide'],
  'modern': ['contemporary', 'current'],
  'traditional': ['classic', 'vintage'],
}

const COMMON_TYPOS: Record<string, string> = {
  'soffa': 'sofa',
  'tabel': 'table',
  'chiar': 'chair',
  'beed': 'bed',
  'cabnit': 'cabinet',
  'wodden': 'wooden',
}

export function correctTypos(query: string): string {
  const words = query.split(' ')
  return words.map(word => COMMON_TYPOS[word] || word).join(' ')
}

export function expandWithSynonyms(query: string): string[] {
  const words = normalizeSearchQuery(query).split(' ')
  const expanded = new Set<string>([query])
  
  words.forEach(word => {
    Object.entries(SEARCH_SYNONYMS).forEach(([key, synonyms]) => {
      if (word === key || synonyms.includes(word)) {
        synonyms.forEach(syn => {
          const newQuery = query.replace(new RegExp(word, 'gi'), syn)
          expanded.add(newQuery)
        })
        expanded.add(query.replace(new RegExp(word, 'gi'), key))
      }
    })
  })
  
  return Array.from(expanded)
}

// Build search query for database
export function buildSearchQuery(filters: SearchFilters): any {
  const conditions: any = {}
  
  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    conditions.category = { $in: filters.categories }
  }
  
  // Price range filter
  if (filters.priceRange) {
    conditions.price = {
      $gte: filters.priceRange.min,
      $lte: filters.priceRange.max
    }
  }
  
  // Rating filter
  if (filters.rating) {
    conditions.averageRating = { $gte: filters.rating }
  }
  
  // Availability filter
  if (filters.availability && filters.availability !== 'all') {
    switch (filters.availability) {
      case 'in_stock':
        conditions.stock = { $gt: 0 }
        break
      case 'out_of_stock':
        conditions.stock = { $eq: 0 }
        conditions.allowPreOrder = { $ne: true }
        break
      case 'pre_order':
        conditions.allowPreOrder = true
        break
    }
  }
  
  // Text search
  if (filters.query) {
    const normalizedQuery = normalizeSearchQuery(filters.query)
    const correctedQuery = correctTypos(normalizedQuery)
    const synonymQueries = expandWithSynonyms(correctedQuery)
    
    // MongoDB text search or regex
    conditions.$or = synonymQueries.map(q => ({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    }))
  }
  
  return conditions
}

// Build sort query
export function buildSortQuery(sortBy?: string): any {
  switch (sortBy) {
    case 'price_low':
      return { price: 1 }
    case 'price_high':
      return { price: -1 }
    case 'popularity':
      return { soldCount: -1, averageRating: -1 }
    case 'newest':
      return { createdAt: -1 }
    case 'rating':
      return { averageRating: -1, totalReviews: -1 }
    case 'name':
      return { name: 1 }
    default:
      return { createdAt: -1 }
  }
}

// Track search analytics
export interface SearchAnalytics {
  query: string
  filters: SearchFilters
  resultsCount: number
  userId?: string
  timestamp: Date
}

export async function trackSearchAnalytics(analytics: SearchAnalytics) {
  try {
    // Store in database for analytics
    // This helps understand what users are searching for
    console.log('Search Analytics:', analytics)
    
    // In production, store this in a separate collection
    // await addDoc(collection(db, 'searchAnalytics'), analytics)
  } catch (error) {
    console.error('Error tracking search analytics:', error)
  }
}

// Generate search suggestions
export function generateSearchSuggestions(
  query: string,
  recentSearches: string[],
  popularSearches: string[],
  products: any[]
): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = []
  const normalizedQuery = normalizeSearchQuery(query)
  
  if (normalizedQuery.length < 2) return suggestions
  
  // Recent searches
  recentSearches
    .filter(search => search.toLowerCase().includes(normalizedQuery))
    .slice(0, 3)
    .forEach(search => {
      suggestions.push({
        type: 'query',
        text: search
      })
    })
  
  // Matching products
  products
    .filter(p => p.name.toLowerCase().includes(normalizedQuery))
    .slice(0, 5)
    .forEach(product => {
      suggestions.push({
        type: 'product',
        text: product.name,
        productId: product.id
      })
    })
  
  // Popular searches
  popularSearches
    .filter(search => 
      search.toLowerCase().includes(normalizedQuery) &&
      !suggestions.find(s => s.text === search)
    )
    .slice(0, 3)
    .forEach(search => {
      suggestions.push({
        type: 'query',
        text: search
      })
    })
  
  return suggestions.slice(0, 10)
}

// Price range calculation
export function calculatePriceRanges(products: any[]): Array<{
  label: string
  min: number
  max: number
  count: number
}> {
  if (products.length === 0) return []
  
  const prices = products.map(p => p.price).sort((a, b) => a - b)
  const minPrice = prices[0]
  const maxPrice = prices[prices.length - 1]
  const range = maxPrice - minPrice
  
  const ranges = [
    { label: 'Under ₹10,000', min: 0, max: 10000 },
    { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
    { label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
    { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
    { label: 'Over ₹1,00,000', min: 100000, max: Infinity },
  ]
  
  return ranges.map(range => ({
    ...range,
    count: products.filter(p => p.price >= range.min && p.price < range.max).length
  })).filter(r => r.count > 0)
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 * Helps with "Did you mean?" suggestions
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(0))

  for (let i = 0; i <= str1.length; i++) {
    track[0][i] = i
  }
  for (let j = 0; j <= str2.length; j++) {
    track[j][0] = j
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      )
    }
  }

  return track[str2.length][str1.length]
}

/**
 * Get "Did you mean?" suggestions using similarity matching
 */
export function getDidYouMeanSuggestion(
  query: string,
  suggestions: string[],
  maxDistance: number = 2
): string | null {
  const normalized = normalizeSearchQuery(query)

  let closestMatch: { word: string; distance: number } | null = null

  suggestions.forEach((suggestion) => {
    const distance = levenshteinDistance(normalized, suggestion.toLowerCase())
    if (distance <= maxDistance) {
      if (!closestMatch || distance < closestMatch.distance) {
        closestMatch = { word: suggestion, distance }
      }
    }
  })

  return closestMatch?.word || null
}

/**
 * Save search query for analytics
 */
export async function trackSearchQuery(
  userId: string | null,
  query: string,
  resultsCount: number,
  filters?: SearchFilters
) {
  try {
    const searchRecord = {
      userId: userId || 'guest',
      query: normalizeSearchQuery(query),
      originalQuery: query,
      resultsCount,
      filters: filters || {},
      timestamp: new Date(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    }

    // Send to analytics endpoint
    if (typeof fetch !== 'undefined') {
      await fetch('/api/search-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRecord),
      }).catch((err) => console.error('Analytics tracking error:', err))
    }
  } catch (error) {
    console.error('Track search error:', error)
  }
}

/**
 * Get top search keywords (for admin analytics)
 */
export function getTopSearchKeywords(limit: number = 10) {
  // This would typically come from your analytics collection
  // For now, return empty - implement via /api/search-analytics endpoint
  return []
}

/**
 * Advanced filter suggestion based on search context
 */
export function getSuggestedFilters(query: string): Partial<SearchFilters> {
  const normalized = normalizeSearchQuery(query)
  const suggestions: Partial<SearchFilters> = {}

  // Auto-detect room type
  if (normalized.includes('bedroom')) {
    suggestions.categories = ['Beds', 'Wardrobes', 'Nightstands']
  } else if (normalized.includes('living')) {
    suggestions.categories = ['Sofas', 'Coffee Tables', 'TV Units']
  } else if (normalized.includes('dining')) {
    suggestions.categories = ['Dining Tables', 'Chairs', 'Sideboards']
  } else if (normalized.includes('kitchen')) {
    suggestions.categories = ['Bar Stools', 'Kitchen Islands']
  }

  // Auto-detect price range if mentioned
  if (normalized.includes('cheap') || normalized.includes('budget')) {
    suggestions.priceRange = { min: 0, max: 15000 }
  } else if (normalized.includes('luxury') || normalized.includes('premium')) {
    suggestions.priceRange = { min: 100000, max: Infinity }
  }

  // Auto-detect style
  if (normalized.includes('modern') || normalized.includes('contemporary')) {
    suggestions.sortBy = 'newest'
  }

  return suggestions
}

