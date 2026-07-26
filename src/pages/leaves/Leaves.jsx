import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import { StatusBadge } from '@/components/common/Badges'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Avatar from '@/components/common/Avatar'
import { usePermissions, useAuth } from '@/hooks/useAuth'
import {
  fetchMyLeaves, fetchTeamLeaves, applyLeave, cancelLeave, approveLeave, rejectLeave,
  fetchLeaveTypes, fetchLeaveBalance, approveLeavesBatch,
} from '@/redux/slices/leaveSlice'
import { Modal, ModalHeader, ModalBody, ModalFooter, Label, Input, FormText, FormGroup } from 'reactstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { FiPlus, FiCheckCircle, FiXCircle, FiTrash2, FiCalendar, FiFileText } from 'react-icons/fi'
import { formatDate, cx, daysBetween } from '@/utils'
import { toast } from 'react-toastify'

const schema = Yup.object({
  leaveTypeId: Yup.string().required('Leave type is required'),
  fromDate: Yup.string().required('Start date is required'),
  toDate: Yup.string().required('End date is required').test('gte', 'End must be after start', function (v) {
    const from = this.from ? this.from[2].value : this.parent?.fromDate
    return v ? new Date(v) >= new Date(from) : false
  }),
  reason: Yup.string().min(5, 'Please provide a brief reason').required('Reason is required'),
})

