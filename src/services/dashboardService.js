import { Mock, api } from './apiClient'

const growth = (months = 12) => {
  const out = []
  let count = 10
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    count += 1 + (i % 3)
    out.push({
      month: d.toLocaleString('en-US', { month: 'short' }),
      employees: count,
    })
  }
  return out
}

export const dashboardService = {
  stats: async () => {
    await api.get('/dashboard/stats')
    const overview = {
      total: Mock.EMPLOYEES.filter((e) => e.status === 'active').length,
      present: 0,
      absent: 0,
      late: 0,
      wfh: 0,
      halfday: 0,
      leave: 0,
      pendingLeaves: Mock.LEAVES.filter((l) => l.status === 'pending').length,
    }
    const today = new Date().toISOString().split('T')[0]
    Mock.EMPLOYEES.filter((e) => e.status === 'active').forEach((e) => {
      const r = Mock.ATTENDANCE.find((a) => a.employeeId === e.id && a.date === today)
      if (r) overview[r.status] = (overview[r.status] || 0) + 1
      else {
        const onLeave = Mock.LEAVES.some(
          (l) => l.employeeId === e.id && l.status === 'approved' && l.fromDate <= today && l.toDate >= today
        )
        if (onLeave) overview.leave += 1
        else overview.absent += 1
      }
    })
    return overview
  },

  recentActivities: async (limit = 10) => {
    await api.get('/dashboard/recent', { limit })
    return Mock.ACTIVITIES.slice(0, limit)
  },

  upcomingHolidays: async (limit = 6) => {
    await api.get('/dashboard/holidays', { limit })
    const today = new Date().toISOString().split('T')[0]
    return Mock.HOLIDAYS.filter((h) => h.date >= today)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, limit)
  },

  todaysBirthdays: async () => {
    await api.get('/dashboard/birthdays')
    return Mock.TODAYS_BIRTHDAYS.map((e) => ({
      id: e.id,
      name: e.name,
      designation: e.designation,
      department: e.department,
      dateOfBirth: e.dateOfBirth,
    }))
  },

 

  monthlyAttendance: async () => {
    await api.get('/dashboard/charts')
    const data = []
    for (let i = 19; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      data.push({
        date: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        present: 14 + (i % 5),
        wfh: 2 + (i % 3),
        absent: 1 + (i % 2),
      })
    }
    return data
  },

  employeeGrowth: async (months = 12) => {
    await api.get('/dashboard/employee-growth', { months })
    return growth(months)
  },

  notifications: async () => Mock.NOTIFICATIONS,
  holidays: async () => Mock.HOLIDAYS,
  officeSettings: async () => Mock.OFFICE_SETTINGS,
}
