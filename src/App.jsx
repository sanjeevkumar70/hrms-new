import React, { useEffect } from 'react'
import { ToastContainer, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import AppRoutes from '@/routes'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { setTheme } from '@/redux/slices/uiSlice'
import Loader from '@/components/common/Loader'

const App = () => {
  const dispatch = useDispatch()
  const theme = useSelector((s) => s.ui.theme)
  const loading = useSelector((s) => s.auth.loading)

  useEffect(() => {
    const stored =
      typeof window !== 'undefined' ? window.localStorage.getItem('theme:mode') : null
    if (stored && ['light', 'dark'].includes(stored)) {
      dispatch(setTheme(stored))
    } else {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      dispatch(setTheme(prefersDark ? 'dark' : 'light'))
    }
  }, [dispatch])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme || 'light')
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1220' : '#ffffff')
    }
  }, [theme])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Loader fullscreen text="Preparing your workspace…" size={52} />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3800}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        theme={theme === 'dark' ? 'dark' : 'light'}
        toastStyle={{
          borderRadius: 14,
          fontFamily:
            '"Plus Jakarta Sans", Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          boxShadow:
            '0 20px 40px -18px rgba(15,23,42,0.35), 0 2px 6px -2px rgba(15,23,42,0.1)',
        }}
      />
    </ErrorBoundary>
  )
}

export default App
