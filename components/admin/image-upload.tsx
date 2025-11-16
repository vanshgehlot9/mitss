'use client'

import { useState } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  folder?: string
}

export default function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  folder = 'mitss/products',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onUpload = (result: any) => {
    const url = result.info.secure_url
    onChange([...value, url])
    setIsUploading(false)
  }

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url))
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          folder: folder,
          maxFiles: 1,
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
          maxFileSize: 10000000, // 10MB
        }}
        onUpload={onUpload}
      >
        {({ open }) => {
          return (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUploading(true)
                open()
              }}
              disabled={value.length >= maxImages || isUploading}
              className="w-full h-32 border-2 border-dashed hover:border-primary"
            >
              <div className="flex flex-col items-center gap-2">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {value.length}/{maxImages} images
                    </p>
                  </>
                )}
              </div>
            </Button>
          )
        }}
      </CldUploadWidget>

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-border group"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  onClick={() => onRemove(url)}
                  variant="destructive"
                  size="icon"
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-2" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  )
}
