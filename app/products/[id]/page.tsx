"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import ProductDetail from "@/components/product-detail"
import { Product } from "@/lib/products-data"

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) throw new Error("Product not found")
        const data = await response.json()
        
        // Map MongoDB product to match Product interface expected by ProductDetail
        const mappedProduct = {
          ...data.data,
          id: data.data._id?.toString() || data.data.id || "",
          color: data.data.color || ["Natural"],
          material: data.data.materials?.[0] || data.data.material || "Wood",
          deliveryTime: data.data.deliveryTime || "2-3 weeks",
          rating: data.data.rating || 4.5,
          reviews: data.data.reviews || 0,
          inStock: data.data.inStock !== false,
          features: data.data.features || [],
          dimensions: data.data.dimensions || { width: "N/A", height: "N/A", depth: "N/A" },
          description: data.data.description || "",
        }
        
        setProduct(mappedProduct)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🪑</div>
          <p className="text-gray-600">Loading product...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <a href="/products" className="text-[#D4AF37] hover:underline">
            Back to Products
          </a>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <ProductDetail product={product} />
      <Footer />
    </main>
  )
}
