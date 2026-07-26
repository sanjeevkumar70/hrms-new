import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 px-4" style={{
      background: 'radial-gradient(600px 400px at 20% 20%, rgba(37,99,235,0.12), transparent 60%), radial-gradient(500px 400px at 80% 0%, rgba(13,148,136,0.12), transparent 60%), #f8fafc',
    }}>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 90 }}
          className="mb-4"
        >
          <h1 className="text-display fw-bold" style={{ fontSize: 'clamp(5rem, 18vw, 11rem)', lineHeight: 0.9 }}>404</h1>
        </motion.div>
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Page not found
        </motion.h2>
        <p className="text-muted mx-auto mt-3 mb-5" style={{ maxWidth: 480 }}>
          The page you're looking for doesn't exist or you might have mistyped the address. Let's get you back on track.
        </p>
        <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
          <Link to="/dashboard" className="btn btn-primary btn-lg"><FiHome className="me-1" /> Go to Dashboard</Link>
          <Link to="-1" className="btn btn-light btn-lg" onClick={(e) => { e.preventDefault(); window.history.back() }}><FiArrowLeft className="me-1" /> Go Back</Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
