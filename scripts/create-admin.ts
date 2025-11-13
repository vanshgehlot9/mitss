/**
 * Script to create an admin user
 * Usage: npx ts-node scripts/create-admin.ts
 * 
 * This script will:
 * 1. Create a user in Firebase Auth
 * 2. Add user document to Firestore 'users' collection
 * 3. Add admin role to 'userRoles' collection
 */

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { UserRole, ROLE_PERMISSIONS } from '../lib/admin-roles'

// Firebase config - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createAdminUser() {
  // Admin user details
  const adminEmail = 'admin@mitss.com' // Change this to your desired admin email
  const adminPassword = 'Admin@123456' // Change this to a strong password
  const adminName = 'Admin User'
  
  try {
    console.log('Creating admin user...')
    
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    )
    const user = userCredential.user
    
    console.log('✓ User created in Firebase Auth:', user.uid)
    
    // 2. Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: adminName,
      phoneNumber: '',
      photoURL: null,
      createdAt: serverTimestamp(),
      addresses: [],
      orderHistory: []
    })
    
    console.log('✓ User document created in Firestore')
    
    // 3. Create admin role document
    await setDoc(doc(db, 'userRoles', user.uid), {
      uid: user.uid,
      email: user.email,
      role: UserRole.ADMIN,
      permissions: ROLE_PERMISSIONS[UserRole.ADMIN],
      assignedBy: 'system',
      assignedAt: new Date(),
    })
    
    console.log('✓ Admin role assigned')
    console.log('\n===== ADMIN USER CREATED SUCCESSFULLY =====')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('UID:', user.uid)
    console.log('\nYou can now login to /admin with these credentials!')
    console.log('===========================================\n')
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message)
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nThis email is already registered. If you want to make this user an admin:')
      console.log('1. Get the user UID from Firebase Console')
      console.log('2. Manually add a document in userRoles collection with admin role')
    }
    
    process.exit(1)
  }
}

createAdminUser()
