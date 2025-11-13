// GDPR & Compliance utilities for Mitss E-commerce

import { db } from './firebase'
import { collection, doc, setDoc, getDoc, deleteDoc, updateDoc, Timestamp, getDocs, query, where } from 'firebase/firestore'

export interface CookieConsent {
  userId?: string
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
  timestamp: Date
  version: string
}

export interface DataExportRequest {
  id: string
  userId: string
  userEmail: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requestedAt: Date
  completedAt?: Date
  downloadUrl?: string
  expiresAt?: Date
}

export interface AccountDeletionRequest {
  id: string
  userId: string
  userEmail: string
  reason?: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  requestedAt: Date
  scheduledDeletionDate: Date
  completedAt?: Date
}

export interface TermsAcceptance {
  userId: string
  termsVersion: string
  privacyVersion: string
  acceptedAt: Date
  ipAddress: string
}

export interface PrivacyPolicyVersion {
  version: string
  content: string
  effectiveDate: Date
  createdAt: Date
}

// Cookie consent management
export function saveCookieConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return

  localStorage.setItem('cookieConsent', JSON.stringify({
    ...consent,
    timestamp: consent.timestamp.toISOString()
  }))

  // Also save to database if user is logged in
  if (consent.userId) {
    const consentRef = doc(db, 'cookieConsents', consent.userId)
    setDoc(consentRef, {
      ...consent,
      timestamp: Timestamp.fromDate(consent.timestamp)
    }).catch(error => console.error('Error saving consent:', error))
  }
}

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem('cookieConsent')
  if (!stored) return null

  try {
    const consent = JSON.parse(stored)
    return {
      ...consent,
      timestamp: new Date(consent.timestamp)
    }
  } catch {
    return null
  }
}

export function hasConsentFor(category: keyof Omit<CookieConsent, 'userId' | 'timestamp' | 'version'>): boolean {
  const consent = getCookieConsent()
  if (!consent) return false
  return consent[category]
}

// Request data export
export async function requestDataExport(
  userId: string,
  userEmail: string
): Promise<{ success: boolean; requestId?: string; message: string }> {
  try {
    const requestRef = doc(collection(db, 'dataExportRequests'))
    
    const exportRequest: Omit<DataExportRequest, 'id'> = {
      userId,
      userEmail,
      status: 'pending',
      requestedAt: new Date()
    }

    await setDoc(requestRef, {
      ...exportRequest,
      requestedAt: Timestamp.fromDate(exportRequest.requestedAt)
    })

    return {
      success: true,
      requestId: requestRef.id,
      message: 'Data export request submitted. You will receive an email within 30 days.'
    }
  } catch (error) {
    console.error('Error requesting data export:', error)
    return {
      success: false,
      message: 'Failed to submit data export request'
    }
  }
}

// Export user data (GDPR compliance)
export async function exportUserData(userId: string): Promise<any> {
  try {
    // Collect all user data from various collections
    const userData: any = {}

    // User profile
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      userData.profile = userDoc.data()
    }

    // Orders
    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId))
    const ordersSnapshot = await getDocs(ordersQuery)
    userData.orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Wishlist
    const wishlistQuery = query(collection(db, 'wishlists'), where('userId', '==', userId))
    const wishlistSnapshot = await getDocs(wishlistQuery)
    userData.wishlist = wishlistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Reviews
    const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', userId))
    const reviewsSnapshot = await getDocs(reviewsQuery)
    userData.reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Support tickets
    const ticketsQuery = query(collection(db, 'supportTickets'), where('userId', '==', userId))
    const ticketsSnapshot = await getDocs(ticketsQuery)
    userData.supportTickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Cookie consent
    const consentDoc = await getDoc(doc(db, 'cookieConsents', userId))
    if (consentDoc.exists()) {
      userData.cookieConsent = consentDoc.data()
    }

    return userData
  } catch (error) {
    console.error('Error exporting user data:', error)
    throw error
  }
}

