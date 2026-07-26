import React from 'react'
import { cx, getInitials } from '@/utils'

const Avatar = ({ src, name, size = 'md', className, style }) => {
  const sizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80, '2xl': 120 }
  const s = sizes[size] || 40
  const initials = getInitials(name)
  return (
    <div
      className={cx('avatar', size, className)}
      style={{ width: s, height: s, fontSize: s * 0.38, ...style }}
    >
      {src ? (
        <img src={src} alt={name || 'avatar'} loading="lazy" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export default Avatar
