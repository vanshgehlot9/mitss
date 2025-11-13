'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface InStockToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function InStockToggle({ checked, onChange }: InStockToggleProps) {
  return (
    <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
      <Label htmlFor="in-stock" className="text-sm font-medium cursor-pointer">
        Show In-Stock Only
      </Label>
      <Switch
        id="in-stock"
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  )
}
