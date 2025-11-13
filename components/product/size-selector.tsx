'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface SizeSelectorProps {
  sizes: string[]
  selectedSize: string
  onChange: (size: string) => void
  disabled?: boolean
}

export default function SizeSelector({ 
  sizes, 
  selectedSize, 
  onChange,
  disabled = false 
}: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-900">
        Size
      </label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => !disabled && onChange(size)}
            disabled={disabled}
            className={cn(
              "px-4 py-2 border-2 rounded-lg font-medium transition-all",
              "hover:border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed",
              selectedSize === size
                ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                : "border-gray-300 bg-white text-gray-700"
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}
