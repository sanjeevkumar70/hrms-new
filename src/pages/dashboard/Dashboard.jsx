import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { dashboardService } from '@/services/dashboardService'
import { fetchOverview, fetchMonthly } from '@/redux/slices/attendanceSlice'
import { fetchTeamLeaves, fetchLeaveBalance, fetchLeaveTypes } from '@/redux/slices/leaveSlice'
import { fetchEmployees } from '@/redux/slices/employeeSlice'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import PageHeader from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/Badges'
import ChartCard, { MonthlyLineChart, EmployeeGrowthChart } from '@/components/common/Charts'
import Avatar from '@/components/common/Avatar'
import Loader, { Skeleton, EmptyState } from '@/components/common/Loader'
import {
  formatDate,
  formatDateTime,
  cx,
  formatDuration,
  diffMinutes,
  formatTime
} from '@/utils'
import { motion } from 'framer-motion'
import RealTable from '@/components/common/Table'
import { adminCards, employeeCards, recentAttendance } from '@/data'
import './dashboard.scss';
import {
  FiClock,
  FiLogIn,
  FiLogOut,
  FiCheckCircle,
} from 'react-icons/fi'
import PunchControls from '@/components/punch/PunchControls'
import AttendanceSummaryCard from '@/components/common/cards/AttendanceSummaryCard'


const Dashboard = () => {
  const dispatch = useDispatch()
  const { role, employee } = useAuth()
  const perms = usePermissions()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [holidays, setHolidays] = useState([])
  const [birthdays, setBirthdays] = useState([])
  const [monthly, setMonthly] = useState([])
  const [growth, setGrowth] = useState([])
  const [loading, setLoading] = useState(true)
  const todayRec = useSelector((s) => s.attendance.today)
  const myBalance = useSelector((s) => s.leave.balance)
  const leaveTypes = useSelector((s) => s.leave.types)




  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const all = await Promise.all([
          dashboardService.stats(),
          dashboardService.recentActivities(8),
          dashboardService.upcomingHolidays(5),
          dashboardService.todaysBirthdays(),
          dashboardService.monthlyAttendance(),
          dashboardService.employeeGrowth(8),
          dispatch(fetchOverview()),
          perms.canViewReports && dispatch(fetchEmployees({ perPage: 5, page: 1 })),
          dispatch(fetchLeaveTypes()),
          employee && dispatch(fetchLeaveBalance(employee.id)),
        ])
        const [s, r, h, b, m, g] = all
        setStats(s); setRecent(r); setHolidays(h); setBirthdays(b); setMonthly(m); setGrowth(g)
      } finally {
        setLoading(false)
      }
    })()
  }, [dispatch, perms.canViewReports, employee])

  const cards = useMemo(() => {
    return perms.isEmployee ? employeeCards : adminCards
  }, [perms.isEmployee])


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

  const EmployeeRecentAttendance = () => {
    return (
      <Table
        title="Recent Attendance"
        data={recentAttendance}
        columns={[
          {
            name: 'Date',
            selector: r => r.date,
            sortable: true,
          },
          {
            name: 'Punch In',
            selector: r => r.in,
          },
          {
            name: 'Punch Out',
            selector: r => r.out,
          },
          {
            name: 'Hours',
            selector: r => r.hours,
          },
          {
            name: 'Status',
            cell: r => (
              <span className={cx('badge', `badge-${r.status}`)}>
                {r.status}
              </span>
            ),
            center: true,
          },
        ]}
        pagination={false}
      />
    )
  }


  return (
    <div className='dashboard-wrapper'>
      <PageHeader
        title={perms.isEmployee ? `Welcome back, ${employee?.firstName || 'there'}!` : 'Dashboard'}
        subtitle={perms.isEmployee ? "Here's a quick look at your attendance today." : "Today's workforce snapshot at a glance."}
      />


      <motion.div className="row g-4 mb-4"
        initial="hidden"
        animate="show"
      >
        <div className="col-lg-12">
          <PunchControls />
        </div>
      </motion.div>


      <div className="row g-4 mb-4">
        <AttendanceSummaryCard
          data={cards}
          title="📊 Attendance Summary"
          period="Last 30 days"
        />
      </div>

      {!perms.isEmployee && (
        <motion.div
          className="charts-grid row g-4 mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >

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
        {!perms.isEmployee && (
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
          </div>
        )}
        {perms.isEmployee && (
          <div className="col-lg-7">
            <div>
              <EmployeeRecentAttendance />
            </div>
          </div>
        )}
        <div className="col-lg-5">
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
                    <div key={b.id} className="d-flex align-items-center justify-content-between gap-3 p-2 rounded-3 bg-slate-50">
                      <Avatar size="md" name={b.name} />
                      <div className="flex-1">
                        <div className="fw-semibold ">{b.name}</div>
                        <div className="text-muted">{b.designation} </div>
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
