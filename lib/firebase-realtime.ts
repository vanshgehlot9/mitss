// Firebase Realtime Database implementation as alternative to Firestore
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getDatabase, Database, ref, push, set, get, update, query, orderByChild, limitToLast } from "firebase/database"
import { getStorage, FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
}

const shouldInitialize = firebaseConfig.apiKey && firebaseConfig.apiKey !== '' && firebaseConfig.projectId && firebaseConfig.projectId !== ''

let app: FirebaseApp | undefined
let auth: Auth | undefined
let database: Database | undefined
let storage: FirebaseStorage | undefined

if (shouldInitialize) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    database = getDatabase(app)
    storage = getStorage(app)
    console.log('Firebase Realtime Database initialized successfully')
  } catch (error) {
    console.error('Firebase initialization failed:', error)
  }
}

export { app, auth, database, storage, ref, push, set, get, update, query, orderByChild, limitToLast }
