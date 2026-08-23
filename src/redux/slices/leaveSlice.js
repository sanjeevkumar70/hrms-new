import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { leaveService } from '@/services/leaveService'
import { toast } from 'react-toastify'

const initialState = {
  myLeaves: { data: [], total: 0, totalPages: 1, page: 1, perPage: 15 },
  teamLeaves: { data: [], total: 0, totalPages: 1, page: 1, perPage: 15 },
  types: [],
  balance: [],
  statistics: [],
  loading: false,
}

const thunk = (name, fn) =>
  createAsyncThunk(`leave/${name}`, async (payload, { rejectWithValue }) => {
    try {
      return await fn(payload)
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed')
    }
  })

export const fetchMyLeaves = thunk('myLeaves', (p) => leaveService.myLeaves(p))
export const fetchTeamLeaves = thunk('teamLeaves', (p) => leaveService.teamLeaves(p))
export const applyLeave = thunk('apply', (p) => leaveService.create(p))
export const cancelLeave = thunk('cancel', ({ id, reason }) => leaveService.cancel(id, reason))
export const approveLeave = thunk('approve', ({ id, remarks }) => leaveService.approve(id, remarks))
export const rejectLeave = thunk('reject', ({ id, remarks }) => leaveService.reject(id, remarks))
export const approveLeavesBatch = thunk('batchApprove', (ids) => leaveService.approveBatch(ids))
export const fetchLeaveTypes = thunk('types', () => leaveService.getTypes())
export const fetchLeaveBalance = thunk('balance', (employeeId) => employeeService.getLeaveBalance(employeeId))
export const fetchLeaveStatistics = thunk('stats', (year) => leaveService.statistics(year))

const handleReject = (m) => (s, a) => {
  s.loading = false
  toast.error(a.payload || m || 'Operation failed')
}

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchMyLeaves.fulfilled, (s, a) => { s.myLeaves = a.payload })
      .addCase(fetchTeamLeaves.fulfilled, (s, a) => { s.teamLeaves = a.payload })
      .addCase(fetchLeaveTypes.fulfilled, (s, a) => { s.types = a.payload })
      .addCase(fetchLeaveBalance.fulfilled, (s, a) => { s.balance = a.payload })
      .addCase(fetchLeaveStatistics.fulfilled, (s, a) => { s.statistics = a.payload })
      .addCase(applyLeave.pending, (s) => { s.loading = true })
      .addCase(applyLeave.fulfilled, (s, a) => {
        s.loading = false
        toast.success('Leave request submitted')
      })
      .addCase(applyLeave.rejected, handleReject('Failed to submit leave'))
      .addCase(cancelLeave.fulfilled, () => { toast.success('Leave cancelled') })
      .addCase(cancelLeave.rejected, handleReject('Failed to cancel'))
      .addCase(approveLeave.fulfilled, () => { toast.success('Leave approved') })
      .addCase(approveLeave.rejected, handleReject('Failed to approve'))
      .addCase(rejectLeave.fulfilled, () => { toast.success('Leave rejected') })
      .addCase(rejectLeave.rejected, handleReject('Failed to reject'))
      .addCase(approveLeavesBatch.fulfilled, (_, a) => { toast.success(`${a.payload.approved} leave(s) approved`) })
  },
})

export default leaveSlice.reducer
