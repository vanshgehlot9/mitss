"use client"

import { Suspense } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import AllProducts from "@/components/all-products"

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-32 text-center">
          <p>Loading products...</p>
        </div>
      }>
        <AllProducts />
      </Suspense>
      <Footer />
    </main>
  )
}