const Leaves = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const perms = usePermissions()
  const { employee } = useAuth()
  const myLeaves = useSelector((s) => s.leave.myLeaves)
  const teamLeaves = useSelector((s) => s.leave.teamLeaves)
  const types = useSelector((s) => s.leave.types)
  const balance = useSelector((s) => s.leave.balance)
  const [tab, setTab] = useState(perms.canApproveLeaves ? 'approvals' : 'mine')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [remarkOpen, setRemarkOpen] = useState(false)
  const [remarkMode, setRemarkMode] = useState('approve')
  const [remarkText, setRemarkText] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { leaveTypeId: '', fromDate: '', toDate: '', reason: '' },
  })

  const type = watch('leaveTypeId')

  useEffect(() => {
    dispatch(fetchLeaveTypes())
    employee && dispatch(fetchLeaveBalance(employee.id))
  }, [dispatch, employee])

  useEffect(() => {
    if (tab === 'mine') dispatch(fetchMyLeaves({ status, page }))
    else if (tab === 'approvals') dispatch(fetchTeamLeaves({ status: status || 'pending', page }))
    else if (tab === 'types') {}
  }, [dispatch, tab, status, page])

  const onApply = async (values) => {
    const payload = {
      ...values,
      days: daysBetween(values.fromDate, values.toDate),
    }
    const res = await dispatch(applyLeave(payload))
    if (res.meta.requestStatus === 'fulfilled') {
      setModalOpen(false)
      reset()
      dispatch(fetchMyLeaves({ status, page: 1 }))
    }
  }

  const columnsMine = [
    { name: 'Type', selector: r => r.leaveType, sortable: true, cell: r => (
      <div className="d-flex align-items-center gap-2">
        <span className="status-dot" style={{ background: types.find(t => t.name === r.leaveType)?.color || '#64748b' }} />
        <span className="fw-semibold small">{r.leaveType}</span>
      </div>
    )},
    { name: 'From', selector: r => formatDate(r.fromDate), sortable: true },
    { name: 'To', selector: r => formatDate(r.toDate), sortable: true },
    { name: 'Days', selector: r => `${r.days}d`, width: '80px' },
    { name: 'Reason', cell: r => <div className="text-muted small">{r.reason}</div>, grow: 2 },
    { name: 'Status', cell: r => <StatusBadge status={r.status} pulse={r.status === 'pending'} />, center: true },
    { name: 'Remarks', cell: r => <div className="small text-muted" title={r.managerRemarks}>{r.managerRemarks || '—'}</div>, omit: true },
    { name: 'Applied', selector: r => formatDate(r.appliedAt), omit: true },
    { name: 'Actions', width: '130px', cell: r => r.status === 'pending' ? (
      <button type="button" className="btn btn-light sm" onClick={() => setConfirm({ type: 'cancel', item: r })}>
        <FiTrash2 className="me-1" /> Cancel
      </button>
    ) : <span className="text-muted small">—</span> },
  ]

  const columnsTeam = [
    { name: 'Employee', sortable: true, cell: r => (
      <div className="d-flex align-items-center gap-2">
        <Avatar size="sm" name={r.employeeName} />
        <div>
          <div className="fw-semibold small">{r.employeeName}</div>
          <div className="text-xs text-muted">{r.department} · {r.designation}</div>
        </div>
      </div>
    )},
    ...columnsMine.filter(c => c.name !== 'Actions'),
    { name: 'Actions', width: '180px', cell: r => r.status === 'pending' && (
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-success sm" onClick={() => openRemark('approve', r)}>
          <FiCheckCircle />
        </button>
        <button type="button" className="btn btn-danger sm" onClick={() => openRemark('reject', r)}>
          <FiXCircle />
        </button>
      </div>
    )},
  ]

  const openRemark = (mode, item) => {
    setRemarkMode(mode)
    setSelected(item)
    setRemarkText('')
    setRemarkOpen(true)
  }

  const submitRemark = async () => {
    if (remarkMode === 'reject' && !remarkText.trim()) {
      toast.error('Remarks required for rejection')
      return
    }
    const fn = remarkMode === 'approve' ? approveLeave : rejectLeave
    const res = await dispatch(fn({ id: selected.id, remarks: remarkText }))
    if (res.meta.requestStatus === 'fulfilled') {
      setRemarkOpen(false)
      dispatch(fetchTeamLeaves({ status: status || 'pending', page }))
    }
  }

  const typesColumns = [
    { name: 'Type', cell: r => <div className="d-flex align-items-center gap-2"><span className="status-dot" style={{ background: r.color }} /><span className="fw-semibold small">{r.name}</span></div> },
    { name: 'Color', cell: r => <div className="d-flex align-items-center gap-2"><div style={{ width: 40, height: 18, background: r.color, borderRadius: 6 }} /><code className="small text-muted">{r.color}</code></div> },
    { name: 'Days Allocated', selector: r => r.daysAllocated },
    { name: 'Description', selector: r => r.description, cell: r => <span className="text-muted small">{r.description}</span> },
    perms.isAdmin && { name: 'Actions', width: '140px', cell: r => (
      <div className="d-flex gap-2">
        <button className="btn btn-outline btn-sm">Edit</button>
        <button className="btn btn-light btn-sm" onClick={() => setConfirm({ type: 'delete-type', item: r })}>Delete</button>
      </div>
    )},
  ].filter(Boolean)

  const currentTable = useMemo(() => {
    if (tab === 'mine') return { title: 'My Leave Requests', columns: columnsMine, data: myLeaves.data, total: myLeaves.total, toggleSearch: null }
    if (tab === 'approvals') return { title: 'Team Pending Approvals', columns: columnsTeam, data: teamLeaves.data, total: teamLeaves.total, toggleSearch: true }
    return { title: 'Leave Types', columns: typesColumns, data: types, total: types.length, toggleSearch: false }
  }, [tab, myLeaves, teamLeaves, types])

  return (
    <div>
      <PageHeader
        title="Leave Management"
        subtitle={tab === 'mine' ? 'View and manage your leave requests.' : tab === 'approvals' ? 'Approve or reject leave requests from your team.' : 'Configure leave types and allocation.'}
        actions={
          <>
            {tab === 'mine' && (
              <button className="btn btn-primary" onClick={() => setModalOpen(true)}><FiPlus /> Apply Leave</button>
            )}
            {tab === 'approvals' && perms.isAdmin && (
              <button className="btn btn-success" disabled={!selectedIds.length} onClick={async () => {
                await dispatch(approveLeavesBatch(selectedIds))
                setSelectedIds([])
                dispatch(fetchTeamLeaves({ status: status || 'pending', page }))
              }}>
                <FiCheckCircle /> Approve ({selectedIds.length})
              </button>
            )}
            {tab === 'types' && perms.isAdmin && (
              <button className="btn btn-primary" onClick={() => toast.info('Create type modal – extend as needed')}><FiPlus /> New Type</button>
            )}
          </>
        }
      >
        <div className="btn-group" role="group" style={{ borderRadius: 99 }}>
          <button type="button" className={cx('btn', tab === 'mine' ? 'btn-primary' : 'btn-light')} onClick={() => { setTab('mine'); setPage(1) }}>
            <FiFileText className="me-1" /> My Requests
          </button>
          {perms.canApproveLeaves && (
            <button type="button" className={cx('btn', tab === 'approvals' ? 'btn-primary' : 'btn-light')} onClick={() => { setTab('approvals'); setPage(1) }}>
              <FiCheckCircle className="me-1" /> Approvals <span className="badge-count ms-2" style={{ background: teamLeaves.total ? '#f43f5e' : '#cbd5e1' }}>{teamLeaves.total || 0}</span>
            </button>
          )}
          {perms.canManageLeaveTypes && ( 
            <button type="button" className={cx('btn', tab === 'types' ? 'btn-primary' : 'btn-light')} onClick={() => { setTab('types'); setPage(1) }}>
              <FiCalendar className="me-1" /> Types
            </button>
          )}
        </div>
      </PageHeader>

      {tab === 'mine' && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>Leave Balance</h3>
            <span className="small text-muted">Current year</span>
          </div>
          <div className="card-body">
            {!balance.length ? <div className="text-muted small">No balance loaded.</div> : (
              <div className="row g-3">
                {balance.map(b => {
                  const pct = Math.min(100, Math.round((b.used / (b.allocated || 1)) * 100))
                  return (
                    <div key={b.id} className="col-md-4 col-sm-6">
                      <div className="p-3 border rounded-3" style={{ background: 'rgba(248,250,252,0.8)' }}>
                        <div className="d-flex justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="status-dot" style={{ background: b.color }} />
                            <span className="fw-semibold small">{b.leaveType}</span>
                          </div>
                          <span className="small text-muted">{b.used}/{b.allocated} used</span>
                        </div>
                        <div className="progress mb-1" style={{ height: 8 }}>
                          <div className="progress-bar" style={{ width: `${pct}%`, background: b.color }} />
                        </div>
                        <div className="d-flex justify-content-between small">
                          <span className="text-slate-600">Remaining: <strong className="text-slate-900">{b.remaining}</strong></span>
                          <span className="text-muted">{pct}% used</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Table
        title={currentTable.title}
        columns={currentTable.columns}
        data={currentTable.data || []}
        progressPending={!currentTable.data}
        pagination={tab !== 'types'}
        paginationServer={tab !== 'types'}
        paginationTotalRows={currentTable.total || 0}
        onChangePage={setPage}
        currentPage={page}
        selectableRows={tab === 'approvals'}
        clearSelectedRows={!selectedIds.length}
        onSelectedRowsChange={({ selectedRows }) => setSelectedIds(selectedRows.map(r => r.id))}
        subHeaderComponent={
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <span className="small text-muted">Status:</span>
            <select className="form-select form-select-sm" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} style={{ width: 160 }}>
              <option value="">All</option>
              {['pending', 'approved', 'rejected', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        }
      />

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" centered>
        <ModalHeader toggle={() => setModalOpen(false)}>Apply for Leave</ModalHeader>
        <form onSubmit={handleSubmit(onApply)} noValidate>
          <ModalBody>
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label">Leave Type <span className="text-danger">*</span></label>
                <select className="form-select" {...register('leaveTypeId')}>
                  <option value="">Select…</option>
                  {types.map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.daysAllocated} days/year</option>
                  ))}
                </select>
                {errors.leaveTypeId && <div className="field-error">{errors.leaveTypeId.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">From Date <span className="text-danger">*</span></label>
                <input type="date" className="form-control" {...register('fromDate')} />
                {errors.fromDate && <div className="field-error">{errors.fromDate.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">To Date <span className="text-danger">*</span></label>
                <input type="date" className="form-control" {...register('toDate')} />
                {errors.toDate && <div className="field-error">{errors.toDate.message}</div>}
              </div>
              <div className="col-12">
                <label className="form-label">Reason <span className="text-danger">*</span></label>
                <textarea rows="4" className="form-control" {...register('reason')} placeholder="Briefly describe the reason…" />
                {errors.reason && <div className="field-error">{errors.reason.message}</div>}
              </div>
            </div>
            {type && (
              <div className="mt-4 p-3 rounded-3 bg-slate-50 border">
                <div className="small text-muted mb-1">Balance Preview</div>
                {(() => {
                  const t = types.find(x => x.id === type)
                  const b = balance.find(x => x.leaveTypeId === type)
                  if (!t) return null
                  const remaining = b?.remaining ?? t.daysAllocated
                  const used = b?.used ?? 0
                  return (
                    <div className="d-flex align-items-center gap-3">
                      <span className="status-dot" style={{ background: t.color }} />
                      <div className="flex-1">
                        <div className="fw-semibold small">{t.name}</div>
                        <div className="small text-muted">{remaining} remaining · {used} used · {t.daysAllocated} allocated</div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-light" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={remarkOpen} toggle={() => setRemarkOpen(false)} size="md" centered>
        <ModalHeader toggle={() => setRemarkOpen(false)}>
          {remarkMode === 'approve' ? 'Approve Leave' : 'Reject Leave'}
        </ModalHeader>
        <ModalBody>
          {selected && (
            <div className="mb-3 p-3 rounded-3 bg-slate-50 border">
              <div className="small"><strong>{selected.employeeName}</strong> — {selected.leaveType}</div>
              <div className="text-muted small">
                {formatDate(selected.fromDate)} → {formatDate(selected.toDate)} · {selected.days}d · {selected.reason}
              </div>
            </div>
          )}
          <label className="form-label">Remarks {remarkMode === 'reject' && <span className="text-danger">*</span>}</label>
          <textarea
            rows="3"
            className="form-control"
            value={remarkText}
            onChange={e => setRemarkText(e.target.value)}
            placeholder={remarkMode === 'approve' ? 'Optional note for employee…' : 'Reason for rejection…'}
          />
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-light" onClick={() => setRemarkOpen(false)}>Cancel</button>
          <button type="button" className={remarkMode === 'approve' ? 'btn btn-success' : 'btn btn-danger'} onClick={submitRemark}>
            {remarkMode === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirm}
        toggle={() => setConfirm(null)}
        variant={confirm?.type === 'cancel' ? 'warning' : 'danger'}
        title={confirm?.type === 'cancel' ? 'Cancel Leave' : 'Delete Leave Type'}
        message={confirm?.type === 'cancel'
          ? `Are you sure you want to cancel this ${confirm?.item?.leaveType} request?`
          : `Delete ${confirm?.item?.name}? This action cannot be undone.`}
        confirmText="Yes, confirm"
        onConfirm={async () => {
          if (confirm?.type === 'cancel') {
            await dispatch(cancelLeave({ id: confirm.item.id, reason: 'User cancelled' }))
            dispatch(fetchMyLeaves({ status, page }))
          } else if (confirm?.type === 'delete-type') {
            toast.success('Leave type deleted (stub)')
          }
          setConfirm(null)
        }}
      />
    </div>
  )
}

export default Leaves
