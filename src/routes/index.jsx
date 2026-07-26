import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'
import Loader from '@/components/common/Loader'
import { ROLES } from '@/utils'
import Update from '@/pages/update/Update'

const PageFallback = ({ text = 'Loading page…' }) => (
  <div style={{ padding: 48, display: 'grid', placeItems: 'center', minHeight: 240 }}>
    <Loader text={text} size={48} />
  </div>
)

const Login = lazy(() => import('@/pages/auth/Login.jsx'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword.jsx'))
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard.jsx'))
const Attendance = lazy(() => import('@/pages/attendance/Attendance.jsx'))
const Leaves = lazy(() => import('@/pages/leaves/Leaves.jsx'))
const Employees = lazy(() => import('@/pages/employees/Employees.jsx'))
const Holidays = lazy(() => import('@/pages/holidays/Holidays.jsx'))
const Reports = lazy(() => import('@/pages/reports/Reports.jsx'))
const Profile = lazy(() => import('@/pages/profile/Profile.jsx'))
const Settings = lazy(() => import('@/pages/settings/Settings.jsx'))
const NotFound = lazy(() => import('@/pages/errors/NotFound.jsx'))

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route
          path="/"
          element={
            <GuestRoute>
              <AuthLayout />
            </GuestRoute>
          }
        >
          <Route index element={<Navigate to="/login" replace />} />
          <Route
            path="login"
            element={
              <Suspense fallback={<PageFallback />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="forgot-password"
            element={
              <Suspense fallback={<PageFallback />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route
            path="reset-password/:token?"
            element={
              <Suspense fallback={<PageFallback />}>
                <ResetPassword />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageFallback />}>
                <Dashboard />
              </Suspense>
            }
          />

          <Route
            path="update"
            element={
              <Suspense fallback={<PageFallback />}>
                <Update />
              </Suspense>
            }
          />
          <Route
            path="attendance"
            element={
              <Suspense fallback={<PageFallback />}>
                <Attendance />
              </Suspense>
            }
          />

          <Route
            path="leaves"
            element={
              <Suspense fallback={<PageFallback />}>
                <Leaves />
              </Suspense>
            }
          />
          <Route
            path="leaves/request"
            element={
              <Suspense fallback={<PageFallback />}>
                <Leaves defaultTab="request" />
              </Suspense>
            }
          />

          <Route
            path="employees"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.MANAGER]}>
                <Suspense fallback={<PageFallback />}>
                  <Employees />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="employees/add"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <Suspense fallback={<PageFallback />}>
                  <Employees defaultAction="add" />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="employees/edit/:id"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <Suspense fallback={<PageFallback />}>
                  <Employees />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="holidays"
            element={
              <Suspense fallback={<PageFallback />}>
                <Holidays />
              </Suspense>
            }
          />

          <Route
            path="reports"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.MANAGER]}>
                <Suspense fallback={<PageFallback />}>
                  <Reports />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <Suspense fallback={<PageFallback />}>
                <Profile />
              </Suspense>
            }
          />

          <Route
            path="settings"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <Suspense fallback={<PageFallback />}>
                  <Settings />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <Suspense fallback={<PageFallback />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
