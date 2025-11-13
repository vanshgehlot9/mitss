"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from './firebase'
import { toast } from 'sonner'
import { initializeUserRole } from './admin-roles'

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  phoneNumber?: string
  role?: string
  createdAt?: any
  addresses?: Address[]
}

interface Address {
  id: string
  type: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  isDefault: boolean
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  updateUserProfile: (data: Partial<UserData>) => Promise<void>
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>
  deleteAddress: (addressId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user data from MongoDB
  const fetchUserData = async (uid: string) => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'x-user-id': uid
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserData(data as UserData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await fetchUserData(user.uid)
      } else {
        setUserData(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Register new user
  const register = async (email: string, password: string, name: string, phone?: string) => {
    if (!auth) {
      toast.error('Authentication not initialized')
      throw new Error('Authentication not initialized')
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile
      await updateProfile(user, { displayName: name })

      // Create user document in MongoDB
      await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify({
          email: user.email,
          displayName: name,
          phoneNumber: phone || '',
          photoURL: user.photoURL,
          addresses: [],
          orderHistory: []
        })
      })

      // Initialize user role (customer by default, unless email is in SUPER_ADMIN_EMAILS)
      await initializeUserRole(user.uid, user.email || '')

      toast.success('Account created successfully!')
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters')
      } else {
        toast.error('Registration failed: ' + error.message)
      }
      throw error
    }
  }

  // Login user
  const login = async (email: string, password: string) => {
    if (!auth) {
      toast.error('Authentication not initialized')
      throw new Error('Authentication not initialized')
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Login successful!')
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password')
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password')
      } else {
        toast.error('Login failed: ' + error.message)
      }
      throw error
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    if (!auth) {
      toast.error('Authentication not initialized')
      throw new Error('Authentication not initialized')
    }

    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user

      // Check if user document exists in MongoDB
      const response = await fetch('/api/user', {
        headers: {
          'x-user-id': user.uid
        }
      })

      if (!response.ok) {
        // Create new user document
        await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.uid
          },
          body: JSON.stringify({
            email: user.email,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber || '',
            photoURL: user.photoURL,
            addresses: [],
            orderHistory: []
          })
        })

        // Initialize user role
        await initializeUserRole(user.uid, user.email || '')
      }

      toast.success('Login successful!')
    } catch (error: any) {
      console.error('Google login error:', error)
      toast.error('Google login failed: ' + error.message)
      throw error
    }
  }

  // Logout user
  const logout = async () => {
    if (!auth) {
      toast.error('Authentication not initialized')
      throw new Error('Authentication not initialized')
    }

    try {
      await signOut(auth)
      toast.success('Logged out successfully')
    } catch (error: any) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
      throw error
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    if (!auth) {
      toast.error('Authentication not initialized')
      throw new Error('Authentication not initialized')
    }

    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent!')
    } catch (error: any) {
      console.error('Password reset error:', error)
      toast.error('Failed to send password reset email')
      throw error
    }
  }

  // Update user profile
  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) return

    try {
      await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify(data)
      })
      await fetchUserData(user.uid)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  // Add new address
  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return

    try {
      await fetch('/api/user/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify(address)
      })

      await fetchUserData(user.uid)
      toast.success('Address added successfully')
    } catch (error: any) {
      console.error('Add address error:', error)
      toast.error('Failed to add address')
      throw error
    }
  }

  // Update address
  const updateAddress = async (addressId: string, addressData: Partial<Address>) => {
    if (!user) return

    try {
      await fetch('/api/user/address', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify({ addressId, ...addressData })
      })

      await fetchUserData(user.uid)
      toast.success('Address updated successfully')
    } catch (error: any) {
      console.error('Update address error:', error)
      toast.error('Failed to update address')
      throw error
    }
  }

  // Delete address
  const deleteAddress = async (addressId: string) => {
    if (!user) return

    try {
      await fetch(`/api/user/address?id=${addressId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.uid
        }
      })

      await fetchUserData(user.uid)
      toast.success('Address deleted successfully')
    } catch (error: any) {
      console.error('Delete address error:', error)
      toast.error('Failed to delete address')
      throw error
    }
  }

  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    resetPassword,
    loginWithGoogle,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
