import { useState, useEffect } from 'react'

export interface Product {
  _id?: string
  id: number
  name: string
  description: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  badge?: string
  badgeColor?: string
  features?: string[]
  material?: string
  color?: string[]
  inStock?: boolean
  deliveryTime?: string
  dimensions?: {
    width: string
    height: string
    depth: string
  }
}

interface UseProductsOptions {
  category?: string
  limit?: number
  skip?: number
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchProducts()
  }, [options.category, options.limit, options.skip])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.category) params.append('category', options.category)
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.skip) params.append('skip', options.skip.toString())

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data)
        setTotal(data.total)
      } else {
        setError(data.error || 'Failed to fetch products')
      }
    } catch (err) {
      setError('Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchProducts()
  }

  return { products, loading, error, total, refetch }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${id}`)
    const data = await response.json()

    if (data.success) {
      return data.data
    }
    return null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function createProduct(productData: Partial<Product>): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}
