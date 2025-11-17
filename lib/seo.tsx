import { Metadata } from 'next'
import { Product } from '@/lib/products-data'

// Base metadata for the site
export const baseMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mitss.store'),
  title: {
    default: 'Mitss - Premium Handcrafted Wooden Furniture',
    template: '%s | Mitss'
  },
  description: 'Discover exquisite handcrafted wooden furniture. Premium quality, timeless designs, free shipping across India.',
  keywords: [
    'wooden furniture',
    'handcrafted furniture',
    'premium furniture',
    'solid wood furniture',
    'custom furniture',
    'Indian furniture',
    'teak wood furniture',
    'sheesham furniture',
    'furniture online India'
  ],
  authors: [{ name: 'Mitss' }],
  creator: 'Mitss',
  publisher: 'Mitss',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'Mitss - Premium Handcrafted Wooden Furniture',
    description: 'Discover exquisite handcrafted wooden furniture',
    siteName: 'Mitss',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mitss Furniture'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mitss - Premium Handcrafted Wooden Furniture',
    description: 'Discover exquisite handcrafted wooden furniture',
    images: ['/images/twitter-image.jpg'],
    creator: '@mitss_store'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    // yandex: 'yandex-verification-code',
    // bing: 'bing-verification-code',
  },
  alternates: {
    canonical: '/',
  },
  category: 'E-commerce',
}

// Generate product metadata
export function generateProductMetadata(product: Product): Metadata {
  const productImage = product.image || '/images/placeholder.jpg'
  const images = [
    {
      url: productImage,
      width: 800,
      height: 800,
      alt: product.name
    }
  ]

  return {
    title: product.name,
    description: product.description.substring(0, 160),
    keywords: [
      product.name,
      product.category,
      'buy online',
      'India'
    ],
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.description,
      images: images,
      url: `/products/${product.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description.substring(0, 160),
      images: [productImage],
    },
    alternates: {
      canonical: `/products/${product.id}`,
    },
  }
}

// Product JSON-LD structured data
export function generateProductStructuredData(product: Product) {
  const productImage = product.image || '/images/placeholder.jpg'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [productImage],
    sku: product.id.toString(),
    brand: {
      '@type': 'Brand',
      name: 'Mitss'
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Mitss'
      }
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews || 0,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    category: product.category,
    material: product.material,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Material',
        value: product.material
      },
      {
        '@type': 'PropertyValue',
        name: 'Category',
        value: product.category
      }
    ]
  }
}

// Organization structured data
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mitss',
  url: process.env.NEXT_PUBLIC_SITE_URL,
  logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
  description: 'Premium handcrafted wooden furniture store',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-XXXXXXXXXX',
    contactType: 'Customer Service',
    areaServed: 'IN',
    availableLanguage: ['en', 'hi']
  },
  sameAs: [
    'https://www.facebook.com/mitss',
    'https://www.instagram.com/mitss.website/',
    'https://twitter.com/mitss_store'
  ]
}

// Breadcrumb structured data
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL}${item.url}`
    }))
  }
}

// Website structured data
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mitss',
  url: process.env.NEXT_PUBLIC_SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
}

// FAQ structured data
export function generateFAQStructuredData(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// Review structured data
export function generateReviewStructuredData(reviews: any[]) {
  return reviews.map(review => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.userName
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1
    },
    reviewBody: review.comment,
    datePublished: new Date(review.createdAt).toISOString()
  }))
}

// Local Business structured data
export const localBusinessStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FurnitureStore',
  name: 'Mitss',
  image: `${process.env.NEXT_PUBLIC_SITE_URL}/images/store-front.jpg`,
  '@id': process.env.NEXT_PUBLIC_SITE_URL,
  url: process.env.NEXT_PUBLIC_SITE_URL,
  telephone: '+91-XXXXXXXXXX',
  priceRange: '₹₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Your Street Address',
    addressLocality: 'Your City',
    addressRegion: 'Your State',
    postalCode: 'Your Postal Code',
    addressCountry: 'IN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 0.0, // Add actual coordinates
    longitude: 0.0
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      opens: '09:00',
      closes: '18:00'
    }
  ],
  sameAs: [
    'https://www.facebook.com/mitss',
    'https://www.instagram.com/mitss',
    'https://twitter.com/mitss_store'
  ]
}

// Helper to inject structured data
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
