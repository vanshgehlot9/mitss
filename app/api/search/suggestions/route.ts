import { NextResponse } from 'next/server'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    const searchQuery = q.trim().toLowerCase()

    // Search products by name (case-insensitive search)
    const productsRef = collection(db, 'products')
    
    // Note: Firestore doesn't support full-text search natively
    // For production, consider using Algolia or Elasticsearch
    // This is a basic implementation using array-contains
    
    const suggestions: any[] = []

    // Get all products and filter in memory (not ideal for large datasets)
    const snapshot = await getDocs(query(productsRef, limit(50)))
    
    snapshot.forEach((doc) => {
      const product = doc.data()
      const productName = product.name?.toLowerCase() || ''
      const category = product.category?.toLowerCase() || ''
      
      if (productName.includes(searchQuery) || category.includes(searchQuery)) {
        suggestions.push({
          id: doc.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.images?.[0] || product.image,
          type: 'product'
        })
      }
    })

    // Sort by relevance (exact matches first)
    suggestions.sort((a, b) => {
      const aExact = a.name.toLowerCase().startsWith(searchQuery)
      const bExact = b.name.toLowerCase().startsWith(searchQuery)
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      return 0
    })

    // Return top 8 suggestions
    return NextResponse.json({ 
      suggestions: suggestions.slice(0, 8)
    })

  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
