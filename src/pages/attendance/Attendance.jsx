import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import Table from '@/components/common/Table'
import PageHeader from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/Badges'
import React, { useEffect, useMemo, useState } from 'react'
import { FiLogIn, FiLogOut, FiMapPin, FiRefreshCw, FiClock, FiSun } from 'react-icons/fi'
import { formatTime, formatDate, formatDuration, diffMinutes, cx, getStatusConfig } from '@/utils'
import { punchIn, punchOut, fetchTodayAttendance, fetchAttendanceHistory, setTodayWorkingMinutes, } from '@/redux/slices/attendanceSlice'
import { attendanceHistory, attendanceSummary } from '@/data'
import AttendanceSummaryCard from '@/components/common/cards/AttendanceSummaryCard'

const attendanceHistoryColumns = [
  {
    name: 'Date',
    selector: row => row.date,
    sortable: true,
    grow: 1.2,
  },
  {
    name: 'Punch In',
    selector: row => row.punchIn || '—',
    sortable: true,
  },
  {
    name: 'Punch Out',
    selector: row => row.punchOut || '—',
    sortable: true,
  },
  {
    name: 'Working Hours',
    selector: row => row.hours || '0h 0m',
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


const Attendance = () => {
  const dispatch = useDispatch()
  const { employee } = useAuth()


  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Punch in, track your time, and review your attendance history."
        actions={
          <button type="button" className="btn btn-light btn-sm" onClick={() => { dispatch(fetchTodayAttendance()); dispatch(fetchAttendanceHistory({ status: statusFilter || undefined, page })) }}>
            <FiRefreshCw className="me-1" /> Refresh
          </button>
        }
      />

      <div className="row g-4 mb-4">
        <AttendanceSummaryCard
          data={attendanceSummary}
          title="📊 Attendance Summary"
          period="Last 30 days"
        />
      </div>

      <div className="row">
        <Table
          title="Attendance History"
          columns={attendanceHistoryColumns}
          data={attendanceHistory || []}
          // progressPending={loading}
          pagination
          paginationPerPage={10}
          subHeaderComponent={
            <span className="text-muted small">
              Last 30 Days
            </span>
          }
        />

      </div>
    </div>
  )
}

export default Attendance
