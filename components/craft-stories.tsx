"use client"

import { motion } from "framer-motion"
import { Star, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const stories = [
  {
    id: 1,
    title: "Allycia Premium Solid Wood Shoe Rack With 10 Cushioned Seats (Mango Wood...)",
    image: "👨‍🔧",
    discount: "41%",
    price: "₹16,989",
    originalPrice: "₹28,999",
    rating: 4.5,
    reviews: 19,
    description: "Handcrafted by skilled artisans"
  },
  {
    id: 2,
    title: "Avelis Premium Outdoor Chair with Rattan-Style Weave & PP Durability...",
    image: "🪑",
    discount: "24%",
    price: "₹4,589",
    originalPrice: "₹5,999",
    rating: 4.3,
    reviews: 71,
    description: "Sustainable outdoor furniture"
  },
  {
    id: 3,
    title: "Hamona Premium Ash Wood TV Unit With Drawers And Cabinets (Ash Wood, Walnu...",
    image: "📺",
    discount: "32%",
    price: "₹44,989",
    originalPrice: "₹66,982",
    rating: 4.0,
    reviews: 13,
    description: "Modern meets traditional design"
  },
  {
    id: 4,
    title: "Lorenz 3 Seater Sofa (Velvet, Dark Olive Green)",
    image: "🛋️",
    discount: "40%",
    price: "₹44,989",
    originalPrice: "₹74,682",
    rating: 4.5,
    reviews: 162,
    description: "Luxurious comfort redefined"
  },
  {
    id: 5,
    title: "Clouda Modern L Shaped Sofa Boucle Fabric (White)",
    image: "🛋️",
    discount: "27%",
    price: "₹6,689",
    originalPrice: "₹9,199",
    rating: 5.0,
    reviews: 20,
    description: "Contemporary elegance"
  }
]

export default function CraftStories() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A2642] mb-4">
            Stories Behind the <span className="text-[#D4AF37]">Style</span>
          </h2>
          <p className="text-lg text-[#1A2642]/60 max-w-2xl mx-auto">
            Every piece tells a story of craftsmanship and dedication
          </p>
        </motion.div>

        <div className="relative">
          <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-72 snap-start group"
              >
                <Link href={`/products/${story.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-[#E8DCC4] to-[#D4C4A8] overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                        <span className="text-8xl opacity-40">{story.image}</span>
                      </div>
                      
                      {/* Discount Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" />
                          {story.discount}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-[#1A2642] mb-2 line-clamp-2 text-sm group-hover:text-[#D4AF37] transition-colors min-h-[2.5rem]">
                        {story.title}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center bg-orange-50 px-2 py-1 rounded">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(story.rating)
                                  ? "fill-orange-400 text-orange-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">({story.reviews})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-bold text-[#1A2642]">{story.price}</span>
                        <span className="text-sm text-gray-400 line-through">{story.originalPrice}</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#1A2642]/60 italic">
                        {story.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
