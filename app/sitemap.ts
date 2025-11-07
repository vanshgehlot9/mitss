import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mitss.store'
  
  // Static pages
  const staticPages = [
    '',
    '/products',
    '/contact',
    '/about',
    '/custom-design',
    '/deals',
    '/wishlist',
    '/compare',
    '/gift-registry',
    '/track-order',
    '/account',
    '/sustainability',
    '/warranty',
    '/shipping-policy',
    '/return-refund',
    '/privacy-policy',
    '/terms-conditions',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Add product categories
  const categories = [
    'Living Room',
    'Bedroom',
    'Dining',
    'Handicrafts',
    'Decor',
  ].map((category) => ({
    url: `${baseUrl}/products?category=${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...categories]
}
