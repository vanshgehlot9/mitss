"use client"

import { useState } from "react"
import { Star, ThumbsUp, ThumbsDown, Check, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

interface Review {
  id: number
  author: string
  rating: number
  date: string
  title: string
  content: string
  verified: boolean
  helpful: number
  notHelpful: number
  images?: string[]
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: 1,
    author: "Rajesh Kumar",
    rating: 5,
    date: "2024-10-15",
    title: "Excellent Quality and Craftsmanship!",
    content: "I am extremely happy with this purchase. The quality is outstanding and it looks even better in person. The delivery was on time and the packaging was secure. Highly recommend!",
    verified: true,
    helpful: 24,
    notHelpful: 2,
    images: ["/images/sofa1.jpg", "/images/bed1.jpg"]
  },
  {
    id: 2,
    author: "Priya Sharma",
    rating: 4,
    date: "2024-10-10",
    title: "Great value for money",
    content: "Very satisfied with the product. The material is good and assembly was easy. Only minor issue was a small scratch which was hardly noticeable. Overall, great purchase!",
    verified: true,
    helpful: 18,
    notHelpful: 1
  },
  {
    id: 3,
    author: "Amit Patel",
    rating: 5,
    date: "2024-10-05",
    title: "Perfect addition to my home",
    content: "This furniture piece transformed my living room completely. The color matches perfectly with my interior. Customer service was also very helpful.",
    verified: false,
    helpful: 12,
    notHelpful: 0
  },
  {
    id: 4,
    author: "Sneha Reddy",
    rating: 4,
    date: "2024-09-28",
    title: "Good product, slight delay in delivery",
    content: "The product quality is excellent but there was a slight delay in delivery. However, it was worth the wait. Very comfortable and looks premium.",
    verified: true,
    helpful: 9,
    notHelpful: 3,
    images: ["/images/dining1.jpg"]
  },
  {
    id: 5,
    author: "Vikram Singh",
    rating: 5,
    date: "2024-09-20",
    title: "Outstanding!",
    content: "Best furniture I've purchased online. The craftsmanship is top-notch and it's very sturdy. My family loves it!",
    verified: true,
    helpful: 31,
    notHelpful: 0
  }
]

interface ProductReviewsProps {
  productId: number
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews] = useState<Review[]>(mockReviews)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: "",
    name: ""
  })

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
  }))

  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1)

  const filteredReviews = filterRating 
    ? reviews.filter(r => r.rating === filterRating)
    : reviews

  const handleSubmitReview = () => {
    // In real app, this would submit to API
    console.log("New review:", newReview)
    setShowReviewForm(false)
    setNewReview({ rating: 5, title: "", content: "", name: "" })
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-muted rounded-lg">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-[#D4AF37] mb-2">{averageRating}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(parseFloat(averageRating))
                    ? 'fill-[#D4AF37] text-[#D4AF37]'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-2">
          {ratingCounts.map(({ rating, count, percentage }) => (
            <button
              key={rating}
              onClick={() => setFilterRating(filterRating === rating ? null : rating)}
              className={`w-full flex items-center gap-3 p-2 rounded hover:bg-background transition-colors ${
                filterRating === rating ? 'bg-background' : ''
              }`}
            >
              <div className="flex items-center gap-1 min-w-[80px]">
                <span className="text-sm font-semibold">{rating}</span>
                <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
              </div>
              <Progress value={percentage} className="flex-1" />
              <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          Customer Reviews {filterRating && `(${filterRating} stars)`}
        </h3>
        <Button 
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-[#D4AF37] hover:bg-[#B8941F]"
        >
          Write a Review
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="border border-border rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-lg">Write Your Review</h4>
          
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= newReview.rating
                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <Input
              value={newReview.name}
              onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Review Title</label>
            <Input
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              placeholder="Summarize your experience"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <Textarea
              value={newReview.content}
              onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
              placeholder="Share your thoughts about this product..."
              rows={5}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Add Photos (Optional)</label>
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSubmitReview}
              className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F]"
            >
              Submit Review
            </Button>
            <Button 
              onClick={() => setShowReviewForm(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div key={review.id} className="border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[#D4AF37] text-white">
                    {review.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.author}</span>
                    {review.verified && (
                      <Badge variant="outline" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-[#D4AF37] text-[#D4AF37]'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-semibold mb-2">{review.title}</h4>
            <p className="text-muted-foreground mb-4">{review.content}</p>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-3 mb-4">
                {review.images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <Image
                      src={img}
                      alt={`Review image ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Helpful Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Was this helpful?</span>
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsUp className="w-4 h-4" />
                Yes ({review.helpful})
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsDown className="w-4 h-4" />
                No ({review.notHelpful})
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews found for this rating.</p>
          <Button
            onClick={() => setFilterRating(null)}
            variant="link"
            className="text-[#D4AF37]"
          >
            Show all reviews
          </Button>
        </div>
      )}
    </div>
  )
}
