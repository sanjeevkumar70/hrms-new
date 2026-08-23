import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }
  return children
}

export default GuestRoute
