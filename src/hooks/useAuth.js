import { useSelector } from 'react-redux'
import { ROLES } from '@/utils'

const HIEARCHY = { [ROLES.ADMIN]: 3, [ROLES.MANAGER]: 2, [ROLES.EMPLOYEE]: 1 }

export const useAuth = () => {
  const { user, role, isAuthenticated, token, loading } = useSelector((s) => s.auth)

  return { user, role, isAuthenticated, token, loading, employee: user?.employee }
}

export const usePermissions = () => {
  const { role } = useAuth()
  const hasRole = (r) => {
    if (!r) return true
    if (Array.isArray(r)) return r.includes(role)
    return r === role
  }
  const atLeast = (r) => (HIEARCHY[role] || 0) >= (HIEARCHY[r] || 0)
  return {
    can: hasRole,
    atLeast,
    isAdmin: role === ROLES.ADMIN,
    isManager: role === ROLES.MANAGER,
    isEmployee: role === ROLES.EMPLOYEE,
    canManageEmployees: atLeast(ROLES.MANAGER),
    canApproveLeaves: atLeast(ROLES.MANAGER),
    canManageLeaveTypes: role === ROLES.ADMIN,
    canViewReports: atLeast(ROLES.MANAGER),
    canAccessSettings: atLeast(ROLES.MANAGER),
  }
}
