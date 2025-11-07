"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import AllProducts from "@/components/all-products"

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <AllProducts />
      <Footer />
    </main>
  )
}
