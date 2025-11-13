// Admin role verification and management

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface UserRoles {
  uid: string
  email: string
  role: UserRole
  permissions: string[]
  assignedBy?: string
  assignedAt?: Date
}

// Default permissions for each role
export const ROLE_PERMISSIONS = {
  [UserRole.CUSTOMER]: [
    'view:products',
    'create:order',
    'view:own_orders',
    'create:review',
  ],
  [UserRole.ADMIN]: [
    'view:products',
    'create:order',
    'view:all_orders',
    'update:order_status',
    'view:analytics',
    'manage:products',
    'manage:inventory',
    'view:customers',
    'moderate:reviews',
  ],
  [UserRole.SUPER_ADMIN]: [
    'view:products',
    'create:order',
    'view:all_orders',
    'update:order_status',
    'view:analytics',
    'manage:products',
    'manage:inventory',
    'view:customers',
    'moderate:reviews',
    'manage:admins',
    'manage:settings',
    'view:logs',
  ],
}

// List of super admin emails (configure in environment)
const SUPER_ADMIN_EMAILS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || '').split(',').map(e => e.trim())

export async function getUserRole(uid: string): Promise<UserRoles | null> {
  try {
    const response = await fetch('/api/user/role', {
      headers: {
        'x-user-id': uid
      }
    })
    
    if (response.ok) {
      return await response.json() as UserRoles
    }
    
    return null
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null
  }
}

export async function assignUserRole(
  uid: string,
  email: string,
  role: UserRole,
  assignedBy: string
): Promise<boolean> {
  try {
    const roleData: UserRoles = {
      uid,
      email,
      role,
      permissions: ROLE_PERMISSIONS[role],
      assignedBy,
      assignedAt: new Date(),
    }
    
    const response = await fetch('/api/user/role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': assignedBy
      },
      body: JSON.stringify(roleData)
    })
    
    return response.ok
  } catch (error) {
    console.error('Error assigning user role:', error)
    return false
  }
}

export async function initializeUserRole(uid: string, email: string): Promise<void> {
  try {
    // This function is called during registration, so we can't use the API
    // Instead, we'll just log it and rely on the first login to create the role
    console.log('User role will be initialized on first API call:', { uid, email })
    
    // The role will be automatically created when user first accesses the app
    // via the GET /api/user/role endpoint which creates a default role if none exists
  } catch (error) {
    console.error('Error initializing user role:', error)
  }
}

export function hasPermission(userRole: UserRoles | null, permission: string): boolean {
  if (!userRole) return false
  return userRole.permissions.includes(permission)
}

export function isAdmin(userRole: UserRoles | null): boolean {
  if (!userRole) return false
  return userRole.role === UserRole.ADMIN || userRole.role === UserRole.SUPER_ADMIN
}

export function isSuperAdmin(userRole: UserRoles | null): boolean {
  if (!userRole) return false
  return userRole.role === UserRole.SUPER_ADMIN
}

// Middleware helper for API routes
export async function verifyAdminAccess(uid: string): Promise<{ 
  isAdmin: boolean
  role: UserRoles | null 
}> {
  const role = await getUserRole(uid)
  return {
    isAdmin: isAdmin(role),
    role
  }
}
