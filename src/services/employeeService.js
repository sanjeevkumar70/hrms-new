import { Mock, api } from './apiClient'
import { paginate, sortBy, uid } from '@/utils'

const matchesSearch = (emp, q) => {
  if (!q) return true
  const s = q.toLowerCase()
  return (
    emp.name.toLowerCase().includes(s) ||
    emp.employeeId.toLowerCase().includes(s) ||
    emp.email.toLowerCase().includes(s) ||
    emp.department.toLowerCase().includes(s) ||
    emp.designation.toLowerCase().includes(s)
  )
}

const statusFor = (emp) => {
  const today = new Date().toISOString().split('T')[0]
  const r = Mock.ATTENDANCE.find((a) => a.employeeId === emp.id && a.date === today)
  if (r) return r.status
  const onLeave = Mock.LEAVES.some(
    (l) => l.employeeId === emp.id && l.status === 'approved' && l.fromDate <= today && l.toDate >= today
  )
  if (onLeave) return 'leave'
  if (new Date().getDay() === 0 || new Date().getDay() === 6) return 'leave'
  return 'absent'
}

const withStatus = (e) => ({ ...e, attendanceStatus: statusFor(e) })

export const employeeService = {
  getAll: async ({ page = 1, perPage = 10, search = '', sortBy: sb = 'name', sortDir = 'asc', department = '', status = '' } = {}) => {
    await api.get('/employees', { page, perPage, search })
    let list = Mock.EMPLOYEES.filter((e) => status !== 'inactive' ? e.status === 'active' : true)
    if (department) list = list.filter((e) => e.departmentId === department)
    list = list.filter((e) => matchesSearch(e, search))
    if (status) list = list.filter((e) => e.status === status)
    list = sortBy(list, sb, sortDir).map(withStatus)
    return paginate(list, page, perPage)
  },

  getById: async (id) => {
    await api.get(`/employees/${id}`)
    const emp = Mock.EMPLOYEES.find((e) => e.id === id)
    if (!emp) throw new Error('Employee not found')
    return withStatus(emp)
  },

  create: async (payload) => {
    await api.post('/employees', payload)
    const newEmp = {
      id: uid('emp'),
      userId: uid('u'),
      employeeId: `EMP-${String(1100 + Mock.EMPLOYEES.length).padStart(4, '0')}`,
      status: 'active',
      ...payload,
      name: `${payload.firstName} ${payload.lastName}`,
      joiningDate: payload.joiningDate || new Date().toISOString(),
    }
    Mock.EMPLOYEES.unshift(newEmp)
    return newEmp
  },

  update: async (id, payload) => {
    await api.put(`/employees/${id}`, payload)
    const idx = Mock.EMPLOYEES.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Employee not found')
    Mock.EMPLOYEES[idx] = {
      ...Mock.EMPLOYEES[idx],
      ...payload,
      name: payload.firstName && payload.lastName ? `${payload.firstName} ${payload.lastName}` : Mock.EMPLOYEES[idx].name,
    }
    return Mock.EMPLOYEES[idx]
  },

  remove: async (id) => {
    await api.delete(`/employees/${id}`)
    const idx = Mock.EMPLOYEES.findIndex((e) => e.id === id)
    if (idx !== -1) Mock.EMPLOYEES.splice(idx, 1)
    return { id }
  },

  getLeaveBalance: async (employeeId) => {
    await api.get(`/employees/${employeeId}/leave-balance`)
    const balances = Mock.LEAVE_BALANCE.filter((b) => b.employeeId === employeeId)
    return balances.map((b) => ({
      ...b,
      leaveType: Mock.LEAVE_TYPES.find((lt) => lt.id === b.leaveTypeId)?.name || 'Leave',
      color: Mock.LEAVE_TYPES.find((lt) => lt.id === b.leaveTypeId)?.color,
      allocated: Mock.LEAVE_TYPES.find((lt) => lt.id === b.leaveTypeId)?.daysAllocated || 0,
    }))
  },

  getDepartments: async () => Mock.DEPARTMENTS,
  getDesignations: async () => Mock.DESIGNATIONS,
}
