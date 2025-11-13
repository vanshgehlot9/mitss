'use client'

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface FilterTag {
  id: string
  label: string
  value: string
}

interface FilterTagsProps {
  tags: FilterTag[]
  onRemove: (id: string) => void
  onClearAll: () => void
}

export default function FilterTags({ tags, onRemove, onClearAll }: FilterTagsProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Active Filters:</span>
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="pl-3 pr-2 py-1 bg-[#D4AF37]/10 text-[#1A2642] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20"
        >
          <span className="text-xs font-medium">{tag.label}: {tag.value}</span>
          <button
            onClick={() => onRemove(tag.id)}
            className="ml-2 hover:text-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      {tags.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Clear All
        </Button>
      )}
    </div>
  )
}
