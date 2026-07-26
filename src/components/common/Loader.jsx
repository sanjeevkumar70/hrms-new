import React from 'react'
import { cx } from '@/utils'

const Loader = ({ text = 'Loading…', fullscreen, size = 40, className }) => {
  const style = fullscreen
    ? { position: 'fixed', inset: 0, background: 'rgba(248,250,252,0.92)', zIndex: 9999 }
    : {}
  return (
    <div className={cx('loader', className)} style={style}>
      <div className="spinner" style={{ width: size, height: size, borderWidth: Math.max(3, size / 12) }} />
      {text && <div className="small">{text}</div>}
    </div>
  )
}

export const Skeleton = ({ className, count = 1, type = 'row' }) => {
  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} className={cx('skeleton', type, className)} />
  ))
  return <>{items}</>
}

export const EmptyState = ({ icon: Icon, title = 'No data found', description = '', action }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{Icon ? <Icon /> : '📭'}</div>
      <h4>{title}</h4>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export default Loader
