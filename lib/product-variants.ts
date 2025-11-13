// Product variants system for size, color, material, etc.

export interface ProductVariant {
  id: string
  sku: string
  name: string // e.g., "Large - Brown - Teak Wood"
  attributes: {
    size?: string
    color?: string
    material?: string
    finish?: string
    [key: string]: string | undefined
  }
  price: number // Can be different from base price
  compareAtPrice?: number
  stock: number
  images: string[]
  isAvailable: boolean
  preOrder?: {
    enabled: boolean
    estimatedShipDate?: string
    maxQuantity?: number
  }
}

export interface ProductWithVariants {
  id: number
  name: string
  basePrice: number
  description: string
  category: string
  images: string[]
  
  // Variant configuration
  hasVariants: boolean
  variants: ProductVariant[]
  variantOptions: {
    sizes?: string[]
    colors?: string[]
    materials?: string[]
    finishes?: string[]
  }
  
  // Bulk pricing
  bulkPricing?: BulkPricing[]
  
  // Stock across all variants
  totalStock: number
  lowStockThreshold: number
  
  // Pre-order settings
  allowPreOrder: boolean
  preOrderDeposit?: number // Percentage or fixed amount
}

export interface BulkPricing {
  minQuantity: number
  maxQuantity?: number
  discountType: 'percentage' | 'fixed'
  discountValue: number
  label?: string // e.g., "Buy 5+ get 10% off"
}

export interface VariantSelection {
  size?: string
  color?: string
  material?: string
  finish?: string
  [key: string]: string | undefined
}

// Helper functions

export function findVariantBySelection(
  product: ProductWithVariants,
  selection: VariantSelection
): ProductVariant | null {
  if (!product.hasVariants || !product.variants) return null
  
  return product.variants.find(variant => {
    return Object.keys(selection).every(key => {
      return variant.attributes[key] === selection[key]
    })
  }) || null
}

export function getVariantPrice(
  variant: ProductVariant | null,
  quantity: number,
  bulkPricing?: BulkPricing[]
): {
  basePrice: number
  bulkDiscount: number
  finalPrice: number
  savings: number
} {
  const basePrice = variant?.price || 0
  let bulkDiscount = 0
  
  if (bulkPricing && quantity > 1) {
    // Find applicable bulk pricing
    const applicable = bulkPricing.find(bp => {
      return quantity >= bp.minQuantity && 
             (!bp.maxQuantity || quantity <= bp.maxQuantity)
    })
    
    if (applicable) {
      if (applicable.discountType === 'percentage') {
        bulkDiscount = (basePrice * applicable.discountValue) / 100
      } else {
        bulkDiscount = applicable.discountValue
      }
    }
  }
  
  const finalPrice = Math.max(0, basePrice - bulkDiscount)
  const savings = quantity * bulkDiscount
  
  return {
    basePrice,
    bulkDiscount,
    finalPrice,
    savings
  }
}

export function getTotalVariantStock(product: ProductWithVariants): number {
  if (!product.hasVariants) {
    return product.totalStock
  }
  
  return product.variants.reduce((total, variant) => {
    return total + variant.stock
  }, 0)
}

export function isProductAvailable(
  product: ProductWithVariants,
  variant?: ProductVariant | null
): boolean {
  if (variant) {
    return variant.isAvailable && (variant.stock > 0 || variant.preOrder?.enabled === true)
  }
  
  if (product.hasVariants) {
    return product.variants.some(v => v.isAvailable && (v.stock > 0 || v.preOrder?.enabled === true))
  }
  
  return product.totalStock > 0 || product.allowPreOrder
}

export function getStockStatus(stock: number, lowStockThreshold: number): {
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  label: string
  color: string
} {
  if (stock === 0) {
    return {
      status: 'out_of_stock',
      label: 'Out of Stock',
      color: 'red'
    }
  } else if (stock <= lowStockThreshold) {
    return {
      status: 'low_stock',
      label: `Only ${stock} left`,
      color: 'orange'
    }
  } else {
    return {
      status: 'in_stock',
      label: 'In Stock',
      color: 'green'
    }
  }
}

export function generateVariantSKU(
  productId: number,
  attributes: VariantSelection
): string {
  const parts = [productId.toString()]
  
  if (attributes.size) parts.push(attributes.size.substring(0, 2).toUpperCase())
  if (attributes.color) parts.push(attributes.color.substring(0, 3).toUpperCase())
  if (attributes.material) parts.push(attributes.material.substring(0, 3).toUpperCase())
  
  return parts.join('-')
}

export function getBulkPricingLabel(pricing: BulkPricing): string {
  const discount = pricing.discountType === 'percentage' 
    ? `${pricing.discountValue}% off`
    : `₹${pricing.discountValue} off`
  
  if (pricing.maxQuantity) {
    return `Buy ${pricing.minQuantity}-${pricing.maxQuantity}: ${discount}`
  }
  
  return `Buy ${pricing.minQuantity}+: ${discount}`
}
