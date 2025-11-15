"use client"
import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import Categories from "@/components/categories"
import FeaturedProducts from "@/components/featured-products"
import DecorShowcase from "@/components/decor-showcase"
import CraftStories from "@/components/craft-stories"
import AboutStory from "@/components/about-story"
import Testimonials from "@/components/testimonials"
import Gallery from "@/components/gallery"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <DecorShowcase />
      <CraftStories />
      <AboutStory />
      <Testimonials />
      <Gallery />
      <Footer />
    </main>
  )
}
