import { clsx } from 'clsx'

export { clsx as cx }

export const formatDate = (date, pattern = 'MMM dd, yyyy') => {
  if (!date) return ''
  const d = new Date(date)
  const options = {}
  if (pattern.includes('MMM')) options.month = 'short'
  if (pattern.includes('MMMM')) options.month = 'long'
  if (pattern.includes('MM') && !pattern.includes('MMM')) options.month = '2-digit'
  if (pattern.includes('dd')) options.day = '2-digit'
  if (pattern.includes('yyyy')) options.year = 'numeric'
  if (pattern.includes('yy')) options.year = '2-digit'
  if (pattern.includes('EEEE')) options.weekday = 'long'
  if (pattern.includes('EEE')) options.weekday = 'short'
  return d.toLocaleDateString('en-US', options)
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes)) return '0h 0m'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${h}h ${m}m`
}

export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value || 0)
}

export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value || 0)
}

export const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((p) => p?.[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const uid = (prefix = 'id') => {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

export const sleep = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const debounce = (fn, ms = 300) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn.apply(this, args), ms)
  }
}

export const groupBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const k = typeof key === 'function' ? key(item) : item[key]
    ;(acc[k] = acc[k] || []).push(item)
    return acc
  }, {})
}

export const paginate = (arr, page = 1, perPage = 10) => {
  const start = (page - 1) * perPage
  return {
    data: arr.slice(start, start + perPage),
    total: arr.length,
    totalPages: Math.ceil(arr.length / perPage),
    page,
    perPage,
  }
}

export const sortBy = (arr, field, dir = 'asc') => {
  const sorted = [...arr].sort((a, b) => {
    const av = a[field]
    const bv = b[field]
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'number' && typeof bv === 'number') return av - bv
    return String(av).localeCompare(String(bv), undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  })
  return dir === 'desc' ? sorted.reverse() : sorted
}

export const daysBetween = (from, to) => {
  const start = new Date(from)
  const end = new Date(to)
  const ms = Math.abs(end - start)
  return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1
}

export const diffMinutes = (from, to) => {
  if (!from || !to) return 0
  return Math.max(0, Math.round((new Date(to) - new Date(from)) / 60000))
}

export const classNames = (...args) => clsx(...args)

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const getAvatarUrl = (seed, size = 120) => {
  const s = encodeURIComponent(seed || 'user')
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${s}&backgroundType=gradientLinear&size=${size}`
}

export const getRoleLabel = (role) => {
  const map = { admin: 'Admin', manager: 'Manager', employee: 'Employee' }
  return map[role] || role
}

export const getStatusConfig = (status) => {
  const map = {
    present: { label: 'Present', variant: 'present' },
    absent: { label: 'Absent', variant: 'absent' },
    late: { label: 'Late', variant: 'late' },
    halfday: { label: 'Half Day', variant: 'halfday' },
    wfh: { label: 'WFH', variant: 'wfh' },
    leave: { label: 'On Leave', variant: 'leave' },
    pending: { label: 'Pending', variant: 'pending' },
    approved: { label: 'Approved', variant: 'approved' },
    rejected: { label: 'Rejected', variant: 'rejected' },
    cancelled: { label: 'Cancelled', variant: 'cancelled' },
  }
  return map[status] || { label: status, variant: 'info' }
}

export const getMonthName = (month) => {
  return new Date(2000, month, 1).toLocaleString('en-US', { month: 'long' })
}

export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

export const getFirstWeekdayOfMonth = (year, month) => new Date(year, month, 1).getDay()

export const isSameDay = (d1, d2) => {
  const a = new Date(d1)
  const b = new Date(d2)
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export const isWeekend = (date) => {
  const d = new Date(date).getDay()
  return d === 0 || d === 6
}

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
})
