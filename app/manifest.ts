import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mitss - Premium Handcrafted Wooden Furniture',
    short_name: 'Mitss',
    description: 'Authentic handcrafted wooden furniture & home décor from Jodhpur',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF9F6',
    theme_color: '#D4AF37',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/mitsslogo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/mitss-logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  }
}
