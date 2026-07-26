import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import { dashboardService } from '@/services/dashboardService'
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi'
import { cx, isSameDay, isWeekend, formatDate, getDaysInMonth, getFirstWeekdayOfMonth } from '@/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const Holidays = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [holidays, setHolidays] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    ;(async () => setHolidays(await dashboardService.holidays()))()
  }, [])

  const monthsHolidays = useMemo(() => {
    return holidays.filter(h => {
      const d = new Date(h.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
  }, [holidays, year, month])

  const upcoming = useMemo(() => {
    const tod = today.toISOString().split('T')[0]
    return holidays
      .filter(h => h.date >= tod)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, 8)
  }, [holidays, today])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstWeekdayOfMonth(year, month)
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push({ empty: true })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d) })
  while (cells.length % 7 !== 0) cells.push({ empty: true })

  const prev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  const next = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  const holidayOn = (d) => monthsHolidays.find(h => new Date(h.date).getDate() === d.getDate())

  return (
    <div>
      <PageHeader
        title="Holiday Calendar"
        subtitle="View company holidays, regional festivals, and team offsites for the year."
        actions={
          <div className="btn-group">
            <button className="btn btn-outline btn-sm" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}>
              <FiCalendar className="me-1" /> Today
            </button>
          </div>
        }
      />

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card holiday-calendar p-0">
            <div className="card-header">
              <div className="calendar-nav">
                <button className="btn btn-light sm" onClick={prev} aria-label="Previous"><FiChevronLeft /></button>
                <h3>{new Date(year, month).toLocaleString('en-US', { month: 'long' })} {year}</h3>
                <button className="btn btn-light sm" onClick={next} aria-label="Next"><FiChevronRight /></button>
              </div>
              <div className="d-flex gap-3 align-items-center small text-muted">
                <span className="d-flex align-items-center gap-1"><span className="status-dot present" /> Holiday</span>
                <span className="d-flex align-items-center gap-1"><span className="status-dot absent" /> Weekend</span>
              </div>
            </div>
            <div className="calendar-grid m-0 border-0">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className={cx('calendar-weekday', (i === 0 || i === 6) && 'weekend')}>{d}</div>
              ))}
              {cells.map((c, i) => {
                if (c.empty) return <div key={`e-${i}`} className="calendar-day other-month" />
                const h = holidayOn(c.date)
                const isToday = isSameDay(c.date, today)
                return (
                  <div
                    key={i}
                    className={cx('calendar-day', isWeekend(c.date) && 'weekend', isToday && 'today')}
                    onClick={() => setSelected(h || null)}
                  >
                    <span className="day-number">{c.date.getDate()}</span>
                    {h && <span className={cx('holiday-tag', h.type)} title={h.name}>{h.name}</span>}
                  </div>
                )
              })}
            </div>
            <div className="card-footer text-center small text-muted">
              {monthsHolidays.length} holiday(s) this month
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3>Upcoming Holidays</h3>
              <span className="small text-muted">{upcoming.length} left</span>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {upcoming.length === 0 && (
                  <li className="list-group-item text-center text-muted py-5">No upcoming holidays</li>
                )}
                {upcoming.map(h => {
                  const d = new Date(h.date)
                  const daysAway = Math.max(0, Math.ceil((d - today) / 86400000))
                  return (
                    <li key={h.id} className={cx('list-group-item d-flex align-items-center gap-3 border-0 py-3', selected?.id === h.id && 'bg-slate-50')} onClick={() => setSelected(h)}>
                      <div className="text-center" style={{ minWidth: 48 }}>
                        <div className="fw-bold text-primary" style={{ fontSize: 11, letterSpacing: '0.08em' }}>
                          {d.toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                        </div>
                        <div className="fw-bold text-slate-900" style={{ fontSize: 20, lineHeight: 1 }}>{d.getDate()}</div>
                      </div>
                      <div className="flex-1">
                        <div className="fw-semibold small">{h.name}</div>
                        <div className="small text-muted">
                          <span className={cx('badge', `badge-${h.type === 'national' ? 'danger' : h.type === 'optional' ? 'info' : 'success'}`)} style={{ marginRight: 6 }}>{h.type}</span>
                          {daysAway === 0 ? '🎉 Today' : `${daysAway} day(s) away`}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          {selected && (
            <div className="card mt-4">
              <div className="card-header">
                <h5>Holiday Details</h5>
              </div>
              <div className="card-body">
                <div className="mb-2"><span className="text-muted small">Name:</span><div className="fw-semibold">{selected.name}</div></div>
                <div className="mb-2"><span className="text-muted small">Date:</span><div className="fw-semibold">{formatDate(selected.date)}</div></div>
                <div className="mb-2"><span className="text-muted small">Type:</span><div><span className={cx('badge', `badge-${selected.type === 'national' ? 'danger' : selected.type === 'optional' ? 'info' : 'success'}`)}>{selected.type}</span></div></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Holidays
