'use client'

import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'

interface PriceRangeSliderProps {
  min?: number
  max?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export default function PriceRangeSlider({ 
  min = 0, 
  max = 100000, 
  value, 
  onChange 
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: number[]) => {
    setLocalValue(newValue as [number, number])
  }

  const handleCommit = () => {
    onChange(localValue)
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">Price Range</Label>
      <Slider
        min={min}
        max={max}
        step={500}
        value={localValue}
        onValueChange={handleChange}
        onValueCommit={handleCommit}
        className="w-full"
      />
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>₹{localValue[0].toLocaleString()}</span>
        <span>₹{localValue[1].toLocaleString()}</span>
      </div>
    </div>
  )
}
