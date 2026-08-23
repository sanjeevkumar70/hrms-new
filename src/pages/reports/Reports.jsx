import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import ChartCard, { AttendanceBarChart, LeaveDoughnutChart, EmployeeGrowthChart } from '@/components/common/Charts'
import { usePermissions, useAuth } from '@/hooks/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEmployees, fetchDepartments } from '@/redux/slices/employeeSlice'
import { fetchAttendanceHistory } from '@/redux/slices/attendanceSlice'
import { fetchMyLeaves, fetchTeamLeaves } from '@/redux/slices/leaveSlice'
import { StatusBadge } from '@/components/common/Badges'
import Avatar from '@/components/common/Avatar'
import { dashboardService } from '@/services/dashboardService'
import { FiDownload, FiFilter, FiRefreshCw, FiFileText, FiUser, FiCalendar, FiUsers } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { cx, formatDate, formatDuration } from '@/utils'
import { motion } from 'framer-motion'

const TABS = [
  { id: 'attendance', label: 'Attendance Report', icon: FiFileText },
  { id: 'leave', label: 'Leave Report', icon: FiCalendar },
  { id: 'monthly', label: 'Monthly Summary', icon: FiUsers },
]

const Reports = () => {
  const dispatch = useDispatch()
  const perms = usePermissions()
  const { employee } = useAuth()
  const [tab, setTab] = useState('attendance')
  const [dept, setDept] = useState('')
  const [emp, setEmp] = useState('')
  const [status, setStatus] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const departments = useSelector(s => s.employee.departments)
  const employees = useSelector(s => s.employee.list)
  const [chartOverview, setChartOverview] = useState([])
  const [growth, setGrowth] = useState([])
  const [rows, setRows] = useState([])

  useEffect(() => {
    dispatch(fetchDepartments())
    dispatch(fetchEmployees({ perPage: 50 }))
      ; (async () => {
        const [a, b] = await Promise.all([
          dashboardService.leaveStatistics(),
          dashboardService.employeeGrowth(6),
        ])
        setChartOverview(a); setGrowth(b)
      })()
  }, [dispatch])

  useEffect(() => {
    ; (async () => {
      let data = []
      if (tab === 'attendance') {
        const res = await dispatch(fetchAttendanceHistory({ employeeId: emp || undefined, status: status || undefined, perPage: 50 }))
        data = (res.payload?.data || []).map(r => {
          const e = employees.find(x => x.id === r.employeeId) || { name: 'Employee', department: '-', designation: '-' }
          return {
            ...r,
            employeeName: e.name,
            department: e.department,
            designation: e.designation,
          }
        })
      } else if (tab === 'leave') {
        const res = perms.canApproveLeaves
          ? await dispatch(fetchTeamLeaves({ perPage: 50 }))
          : await dispatch(fetchMyLeaves({ perPage: 50 }))
        data = (res.payload?.data || []).map(r => ({
          ...r,
          employeeName: r.employeeName || employee?.name,
          type: r.leaveType,
          duration: `${r.days} days`,
        }))
      } else {
        const days = Array.from({ length: 30 }).map((_, i) => {
          const d = new Date(); d.setDate(d.getDate() - i)
          return {
            date: formatDate(d),
            totalPresent: 16 + (i % 4),
            totalLate: 1 + (i % 3),
            totalAbsent: 1 + (i % 2),
            totalLeaves: 1 + (i % 4),
            totalWFH: 2 + (i % 3),
            notes: (i % 7 === 0) ? 'Weekly review' : '',
          }
        })
        data = days
      }
      setRows(data)
    })()
  }, [tab, employees, emp, status, dispatch, perms.canApproveLeaves, employee])

  const attendanceColumns = [
    { name: 'Employee', cell: r => <div className="d-flex align-items-center gap-2"><Avatar size="sm" name={r.employeeName} /><div><div className="small fw-semibold">{r.employeeName}</div><div className="text-xs text-muted">{r.department} · {r.designation}</div></div></div>, sortable: true },
    { name: 'Date', selector: r => formatDate(r.date), sortable: true },
    { name: 'Punch In', selector: r => r.punchIn ? new Date(r.punchIn).toLocaleTimeString() : '—' },
    { name: 'Punch Out', selector: r => r.punchOut ? new Date(r.punchOut).toLocaleTimeString() : '—' },
    { name: 'Hours', selector: r => formatDuration(r.workingMinutes) },
    { name: 'Status', cell: r => <StatusBadge status={r.status} /> },
  ]
  const leaveColumns = [
    { name: 'Employee', cell: r => <div className="d-flex align-items-center gap-2"><Avatar size="sm" name={r.employeeName} /><span className="small fw-semibold">{r.employeeName}</span></div>, sortable: true },
    { name: 'Type', selector: r => r.type },
    { name: 'From', selector: r => formatDate(r.fromDate), sortable: true },
    { name: 'To', selector: r => formatDate(r.toDate) },
    { name: 'Duration', selector: r => r.duration },
    { name: 'Reason', selector: r => r.reason, cell: r => <span className="small text-muted">{r.reason}</span>, grow: 2 },
    { name: 'Status', cell: r => <StatusBadge status={r.status} /> },
  ]
  const monthlyColumns = [
    { name: 'Date', selector: r => r.date, sortable: true },
    { name: 'Present', selector: r => r.totalPresent, sortable: true },
    { name: 'Late', selector: r => r.totalLate },
    { name: 'WFH', selector: r => r.totalWFH },
    { name: 'Leaves', selector: r => r.totalLeaves },
    { name: 'Absent', selector: r => r.totalAbsent },
    { name: 'Notes', cell: r => r.notes ? <span className="small text-muted">{r.notes}</span> : '—' },
  ]
  const columns = tab === 'attendance' ? attendanceColumns : tab === 'leave' ? leaveColumns : monthlyColumns

  const doExport = (type) => {
    toast.success(`Exporting ${tab} report as ${type.toUpperCase()}…`)
  }

  const summaryCards = useMemo(() => {
    const base = rows
    if (tab === 'attendance') {
      const present = base.filter(r => r.status === 'present' || r.status === 'wfh').length
      const late = base.filter(r => r.status === 'late').length
      const absent = base.filter(r => r.status === 'absent').length
      const onLeave = base.filter(r => r.status === 'leave').length
      return [
        { label: 'Records', value: base.length, color: '#2563eb' },
        { label: 'Present / WFH', value: present, color: '#10b981' },
        { label: 'Late', value: late, color: '#f59e0b' },
        { label: 'Absent / Leave', value: absent + onLeave, color: '#f43f5e' },
      ]
    }
    if (tab === 'leave') {
      const approved = base.filter(r => r.status === 'approved').length
      const pending = base.filter(r => r.status === 'pending').length
      const rejected = base.filter(r => r.status === 'rejected').length
      const totalDays = base.reduce((s, r) => s + (r.days || 0), 0)
      return [
        { label: 'Requests', value: base.length, color: '#2563eb' },
        { label: 'Approved', value: approved, color: '#10b981' },
        { label: 'Pending', value: pending, color: '#f59e0b' },
        { label: 'Total Days', value: totalDays, color: '#0ea5e9' },
      ]
    }
    const avg = (p) => Math.round(base.reduce((s, r) => s + (r[p] || 0), 0) / (base.length || 1))
    return [
      { label: 'Avg Present', value: avg('totalPresent'), color: '#10b981' },
      { label: 'Avg Late', value: avg('totalLate'), color: '#f59e0b' },
      { label: 'Avg Leaves', value: avg('totalLeaves'), color: '#0ea5e9' },
      { label: 'Avg WFH', value: avg('totalWFH'), color: '#0d9488' },
    ]
  }, [tab, rows])

  return (
    <div>
      <PageHeader
        title="Reports Center"
        subtitle="Inspect workforce trends, export records, and keep leadership informed."
        actions={
          <>
            <button className="btn btn-light btn-sm" onClick={() => toast.success('Filters reset')}><FiRefreshCw className="me-1" /> Reset</button>
            <button className="btn btn-outline btn-sm" onClick={() => doExport('pdf')}><FiDownload className="me-1" /> PDF</button>
            <button className="btn btn-success btn-sm" onClick={() => doExport('excel')}><FiDownload className="me-1" /> Excel</button>
          </>
        }
      >
        <div className="btn-group" role="group" style={{ borderRadius: 99 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              className={cx('btn', tab === t.id ? 'btn-primary' : 'btn-light')}
              onClick={() => setTab(t.id)}
            >
              <t.icon className="me-1" /> {t.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="row g-4 mb-4">
        {summaryCards.map(s => (
          <div key={s.label} className="col-md-3 col-6">
            <div className="card card-stat p-4">
              <div className="stat-accent" style={{ background: s.color }} />
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex align-items-center gap-2"><FiFilter /> <h3>Filters</h3></div>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Department</label>
              <select className="form-select" value={dept} onChange={e => setDept(e.target.value)}>
                <option value="">All</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Employee</label>
              <select className="form-select" value={emp} onChange={e => setEmp(e.target.value)}>
                <option value="">All</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">From</label>
              <input type="date" className="form-control" value={range.from} onChange={e => setRange({ ...range, from: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label">To</label>
              <input type="date" className="form-control" value={range.to} onChange={e => setRange({ ...range, to: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="wfh">WFH</option>
                <option value="leave">On Leave</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <ChartCard title={tab === 'leave' ? 'Leave Type Breakdown' : 'Attendance Overview'} subtitle="By status / type">
            {tab === 'monthly' ? <EmployeeGrowthChart data={growth} /> : tab === 'leave' ? <LeaveDoughnutChart data={chartOverview} /> : <AttendanceBarChart data={rows.slice(0, 15).map(r => ({ date: formatDate(r.date), present: r.status === 'present' ? 1 : 0, wfh: r.status === 'wfh' ? 1 : 0, absent: r.status === 'absent' ? 1 : 0 }))} />}
          </ChartCard>
        </div>
        <div className="col-lg-6">
          <ChartCard title="Employee Growth" subtitle="Last 6 months">
            <EmployeeGrowthChart data={growth} />
          </ChartCard>
        </div>
      </div>
      <motion.div
        className="row g-4 mb-4"
        initial="hidden"
        animate="show"
      >
        <div className="col-lg-12">
          <Table
            title={`${TABS.find(t => t.id === tab).label} — Results`}
            columns={columns}
            className="table-responsive"
            data={rows}
            pagination
            paginationPerPage={15}
            searchPlaceholder={`Search ${tab} records…`}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default Reports
