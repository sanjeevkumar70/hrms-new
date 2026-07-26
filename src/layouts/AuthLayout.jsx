import React from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <AnimatePresence mode="wait">
        <motion.div
          key="auth"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="auth-inner"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AuthLayout
