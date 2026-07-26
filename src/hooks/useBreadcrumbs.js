import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { setBreadcrumbs, closeMobileSidebar } from '@/redux/slices/uiSlice'

const labelMap = {
  dashboard: 'Dashboard',
  attendance: 'Attendance',
  punch: 'Punch In / Out',
  leaves: 'Leaves',
  request: 'Apply Leave',
  approvals: 'Approvals',
  types: 'Leave Types',
  employees: 'Employees',
  add: 'Add Employee',
  edit: 'Edit Employee',
  view: 'View Employee',
  holidays: 'Holiday Calendar',
  reports: 'Reports',
  attendance_report: 'Attendance Report',
  leave_report: 'Leave Report',
  monthly_report: 'Monthly Report',
  profile: 'Profile',
  'change-password': 'Change Password',
  settings: 'Settings',
  office: 'Office Timing',
  'leave-policy': 'Leave Policy',
  roles: 'Roles & Permissions',
  theme: 'Theme Settings',
}

export const useBreadcrumbs = () => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  useEffect(() => {
    dispatch(closeMobileSidebar())
    const parts = pathname.split('/').filter(Boolean)
    const crumbs = [{ label: 'Home', to: '/' }]
    let acc = ''
    parts.forEach((p) => {
      acc += `/${p}`
      const label = labelMap[p] || (p.startsWith('EMP-') ? p : p.charAt(0).toUpperCase() + p.slice(1))
      crumbs.push({ label, to: acc })
    })
    dispatch(setBreadcrumbs(crumbs))
  }, [pathname, dispatch])
}
