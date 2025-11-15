'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Copy, ExternalLink, AlertCircle } from 'lucide-react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserRole, ROLE_PERMISSIONS } from '@/lib/admin-roles'
import { toast } from 'sonner'

export default function AdminSetupPage() {
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleCreateAdminRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      // Create admin role document in Firestore
      await setDoc(doc(db, 'userRoles', userId), {
        uid: userId,
        email: userEmail,
        role: UserRole.ADMIN,
        permissions: ROLE_PERMISSIONS[UserRole.ADMIN],
        assignedBy: 'manual-setup',
        assignedAt: new Date(),
      })

      setSuccess(true)
      toast.success('Admin role created successfully!')
    } catch (error: any) {
      console.error('Error creating admin role:', error)
      toast.error('Failed to create admin role: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Setup Guide</h1>
          <p className="text-muted-foreground">
            Follow these steps to create your first admin user
          </p>
        </div>

        {/* Step 1: Create User */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">1</span>
              Create a User in Firebase
            </CardTitle>
            <CardDescription>
              First, you need to create a user account in Firebase Authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Option A: Register on Website</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Go to <code className="bg-gray-100 px-2 py-1 rounded">/account</code> page</li>
                <li>Register with your email and password</li>
                <li>Note down your email for step 2</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/account', '_blank')}
                className="mt-2"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Registration Page
              </Button>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h4 className="font-semibold">Option B: Firebase Console</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Open Firebase Console</li>
                <li>Go to Authentication → Users</li>
                <li>Click "Add User"</li>
                <li>Enter email and password</li>
                <li>Copy the User UID (you'll need this in step 2)</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://console.firebase.google.com', '_blank')}
                className="mt-2"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Firebase Console
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Add Admin Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">2</span>
              Assign Admin Role
            </CardTitle>
            <CardDescription>
              Add the admin role to your user account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdminRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User UID</Label>
                <Input
                  id="userId"
                  placeholder="Get this from Firebase Console → Authentication → Users"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Find this in Firebase Console under Authentication → Users (click on the user)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">User Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="info@mitss.store"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating Admin Role...' : 'Create Admin Role'}
              </Button>

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Admin role created successfully! You can now login to the admin panel.
                  </AlertDescription>
                </Alert>
              )}
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Manual Method (Using Firebase Console)
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 ml-4">
                <li>Go to Firestore Database in Firebase Console</li>
                <li>Create a collection called <code className="bg-blue-100 px-1 rounded">userRoles</code></li>
                <li>Add a document with ID = User UID</li>
                <li>Add these fields:</li>
              </ol>
              <div className="mt-3 bg-white p-3 rounded border border-blue-200">
                <pre className="text-xs overflow-x-auto">
{`{
  "uid": "your-user-uid",
  "email": "info@mitss.store",
  "role": "admin",
  "permissions": [
    "view:products",
    "create:order",
    "view:all_orders",
    "update:order_status",
    "view:analytics",
    "manage:products",
    "manage:inventory",
    "view:customers",
    "moderate:reviews"
  ],
  "assignedBy": "system",
  "assignedAt": [Current Timestamp]
}`}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`{
  "uid": "your-user-uid",
  "email": "info@mitss.store",
  "role": "admin",
  "permissions": ["view:products", "create:order", "view:all_orders", "update:order_status", "view:analytics", "manage:products", "manage:inventory", "view:customers", "moderate:reviews"],
  "assignedBy": "system",
  "assignedAt": "2024-01-01T00:00:00.000Z"
}`)}
                  className="mt-2"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Login */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">3</span>
              Login to Admin Panel
            </CardTitle>
            <CardDescription>
              Access the admin dashboard with your admin credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                After creating the admin role, you can access the admin panel:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Go to <code className="bg-gray-100 px-2 py-1 rounded">/admin</code></li>
                <li>Login with your admin email and password</li>
                <li>You'll be redirected to the admin dashboard</li>
              </ol>
              <Button
                variant="default"
                onClick={() => window.open('/admin', '_blank')}
                className="mt-2"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Admin Panel
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Regular users trying to access /admin will be redirected to the homepage.
                Only users with admin role can access the admin panel.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Common issues and solutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Firebase credentials not working?</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Make sure <code className="bg-gray-100 px-1 rounded">.env.local</code> file exists with Firebase config</li>
                <li>Restart the dev server after changing environment variables</li>
                <li>Check browser console for Firebase errors</li>
                <li>Verify Firebase Authentication is enabled in Firebase Console</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Can't access admin panel?</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Make sure you created the admin role in Firestore (step 2)</li>
                <li>Check that the role field is exactly "admin" (lowercase)</li>
                <li>Clear browser cache and login again</li>
                <li>Check Firestore for the userRoles collection and your document</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Getting redirected to homepage?</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>This means you don't have admin role assigned</li>
                <li>Go back to step 2 and assign the admin role</li>
                <li>Make sure the User UID matches exactly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
