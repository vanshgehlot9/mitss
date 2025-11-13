'use client'

import { usePathname } from 'next/navigation'
import WhatsAppChat from '@/components/whatsapp-chat'
import WelcomePopup from '@/components/welcome-popup'
import ScarcityAlerts from '@/components/scarcity-alerts'
import CookieConsent from '@/components/cookie-consent'

export default function ClientComponents() {
  const pathname = usePathname()
  
  // Don't show customer-facing components on admin routes
  const isAdminRoute = pathname?.startsWith('/admin')
  
  if (isAdminRoute) {
    return null
  }
  
  return (
    <>
      <WelcomePopup />
      <ScarcityAlerts />
      <WhatsAppChat />
      <CookieConsent />
    </>
  )
}
