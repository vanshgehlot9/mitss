export interface Product {
  id: number
  name: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  badge?: string
  badgeColor?: string
  description: string
  features: string[]
  dimensions: {
    width: string
    height: string
    depth: string
  }
  material: string
  color: string[]
  inStock: boolean
  deliveryTime: string
  isExclusive?: boolean  // New field: true for WhatsApp-only, false for regular buy
  exclusivePrice?: string  // e.g., "Contact for Price" or "Starting from ₹50,000"
}

// Empty products array - to be populated from backend
export const products: Product[] = []

export function getAllProducts(): Product[] {
  return products
}

export function getProductById(id: number): Product | undefined {
  return products.find(product => product.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(product => product.category === category)
}

export function getFeaturedProducts(count: number = 3): Product[] {
  return products.slice(0, count)
}
