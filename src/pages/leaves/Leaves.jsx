import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useDispatch } from 'react-redux'
import Table from '@/components/common/Table'
import PageHeader from '@/components/common/PageHeader'
import React, { useMemo, useState } from 'react'
import {
  FiPlus,
  FiFilter,
} from 'react-icons/fi'
import { cx } from '@/utils'
import { leaveHistory, attendanceSummary, leaveTypes } from '@/data'
import AttendanceSummaryCard from '@/components/common/cards/AttendanceSummaryCard'
import { useNavigate } from 'react-router-dom'


const leaveHistoryColumns = [
  {
    name: 'Start Date',
    selector: row => row.startDate,
    sortable: true,
    grow: 1.2,
  },
  {
    name: 'End Date',
    selector: row => row.endDate || '—',
    sortable: true,
  },
  {
    name: 'Leave Type',
    selector: row => row.leaveType || '—',
    sortable: true,
  },
  {
    name: 'Duration',
    selector: row => row.duration || '0 Days',
    sortable: true,
  },
  {
    name: 'Status',
    cell: row => (
      <span
        className={cx(
          'badge',
          `badge-${row.status?.toLowerCase() || 'secondary'}`
        )}
      >
        {row.status || 'Unknown'}
      </span>
    ),
    center: true,
  },
]


const Leaves = () => {
  const dispatch = useDispatch()
  const { employee } = useAuth()
  const navigate = useNavigate()
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [leaveForm, setLeaveForm] = useState({
    leaveType: '',
    fromDate: '',
    endDate: '',
    duration: 'full-day',
    reason: '',
  })
  const handleLeaveChange = (e) => {
    const { name, value } = e.target

    setLeaveForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handleApplyLeave = (e) => {
    e.preventDefault()

    console.log('Leave Request:', leaveForm)

    // TODO: dispatch API/action here

    setShowApplyLeaveModal(false)

    setLeaveForm({
      leaveType: '',
      fromDate: '',
      endDate: '',
      duration: 'full-day',
      reason: '',
    })
  }
  // Filter leave data
  const filteredLeaves = useMemo(() => {
    return leaveHistory.filter(row => {
      const statusMatch =
        !statusFilter ||
        row.status?.toLowerCase() === statusFilter.toLowerCase()

      const yearMatch =
        !yearFilter ||
        new Date(row.startDate).getFullYear().toString() === yearFilter

      return statusMatch && yearMatch
    })
  }, [statusFilter, yearFilter])

  // Generate years from data
  const years = useMemo(() => {
    const uniqueYears = [
      ...new Set(
        leaveHistory.map(row =>
          new Date(row.startDate).getFullYear()
        )
      ),
    ]

    return uniqueYears.sort((a, b) => b - a)
  }, [])

  const companyLeavePolicy = {
    lastPayrollDate: '2026-08-01',
    leavePeriodEndDate: '2026-08-31',
  }

  return (
    <div>
      <PageHeader
        title="Leave Management"
        subtitle="View and manage your leave requests."
        actions={
          <div className="d-flex align-items-center gap-2">

            <button
              type="button"
              className="btn custom-violet"
              onClick={() => setShowApplyLeaveModal(true)}
            >
              <FiPlus className="me-1" />
              Apply Leave
            </button>

            <button
              type="button"
              className="btn custom-violet"
              onClick={() => navigate('/approvals')}
            >
              Approvals
            </button>
          </div>
        }
      />

      {/* Summary */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <AttendanceSummaryCard
            data={leaveTypes}
            title="📊 Leave Summary"
            period="2026"
          />
        </div>
      </div>

      {/* Leave History */}
      <div className="row">
        <Table
          title="My Leave Requests"
          columns={leaveHistoryColumns}
          data={filteredLeaves}
          pagination
          paginationPerPage={10}
          subHeaderComponent={
            <div className="d-flex align-items-center gap-2">

              {/* Status Filter */}
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Year Filter */}
              <select
                className="form-select form-select-sm"
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                style={{ width: '120px' }}
              >
                <option value="">All Years</option>

                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {/* Clear */}
              {(statusFilter || yearFilter) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setStatusFilter('')
                    setYearFilter('')
                  }}
                >
                  Clear
                </button>
              )}

            </div>
          }
        />
      </div>

      {showApplyLeaveModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleApplyLeave}>
                {/* Modal Header */}
                <div className="modal-header">
                  <h5 className="modal-title">
                    Apply for Leave
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowApplyLeaveModal(false)}
                  />
                </div>

                {/* Modal Body */}
                <div className="modal-body">

                  <div className="row">
                    {/* Leave Type */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Leave Type <span className="text-danger">*</span>
                      </label>

                      <select
                        name="leaveType"
                        className="form-select"
                        value={leaveForm.leaveType}
                        onChange={handleLeaveChange}
                        required
                      >
                        <option value="">Select Leave Type</option>
                        <option value="casual">Casual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="earned">Earned Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-3">
                    {/* From Date */}
                    <div className="col-md-6">
                      <label className="form-label">
                        From Date <span className="text-danger">*</span>
                      </label>

                      <input
                        type="date"
                        name="fromDate"
                        className="form-control"
                        value={leaveForm.fromDate}
                        min={companyLeavePolicy.lastPayrollDate}
                        max={companyLeavePolicy.leavePeriodEndDate}
                        onChange={handleLeaveChange}
                        required
                      />
                    </div>

                    {/* End Date */}
                    <div className="col-md-6">
                      <label className="form-label">
                        End Date <span className="text-danger">*</span>
                      </label>

                      <input
                        type="date"
                        name="endDate"
                        className="form-control"
                        value={leaveForm.endDate}
                        min={
                          leaveForm.fromDate || companyLeavePolicy.lastPayrollDate
                        }
                        max={companyLeavePolicy.leavePeriodEndDate}
                        onChange={handleLeaveChange}
                        required
                      />
                    </div>

                    {/* Duration */}
                    <div className="col-md-6">
                      <label className="form-label d-block">
                        Duration <span className="text-danger">*</span>
                      </label>

                      <div className="d-flex gap-4 mt-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="duration"
                            id="fullDay"
                            value="full-day"
                            checked={leaveForm.duration === 'full-day'}
                            onChange={handleLeaveChange}
                          />

                          <label
                            className="form-check-label"
                            htmlFor="fullDay"
                          >
                            Full Day
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="duration"
                            id="firstHalf"
                            value="first-half"
                            checked={leaveForm.duration === 'first-half'}
                            onChange={handleLeaveChange}
                          />

                          <label
                            className="form-check-label"
                            htmlFor="firstHalf"
                          >
                            First Half
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="duration"
                            id="secondHalf"
                            value="second-half"
                            checked={leaveForm.duration === 'second-half'}
                            onChange={handleLeaveChange}
                          />

                          <label
                            className="form-check-label"
                            htmlFor="secondHalf"
                          >
                            Second Half
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="col-12">
                      <label className="form-label">
                        Reason <span className="text-danger">*</span>
                      </label>

                      <textarea
                        name="reason"
                        className="form-control"
                        rows="4"
                        placeholder="Enter reason for leave..."
                        value={leaveForm.reason}
                        onChange={handleLeaveChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowApplyLeaveModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn custom-violet"
                  >
                    Apply Leave
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaves
