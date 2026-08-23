import { Mock, api } from './apiClient'
import { paginate, uid, diffMinutes, isSameDay } from '@/utils'

const todayStr = () => new Date().toISOString().split('T')[0]

export const attendanceService = {
  punchIn: async ({ location = 'Office - HQ New York', note = '' } = {}) => {
    await api.post('/attendance/punch-in', { location, note })
    const store = window.__REDUX_STORE__?.getState?.()
    const empId = store?.auth?.user?.employee?.id
    if (!empId) throw new Error('Unauthorized')
    const now = new Date()
    const rec = {
      id: uid('att'),
      employeeId: empId,
      date: todayStr(),
      punchIn: now.toISOString(),
      punchOut: null,
      workingMinutes: 0,
      status: 'present',
      location,
      note,
    }
    Mock.ATTENDANCE.unshift(rec)
    return rec
  },

  punchOut: async ({ location = 'Office - HQ New York', note = '' } = {}) => {
    await api.put('/attendance/punch-out', { location, note })
    const store = window.__REDUX_STORE__?.getState?.()
    const empId = store?.auth?.user?.employee?.id
    if (!empId) throw new Error('Unauthorized')
    const now = new Date()
    const idx = Mock.ATTENDANCE.findIndex(
      (a) => a.employeeId === empId && a.date === todayStr() && a.punchIn && !a.punchOut
    )
    if (idx === -1) throw new Error('No active punch-in session found')
    const punchOutIso = now.toISOString()
    const workingMinutes = diffMinutes(Mock.ATTENDANCE[idx].punchIn, punchOutIso)
    const updated = {
      ...Mock.ATTENDANCE[idx],
      punchOut: punchOutIso,
      workingMinutes,
      location: location || Mock.ATTENDANCE[idx].location,
      note: note || Mock.ATTENDANCE[idx].note,
    }
    Mock.ATTENDANCE.splice(idx, 1, updated)
    return updated
  },

  today: async () => {
    await api.get('/attendance/today')
    const store = window.__REDUX_STORE__?.getState?.()
    const empId = store?.auth?.user?.employee?.id
    if (!empId) return null
    const todays = Mock.ATTENDANCE.find((a) => a.employeeId === empId && a.date === todayStr())
    return todays || { employeeId: empId, date: todayStr(), status: 'absent' }
  },

  history: async ({ page = 1, perPage = 15, from, to, employeeId, status } = {}) => {
    await api.get('/attendance/history', { page, perPage, from, to, employeeId, status })
    const store = window.__REDUX_STORE__?.getState?.()
    const emp = employeeId || store?.auth?.user?.employee?.id
    let list = Mock.ATTENDANCE.filter((a) => !emp || a.employeeId === emp)
    if (status) list = list.filter((a) => a.status === status)
    if (from) list = list.filter((a) => a.date >= from)
    if (to) list = list.filter((a) => a.date <= to)
    list = [...list].sort((a, b) => (a.date < b.date ? 1 : -1))
    return paginate(list, page, perPage)
  },

  overview: async (date = null) => {
    await api.get('/attendance/overview', { date })
    const d = date || todayStr()
    const counts = { present: 0, absent: 0, late: 0, wfh: 0, halfday: 0, leave: 0, total: Mock.EMPLOYEES.filter((e) => e.status === 'active').length }
    Mock.EMPLOYEES.filter((e) => e.status === 'active').forEach((e) => {
      const rec = Mock.ATTENDANCE.find((a) => a.employeeId === e.id && a.date === d)
      if (rec) counts[rec.status] = (counts[rec.status] || 0) + 1
      else {
        const onLeave = Mock.LEAVES.some(
          (l) => l.employeeId === e.id && l.status === 'approved' && l.fromDate <= d && l.toDate >= d
        )
        if (onLeave) counts.leave += 1
        else if (new Date(d).getDay() % 6 === 0) return
        else counts.absent += 1
      }
    })
    return counts
  },

  monthly: async (month = new Date().getMonth(), year = new Date().getFullYear()) => {
    await api.get('/attendance/monthly', { month, year })
    const data = []
    const numDays = new Date(year, month + 1, 0).getDate()
    for (let i = 1; i <= numDays; i++) {
      const d = new Date(year, month, i)
      if (d.getDay() === 0 || d.getDay() === 6) continue
      const dateStr = d.toISOString().split('T')[0]
      let p = 0, a = 0, l = 0, w = 0
      Mock.ATTENDANCE.filter((x) => x.date === dateStr).forEach((x) => {
        if (x.status === 'present') p++
        else if (x.status === 'late') l++
        else if (x.status === 'wfh') w++
        else a++
      })
      data.push({ date: `Mon ${i}`, present: p + 3, late: l + 1, wfh: w + 1, absent: a })
    }
    return data.slice(-20)
  },
}
