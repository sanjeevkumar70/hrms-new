import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleMobileSidebar, toggleTheme } from '@/redux/slices/uiSlice'
import { logout } from '@/redux/slices/authSlice'
import { useAuth } from '@/hooks/useAuth'
import { Breadcrumb, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from 'reactstrap'
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiMoon,
  FiSun,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMail,
} from 'react-icons/fi'
import { dashboardService } from '@/services/dashboardService'
import { formatDateTime, getInitials, cx } from '@/utils'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { breadcrumbs, theme } = useSelector((s) => s.ui)
  const { employee } = useAuth()
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    dashboardService.notifications().then((list) => {
      if (mounted.current) setNotifications(list)
    })
    return () => { mounted.current = false }
  }, [])

  const unread = notifications.filter((n) => n.unread).length

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="app-navbar">
      <button
        className="sidebar-toggle d-none d-lg-inline-flex"
        type="button"
        onClick={() => dispatch(toggleMobileSidebar())}
        aria-label="Toggle sidebar"
      >
        <FiMenu />
      </button>
      <button
        className="sidebar-toggle d-lg-none"
        type="button"
        onClick={() => dispatch(toggleMobileSidebar())}
        aria-label="Open menu"
      >
        <FiMenu />
      </button>

      <div className="breadcrumb-wrap d-none d-md-block">
        <Breadcrumb listClassName="m-0">
          {breadcrumbs.map((bc, i) => (
            <li
              key={bc.to + i}
              className={cx('breadcrumb-item', i === breadcrumbs.length - 1 && 'active')}
              aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
            >
              {i === breadcrumbs.length - 1 ? bc.label : <Link to={bc.to}>{bc.label}</Link>}
            </li>
          ))}
        </Breadcrumb>
      </div>

      <div className="navbar-actions ms-auto">
        <div className="navbar-search">
          <FiSearch className="search-icon" />
          <input placeholder="Search employees, reports…" aria-label="Search" />
        </div>
        <button className="nav-icon-btn d-none d-md-inline-flex" type="button" onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
        <Dropdown isOpen={notifyOpen} toggle={() => setNotifyOpen((v) => !v)} direction="down">
          <DropdownToggle
            tag="button"
            className="nav-icon-btn"
            onClick={(e) => { e.preventDefault(); setNotifyOpen((v) => !v) }}
            aria-label="Notifications"
          >
            <FiBell />
            {unread > 0 && <span className="badge-count">{unread}</span>}
          </DropdownToggle>
          <DropdownMenu end className="p-0 shadow-lg" style={{ minWidth: 340 }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="m-0">Notifications</h6>
              <Badge pill color="primary">{unread} new</Badge>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {notifications.length === 0 && (
                <div className="p-5 text-center text-muted small">No notifications</div>
              )}
              {notifications.map((n) => (
                <DropdownItem key={n.id} className={cx('px-3 py-2 border-bottom', n.unread && 'bg-light')}>
                  <div className="d-flex gap-2 align-items-start">
                    <div className="avatar sm" style={{ background: n.unread ? '#2563eb' : '#94a3b8' }}>
                      <FiBell size={12} />
                    </div>
                    <div className="flex-1">
                      <div className={cx('small', n.unread ? 'fw-semibold text-slate-900' : 'text-slate-700')}>{n.title}</div>
                      <div className="text-muted small">{n.subtitle}</div>
                      <div className="text-xs text-slate-400 mt-1">{formatDateTime(n.createdAt)}</div>
                    </div>
                  </div>
                </DropdownItem>
              ))}
            </div>
            <div className="p-2 text-center border-top">
              <button className="btn btn-outline btn-sm w-100">View all</button>
            </div>
          </DropdownMenu>
        </Dropdown>
        <Dropdown isOpen={userOpen} toggle={() => setUserOpen((v) => !v)} direction="down">
          <DropdownToggle
            tag="div"
            className="user-dropdown-btn"
            onClick={() => setUserOpen((v) => !v)}
          >
            <div className="avatar sm">{getInitials(employee?.name)}</div>
            <div className="user-info">
              <div className="name">{employee?.name || 'User'}</div>
              <div className="role">{(employee?.designation || 'Guest').toString()}</div>
            </div>
          </DropdownToggle>
          <DropdownMenu end className="shadow-lg p-2" style={{ minWidth: 220 }}>
            <div className="px-3 py-2 d-flex align-items-center gap-3 border-bottom mb-1">
              <div className="avatar md">{getInitials(employee?.name)}</div>
              <div>
                <div className="fw-semibold small">{employee?.name}</div>
                <div className="text-muted small">{employee?.email}</div>
              </div>
            </div>
            <DropdownItem onClick={() => navigate('/profile')} className="rounded-2 px-3 py-2">
              <FiUser className="me-2" /> My Profile
            </DropdownItem>
            <DropdownItem onClick={() => navigate('/profile/change-password')} className="rounded-2 px-3 py-2">
              <FiMail className="me-2" /> Change Password
            </DropdownItem>
            <DropdownItem onClick={() => navigate('/settings')} className="rounded-2 px-3 py-2">
              <FiSettings className="me-2" /> Settings
            </DropdownItem>
            <div className="dropdown-divider" />
            <DropdownItem onClick={handleLogout} className="rounded-2 px-3 py-2 text-danger">
              <FiLogOut className="me-2" /> Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}

export default Navbar
