import { User } from '@supabase/supabase-js';

export type Permission = 
  | 'view_sensitive_data'
  | 'manage_applications'
  | 'view_applications'
  | 'manage_users'
  | 'view_reports';

interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

const ADMIN_ROLE: UserRole = {
  id: 'admin',
  name: 'Administrator',
  permissions: [
    'view_sensitive_data',
    'manage_applications',
    'view_applications',
    'manage_users',
    'view_reports'
  ]
};

const MANAGER_ROLE: UserRole = {
  id: 'manager',
  name: 'Manager',
  permissions: [
    'view_sensitive_data',
    'manage_applications',
    'view_applications',
    'view_reports'
  ]
};

const VIEWER_ROLE: UserRole = {
  id: 'viewer',
  name: 'Viewer',
  permissions: [
    'view_applications'
  ]
};

const ROLES: Record<string, UserRole> = {
  admin: ADMIN_ROLE,
  manager: MANAGER_ROLE,
  viewer: VIEWER_ROLE
};

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;

  // Get user's role from user metadata
  const userRole = user.user_metadata?.role as string;
  if (!userRole) return false;

  const role = ROLES[userRole];
  if (!role) return false;

  return role.permissions.includes(permission);
}

export function getUserRole(user: User | null): UserRole | null {
  if (!user) return null;

  const userRole = user.user_metadata?.role as string;
  if (!userRole) return null;

  return ROLES[userRole] || null;
}

export function getAllPermissions(): Permission[] {
  return Object.values(ROLES).flatMap(role => role.permissions);
}

export function getRolePermissions(roleId: string): Permission[] {
  return ROLES[roleId]?.permissions || [];
} 