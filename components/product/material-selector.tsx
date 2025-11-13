'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MaterialSelectorProps {
  materials: string[]
  selectedMaterial: string
  onChange: (material: string) => void
  disabled?: boolean
}

export default function MaterialSelector({ 
  materials, 
  selectedMaterial, 
  onChange,
  disabled = false 
}: MaterialSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-900">
        Material
      </label>
      <Select 
        value={selectedMaterial} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select material" />
        </SelectTrigger>
        <SelectContent>
          {materials.map((material) => (
            <SelectItem key={material} value={material}>
              {material}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