// Request account deletion
export async function requestAccountDeletion(
  userId: string,
  userEmail: string,
  reason?: string
): Promise<{ success: boolean; requestId?: string; message: string }> {
  try {
    const requestRef = doc(collection(db, 'accountDeletionRequests'))
    
    // Schedule deletion for 30 days from now (GDPR grace period)
    const scheduledDate = new Date()
    scheduledDate.setDate(scheduledDate.getDate() + 30)

    const deletionRequest: Omit<AccountDeletionRequest, 'id'> = {
      userId,
      userEmail,
      reason,
      status: 'pending',
      requestedAt: new Date(),
      scheduledDeletionDate: scheduledDate
    }

    await setDoc(requestRef, {
      ...deletionRequest,
      requestedAt: Timestamp.fromDate(deletionRequest.requestedAt),
      scheduledDeletionDate: Timestamp.fromDate(deletionRequest.scheduledDeletionDate)
    })

    return {
      success: true,
      requestId: requestRef.id,
      message: `Account deletion scheduled for ${scheduledDate.toLocaleDateString()}. You can cancel this request within 30 days.`
    }
  } catch (error) {
    console.error('Error requesting account deletion:', error)
    return {
      success: false,
      message: 'Failed to submit account deletion request'
    }
  }
}

// Cancel account deletion
export async function cancelAccountDeletion(
  requestId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const requestRef = doc(db, 'accountDeletionRequests', requestId)
    
    await updateDoc(requestRef, {
      status: 'cancelled',
      cancelledAt: Timestamp.now()
    })

    return {
      success: true,
      message: 'Account deletion request cancelled'
    }
  } catch (error) {
    console.error('Error cancelling account deletion:', error)
    return {
      success: false,
      message: 'Failed to cancel account deletion request'
    }
  }
}

// Delete user account and all data
export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    // Delete from all collections
    const collections = [
      'users',
      'wishlists',
      'reviews',
      'supportTickets',
      'cookieConsents',
      'notifications',
      'recentlyViewed',
      'comparisons'
    ]

    for (const collectionName of collections) {
      if (collectionName === 'users') {
        await deleteDoc(doc(db, collectionName, userId))
      } else {
        const q = query(collection(db, collectionName), where('userId', '==', userId))
        const snapshot = await getDocs(q)
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
      }
    }

    // Anonymize orders (keep for record keeping but remove PII)
    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId))
    const ordersSnapshot = await getDocs(ordersQuery)
    const anonymizePromises = ordersSnapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        userId: '[deleted]',
        userEmail: '[deleted]',
        userName: '[deleted]',
        shippingAddress: {
          name: '[deleted]',
          email: '[deleted]',
          phone: '[deleted]',
          address: '[redacted]',
          city: '[redacted]',
          state: '[redacted]',
          pincode: '[redacted]'
        }
      })
    )
    await Promise.all(anonymizePromises)

  } catch (error) {
    console.error('Error deleting user account:', error)
    throw error
  }
}

// Record terms acceptance
export async function recordTermsAcceptance(
  userId: string,
  termsVersion: string,
  privacyVersion: string,
  ipAddress: string
): Promise<void> {
  try {
    const acceptanceRef = doc(db, 'termsAcceptances', userId)
    
    const acceptance: TermsAcceptance = {
      userId,
      termsVersion,
      privacyVersion,
      acceptedAt: new Date(),
      ipAddress
    }

    await setDoc(acceptanceRef, {
      ...acceptance,
      acceptedAt: Timestamp.fromDate(acceptance.acceptedAt)
    })
  } catch (error) {
    console.error('Error recording terms acceptance:', error)
  }
}

