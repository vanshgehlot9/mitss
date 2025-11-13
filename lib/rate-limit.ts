// Rate limiting utility for API routes
// Simple in-memory rate limiting (use Redis for production at scale)

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per interval
}

export const rateLimitConfigs = {
  // Strict limits for sensitive endpoints
  auth: { interval: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  registration: { interval: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  passwordReset: { interval: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  
  // Moderate limits for write operations
  createOrder: { interval: 60 * 1000, maxRequests: 10 }, // 10 per minute
  contactForm: { interval: 60 * 60 * 1000, maxRequests: 5 }, // 5 per hour
  review: { interval: 60 * 60 * 1000, maxRequests: 10 }, // 10 per hour
  
  // Generous limits for read operations
  api: { interval: 60 * 1000, maxRequests: 60 }, // 60 per minute
  search: { interval: 60 * 1000, maxRequests: 30 }, // 30 per minute
  
  // Default
  default: { interval: 60 * 1000, maxRequests: 30 }, // 30 per minute
}

export function checkRateLimit(
  identifier: string, // Usually IP address or user ID
  config: RateLimitConfig = rateLimitConfigs.default
): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const key = `${identifier}`
  
  // Get or create entry
  let entry = store[key]
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 1,
      resetTime: now + config.interval
    }
    store[key] = entry
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime
    }
  }
  
  // Increment count
  entry.count++
  
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

export function getRateLimitHeaders(
  allowed: boolean,
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(remaining + (allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(Math.floor(resetTime / 1000)),
    ...(allowed ? {} : { 'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)) })
  }
}

// Helper to get client IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback - not reliable in production
  return 'unknown'
}
