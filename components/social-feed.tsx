"use client"

import { motion } from "framer-motion"
import { Instagram, Facebook, Twitter, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

const socialPosts = [
  {
    platform: "Instagram",
    icon: Instagram,
    image: "📸",
    likes: "2.4k",
    comments: "156",
    caption: "Stunning bedroom transformation for the Johnson family ✨",
    color: "from-pink-500 to-purple-500"
  },
  {
    platform: "Facebook",
    icon: Facebook,
    image: "🛋️",
    likes: "1.8k",
    comments: "89",
    caption: "Our new luxury sofa collection is here! 🎉",
    color: "from-blue-500 to-cyan-500"
  },
  {
    platform: "Instagram",
    icon: Instagram,
    image: "🪑",
    likes: "3.1k",
    comments: "203",
    caption: "Behind the scenes: Crafting your dreams 🔨",
    color: "from-orange-500 to-red-500"
  },
  {
    platform: "Twitter",
    icon: Twitter,
    image: "🎨",
    likes: "956",
    comments: "47",
    caption: "Custom design process from sketch to reality 🖌️",
    color: "from-blue-400 to-blue-600"
  }
]

export default function SocialFeed() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Follow Our <span className="text-[#D4AF37]">Journey</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Stay connected and see our latest projects and happy customers
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="gap-2 hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]">
              <Instagram className="w-4 h-4" />
              @mitss_furniture
            </Button>
            <Button variant="outline" className="gap-2 hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]">
              <Facebook className="w-4 h-4" />
              MITSS Furniture
            </Button>
            <Button variant="outline" className="gap-2 hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]">
              <Twitter className="w-4 h-4" />
              @mitss_design
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {socialPosts.map((post, index) => {
            const Icon = post.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-card border border-border hover:shadow-xl hover:shadow-[#D4AF37]/10 transition-all duration-500">
                  {/* Image placeholder */}
                  <div className="relative h-64 bg-gradient-to-br from-[#1A2642] to-[#2A3652] flex items-center justify-center">
                    <span className="text-7xl">{post.image}</span>
                    
                    {/* Platform badge */}
                    <div className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br ${post.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm mb-3 line-clamp-2">{post.caption}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">Share your MITSS furniture using #MITSSHome</p>
          <Button size="lg" className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
            <MapPin className="w-5 h-5 mr-2" />
            Tag Us in Your Posts
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
