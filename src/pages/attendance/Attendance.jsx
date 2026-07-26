import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import { StatusBadge } from '@/components/common/Badges'
import { useAuth } from '@/hooks/useAuth'
import {
  punchIn, punchOut, fetchTodayAttendance, fetchAttendanceHistory, setTodayWorkingMinutes,
} from '@/redux/slices/attendanceSlice'
import { FiLogIn, FiLogOut, FiMapPin, FiRefreshCw, FiClock, FiSun } from 'react-icons/fi'
import { formatTime, formatDate, formatDuration, diffMinutes, cx, getStatusConfig } from '@/utils'
import { motion } from 'framer-motion'

const LEGEND = ['present', 'late', 'wfh', 'halfday', 'absent', 'leave']

const Timer = ({ punchInTime, running }) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running || !punchInTime) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running, punchInTime])
  const totalSec = Math.max(0, Math.floor((now - new Date(punchInTime).getTime()) / 1000))
  const h = Math.floor(totalSec / 3600).toString().padStart(2, '0')
  const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0')
  const s = (totalSec % 60).toString().padStart(2, '0')
  return (
    <div className="text-center">
      <div className="timer-display">
        {h}:{m}:{s}
      </div>
    
    </div>
  )
}

const Attendance = () => {
  const dispatch = useDispatch()
  const { employee } = useAuth()
  const today = useSelector((s) => s.attendance.today)
  const history = useSelector((s) => s.attendance.history)
  const uiLoading = useSelector((s) => s.attendance.loading)
  const office = useSelector((s) => s.ui.officeSettings)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const punchedIn = !!today?.punchIn && !today?.punchOut
  const workingMin = today?.workingMinutes || (today?.punchIn ? diffMinutes(today.punchIn, new Date().toISOString()) : 0)

  useEffect(() => {
    dispatch(fetchTodayAttendance())
    dispatch(fetchAttendanceHistory({ status: statusFilter || undefined, page, perPage: 12 }))
  }, [dispatch, statusFilter, page])

  const statusToday = today?.status || (punchedIn ? 'present' : 'absent')

  const historyColumns = [
    {
      name: 'Date', selector: r => formatDate(r.date), sortable: true, width: '180px',
      cell: r => <div className="fw-semibold small">{formatDate(r.date)}<div className="text-muted text-xs">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' })}</div></div>
    },
    { name: 'Punch In', cell: r => r.punchIn ? <span className="badge badge-present badge-pulse"><span className="status-dot present me-2" />{formatTime(r.punchIn)}</span> : <span className="text-muted">—</span>, width: '180px' },
    { name: 'Punch Out', cell: r => r.punchOut ? <span>{formatTime(r.punchOut)}</span> : <span className="badge badge-warning">{punchedIn && r.date === today?.date ? 'In progress' : '—'}</span>, width: '180px' },
    { name: 'Working Hours', selector: r => formatDuration(r.workingMinutes), sortable: true, width: '180px' },
    { name: 'Status', cell: r => <StatusBadge status={r.status} pulse={r.status === 'present' || r.status === 'late'} />, center: true },
    { name: 'Location', selector: r => r.location || '—', omit: true },
  ]

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

      <div className="row g-4 mb-4 attendance-punch-wrap" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <h3>
              <FiClock className="me-2 text-primary" /> Punch Controls
            </h3>
            <span className="small text-muted">
              Office Hours: {office.startTime} – {office.endTime}
            </span>
          </div>
          <div className="card-body">
            <div className="row g-4 align-items-center">
              <div className="col-md-7">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <span className={cx('status-dot live', statusToday)} style={{ width: 14, height: 14 }} />
                  <span className="fw-semibold">
                    Current Status: <StatusBadge status={statusToday} pulse={punchedIn} />
                  </span>
                </div>
                <Timer punchInTime={today?.punchIn} running={punchedIn} />
                <div className="mt-4 small text-muted d-flex flex-wrap gap-3">
                  <div><FiMapPin className="me-1" /> {today?.location || office.officeLocation}</div>
                  <div className="fw-semibold text-slate-700">Today: {formatDuration(workingMin)} worked</div>
                </div>
              </div>
              <div className="col-md-5 d-flex flex-column gap-3">
                <button
                  type="button"
                  className="btn btn-success btn-lg"
                  disabled={uiLoading || punchedIn}
                  onClick={() => dispatch(punchIn({ location: 'Office - HQ New York' }))}
                >
                  <FiLogIn /> Punch In
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-lg"
                  disabled={uiLoading || !punchedIn}
                  onClick={() => dispatch(punchOut({ location: 'Office - HQ New York' }))}
                >
                  <FiLogOut /> Punch Out
                </button>
              
              </div>
            </div>
         
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-0"
        >
          <div className="card-header">
            <h3>📊 Attendance Summary</h3>
            <span className="small text-muted">Last 30 days</span>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {[
                { k: 'present', label: 'Present', value: 18, accent: '#10b981' },
                { k: 'late', label: 'Late Arrivals', value: 3, accent: '#f59e0b' },
                { k: 'wfh', label: 'Work From Home', value: 5, accent: '#0d9488' },
                { k: 'absent', label: 'Absent', value: 1, accent: '#f43f5e' },
                { k: 'leave', label: 'On Leave', value: 2, accent: '#0ea5e9' },
                { k: 'halfday', label: 'Half Days', value: 1, accent: '#a855f7' },
              ].map(s => (
                <div key={s.k} className="col-6">
                  <div className="card card-stat" style={{ padding: '1rem 1.25rem' }}>
                    <div className="stat-accent" style={{ background: s.accent, height: 3 }} />
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                    <div className="stat-delta up">{Math.round(s.value / 29 * 100)}% rate</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <Table
        title="Attendance History"
        columns={historyColumns}
        data={history.data || []}
        progressPending={!history.data}
        pagination
        paginationPerPage={12}
        paginationServer
        paginationTotalRows={history.total || 0}
        onChangePage={setPage}
        currentPage={page}
        subHeaderComponent={
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <span className="small text-muted">Status:</span>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              style={{ width: 160 }}
            >
              <option value="">All</option>
              {LEGEND.map(s => <option key={s} value={s}>{getStatusConfig(s).label}</option>)}
            </select>
          </div>
        }
      />
    </div>
  )
}

export default Attendance
