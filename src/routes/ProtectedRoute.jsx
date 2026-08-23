import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Loader from '@/components/common/Loader'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, role, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader fullscreen text="Authenticating…" />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
