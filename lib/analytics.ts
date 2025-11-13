// Analytics utilities for Mitss E-commerce

// Google Analytics 4
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
    fbq?: (...args: any[]) => void
  }
}

// Initialize Google Analytics
export function initGA() {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return

  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script1)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  })
}

// Track page views
export function trackPageView(url: string) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

// Track events
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// E-commerce events for GA4
export const ecommerceEvents = {
  // View item list
  viewItemList: (items: any[], listName: string) => {
    if (!window.gtag) return

    window.gtag('event', 'view_item_list', {
      item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
      item_list_name: listName,
      items: items.map((item, index) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        index: index,
      })),
    })
  },

  // View item details
  viewItem: (product: any) => {
    if (!window.gtag) return

    window.gtag('event', 'view_item', {
      currency: 'INR',
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
        },
      ],
    })
  },

  // Add to cart
  addToCart: (product: any, quantity: number = 1) => {
    if (!window.gtag) return

    window.gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: product.price * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: quantity,
        },
      ],
    })
  },

  // Remove from cart
  removeFromCart: (product: any, quantity: number = 1) => {
    if (!window.gtag) return

    window.gtag('event', 'remove_from_cart', {
      currency: 'INR',
      value: product.price * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: quantity,
        },
      ],
    })
  },

  // Begin checkout
  beginCheckout: (items: any[], value: number) => {
    if (!window.gtag) return

    window.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: value,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
      })),
    })
  },

  // Purchase
  purchase: (orderId: string, items: any[], value: number, shipping: number = 0, tax: number = 0) => {
    if (!window.gtag) return

    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: value,
      currency: 'INR',
      tax: tax,
      shipping: shipping,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
      })),
    })
  },

  // Search
  search: (searchTerm: string) => {
    if (!window.gtag) return

    window.gtag('event', 'search', {
      search_term: searchTerm,
    })
  },

  // Add to wishlist
  addToWishlist: (product: any) => {
    if (!window.gtag) return

    window.gtag('event', 'add_to_wishlist', {
      currency: 'INR',
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
        },
      ],
    })
  },
}

// Facebook Pixel
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || ''

export function initFacebookPixel() {
  if (typeof window === 'undefined' || !FB_PIXEL_ID) return

  // Load Facebook Pixel
  const script = document.createElement('script')
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${FB_PIXEL_ID}');
    fbq('track', 'PageView');
  `
  document.head.appendChild(script)
}

export const facebookPixelEvents = {
  viewContent: (product: any) => {
    if (!window.fbq) return

    window.fbq('track', 'ViewContent', {
      content_name: product.name,
      content_category: product.category,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'INR',
    })
  },

  addToCart: (product: any, quantity: number = 1) => {
    if (!window.fbq) return

    window.fbq('track', 'AddToCart', {
      content_name: product.name,
      content_category: product.category,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price * quantity,
      currency: 'INR',
    })
  },

  initiateCheckout: (value: number) => {
    if (!window.fbq) return

    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: 'INR',
    })
  },

  purchase: (orderId: string, value: number) => {
    if (!window.fbq) return

    window.fbq('track', 'Purchase', {
      value: value,
      currency: 'INR',
      content_type: 'product',
    })
  },

  search: (searchTerm: string) => {
    if (!window.fbq) return

    window.fbq('track', 'Search', {
      search_string: searchTerm,
    })
  },

  addToWishlist: (product: any) => {
    if (!window.fbq) return

    window.fbq('track', 'AddToWishlist', {
      content_name: product.name,
      content_category: product.category,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'INR',
    })
  },
}

// Custom analytics (can be sent to your own backend)
export async function trackCustomEvent(
  event: string,
  properties: Record<string, any>
) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        properties,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Failed to track custom event:', error)
  }
}

// User identification
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') return

  // GA4 user ID
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: userId,
    })
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('setUserProperties', { external_id: userId })
  }

  // Custom tracking
  trackCustomEvent('identify', {
    userId,
    ...traits,
  })
}

// Conversion tracking
export function trackConversion(orderId: string, value: number) {
  // Google Ads Conversion (if configured)
  if (window.gtag && process.env.NEXT_PUBLIC_GOOGLE_ADS_ID) {
    window.gtag('event', 'conversion', {
      send_to: `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/CONVERSION_LABEL`,
      value: value,
      currency: 'INR',
      transaction_id: orderId,
    })
  }
}
