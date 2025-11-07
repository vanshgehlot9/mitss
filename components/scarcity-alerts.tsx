"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, TrendingUp, Users, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ScarcityAlerts() {
  const [showAlert, setShowAlert] = useState(false)
  const [alertType, setAlertType] = useState<"stock" | "viewing" | "purchase">("stock")

  useEffect(() => {
    // Randomly show alerts every 10-15 seconds
    const showRandomAlert = () => {
      const types: ("stock" | "viewing" | "purchase")[] = ["stock", "viewing", "purchase"]
      const randomType = types[Math.floor(Math.random() * types.length)]
      setAlertType(randomType)
      setShowAlert(true)

      setTimeout(() => setShowAlert(false), 5000)
    }

    const interval = setInterval(showRandomAlert, 15000)
    
    // Show first alert after 5 seconds
    setTimeout(showRandomAlert, 5000)

    return () => clearInterval(interval)
  }, [])

  const alerts = {
    stock: {
      icon: <AlertTriangle className="w-5 h-5" />,
      text: "Only 3 items left in stock!",
      color: "bg-red-600",
      badge: "Low Stock"
    },
    viewing: {
      icon: <Eye className="w-5 h-5" />,
      text: "12 people are viewing this right now",
      color: "bg-blue-600",
      badge: "Popular"
    },
    purchase: {
      icon: <TrendingUp className="w-5 h-5" />,
      text: "Someone just purchased this item from Mumbai",
      color: "bg-green-600",
      badge: "Hot Item"
    }
  }

  const currentAlert = alerts[alertType]

  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          className="fixed bottom-24 left-4 z-40"
        >
          <div className={`${currentAlert.color} text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {currentAlert.icon}
              </div>
              <div className="flex-1">
                <Badge className="bg-white/20 text-white mb-1">
                  {currentAlert.badge}
                </Badge>
                <p className="text-sm font-medium">{currentAlert.text}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function LowStockBadge({ stock }: { stock: number }) {
  if (stock > 10) return null

  return (
    <Badge variant="destructive" className="font-semibold flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" />
      Only {stock} left!
    </Badge>
  )
}

export function ViewingNowIndicator({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Users className="w-4 h-4 text-blue-600" />
      <span className="font-medium text-blue-600">{count} people</span>
      <span>viewing now</span>
    </div>
  )
}
