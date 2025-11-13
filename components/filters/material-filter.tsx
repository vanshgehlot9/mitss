'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

interface MaterialFilterProps {
  materials: string[]
  selectedMaterials: string[]
  onChange: (materials: string[]) => void
}

export default function MaterialFilter({ 
  materials, 
  selectedMaterials, 
  onChange 
}: MaterialFilterProps) {
  const handleToggle = (material: string) => {
    const newSelection = selectedMaterials.includes(material)
      ? selectedMaterials.filter(m => m !== material)
      : [...selectedMaterials, material]
    onChange(newSelection)
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">Material</Label>
      <ScrollArea className="h-[150px] pr-4">
        <div className="space-y-3">
          {materials.map((material) => (
            <div key={material} className="flex items-center space-x-2">
              <Checkbox
                id={`material-${material}`}
                checked={selectedMaterials.includes(material)}
                onCheckedChange={() => handleToggle(material)}
              />
              <label
                htmlFor={`material-${material}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {material}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
