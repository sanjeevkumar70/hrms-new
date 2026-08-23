import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { employeeService } from '@/services/employeeService'
import { toast } from 'react-toastify'

const initialState = {
  list: [],
  totalPages: 1,
  total: 0,
  currentPage: 1,
  perPage: 10,
  currentItem: null,
  loading: false,
  error: null,
  departments: [],
  designations: [],
}

const thunk = (name, fn) =>
  createAsyncThunk(`employee/${name}`, async (payload, { rejectWithValue }) => {
    try {
      return await fn(payload)
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed')
    }
  })

export const fetchEmployees = thunk('fetchAll', (p) => employeeService.getAll(p))
export const fetchEmployee = thunk('fetchById', (id) => employeeService.getById(id))
export const createEmployee = thunk('create', (p) => employeeService.create(p))
export const updateEmployee = thunk('update', ({ id, ...rest }) => employeeService.update(id, rest))
export const deleteEmployee = thunk('delete', (id) => employeeService.remove(id))
export const fetchDepartments = thunk('depts', () => employeeService.getDepartments())
export const fetchDesignations = thunk('desig', () => employeeService.getDesignations())

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setPage: (s, a) => { s.currentPage = a.payload },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchEmployees.pending, (s) => { s.loading = true })
      .addCase(fetchEmployees.fulfilled, (s, a) => {
        s.loading = false
        s.list = a.payload.data
        s.total = a.payload.total
        s.totalPages = a.payload.totalPages
        s.currentPage = a.payload.page
        s.perPage = a.payload.perPage
      })
      .addCase(fetchEmployees.rejected, (s) => { s.loading = false })
      .addCase(fetchEmployee.pending, (s) => { s.loading = true })
      .addCase(fetchEmployee.fulfilled, (s, a) => { s.loading = false; s.currentItem = a.payload })
      .addCase(fetchEmployee.rejected, (s) => { s.loading = false })
      .addCase(createEmployee.fulfilled, () => { toast.success('Employee added successfully') })
      .addCase(createEmployee.rejected, (_, a) => { toast.error(a.payload || 'Failed to add employee') })
      .addCase(updateEmployee.fulfilled, () => { toast.success('Employee updated') })
      .addCase(updateEmployee.rejected, (_, a) => { toast.error(a.payload || 'Failed to update') })
      .addCase(deleteEmployee.fulfilled, () => { toast.success('Employee deleted') })
      .addCase(deleteEmployee.rejected, (_, a) => { toast.error(a.payload || 'Failed to delete') })
      .addCase(fetchDepartments.fulfilled, (s, a) => { s.departments = a.payload })
      .addCase(fetchDesignations.fulfilled, (s, a) => { s.designations = a.payload })
  },
})

export const { setPage } = employeeSlice.actions
export default employeeSlice.reducer
