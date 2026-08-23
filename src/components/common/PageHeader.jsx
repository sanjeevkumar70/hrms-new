import React from 'react'
import { cx } from '@/utils'
import { motion } from 'framer-motion'

const PageHeader = ({ title, subtitle, actions, children, className }) => {
  return (
    <div className={cx('page-header', className)}>
      <motion.div
        className="page-title-wrap"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </motion.div>
      <motion.div
        className="page-actions"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        {actions}
        {children}
      </motion.div>
    </div>
  )
}

export default PageHeader
