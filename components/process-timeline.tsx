"use client"

import { motion } from "framer-motion"
import { ClipboardList, Palette, Hammer, Truck, CheckCircle2 } from "lucide-react"

const steps = [
  {
    icon: ClipboardList,
    title: "Consultation",
    description: "Share your vision with our design experts. We'll understand your space, style preferences, and budget.",
    color: "from-blue-500 to-cyan-500",
    duration: "Day 1-2"
  },
  {
    icon: Palette,
    title: "Design & Planning",
    description: "Receive custom 3D renderings and material samples. Refine every detail until it's perfect.",
    color: "from-purple-500 to-pink-500",
    duration: "Day 3-7"
  },
  {
    icon: Hammer,
    title: "Craftsmanship",
    description: "Our master artisans handcraft your furniture using premium materials and traditional techniques.",
    color: "from-[#D4AF37] to-yellow-500",
    duration: "Week 2-4"
  },
  {
    icon: Truck,
    title: "Delivery & Setup",
    description: "White-glove delivery service brings your furniture home and our team handles complete installation.",
    color: "from-green-500 to-emerald-500",
    duration: "Week 5"
  },
  {
    icon: CheckCircle2,
    title: "Quality Assurance",
    description: "Final inspection and walkthrough. We ensure everything meets our exacting standards and your expectations.",
    color: "from-orange-500 to-red-500",
    duration: "Final Step"
  }
]

export default function ProcessTimeline() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Our <span className="text-[#D4AF37]">Creation Process</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From concept to completion - your journey to perfect furniture
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop Timeline */}
          <div className="hidden md:block relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/50 to-transparent" />

            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 0

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative mb-16 flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`w-5/12 ${isEven ? 'text-right pr-12' : 'text-left pl-12'}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-500"
                    >
                      <div className={`flex items-center gap-3 mb-3 ${isEven ? 'justify-end' : 'justify-start'}`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} p-0.5`}>
                          <div className="w-full h-full bg-background rounded-xl flex items-center justify-center">
                            <Icon className="w-6 h-6 text-[#D4AF37]" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{step.title}</h3>
                          <p className="text-sm text-[#D4AF37]">{step.duration}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </motion.div>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                      className={`w-6 h-6 rounded-full bg-gradient-to-br ${step.color} ring-4 ring-background`}
                    />
                  </div>

                  {/* Empty space */}
                  <div className="w-5/12" />
                </motion.div>
              )
            })}
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-12"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Timeline line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-[#D4AF37] to-transparent -mb-8" />
                  )}

                  {/* Content */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      <span className="text-xs text-[#D4AF37] font-semibold">{step.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
