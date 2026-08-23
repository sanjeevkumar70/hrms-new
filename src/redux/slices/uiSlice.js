import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarCollapsed: localStorage.getItem('sidebar:collapsed') === 'true',
  sidebarMobileOpen: false,
  theme: localStorage.getItem('theme:mode') || 'light',
  loadingStack: 0,
  breadcrumbs: [],
  officeSettings: {
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    lateThresholdMinutes: 15,
    timezone: 'America/New_York',
    officeLocation: '500 Market St, HQ, New York, NY',
  },
  leavePolicy: {
    carryOverLimit: 5,
    autoApproveEmployeeIds: [],
    approvalRequiredAboveDays: 3,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (s) => {
      s.sidebarCollapsed = !s.sidebarCollapsed
      localStorage.setItem('sidebar:collapsed', String(s.sidebarCollapsed))
    },
    setSidebarCollapsed: (s, a) => {
      s.sidebarCollapsed = a.payload
      localStorage.setItem('sidebar:collapsed', String(a.payload))
    },
    toggleMobileSidebar: (s) => {
      s.sidebarMobileOpen = !s.sidebarMobileOpen
    },
    closeMobileSidebar: (s) => {
      s.sidebarMobileOpen = false
    },
    setTheme: (s, a) => {
      s.theme = a.payload
      localStorage.setItem('theme:mode', a.payload)
      document.documentElement.setAttribute('data-theme', a.payload)
    },
    toggleTheme: (s) => {
      const next = s.theme === 'light' ? 'dark' : 'light'
      s.theme = next
      localStorage.setItem('theme:mode', next)
      document.documentElement.setAttribute('data-theme', next)
    },
    pushLoading: (s) => { s.loadingStack += 1 },
    popLoading: (s) => { s.loadingStack = Math.max(0, s.loadingStack - 1) },
    setBreadcrumbs: (s, a) => { s.breadcrumbs = a.payload },
    updateOfficeSettings: (s, a) => { s.officeSettings = { ...s.officeSettings, ...a.payload } },
    updateLeavePolicy: (s, a) => { s.leavePolicy = { ...s.leavePolicy, ...a.payload } },
  },
})

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  closeMobileSidebar,
  setTheme,
  toggleTheme,
  pushLoading,
  popLoading,
  setBreadcrumbs,
  updateOfficeSettings,
  updateLeavePolicy,
} = uiSlice.actions

export default uiSlice.reducer
