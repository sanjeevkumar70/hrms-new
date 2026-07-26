import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebar, closeMobileSidebar } from '@/redux/slices/uiSlice'
import { logout } from '@/redux/slices/authSlice'
import { usePermissions } from '@/hooks/useAuth'
import {
  FiGrid,
  FiClock,
  FiLogIn,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiUser,
  FiSettings,
  FiLogOut,
  FiBriefcase,
  FiChevronsLeft,
  FiChevronsRight,
  FiBell,
  FiGift,
} from 'react-icons/fi'

const Sidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { sidebarCollapsed, sidebarMobileOpen } = useSelector((s) => s.ui)
  const pendingCount = useSelector((s) => s.leave.teamLeaves.total || 0)
  const perms = usePermissions()

  const items = [
    { to: '/dashboard', icon: FiGrid, label: 'Dashboard', roles: ['admin', 'manager', 'employee'] },
    { to: '/update', icon: FiGrid, label: 'Update', roles: ['admin', 'manager', 'employee'] },
    { to: '/attendance', icon: FiClock, label: 'Attendance', roles: ['admin', 'manager', 'employee'] },
    { to: '/leaves', icon: FiCalendar, label: 'Leave Management', roles: ['admin', 'manager', 'employee'] },
    { to: '/leaves/request', icon: FiGift, label: 'Apply Leave', roles: ['admin', 'manager', 'employee'] },
    perms.canApproveLeaves && { to: '/leaves/approvals', icon: FiBell, label: 'Approvals', roles: ['admin', 'manager'], badge: pendingCount },
    perms.canManageLeaveTypes && { to: '/leaves/types', icon: FiBriefcase, label: 'Leave Types', roles: ['admin'] },
    perms.canManageEmployees && { to: '/employees', icon: FiUsers, label: 'Employees', roles: ['admin', 'manager'] },
    { to: '/holidays', icon: FiCalendar, label: 'Holiday Calendar', roles: ['admin', 'manager', 'employee'] },
    perms.canViewReports && { to: '/reports', icon: FiFileText, label: 'Reports', roles: ['admin', 'manager'] },
    { to: '/profile', icon: FiUser, label: 'Profile', roles: ['admin', 'manager', 'employee'] },
    perms.canAccessSettings && { to: '/settings', icon: FiSettings, label: 'Settings', roles: ['admin', 'manager'] },
  ].filter(Boolean)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  const classes = `sidebar-wrapper ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarMobileOpen ? 'mobile-open' : ''}`

  return (
    <>
      <div
        className={`sidebar-mobile-overlay ${sidebarMobileOpen ? 'show' : ''}`}
        onClick={() => dispatch(closeMobileSidebar())}
        aria-hidden
      />
      <aside className={classes}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <FiBriefcase />
          </div>
          <span className="logo-text">HRMS Pro</span>
          <button
            className="btn btn-icon sm ms-auto d-none d-lg-flex"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar"
            type="button"
          >
            {sidebarCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {items.map((it, idx) => {
            if (it.group) {
              return (
                <div key={`g-${idx}`} className="sidebar-nav-group-title">
                  {it.group}
                </div>
              )
            }
            const Icon = it.icon
            return (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => dispatch(closeMobileSidebar())}
                title={sidebarCollapsed ? it.label : undefined}
              >
                <Icon className="nav-icon" />
                <span className="sidebar-nav-label">{it.label}</span>
                {it.badge ? <span className="badge-count">{it.badge}</span> : null}
              </NavLink>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" type="button" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            <span className="sidebar-nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
