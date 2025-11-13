'use client'

import { Badge } from '@/components/ui/badge'
import { Tag, TrendingDown } from 'lucide-react'

interface BulkPricingBadgeProps {
  quantity: number
  discount: number
  type: 'percentage' | 'fixed'
}

export default function BulkPricingBadge({ quantity, discount, type }: BulkPricingBadgeProps) {
  const displayDiscount = type === 'percentage' 
    ? `${discount}% OFF` 
    : `₹${discount} OFF`

  return (
    <Badge 
      variant="secondary" 
      className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
    >
      <Tag className="w-3 h-3 mr-1" />
      <span className="text-xs font-semibold">
        Buy {quantity}+ & Save {displayDiscount}
      </span>
    </Badge>
  )
}
