import React from 'react'
import { cx, getStatusConfig } from '@/utils'

export const StatusBadge = ({ status, label, variant, pulse = false }) => {
  const cfg = getStatusConfig(status) || {}
  const v = variant || cfg.variant || 'info'
  return (
    <span className={cx('badge', `badge-${v}`, pulse && 'badge-pulse')} title={label || cfg.label}>
      <span className="status-dot me-2" style={{ background: 'currentColor', opacity: 0.8 }} />
      {label || cfg.label || status}
    </span>
  )
}

export const StatCard = ({ label, value, icon: Icon, delta, deltaUp = true, accent = '#2563eb', children }) => {
  const gradientStyle = {
    background: `linear-gradient(135deg, ${accent}, ${shade(accent, -18)})`,
  }
  return (
    <div className="card card-stat">
      <div className="stat-accent" style={{ background: accent }} />
      <div className="stat-icon" style={gradientStyle}>
        {Icon ? <Icon /> : null}
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {(delta || children) && (
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {delta ? (
            <span className={cx('stat-delta', deltaUp ? 'up' : 'down')}>
              {deltaUp ? '▲' : '▼'} {delta}
            </span>
          ) : null}
          {children}
        </div>
      )}
    </div>
  )
}

function shade(hex, percent) {
  const f = parseInt(hex.slice(1), 16)
  const t = percent < 0 ? 0 : 255
  const p = Math.abs(percent) / 100
  const R = f >> 16
  const G = (f >> 8) & 0x00ff
  const B = f & 0x0000ff
  const r = Math.round((t - R) * p) + R
  const g = Math.round((t - G) * p) + G
  const b = Math.round((t - B) * p) + B
  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export default StatusBadge
