import { Mock, api } from './apiClient'
import { paginate, uid } from '@/utils'

export const leaveService = {
  myLeaves: async ({ status, page = 1, perPage = 15 } = {}) => {
    await api.get('/leaves/mine', { status })
    const store = window.__REDUX_STORE__?.getState?.()
    const empId = store?.auth?.user?.employee?.id
    let list = Mock.LEAVES.filter((l) => !empId || l.employeeId === empId)
    if (status) list = list.filter((l) => l.status === status)
    list = [...list].sort((a, b) => (a.fromDate < b.fromDate ? 1 : -1))
    return paginate(list, page, perPage)
  },

  teamLeaves: async ({ status, page = 1, perPage = 15 } = {}) => {
    await api.get('/leaves/team', { status })
    let list = Mock.LEAVES.slice()
    if (status) list = list.filter((l) => l.status === status)
    list = list.map((l) => {
      const emp = Mock.EMPLOYEES.find((e) => e.id === l.employeeId)
      return {
        ...l,
        department: emp?.department,
        designation: emp?.designation,
      }
    })
    list.sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1))
    return paginate(list, page, perPage)
  },

  create: async (payload) => {
    await api.post('/leaves', payload)
    const store = window.__REDUX_STORE__?.getState?.()
    const emp = store?.auth?.user?.employee
    const lt = Mock.LEAVE_TYPES.find((l) => l.id === payload.leaveTypeId) || {}
    const leave = {
      id: uid('lv'),
      employeeId: emp.id,
      employeeName: emp.name,
      leaveType: lt.name,
      leaveTypeId: lt.id,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      days: payload.days,
      reason: payload.reason,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      reviewedAt: null,
      managerRemarks: '',
      approvedBy: null,
    }
    Mock.LEAVES.unshift(leave)
    return leave
  },

  cancel: async (id, reason = '') => {
    await api.post(`/leaves/${id}/cancel`, { reason })
    const idx = Mock.LEAVES.findIndex((l) => l.id === id)
    if (idx === -1) throw new Error('Leave not found')
    if (Mock.LEAVES[idx].status !== 'pending') {
      throw new Error('Only pending leaves can be cancelled')
    }
    const updated = {
      ...Mock.LEAVES[idx],
      status: 'cancelled',
      managerRemarks: reason || 'Cancelled by applicant',
      reviewedAt: new Date().toISOString(),
    }
    Mock.LEAVES.splice(idx, 1, updated)
    return updated
  },

  approve: async (id, remarks = '') => {
    await api.post(`/leaves/${id}/approve`, { remarks })
    const idx = Mock.LEAVES.findIndex((l) => l.id === id)
    if (idx === -1) throw new Error('Leave not found')
    const store = window.__REDUX_STORE__?.getState?.()
    const updated = {
      ...Mock.LEAVES[idx],
      status: 'approved',
      managerRemarks: remarks || Mock.LEAVES[idx].managerRemarks,
      reviewedAt: new Date().toISOString(),
      approvedBy: store?.auth?.user?.employee?.id || null,
    }
    Mock.LEAVES.splice(idx, 1, updated)
    return updated
  },

  reject: async (id, remarks) => {
    await api.post(`/leaves/${id}/reject`, { remarks })
    if (!remarks) throw new Error('Remarks are required for rejection')
    const idx = Mock.LEAVES.findIndex((l) => l.id === id)
    if (idx === -1) throw new Error('Leave not found')
    const store = window.__REDUX_STORE__?.getState?.()
    const updated = {
      ...Mock.LEAVES[idx],
      status: 'rejected',
      managerRemarks: remarks,
      reviewedAt: new Date().toISOString(),
      approvedBy: store?.auth?.user?.employee?.id || null,
    }
    Mock.LEAVES.splice(idx, 1, updated)
    return updated
  },

  approveBatch: async (ids = []) => {
    await api.post('/leaves/batch-approve', { ids })
    const store = window.__REDUX_STORE__?.getState?.()
    const by = store?.auth?.user?.employee?.id || null
    const reviewedAt = new Date().toISOString()
    let approved = 0
    ids.forEach((id) => {
      const idx = Mock.LEAVES.findIndex((l) => l.id === id)
      if (idx !== -1 && Mock.LEAVES[idx].status === 'pending') {
        const updated = {
          ...Mock.LEAVES[idx],
          status: 'approved',
          reviewedAt,
          approvedBy: by,
        }
        Mock.LEAVES.splice(idx, 1, updated)
        approved++
      }
    })
    return { approved }
  },

  getTypes: async () => Mock.LEAVE_TYPES,

  createType: async (payload) => {
    await api.post('/leave-types', payload)
    const lt = { id: uid('lt'), ...payload }
    Mock.LEAVE_TYPES.push(lt)
    return lt
  },

  updateType: async (id, payload) => {
    await api.put(`/leave-types/${id}`, payload)
    const idx = Mock.LEAVE_TYPES.findIndex((l) => l.id === id)
    if (idx === -1) throw new Error('Leave type not found')
    Mock.LEAVE_TYPES[idx] = { ...Mock.LEAVE_TYPES[idx], ...payload }
    return Mock.LEAVE_TYPES[idx]
  },

  deleteType: async (id) => {
    await api.delete(`/leave-types/${id}`)
    const idx = Mock.LEAVE_TYPES.findIndex((l) => l.id === id)
    if (idx !== -1) Mock.LEAVE_TYPES.splice(idx, 1)
    return { id }
  },

  statistics: async (year = new Date().getFullYear()) => {
    await api.get('/leaves/statistics', { year })
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return Mock.LEAVE_TYPES.map((lt) => ({
      name: lt.name,
      color: lt.color,
      data: months.map((_, i) => 2 + ((i + lt.daysAllocated) % 8)),
    }))
  },
}
