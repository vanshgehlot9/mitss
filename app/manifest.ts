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
        src: '/mitsslogo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
