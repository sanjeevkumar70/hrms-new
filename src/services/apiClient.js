import axios from 'axios'
import { toast } from 'react-toastify'
import { sleep } from '@/utils'
import * as Mock from '@/utils/mockData'

const USE_MOCK = true

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const state = window.__REDUX_STORE__?.getState?.()
    const token = state?.auth?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error?.response?.status
    const store = window.__REDUX_STORE__
    if (status === 401) {
      store?.dispatch?.({ type: 'auth/logout' })
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      toast.error('Permission denied.')
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error?.response?.data || error.message || 'Request failed')
  }
)

const mock = async (returnValue, delay = 350) => {
  await sleep(delay)
  return returnValue
}

export const api = {
  get: async (url, params) => {
    if (USE_MOCK) return mock({ data: null, message: 'OK' })
    return apiClient.get(url, { params })
  },
  post: async (url, body, config) => {
    if (USE_MOCK) return mock({ data: body || null, message: 'Created' })
    return apiClient.post(url, body, config)
  },
  put: async (url, body) => {
    if (USE_MOCK) return mock({ data: body || null, message: 'Updated' })
    return apiClient.put(url, body)
  },
  patch: async (url, body) => {
    if (USE_MOCK) return mock({ data: body || null, message: 'Patched' })
    return apiClient.patch(url, body)
  },
  delete: async (url) => {
    if (USE_MOCK) return mock({ message: 'Deleted' })
    return apiClient.delete(url)
  },
}

export default apiClient
export { Mock }
