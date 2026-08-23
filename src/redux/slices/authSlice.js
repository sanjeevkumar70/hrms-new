import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '@/services/authService'
import { toast } from 'react-toastify'

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    return await authService.login(payload)
  } catch (err) {
    toast.error(err?.message || 'Login failed')
    return rejectWithValue(err?.message || 'Login failed')
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout()
    return true
  } catch (err) {
    return rejectWithValue(err?.message)
  }
})

const initialState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError: (s) => {
      s.error = null
    },
    refreshUser: (s, action) => {
      if (s.user?.employee) {
        s.user.employee = { ...s.user.employee, ...action.payload }
      }
    },
  },
  extraReducers: (b) => {
    b
      .addCase(login.pending, (s) => {
        s.loading = true
        s.error = null
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false
        s.token = a.payload.token
        s.user = a.payload.user
        s.role = a.payload.user.role
        s.isAuthenticated = true
        toast.success(`Welcome back, ${a.payload.user.employee?.firstName || 'User'}!`)
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false
        s.error = a.payload
      })
      .addCase(logout.fulfilled, (s) => {
        Object.assign(s, { ...initialState })
      })
  },
})

export const { resetAuthError, refreshUser } = authSlice.actions
export default authSlice.reducer
