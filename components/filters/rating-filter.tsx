'use client'

import { Star } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface RatingFilterProps {
  selectedRating: number
  onChange: (rating: number) => void
}

export default function RatingFilter({ selectedRating, onChange }: RatingFilterProps) {
  const ratings = [5, 4, 3, 2, 1]

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">Minimum Rating</Label>
      <div className="space-y-2">
        {ratings.map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={cn(
              "flex items-center gap-2 w-full p-2 rounded-lg transition-colors hover:bg-gray-100",
              selectedRating === rating && "bg-[#D4AF37]/10 border border-[#D4AF37]"
            )}
          >
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm">& Up</span>
          </button>
        ))}
        <button
          onClick={() => onChange(0)}
          className={cn(
            "flex items-center gap-2 w-full p-2 rounded-lg transition-colors hover:bg-gray-100",
            selectedRating === 0 && "bg-[#D4AF37]/10 border border-[#D4AF37]"
          )}
        >
          <span className="text-sm">All Ratings</span>
        </button>
      </div>
    </div>
  )
}
