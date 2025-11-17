"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Gift,
  Megaphone,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/support", label: "Support", icon: MessageSquare },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user, loading } = useAuth()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Check authentication only (no admin role check)
  useEffect(() => {
    const checkAccess = async () => {
      // Skip auth check for login page and root admin page
      if (pathname === '/admin/login' || pathname === '/admin') {
        setIsCheckingAuth(false)
        setIsAuthorized(true)
        return
      }

      if (loading) return

      // Not logged in - redirect to login
      // If a local MITSS admin token is present, treat as authorized (dev mode)
      try {
        const localToken = typeof window !== 'undefined' ? localStorage.getItem('mitss_admin_token') : null
        if (localToken) {
          setIsAuthorized(true)
          setIsCheckingAuth(false)
          return
        }
      } catch (e) {
        // ignore localStorage issues
      }

      if (!user) {
        router.push('/admin/login')
        return
      }

      // User is authenticated - allow access
      setIsAuthorized(true)
      setIsCheckingAuth(false)
    }

    checkAccess()
  }, [user, loading, router, pathname])

  const handleLogout = async () => {
    try {
      // Clear local admin token if present
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mitss_admin_token')
        localStorage.removeItem('mitss_admin_email')
      }
    } catch (e) {
      // ignore
    }

    try {
      await logout()
    } catch (err) {
      // ignore firebase logout errors when using local admin
    }

    router.push('/admin/login')
  }

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Don't show admin layout for login page and root admin page
  if (pathname === '/admin/login' || pathname === '/admin') {
    return <>{children}</>
  }

  // Show admin layout only if authorized
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#1A2642]">MITSS Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="pt-16">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden fixed top-20 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white shadow-md"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-40",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="p-6">
            <h2 className="text-lg font-bold text-[#1A2642] mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              {adminLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href || pathname?.startsWith(link.href + "/")
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-[#D4AF37] text-white"
                        : "text-[#1A2642] hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Store
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:ml-64 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