// Get privacy policy version
export async function getPrivacyPolicyVersion(version?: string): Promise<PrivacyPolicyVersion | null> {
  try {
    if (version) {
      const policyDoc = await getDoc(doc(db, 'privacyPolicies', version))
      if (policyDoc.exists()) {
        const data = policyDoc.data()
        return {
          ...data,
          effectiveDate: data.effectiveDate.toDate(),
          createdAt: data.createdAt.toDate()
        } as PrivacyPolicyVersion
      }
    } else {
      // Get latest version
      const policiesSnapshot = await getDocs(collection(db, 'privacyPolicies'))
      const policies = policiesSnapshot.docs.map(doc => ({
        ...doc.data(),
        effectiveDate: doc.data().effectiveDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as PrivacyPolicyVersion[]
      
      // Sort by effective date descending
      policies.sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime())
      return policies[0] || null
    }
    
    return null
  } catch (error) {
    console.error('Error fetching privacy policy:', error)
    return null
  }
}

// GST Invoice format
export interface GSTInvoice {
  invoiceNumber: string
  invoiceDate: Date
  orderId: string
  
  // Seller details
  sellerName: string
  sellerGSTIN: string
  sellerAddress: string
  sellerState: string
  sellerStateCode: string
  
  // Buyer details
  buyerName: string
  buyerGSTIN?: string
  buyerAddress: string
  buyerState: string
  buyerStateCode: string
  
  // Items
  items: {
    description: string
    hsnCode: string
    quantity: number
    unitPrice: number
    taxableValue: number
    cgstRate: number
    cgstAmount: number
    sgstRate: number
    sgstAmount: number
    igstRate: number
    igstAmount: number
    totalAmount: number
  }[]
  
  // Totals
  subtotal: number
  cgstTotal: number
  sgstTotal: number
  igstTotal: number
  totalTax: number
  grandTotal: number
  
  // Payment details
  paymentMethod: string
  paymentStatus: string
}

export function generateGSTInvoice(order: any): GSTInvoice {
  const invoiceDate = new Date()
  const isInterState = order.shippingAddress.state !== 'Your State' // Replace with your state
  
  const items = order.items.map((item: any) => {
    const taxableValue = item.price * item.quantity
    const gstRate = 18 // 18% GST for furniture
    const gstAmount = (taxableValue * gstRate) / 100
    
    return {
      description: item.name,
      hsnCode: '9403', // HSN code for furniture
      quantity: item.quantity,
      unitPrice: item.price,
      taxableValue,
      cgstRate: isInterState ? 0 : gstRate / 2,
      cgstAmount: isInterState ? 0 : gstAmount / 2,
      sgstRate: isInterState ? 0 : gstRate / 2,
      sgstAmount: isInterState ? 0 : gstAmount / 2,
      igstRate: isInterState ? gstRate : 0,
      igstAmount: isInterState ? gstAmount : 0,
      totalAmount: taxableValue + gstAmount
    }
  })
  
  const subtotal = items.reduce((sum: number, item: any) => sum + item.taxableValue, 0)
  const cgstTotal = items.reduce((sum: number, item: any) => sum + item.cgstAmount, 0)
  const sgstTotal = items.reduce((sum: number, item: any) => sum + item.sgstAmount, 0)
  const igstTotal = items.reduce((sum: number, item: any) => sum + item.igstAmount, 0)
  const totalTax = cgstTotal + sgstTotal + igstTotal
  
  return {
    invoiceNumber: `MITSS-${order.id}`,
    invoiceDate,
    orderId: order.id,
    
    sellerName: 'Mitss Furniture',
    sellerGSTIN: process.env.SELLER_GSTIN || '29XXXXXXXXXXXXX',
    sellerAddress: 'Your complete address',
    sellerState: 'Your State',
    sellerStateCode: 'XX',
    
    buyerName: order.shippingAddress.name,
    buyerGSTIN: order.billingGSTIN,
    buyerAddress: `${order.shippingAddress.address}, ${order.shippingAddress.city}`,
    buyerState: order.shippingAddress.state,
    buyerStateCode: 'XX', // Map state to code
    
    items,
    
    subtotal,
    cgstTotal,
    sgstTotal,
    igstTotal,
    totalTax,
    grandTotal: subtotal + totalTax,
    
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus
  }
}
