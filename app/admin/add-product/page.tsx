"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createProduct } from "@/hooks/use-products"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"
import ImageUpload from '@/components/admin/image-upload'

export default function AdminAddProductPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    originalPrice: "",
    rating: "4.5",
    reviews: "0",
    images: [] as string[],
    badge: "",
    badgeColor: "bg-[#D4AF37]",
    material: "",
    inStock: true,
    deliveryTime: "2-3 weeks",
    isExclusive: false,
    exclusivePrice: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const images: string[] = (formData as any).images || []

      // Require at least one image
      if (!images || images.length === 0) {
        toast.error("Please upload at least one product image")
        setLoading(false)
        return
      }

      const productData = {
        ...formData,
        id: Date.now(), // Temporary ID
        price: parseFloat((formData as any).price),
        originalPrice: (formData as any).originalPrice ? parseFloat((formData as any).originalPrice) : undefined,
        rating: parseFloat((formData as any).rating),
        reviews: parseInt((formData as any).reviews),
        image: images[0], // primary image for backward compatibility
        images: images,
        features: [],
        color: [],
        dimensions: {
          width: "",
          height: "",
          depth: ""
        }
      }

      const result = await createProduct(productData)

      if (result.success) {
        toast.success("Product added successfully!")
        // Reset form
        setFormData({
          name: "",
          description: "",
          category: "",
          price: "",
          originalPrice: "",
          rating: "4.5",
          reviews: "0",
          images: [],
          badge: "",
          badgeColor: "bg-[#D4AF37]",
          material: "",
          inStock: true,
          deliveryTime: "2-3 weeks",
          isExclusive: false,
          exclusivePrice: ""
        })
      } else {
        toast.error(result.error || "Failed to add product")
      }
    } catch (error) {
      toast.error("Failed to add product")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2642]">Add New Product</h1>
          <p className="text-gray-500 mt-1">Create a new product in your catalog</p>
        </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Royal Velvet Sofa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      placeholder="Living Room"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Handcrafted wooden furniture..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      placeholder="45999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      placeholder="65999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={handleChange}
                      placeholder="4.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviews">Number of Reviews</Label>
                    <Input
                      id="reviews"
                      name="reviews"
                      type="number"
                      value={formData.reviews}
                      onChange={handleChange}
                      placeholder="128"
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <Label>Product Images *</Label>

                  <ImageUpload
                    value={(formData as any).images || []}
                    onChange={(urls: string[]) => setFormData(prev => ({ ...prev, images: urls }))}
                    maxImages={5}
                    folder="mitss/products"
                  />

                  <p className="text-xs text-gray-500">
                    Images are uploaded to Cloudinary and stored as secure URLs. The first image will be used as the primary product image.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge Text</Label>
                    <Input
                      id="badge"
                      name="badge"
                      value={formData.badge}
                      onChange={handleChange}
                      placeholder="Best Seller"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      placeholder="Sheesham Wood"
                    />
                  </div>
                </div>

                {/* Exclusive Product Section */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-[#1A2642] mb-4">Product Type</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isExclusive"
                        name="isExclusive"
                        checked={formData.isExclusive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isExclusive: e.target.checked }))}
                        className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                      />
                      <div>
                        <Label htmlFor="isExclusive" className="cursor-pointer font-medium">
                          Exclusive Product (WhatsApp Contact Only)
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Check this for custom-priced products sold through WhatsApp contact only
                        </p>
                      </div>
                    </div>

                    {formData.isExclusive && (
                      <div className="space-y-2 bg-[#D4AF37]/5 p-4 rounded-lg">
                        <Label htmlFor="exclusivePrice">Custom Price Text</Label>
                        <Input
                          id="exclusivePrice"
                          name="exclusivePrice"
                          value={formData.exclusivePrice}
                          onChange={handleChange}
                          placeholder="Contact for Price / Starting from ₹50,000"
                        />
                        <p className="text-xs text-gray-500">
                          This text will be shown instead of the price. Customers will contact via WhatsApp for actual pricing.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Delivery Time</Label>
                  <Input
                    id="deliveryTime"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    placeholder="2-3 weeks"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Product
                </Button>
              </form>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}