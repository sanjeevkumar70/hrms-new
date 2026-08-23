import React, { useMemo, useState } from 'react'
import { FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi'
import { cx } from '@/utils'
import Table from '@/components/common/Table'
import PageHeader from '@/components/common/PageHeader'
import { leaveApprovalData } from '@/data'
import './approvals.scss'

const Approvals = () => {
  const [statusFilter, setStatusFilter] = useState('')

  const [approvalData, setApprovalData] = useState(
    leaveApprovalData
  )

  const [approvalModal, setApprovalModal] = useState({
    show: false,
    action: '',
    leave: null,
    comment: '',
  })
  const handleApprovalCommentChange = (e) => {
    setApprovalModal((prev) => ({
      ...prev,
      comment: e.target.value,
    }))
  }
  // Open confirmation modal
  const handleApprovalAction = (leave, action) => {
    setApprovalModal({
      show: true,
      action,
      leave,
    })
  }

  // Confirm approve/reject
  const confirmApprovalAction = () => {
    const { leave, action, comment } = approvalModal

    if (!leave) return

    setApprovalData((prev) =>
      prev.map((item) =>
        item.id === leave.id
          ? {
            ...item,
            status:
              action === 'approve'
                ? 'Approved'
                : 'Rejected',
            approvalComment: comment,
          }
          : item
      )
    )

    setApprovalModal({
      show: false,
      action: '',
      leave: null,
      comment: '',
    })
  }

  // Close confirmation modal
  const closeApprovalModal = () => {
    setApprovalModal({
      show: false,
      action: '',
      leave: null,
      comment: '',
    })
  }

  // Filter approval data
  const filteredLeaves = useMemo(() => {
    return leaveApprovalData.filter((row) => {
      if (!statusFilter) return true

      return (
        row.status?.toLowerCase() ===
        statusFilter.toLowerCase()
      )
    })
  }, [leaveApprovalData, statusFilter])

  // Table columns
  const columns = [
    {
      name: 'Employee',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 py-2">
          <img
            src={row.employee.avatar}
            alt={row.employee.name}
            className="rounded-circle flex-shrink-0"
            width="40"
            height="40"
            style={{
              objectFit: 'cover',
            }}
          />

          <div className="text-truncate">
            <div
              className="fw-semibold text-truncate"
              title={row.employee.name}
            >
              {row.employee.name}
            </div>

            <div className="small text-muted">
              {row.employee.id}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      grow: 1.5,
      minWidth: '190px',
    },

    {
      name: 'Leave Type',
      selector: (row) => row.leaveType || '—',
      sortable: true,
    },

    {
      name: 'Start Date',
      selector: (row) => row.startDate || '—',
      sortable: true,
    },

    {
      name: 'End Date',
      selector: (row) => row.endDate || '—',
      sortable: true,
    },

    {
      name: 'Duration',
      selector: (row) => row.duration || '—',
      sortable: true,
    },

    {
      name: 'Status',
      cell: (row) => (
        <span
          className={cx(
            'badge',
            `badge-${row.status?.toLowerCase() || 'secondary'
            }`
          )}
        >
          {row.status || 'Unknown'}
        </span>
      ),
      center: true,
    },

    {
      name: 'Action',
      cell: (row) => {
        const isPending =
          row.status?.toLowerCase() === 'pending'

        if (!isPending) {
          return (
            <span className="text-muted small">
              No Action
            </span>
          )
        }

        return (
          <div className="d-flex align-items-center gap-2 flex-nowrap">
            <button
              type="button"
              className="btn btn-sm btn-success text-nowrap"
              onClick={() =>
                handleApprovalAction(row, 'approve')
              }
            >
              Approve
            </button>

            <button
              type="button"
              className="btn btn-sm btn-danger text-nowrap"
              onClick={() =>
                handleApprovalAction(row, 'reject')
              }
            >
              Reject
            </button>
          </div>
        )
      },
      center: true,
      minWidth: '190px',
      width: '200px',
    }
  ]

  return (
    <div className='approvals-wraapper'>
      <PageHeader
        title="Leave Approval Management"
        subtitle="View and manage your team leave requests."
      />

      <div className="row">
        <Table
          title="Team Leave Approvals"
          columns={columns}
          data={filteredLeaves}
          pagination
          paginationPerPage={10}
          subHeaderComponent={
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                style={{ width: '150px' }}
              >
                <option value="">All Status</option>
                <option value="pending">
                  Pending
                </option>
                <option value="approved">
                  Approved
                </option>
                <option value="rejected">
                  Rejected
                </option>
              </select>

              {statusFilter && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setStatusFilter('')}
                >
                  Clear
                </button>
              )}
            </div>
          }
        />
      </div>

      {/* Confirmation Modal */}
      {approvalModal.show && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header">
                <h5 className="modal-title">
                  Confirm Action
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeApprovalModal}
                />
              </div>

              {/* Body */}
              <div className="modal-body text-center">
                <FiAlertTriangle
                  size={48}
                  className={
                    approvalModal.action === 'approve'
                      ? 'text-success mb-3'
                      : 'text-danger mb-3'
                  }
                />

                <h5>
                  {approvalModal.action === 'approve'
                    ? 'Approve Leave Request?'
                    : 'Reject Leave Request?'}
                </h5>

                <p className="text-muted">
                  Are you sure you want to{' '}
                  <strong>
                    {approvalModal.action === 'approve'
                      ? 'approve'
                      : 'reject'}
                  </strong>{' '}
                  this leave request?
                </p>

                {approvalModal.leave && (
                  <div className="bg-light rounded p-3 text-start mt-3">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <img
                        src={
                          approvalModal.leave.employee
                            .avatar
                        }
                        alt={
                          approvalModal.leave.employee
                            .name
                        }
                        className="rounded-circle"
                        width="45"
                        height="45"
                        style={{
                          objectFit: 'cover',
                        }}
                      />

                      <div>
                        <div className="fw-semibold">
                          {
                            approvalModal.leave.employee
                              .name
                          }
                        </div>

                        <div className="small text-muted">
                          {
                            approvalModal.leave.employee
                              .id
                          }
                        </div>
                      </div>
                    </div>

                    <hr />

                    <div className="small mb-1">
                      <strong>Leave Type:</strong>{' '}
                      {approvalModal.leave.leaveType}
                    </div>

                    <div className="small mb-1">
                      <strong>Start Date:</strong>{' '}
                      {approvalModal.leave.startDate}
                    </div>

                    <div className="small mb-1">
                      <strong>End Date:</strong>{' '}
                      {approvalModal.leave.endDate}
                    </div>

                    <div className="small mb-1">
                      <strong>Duration:</strong>{' '}
                      {approvalModal.leave.duration}
                    </div>

                    <div className="small">
                      <strong>Reason:</strong>{' '}
                      {approvalModal.leave.reason}
                    </div>
                    <div className="mt-1">
                      <label className="form-label fw-semibold">
                        {approvalModal.action === 'reject'
                          ? 'Reason for Rejection'
                          : 'Comment'}
                        {approvalModal.action === 'reject' && (
                          <span className="text-danger"> *</span>
                        )}
                      </label>

                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder={
                          approvalModal.action === 'reject'
                            ? 'Enter reason for rejecting this leave request...'
                            : 'Add a comment (optional)...'
                        }
                        value={approvalModal.comment}
                        onChange={handleApprovalCommentChange}
                        required={approvalModal.action === 'reject'}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeApprovalModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={
                    approvalModal.action === 'approve'
                      ? 'btn btn-success'
                      : 'btn btn-danger'
                  }
                  onClick={confirmApprovalAction}
                >
                  {approvalModal.action === 'approve'
                    ? 'Approve'
                    : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Approvals