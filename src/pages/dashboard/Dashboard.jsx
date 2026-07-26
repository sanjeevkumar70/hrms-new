import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { dashboardService } from '@/services/dashboardService'
import { fetchOverview, fetchMonthly } from '@/redux/slices/attendanceSlice'
import { fetchTeamLeaves, fetchLeaveBalance, fetchLeaveTypes } from '@/redux/slices/leaveSlice'
import { fetchEmployees, fetchDepartments } from '@/redux/slices/employeeSlice'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import PageHeader from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/Badges'
import ChartCard, { AttendanceBarChart, MonthlyLineChart, LeaveDoughnutChart, EmployeeGrowthChart } from '@/components/common/Charts'
import Avatar from '@/components/common/Avatar'
import Loader, { Skeleton, EmptyState } from '@/components/common/Loader'
import {
  FiUsers, FiUserCheck, FiUserX, FiClock, FiCalendar, FiFileText,
  FiArrowUp, FiArrowDown, FiBriefcase, FiGift, FiActivity,
} from 'react-icons/fi'
import { formatDate, formatDateTime, cx, formatDuration, diffMinutes, formatTime } from '@/utils'
import { motion } from 'framer-motion'
import RealTable from '@/components/common/Table'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { role, employee } = useAuth()
  const perms = usePermissions()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [holidays, setHolidays] = useState([])
  const [birthdays, setBirthdays] = useState([])
  const [overviewChart, setOverviewChart] = useState([])
  const [monthly, setMonthly] = useState([])
  const [leaveStats, setLeaveStats] = useState([])
  const [growth, setGrowth] = useState([])
  const [loading, setLoading] = useState(true)
  const todayRec = useSelector((s) => s.attendance.today)
  const myBalance = useSelector((s) => s.leave.balance)
  const leaveTypes = useSelector((s) => s.leave.types)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const all = await Promise.all([
          dashboardService.stats(),
          dashboardService.recentActivities(8),
          dashboardService.upcomingHolidays(5),
          dashboardService.todaysBirthdays(),
          dashboardService.attendanceOverview(),
          dashboardService.monthlyAttendance(),
          dashboardService.leaveStatistics(),
          dashboardService.employeeGrowth(8),
          dispatch(fetchOverview()),
          perms.canViewReports && dispatch(fetchEmployees({ perPage: 5, page: 1 })),
          dispatch(fetchLeaveTypes()),
          employee && dispatch(fetchLeaveBalance(employee.id)),
        ])
        const [s, r, h, b, oc, m, ls, g] = all
        setStats(s); setRecent(r); setHolidays(h); setBirthdays(b); setOverviewChart(oc); setMonthly(m); setLeaveStats(ls); setGrowth(g)
      } finally {
        setLoading(false)
      }
    })()
  }, [dispatch, perms.canViewReports, employee])

  const cards = useMemo(() => {
    if (perms.isEmployee) {
      const workingMin = todayRec?.workingMinutes || (todayRec?.punchIn ? diffMinutes(todayRec.punchIn, new Date().toISOString()) : 0)
      const balanceUsed = myBalance.reduce((s, b) => s + (b.used || 0), 0)
      const balanceRemaining = myBalance.reduce((s, b) => s + (b.remaining || 0), 0)
      return [
        { label: 'Today\'s Attendance', value: todayRec?.status ? todayRec.status.toUpperCase() : 'NOT PUNCHED', icon: FiClock, accent: '#2563eb',
          delta: todayRec?.punchIn ? `In at ${formatTime(todayRec.punchIn)}` : 'Pending' },
        { label: 'Working Hours', value: formatDuration(workingMin), icon: FiBriefcase, accent: '#10b981',
          delta: todayRec?.punchOut ? `Punched out ${formatTime(todayRec.punchOut)}` : todayRec?.punchIn ? '⏱ Timer running…' : '—' },
        { label: 'Break Time', value: '1h 00m', icon: FiActivity, accent: '#a855f7', delta: 'Lunch 13:00 – 14:00' },
        { label: 'Pending Leaves', value: 3, icon: FiFileText, accent: '#f59e0b', delta: 'Awaiting approval', deltaUp: false },
        { label: 'Approved Leaves', value: balanceUsed || 4, icon: FiCalendar, accent: '#0ea5e9', delta: `Remaining: ${balanceRemaining || 34}` },
        { label: 'Leave Balance', value: balanceRemaining || 34, icon: FiGift, accent: '#0d9488', delta: 'Days available this year' },
      ]
    }
    return [
      { label: 'Total Employees', value: stats?.total || 0, icon: FiUsers, accent: '#2563eb', delta: '+3 this month' },
      { label: 'Present Today', value: stats?.present || 0, icon: FiUserCheck, accent: '#10b981', delta: stats ? `${stats.present + (stats?.wfh || 0)} Incl. WFH` : '' },
      { label: 'Absent Today', value: stats?.absent || 0, icon: FiUserX, accent: '#f43f5e', delta: '-1 vs yesterday', deltaUp: false },
      { label: 'Late Today', value: stats?.late || 0, icon: FiClock, accent: '#f59e0b', delta: '+2 vs yesterday', deltaUp: false },
      { label: 'On Leave', value: stats?.leave || 0, icon: FiCalendar, accent: '#0ea5e9', delta: '2 WFH today' },
      { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: FiFileText, accent: '#a855f7', delta: 'Action needed' },
    ]
  }, [stats, todayRec, myBalance, perms.isEmployee])

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  }
  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } },
  }

  if (loading) return (
    <div>
      <PageHeader title="Dashboard" subtitle="Loading workspace data…" />
      <div className="card-stat-grid row g-4 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="col-lg-4 col-md-6"><div className="skeleton card" /></div>
        ))}
      </div>
    </div>
  )

  const EmployeeRecentAttendance = () => (
    <Table
      title="Recent Attendance"
      data={Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i)
        const statuses = ['present', 'present', 'late', 'wfh', 'halfday']
        const st = statuses[i % statuses.length]
        return {
          date: formatDate(d),
          in: st === 'absent' ? '—' : `${8 + (i % 2)}:${30 + i} AM`,
          out: st === 'absent' || st === 'halfday' ? (st === 'halfday' ? '12:30 PM' : '—') : `5:${30 + (i % 15)} PM`,
          hours: st === 'absent' ? '0h 0m' : st === 'halfday' ? '4h 12m' : `${8 + (i % 2)}h ${10 + i}m`,
          status: st,
        }
      })}
      columns={[
        { name: 'Date', selector: r => r.date, sortable: true },
        { name: 'Punch In', selector: r => r.in },
        { name: 'Punch Out', selector: r => r.out },
        { name: 'Hours', selector: r => r.hours },
        { name: 'Status', cell: (r) => <span className={cx('badge', `badge-${r.status}`)}>{r.status}</span>, center: true },
      ]}
      pagination={false}
    />
  )

  const placeholderTable = { columns: [], data: [] }

  return (
    <div>
      <PageHeader
        title={perms.isEmployee ? `Welcome back, ${employee?.firstName || 'there'}!` : 'Dashboard'}
        subtitle={perms.isEmployee ? "Here's a quick look at your attendance today." : "Today's workforce snapshot at a glance."}
      />

      <motion.div
        className="card-stat-grid row g-4 mb-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {cards.map((c, i) => (
          <motion.div key={c.label} className="col-lg-4 col-md-6" variants={cardVariants}>
            <StatCard {...c} />
          </motion.div>
        ))}
      </motion.div>

      {!perms.isEmployee && (
        <motion.div
          className="charts-grid row g-4 mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="col-lg-6">
            <ChartCard title="Attendance Overview" subtitle="Today's breakdown by status">
              <LeaveDoughnutChart data={overviewChart} />
            </ChartCard>
          </div>
          <div className="col-lg-6">
            <ChartCard title="Monthly Attendance" subtitle="Last 20 working days">
              <MonthlyLineChart
                data={monthly}
                series={[
                  { key: 'present', name: 'Present', color: '#10b981' },
                  { key: 'late', name: 'Late', color: '#f59e0b' },
                  { key: 'absent', name: 'Absent', color: '#f43f5e' },
                ]}
              />
            </ChartCard>
          </div>
          <div className="col-lg-6">
            <ChartCard title="Leave Statistics" subtitle="Used vs remaining by type">
              <LeaveDoughnutChart data={leaveStats} />
            </ChartCard>
          </div>
          <div className="col-lg-6">
            <ChartCard title="Employee Growth" subtitle="Last 8 months">
              <EmployeeGrowthChart data={growth} />
            </ChartCard>
          </div>
        </motion.div>
      )}

      <motion.div
        className="dashboard-bottom row g-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header">
              <h3>Recent Activities</h3>
              <Link to="/reports" className="small">View all</Link>
            </div>
            <div className="card-body p-0">
              {!recent.length ? (
                <EmptyState title="No activity yet" />
              ) : (
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead><tr><th>User</th><th>Activity</th><th>Detail</th><th>When</th></tr></thead>
                    <tbody>
                      {recent.map((a) => (
                        <tr key={a.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Avatar size="sm" name={a.employeeName} />
                              <div>
                                <div className="fw-semibold small">{a.employeeName}</div>
                                <div className="text-muted text-xs">{a.type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="small">{a.action}</td>
                          <td className="small text-muted">{a.detail}</td>
                          <td className="small text-muted">{formatDateTime(a.at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          {perms.isEmployee && (
            <div className="mt-4">
              <EmployeeRecentAttendance />
            </div>
          )}
        </div>
        <div className="col-lg-5">
          <div className="card mb-4">
            <div className="card-header">
              <h3>Upcoming Holidays</h3>
              <Link to="/holidays" className="small">Calendar</Link>
            </div>
            <div className="card-body">
              {holidays.length === 0 ? <EmptyState title="No holidays in sight" /> : (
                <ul className="list-group list-group-flush">
                  {holidays.map((h) => (
                    <li key={h.id} className="list-group-item d-flex align-items-center border-0 px-0 py-3">
                      <div className="me-3 text-center" style={{ minWidth: 48 }}>
                        <div className="fw-bold text-primary">{new Date(h.date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</div>
                        <div className="display-6 fw-bold text-slate-900" style={{ fontSize: 22, lineHeight: 1 }}>
                          {new Date(h.date).getDate()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="fw-semibold small">{h.name}</div>
                        <div className="text-muted small">
                          <span className={cx('badge', `badge-${h.type === 'national' ? 'danger' : h.type === 'optional' ? 'info' : 'success'}`)}>
                            {h.type}
                          </span>
                          <span className="ms-2">
                            {Math.max(0, Math.ceil((new Date(h.date) - new Date()) / 86400000))} day(s) away
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3>🎂 Today's Birthdays</h3>
              <span className="small text-muted">{birthdays.length} celebrating</span>
            </div>
            <div className="card-body">
              {birthdays.length === 0 ? (
                <EmptyState title="No birthdays today" description="Check back tomorrow." />
              ) : (
                <div className="d-flex flex-column gap-3">
                  {birthdays.map((b) => (
                    <div key={b.id} className="d-flex align-items-center gap-3 p-2 rounded-3 bg-slate-50">
                      <Avatar size="md" name={b.name} />
                      <div className="flex-1">
                        <div className="fw-semibold small">{b.name}</div>
                        <div className="text-muted small">{b.designation} · {b.department}</div>
                      </div>
                      <button className="btn btn-outline sm btn-sm">Wish 🎁</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Local Table component (simple, scoped variant)
const Table = ({ columns, data, title, pagination = true, ...rest }) => {
  return <RealTable title={title} columns={columns} data={data} pagination={pagination} {...rest} />
}

export default Dashboard
