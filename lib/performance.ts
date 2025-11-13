// Performance optimization utilities for Mitss E-commerce

// Image optimization configuration for Next.js
export const imageConfig = {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  quality: 80,
  minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
}

// CDN configuration
export const cdnConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
  staticAssets: {
    images: '/images',
    videos: '/videos',
    documents: '/documents',
  },
  // Cloudflare, AWS CloudFront, or Vercel Edge Network
  provider: process.env.CDN_PROVIDER || 'vercel',
}

// Image optimization helper
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  quality: number = 80
): string {
  if (!src) return ''

  // If using CDN
  if (cdnConfig.baseUrl) {
    const params = new URLSearchParams()
    if (width) params.append('w', width.toString())
    params.append('q', quality.toString())
    params.append('f', 'webp')

    return `${cdnConfig.baseUrl}${src}?${params.toString()}`
  }

  // Use Next.js Image Optimization
  return src
}

// Lazy loading configuration
export const lazyLoadConfig = {
  threshold: 0.1, // Start loading when 10% visible
  rootMargin: '50px', // Start loading 50px before viewport
}

// Debounce utility for search and filters
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Cache utilities
export class CacheManager {
  private cache: Map<string, { data: any; expiry: number }> = new Map()

  set(key: string, data: any, ttl: number = 300000): void {
    // Default 5 minutes
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const apiCache = new CacheManager()

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => apiCache.cleanup(), 5 * 60 * 1000)
}

// API caching helper for GET requests
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  ttl: number = 300000
): Promise<T> {
  const cacheKey = `fetch:${url}`

  // Check cache first
  const cached = apiCache.get<T>(cacheKey)
  if (cached) {
    return cached
  }

  // Fetch from API
  const response = await fetch(url, options)
  const data = await response.json()

  // Cache the result
  apiCache.set(cacheKey, data, ttl)

  return data
}

// Preload critical images
export function preloadImage(src: string): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  document.head.appendChild(link)
}

// Preload multiple images
export function preloadImages(urls: string[]): void {
  urls.forEach(preloadImage)
}

// Intersection Observer for lazy loading
export function createLazyLoadObserver(
  callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver {
  if (typeof window === 'undefined') {
    return null as any
  }

  return new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry)
        }
      })
    },
    {
      threshold: lazyLoadConfig.threshold,
      rootMargin: lazyLoadConfig.rootMargin,
    }
  )
}

// Bundle size optimization - Dynamic imports
export async function loadComponent<T>(
  importFn: () => Promise<{ default: T }>
): Promise<T> {
  const module = await importFn()
  return module.default
}

// Prefetch pages
export function prefetchPage(url: string): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  document.head.appendChild(link)
}

// Web Vitals tracking
export interface WebVitalsMetrics {
  CLS: number // Cumulative Layout Shift
  FID: number // First Input Delay
  FCP: number // First Contentful Paint
  LCP: number // Largest Contentful Paint
  TTFB: number // Time to First Byte
}

export function reportWebVitals(metric: any): void {
  // Send to analytics service
  console.log(metric)

  // Example: Send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    })
  }
}

// Service Worker registration helper
export function registerServiceWorker(): void {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration)
        })
        .catch(err => {
          console.log('SW registration failed:', err)
        })
    })
  }
}

// Resource hints
export const resourceHints = {
  // DNS prefetch for external domains
  dnsPrefetch: [
    'https://fonts.googleapis.com',
    'https://www.google-analytics.com',
    'https://firebasestorage.googleapis.com',
  ],

  // Preconnect for critical resources
  preconnect: [
    'https://fonts.gstatic.com',
    'https://firestore.googleapis.com',
  ],

  // Prefetch for likely navigation
  prefetch: [
    '/products',
    '/deals',
    '/contact',
  ],
}

// Critical CSS extraction (for above-the-fold content)
export const criticalStyles = `
  /* Add critical CSS here for faster initial render */
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
  .hero { min-height: 100vh; }
  .loading { display: flex; align-items: center; justify-content: center; }
`

// Compression check
export function checkCompression(): boolean {
  if (typeof window === 'undefined') return false

  const headers = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  return headers.transferSize < headers.encodedBodySize
}
