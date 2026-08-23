import { Mock, api } from './apiClient'
import { uid, paginate, sortBy } from '@/utils'

export const authService = {
  login: async ({ email, password }) => {
    await api.post('/auth/login', { email, password })
    const user = Mock.USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) {
      throw new Error('Invalid email or password.')
    }
    const employee = Mock.EMPLOYEES.find((e) => e.userId === user.id) || null
    return {
      token: `jwt_${uid('tok')}`,
      user: { ...user, password: undefined, employee },
    }
  },

  logout: async () => {
    await api.post('/auth/logout')
    return true
  },

  forgotPassword: async ({ email }) => {
    await api.post('/auth/forgot-password', { email })
    const exists = Mock.USERS.some((u) => u.email.toLowerCase() === email.toLowerCase())
    return {
      sent: true,
      message: exists
        ? `Reset link has been sent to ${email}.`
        : `If ${email} is registered, you will receive a reset link shortly.`,
    }
  },

  resetPassword: async ({ token, password }) => {
    await api.post(`/auth/reset-password/${token}`, { password })
    if (!token) throw new Error('Invalid reset token.')
    return { success: true, message: 'Your password has been updated successfully.' }
  },

  getMe: async () => {
    await api.get('/auth/me')
    return { ok: true }
  },
}
