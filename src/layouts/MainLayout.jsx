import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Footer from './Footer'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAuth } from '@/hooks/useAuth'
import Loader from '@/components/common/Loader'
import { motion, AnimatePresence } from 'framer-motion'

const MainLayout = () => {
  useBreadcrumbs()
  const location = useLocation()
  const { sidebarCollapsed, loadingStack } = useSelector((s) => s.ui)
  const { isAuthenticated } = useAuth()

  return (
    <div className="app-layout">
      <Sidebar />
      <div className={`app-main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar />
        <main className="app-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      {loadingStack > 0 || !isAuthenticated ? null : null}
      {loadingStack > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1040,
          height: 3, background: 'transparent', pointerEvents: 'none'
        }}>
          <div style={{
            width: '30%',
            height: '100%',
            background: 'linear-gradient(90deg, #2563eb, #14b8a6)',
            animation: 'pulseBar 1.2s ease-in-out infinite',
          }} />
        </div>
      )}
      <style>{`@keyframes pulseBar { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }`}</style>
    </div>
  )
}

export default MainLayout
