import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { attendanceService } from '@/services/attendanceService'
import { toast } from 'react-toastify'

const initialState = {
  today: null,
  history: { data: [], total: 0, totalPages: 1, page: 1, perPage: 15 },
  overview: null,
  monthly: [],
  loading: false,
}

const thunk = (name, fn) =>
  createAsyncThunk(`attendance/${name}`, async (payload, { rejectWithValue }) => {
    try {
      return await fn(payload)
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed')
    }
  })

export const punchIn = thunk('punchIn', (p) => attendanceService.punchIn(p))
export const punchOut = thunk('punchOut', (p) => attendanceService.punchOut(p))
export const fetchTodayAttendance = thunk('today', () => attendanceService.today())
export const fetchAttendanceHistory = thunk('history', (p) => attendanceService.history(p))
export const fetchOverview = thunk('overview', (d) => attendanceService.overview(d))
export const fetchMonthly = thunk('monthly', ({ month, year }) => attendanceService.monthly(month, year))

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setTodayWorkingMinutes: (s, a) => {
      if (s.today) s.today.workingMinutes = a.payload
    },
  },
  extraReducers: (b) => {
    b
      .addCase(punchIn.pending, (s) => { s.loading = true })
      .addCase(punchIn.fulfilled, (s, a) => {
      console.log(s.today,'this is mine')

        s.loading = false
        s.today = a.payload
        toast.success('Punched in successfully!')
      })
      .addCase(punchIn.rejected, (s, a) => {
        s.loading = false
        toast.error(a.payload || 'Failed to punch in')
      })
      .addCase(punchOut.pending, (s) => { s.loading = true })
      .addCase(punchOut.fulfilled, (s, a) => {
        s.loading = false
        s.today = a.payload
        toast.success('Punched out successfully!')
      })
      .addCase(punchOut.rejected, (s, a) => {
        s.loading = false
        toast.error(a.payload || 'Failed to punch out')
      })
      .addCase(fetchTodayAttendance.fulfilled, (s, a) => { s.today = a.payload })
      .addCase(fetchAttendanceHistory.fulfilled, (s, a) => { s.history = a.payload })
      .addCase(fetchOverview.fulfilled, (s, a) => { s.overview = a.payload })
      .addCase(fetchMonthly.fulfilled, (s, a) => { s.monthly = a.payload })
  },
})

export const { setTodayWorkingMinutes } = attendanceSlice.actions
export default attendanceSlice.reducer
