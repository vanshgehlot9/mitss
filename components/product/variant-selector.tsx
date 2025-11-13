'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import SizeSelector from './size-selector'
import ColorSwatches from './color-swatches'
import MaterialSelector from './material-selector'
import BulkPricingBadge from './bulk-pricing-badge'

interface ProductVariant {
  id: string
  size?: string
  color?: string
  material?: string
  price: number
  originalPrice?: number
  stock: number
  sku: string
  images?: string[]
}

interface BulkPricing {
  minQuantity: number
  discount: number
  type: 'percentage' | 'fixed'
}

interface VariantSelectorProps {
  variants: ProductVariant[]
  onVariantChange: (variant: ProductVariant) => void
  defaultVariantId?: string
  bulkPricing?: BulkPricing[]
}

export default function VariantSelector({ 
  variants, 
  onVariantChange,
  defaultVariantId,
  bulkPricing = []
}: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    variants.find(v => v.id === defaultVariantId) || variants[0]
  )

  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[]
  
  const colorMap = new Map<string, string>()
  const colorHexMap: { [key: string]: string } = {
    'Red': '#EF4444',
    'Blue': '#3B82F6',
    'Green': '#10B981',
    'Yellow': '#EAB308',
    'Purple': '#A855F7',
    'Pink': '#EC4899',
    'Black': '#000000',
    'White': '#FFFFFF',
    'Gray': '#6B7280',
    'Brown': '#92400E',
    'Orange': '#F97316',
    'Navy': '#1E3A8A',
    'Gold': '#D4AF37',
    'Silver': '#C0C0C0',
    'Beige': '#F5F5DC',
  }
  
  variants.forEach(v => {
    if (v.color && !colorMap.has(v.color)) {
      colorMap.set(v.color, colorHexMap[v.color] || '#9CA3AF')
    }
  })
  
  const colors = Array.from(colorMap.entries()).map(([name, value]) => ({ name, value }))
  const materials = [...new Set(variants.map(v => v.material).filter(Boolean))] as string[]

  const [selectedSize, setSelectedSize] = useState(selectedVariant.size || '')
  const [selectedColor, setSelectedColor] = useState(selectedVariant.color || '')
  const [selectedMaterial, setSelectedMaterial] = useState(selectedVariant.material || '')

  useEffect(() => {
    const matchingVariant = variants.find(v => 
      (!selectedSize || v.size === selectedSize) &&
      (!selectedColor || v.color === selectedColor) &&
      (!selectedMaterial || v.material === selectedMaterial)
    )

    if (matchingVariant) {
      setSelectedVariant(matchingVariant)
      onVariantChange(matchingVariant)
    }
  }, [selectedSize, selectedColor, selectedMaterial, variants, onVariantChange])

  const handleSizeChange = (size: string) => setSelectedSize(size)
  const handleColorChange = (color: string) => setSelectedColor(color)
  const handleMaterialChange = (material: string) => setSelectedMaterial(material)

  const discount = selectedVariant.originalPrice 
    ? Math.round(((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100)
    : 0

  const isInStock = selectedVariant && selectedVariant.stock > 0
  const stockLevel = selectedVariant?.stock || 0

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-[#D4AF37]">
          ₹{selectedVariant.price.toLocaleString('en-IN')}
        </span>
        {selectedVariant.originalPrice && (
          <>
            <span className="text-xl text-gray-500 line-through">
              ₹{selectedVariant.originalPrice.toLocaleString('en-IN')}
            </span>
            <Badge variant="destructive">{discount}% OFF</Badge>
          </>
        )}
      </div>

      {sizes.length > 0 && (
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onChange={handleSizeChange}
        />
      )}

      {colors.length > 0 && (
        <ColorSwatches
          colors={colors}
          selectedColor={selectedColor}
          onChange={handleColorChange}
        />
      )}

      {materials.length > 0 && (
        <MaterialSelector
          materials={materials}
          selectedMaterial={selectedMaterial}
          onChange={handleMaterialChange}
        />
      )}

      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
        <div className="flex items-center gap-2">
          {isInStock ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                In Stock ({stockLevel} available)
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-600 font-medium">
                Out of Stock
              </span>
            </>
          )}
        </div>

        {isInStock && stockLevel <= 5 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-600 font-medium">
              Only {stockLevel} left - Order soon!
            </span>
          </div>
        )}

        <p className="text-xs text-gray-500">
          SKU: {selectedVariant.sku}
        </p>
      </div>

      {bulkPricing.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Bulk Discounts:</p>
          <div className="flex flex-wrap gap-2">
            {bulkPricing.map((pricing, index) => (
              <BulkPricingBadge
                key={index}
                quantity={pricing.minQuantity}
                discount={pricing.discount}
                type={pricing.type}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
