'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Color {
  name: string
  value: string // hex color
}

interface ColorSwatchesProps {
  colors: Color[]
  selectedColor: string
  onChange: (color: string) => void
  disabled?: boolean
}

export default function ColorSwatches({ 
  colors, 
  selectedColor, 
  onChange,
  disabled = false 
}: ColorSwatchesProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-900">
        Color
      </label>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => !disabled && onChange(color.name)}
            disabled={disabled}
            className={cn(
              "relative w-10 h-10 rounded-full border-2 transition-all",
              "hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed",
              selectedColor === color.name
                ? "border-[#D4AF37] ring-2 ring-[#D4AF37] ring-offset-2"
                : "border-gray-300"
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {selectedColor === color.name && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-5 h-5 text-white drop-shadow-lg" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
      {selectedColor && (
        <p className="text-sm text-gray-600">
          Selected: <span className="font-medium">{selectedColor}</span>
        </p>
      )}
    </div>
  )
}
