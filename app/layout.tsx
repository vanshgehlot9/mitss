import type { Metadata } from 'next'
import { Poppins, Lora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { Toaster } from '@/components/ui/sonner'
import ClientComponents from '@/components/client-components'
import AnalyticsTracker from '@/components/analytics-tracker'
import './globals.css'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const lora = Lora({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mitss.store'),
  title: {
    default: 'Mitss - Crafted Heritage, Modern Design | Premium Handcrafted Wooden Furniture',
    template: '%s | Mitss'
  },
  description: 'Authentic handcrafted wooden furniture & home décor from Jodhpur. Premium solid wood furniture designed by expert artisans with 25+ years of craftsmanship. Free shipping across India.',
  keywords: [
    'wooden furniture',
    'handcrafted furniture',
    'solid wood furniture',
    'home décor',
    'custom furniture',
    'artisan furniture',
    'living room furniture',
    'bedroom furniture',
    'dining furniture',
    'Jodhpur furniture',
    'Indian handicrafts',
    'wooden handicrafts',
    'furniture Jodhpur',
    'solid wood beds',
    'wooden dining tables',
    'handmade furniture India'
  ],
  authors: [{ name: 'Mitss', url: 'https://mitss.store' }],
  creator: 'Modern Celluloid Industries',
  publisher: 'Mitss',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/mitsslogo.png', type: 'image/png', sizes: '192x192' },
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
    shortcut: [{ url: '/favicon.ico' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [
      {
        rel: 'mask-icon',
        url: '/mitss-logo.svg',
        color: '#D4AF37',
      },
    ],
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
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mitss.store',
    siteName: 'Mitss',
    title: 'Mitss - Crafted Heritage, Modern Design | Premium Handcrafted Wooden Furniture',
    description: 'Authentic handcrafted wooden furniture & home décor from Jodhpur. Premium solid wood furniture designed by expert artisans with 25+ years of craftsmanship.',
    images: [
      {
        url: '/mitsslogo.png',
        width: 1200,
        height: 630,
        alt: 'Mitss - Premium Handcrafted Wooden Furniture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mitss - Crafted Heritage, Modern Design',
    description: 'Authentic handcrafted wooden furniture & home décor from Jodhpur',
    images: ['/mitsslogo.png'],
    creator: '@mitss',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://mitss.store',
  },
  category: 'Furniture & Home Decor',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF9F6' },
    { media: '(prefers-color-scheme: dark)', color: '#1A2642' }
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${lora.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
      </head>
      <body className={`font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Mitss - Modern Celluloid Industries",
              "image": "https://mitss.store/mitsslogo.png",
              "description": "Premium handcrafted wooden furniture and home décor",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Siwanchi Gate Rd, Pratap Nagar",
                "addressLocality": "Jodhpur",
                "addressRegion": "Rajasthan",
                "addressCountry": "IN"
              },
              "telephone": "+91 99500 36077",
              "email": "info@mitss.store",
              "url": "https://mitss.store",
              "priceRange": "₹₹₹",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  "opens": "09:00",
                  "closes": "19:00"
                }
              ],
              "sameAs": [
                "https://www.facebook.com/mitss",
                "https://www.instagram.com/mitss",
                "https://twitter.com/mitss"
              ]
            })
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <AnalyticsTracker />
              <ClientComponents />
              {children}
              <Toaster position="top-center" richColors />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
