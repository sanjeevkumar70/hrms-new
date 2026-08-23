import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import { StatusBadge } from '@/components/common/Badges'
import Avatar from '@/components/common/Avatar'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { usePermissions, useAuth } from '@/hooks/useAuth'
import {
  fetchEmployees, fetchDepartments, fetchDesignations, createEmployee, updateEmployee, deleteEmployee,
} from '@/redux/slices/employeeSlice'
import { fetchLeaveBalance } from '@/redux/slices/leaveSlice'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiUserX, FiDownload } from 'react-icons/fi'
import { formatDate, cx, getInitials } from '@/utils'
import { toast } from 'react-toastify'

const employeeSchema = Yup.object({
  firstName: Yup.string().required('First name required'),
  lastName: Yup.string().required('Last name required'),
  email: Yup.string().email('Invalid email').required('Email required'),
  phone: Yup.string().min(8).required('Phone required'),
  departmentId: Yup.string().required('Department required'),
  designationId: Yup.string().required('Designation required'),
  role: Yup.string().oneOf(['admin', 'manager', 'employee']).required('Role required'),
  joiningDate: Yup.string().required('Joining date required'),
  dateOfBirth: Yup.string().required('Date of birth required'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other']).required('Gender required'),
  address: Yup.string().min(5, 'Address too short').required('Address required'),
})

const Employees = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const perms = usePermissions()
  const { list, totalPages, total, currentPage, loading, departments, designations } = useSelector(s => s.employee)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ sortBy: 'name', sortDir: 'asc' })
  const [modal, setModal] = useState({ open: false, mode: 'add', id: null })
  const [view, setView] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [balance, setBalance] = useState([])
  const searchT = useDebounced(search, 400)

  useEffect(() => {
    dispatch(fetchDepartments())
    dispatch(fetchDesignations())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchEmployees({ page, perPage: 10, search: searchT, department: deptFilter, ...sort }))
  }, [dispatch, page, searchT, deptFilter, sort])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    resolver: yupResolver(employeeSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '', phone: '', departmentId: '',
      designationId: '', role: 'employee', joiningDate: '', dateOfBirth: '',
      gender: 'Male', address: '', status: 'active',
    },
  })

  const openAdd = () => {
    reset()
    setModal({ open: true, mode: 'add', id: null })
  }
  const openEdit = (e) => {
    reset({
      firstName: e.firstName, lastName: e.lastName, email: e.email, phone: e.phone,
      departmentId: e.departmentId, designationId: e.designationId, role: e.role,
      joiningDate: (e.joiningDate || '').slice(0, 10),
      dateOfBirth: (e.dateOfBirth || '').slice(0, 10),
      gender: e.gender, address: e.address, status: e.status,
    })
    setModal({ open: true, mode: 'edit', id: e.id })
  }
  const openView = async (e) => {
    setView(e)
    const bal = await dispatch(fetchLeaveBalance(e.id))
    setBalance(bal.payload || [])
  }

  const submitForm = async (values) => {
    if (modal.mode === 'add') {
      await dispatch(createEmployee(values))
    } else {
      await dispatch(updateEmployee({ id: modal.id, ...values }))
    }
    setModal({ open: false, mode: 'add', id: null })
    dispatch(fetchEmployees({ page, perPage: 10, search: searchT, department: deptFilter, ...sort }))
  }

  const desigFiltered = useMemo(() => {
    const dId = watch('departmentId')
    if (!dId) return designations
    return designations.filter(d => d.departmentId === dId)
  }, [designations, watch('departmentId')])

  const columns = [
    {
      name: 'Employee', selector: r => r.name, sortable: true, width: '220px',
      cell: r => (
        <div className="d-flex align-items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => openView(r)}>
          <Avatar size="md" name={r.name} />
          <div>
            <div className="fw-semibold small">{r.name}</div>
            <div className="text-xs text-muted">{r.department} · {r.designation}</div>
          </div>
        </div>
      )
    },
    { name: 'ID', selector: r => r.employeeId, sortable: true, width: '110px', cell: r => <code className="small">{r.employeeId}</code> },
    { name: 'Email', selector: r => r.email, omit: true, cell: r => <span className="small">{r.email}</span> },
    { name: 'Phone', selector: r => r.phone, omit: true, width: '140px', cell: r => <span className="small">{r.phone}</span> },
    { name: 'Joining', selector: r => r.joiningDate, sortable: true, cell: r => <span className="small">{formatDate(r.joiningDate)}</span>, width: '130px' },
    { name: 'Status', width: '130px', center: true, cell: r => <StatusBadge status={r.attendanceStatus} pulse={r.attendanceStatus === 'present'} /> },
    {
      name: 'Leave Bal.', width: '130px', cell: r => {
        const balTotal = 34
        const used = Math.round(balTotal * (Math.random() * 0.5))
        const pct = Math.round(used / balTotal * 100)
        return (
          <div>
            <div className="small text-muted">{used}/{balTotal}</div>
            <div className="progress" style={{ height: 4, marginTop: 4 }}>
              <div className="progress-bar bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      }
    },
    {
      name: 'Actions', width: '160px', right: true, cell: r => (
        <div className="d-flex gap-1 justify-content-end">
          <button type="button" className="btn btn-light sm" title="View" onClick={() => openView(r)}><FiEye /></button>
          {perms.isAdmin && (
            <>
              <button type="button" className="btn btn-outline sm" title="Edit" onClick={() => openEdit(r)}><FiEdit /></button>
              <button type="button" className="btn btn-light sm text-danger" title="Delete" onClick={() => setConfirm({ item: r })}><FiTrash2 /></button>
            </>
          )}
        </div>
      )
    },
  ]

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${total} team members across ${departments.length} departments.`}
        actions={
          <>
            <button className="btn custom-violet " onClick={() => toast.info('Export CSV (stub)')}>
              <FiDownload className="me-1" /> Export
            </button>
            {perms.isAdmin && (
              <button className="btn custom-violet" onClick={openAdd}><FiPlus /> Add Employee</button>
            )}
          </>
        }
      />

      <Table
        title="Employee Directory"
        columns={columns}
        data={list}
        progressPending={loading || !list.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, dept…"
        pagination
        paginationServer
        paginationTotalRows={total || list.length}
        paginationPerPage={10}
        onChangePage={setPage}
        currentPage={page}
        onSort={(col, dir) => setSort({ sortBy: col.selector || col.name, sortDir: dir })}
        sortServer
        subHeaderComponent={
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <span className="small text-muted">Dept:</span>
            <select className="form-select form-select-sm" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1) }} style={{ width: 180 }}>
              <option value="">All</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        }
      />

      <Modal isOpen={modal.open} toggle={() => setModal({ open: false, mode: 'add', id: null })} size="lg" centered scrollable>
        <ModalHeader toggle={() => setModal({ open: false })}>
          {modal.mode === 'add' ? 'Add New Employee' : 'Edit Employee'}
        </ModalHeader>
        <form onSubmit={handleSubmit(submitForm)} noValidate>
          <ModalBody>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">First Name *</label>
                <input className="form-control" {...register('firstName')} />
                {errors.firstName && <div className="field-error">{errors.firstName.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name *</label>
                <input className="form-control" {...register('lastName')} />
                {errors.lastName && <div className="field-error">{errors.lastName.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" {...register('email')} />
                {errors.email && <div className="field-error">{errors.email.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone *</label>
                <input className="form-control" {...register('phone')} />
                {errors.phone && <div className="field-error">{errors.phone.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Department *</label>
                <select className="form-select" {...register('departmentId')} onChange={(e) => {
                  register('departmentId').onChange(e)
                  setValue('designationId', '')
                }}>
                  <option value="">Select…</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.departmentId && <div className="field-error">{errors.departmentId.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Designation *</label>
                <select className="form-select" {...register('designationId')}>
                  <option value="">Select…</option>
                  {desigFiltered.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
                {errors.designationId && <div className="field-error">{errors.designationId.message}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Role *</label>
                <select className="form-select" {...register('role')}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && <div className="field-error">{errors.role.message}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Joining Date *</label>
                <input type="date" className="form-control" {...register('joiningDate')} />
                {errors.joiningDate && <div className="field-error">{errors.joiningDate.message}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Date of Birth *</label>
                <input type="date" className="form-control" {...register('dateOfBirth')} />
                {errors.dateOfBirth && <div className="field-error">{errors.dateOfBirth.message}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Gender *</label>
                <select className="form-select" {...register('gender')}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label">Address *</label>
                <input className="form-control" {...register('address')} />
                {errors.address && <div className="field-error">{errors.address.message}</div>}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-light" onClick={() => setModal({ open: false })}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : (modal.mode === 'add' ? 'Add Employee' : 'Save Changes')}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={!!view} toggle={() => setView(null)} size="lg" centered scrollable>
        {view && (
          <>
            <div className="position-relative">
              <div className="profile-banner" style={{
                height: 110,
                background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)',
                borderTopLeftRadius: 16, borderTopRightRadius: 16,
              }} />
              <div className="d-flex align-items-end px-4 gap-3" style={{ marginTop: -36 }}>
                <div className="avatar xl" style={{ border: '4px solid #fff', boxShadow: '0 8px 20px rgba(15,23,42,0.12)' }}>
                  {getInitials(view.name)}
                </div>
                <div className="pb-2">
                  <h4 className="m-0">{view.name}</h4>
                  <div className="text-muted small">{view.designation} · {view.department}</div>
                </div>
                <div className="ms-auto pb-2">
                  <StatusBadge status={view.attendanceStatus} />
                </div>
              </div>
            </div>
            <ModalHeader toggle={() => setView(null)} className="border-0 pt-2" />
            <ModalBody className="pt-0">
              <div className="row g-3 mb-4">
                <Info label="Employee ID" value={view.employeeId} />
                <Info label="Email" value={view.email} />
                <Info label="Phone" value={view.phone} />
                <Info label="Role" value={view.role?.toUpperCase()} />
                <Info label="Gender" value={view.gender} />
                <Info label="Date of Birth" value={formatDate(view.dateOfBirth)} />
                <Info label="Joining Date" value={formatDate(view.joiningDate)} />
                <Info label="Address" value={view.address} />
              </div>
              <h5>Leave Balance</h5>
              {balance.length === 0 ? <div className="text-muted small">No balance data.</div> : (
                <div className="row g-3">
                  {balance.map(b => (
                    <div key={b.id} className="col-md-4">
                      <div className="p-3 border rounded-3">
                        <div className="d-flex justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="status-dot" style={{ background: b.color }} />
                            <span className="fw-semibold small">{b.leaveType}</span>
                          </div>
                          <span className="small text-muted">{b.used}/{b.allocated}</span>
                        </div>
                        <div className="progress mb-1" style={{ height: 8 }}>
                          <div className="progress-bar" style={{ width: `${Math.min(100, b.used / (b.allocated || 1) * 100)}%`, background: b.color }} />
                        </div>
                        <div className="small">Remaining: <strong>{b.remaining}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <button type="button" className="btn btn-light" onClick={() => setView(null)}>Close</button>
              {perms.isAdmin && (
                <button type="button" className="btn btn-primary" onClick={() => { setView(null); openEdit(view) }}>Edit Profile</button>
              )}
            </ModalFooter>
          </>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirm}
        toggle={() => setConfirm(null)}
        variant="danger"
        title="Delete Employee?"
        message={confirm ? `Delete ${confirm.item?.name}? This action cannot be undone.` : ''}
        confirmText="Delete"
        onConfirm={async () => {
          if (confirm?.item) {
            await dispatch(deleteEmployee(confirm.item.id))
            dispatch(fetchEmployees({ page, perPage: 10, search: searchT, department: deptFilter, ...sort }))
          }
          setConfirm(null)
        }}
      />
    </div>
  )
}

const Info = ({ label, value }) => (
  <div className="col-md-6">
    <div className="small text-muted">{label}</div>
    <div className="fw-semibold small">{value}</div>
  </div>
)

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export default Employees
