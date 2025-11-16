// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getAnalytics, Analytics } from "firebase/analytics"
import { getAuth, Auth } from "firebase/auth"
// Firestore import removed - not configured, using Realtime Database instead
import { getStorage, FirebaseStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
}

// Initialize Firebase only if we have a valid API key and we're in the browser or have all required config
const shouldInitialize = firebaseConfig.apiKey && firebaseConfig.apiKey !== '' && firebaseConfig.projectId && firebaseConfig.projectId !== ''

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: any = undefined // Firestore disabled - using Realtime Database
let storage: FirebaseStorage | undefined
let analytics: Analytics | null = null

// Only initialize if we should (has valid config)
if (shouldInitialize) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    
    // Firestore intentionally not initialized - database not configured
    // All data operations use Firebase Realtime Database instead
    // db remains undefined to prevent any Firestore connections
    
    storage = getStorage(app)
    
    // Analytics (only in browser)
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app)
      } catch (error) {
        console.warn('Analytics not available:', error)
      }
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error)
  }
}

export { app, auth, db, storage, analytics }
