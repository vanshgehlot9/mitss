'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { UserRole, ROLE_PERMISSIONS } from '@/lib/admin-roles'
import { useRouter } from 'next/navigation'

export default function CreateAdminAccount() {
  const router = useRouter()
  const [email, setEmail] = useState('info@mitss.store')
  const [password, setPassword] = useState('Mitss@2025')
  const [displayName, setDisplayName] = useState('MITSS Admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      if (!auth || !db) {
        throw new Error('Firebase not initialized')
      }

      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 2. Update profile with display name
      await updateProfile(user, {
        displayName: displayName
      })

      // 3. Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: null,
        phoneNumber: '',
        createdAt: new Date(),
        addresses: [],
        orderHistory: []
      })

      // 4. Create admin role document
      await setDoc(doc(db, 'userRoles', user.uid), {
        uid: user.uid,
        email: user.email,
        role: UserRole.ADMIN,
        permissions: ROLE_PERMISSIONS[UserRole.ADMIN],
        assignedBy: 'system-setup',
        assignedAt: new Date()
      })

      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/admin/login')
      }, 2000)

    } catch (err: any) {
      console.error('Error creating admin account:', err)
      
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in instead, or use the admin-setup page to assign admin role to existing user.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.')
      } else {
        setError(err.message || 'Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#F4C430] rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-10 w-10 text-slate-900" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-white">Create Admin Account</CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              Set up your first admin user for MITSS
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {success ? (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <AlertDescription className="text-green-400 ml-2">
                <div className="font-semibold mb-1">Admin account created successfully!</div>
                <div className="text-sm">Redirecting to login page...</div>
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-5">
              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <AlertDescription className="text-red-400 ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-slate-300">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <p className="text-xs text-slate-400">Password must be at least 6 characters</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] hover:from-[#C19B2D] hover:to-[#E0B820] text-slate-900 font-semibold h-11 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Admin Account'
                )}
              </Button>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-center text-slate-400">
                  Already have an account?{' '}
                  <a href="/admin/login" className="text-[#D4AF37] hover:underline">
                    Login here
                  </a>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Mitss. All rights reserved.
        </p>
      </div>
    </div>
  )
}
