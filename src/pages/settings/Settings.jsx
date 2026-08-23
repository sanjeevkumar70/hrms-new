import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from '@/components/common/PageHeader'
import { usePermissions } from '@/hooks/useAuth'
import { setTheme, toggleTheme, updateOfficeSettings, updateLeavePolicy } from '@/redux/slices/uiSlice'
import { FiSun, FiMoon, FiClock, FiShield, FiBriefcase, FiImage } from 'react-icons/fi'
import { cx } from '@/utils'
import { toast } from 'react-toastify'

const TABS = [
  { id: 'office', label: 'Office Timing', icon: FiClock, roles: ['admin'] },
  { id: 'leave-policy', label: 'Leave Policy', icon: FiBriefcase, roles: ['admin'] },
  { id: 'roles', label: 'Roles & Permissions', icon: FiShield, roles: ['admin'] },
  { id: 'theme', label: 'Theme Settings', icon: FiImage, roles: ['admin', 'manager', 'employee'] },
]

const PERMISSIONS = [
  ['view_dashboard', 'View Dashboard'],
  ['view_attendance', 'View Attendance'],
  ['punch_attendance', 'Punch In/Out'],
  ['apply_leave', 'Apply Leave'],
  ['cancel_leave', 'Cancel Own Leave'],
  ['approve_leave', 'Approve/Reject Leave'],
  ['manage_employees', 'Manage Employees'],
  ['manage_leave_types', 'Manage Leave Types'],
  ['view_reports', 'View Reports'],
  ['export_reports', 'Export Reports'],
  ['manage_settings', 'Manage Settings'],
]

const ROLE_PERMISSION_MATRIX = {
  admin: Array(PERMISSIONS.length).fill(true),
  manager: [true, true, true, true, true, true, true, false, true, true, false],
  employee: [true, true, true, true, true, false, false, false, false, false, false],
}

const Settings = () => {
  const dispatch = useDispatch()
  const perms = usePermissions()
  const { theme, officeSettings, leavePolicy } = useSelector(s => s.ui)
  const [tab, setTab] = React.useState(perms.isAdmin ? 'office' : 'theme')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const visibleTabs = TABS.filter(t => t.roles.includes(perms.isAdmin ? 'admin' : perms.isManager ? 'manager' : 'employee'))

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure preferences, office timing, and access controls."
      >
        <div className="btn-group" role="group" style={{ borderRadius: 99 }}>
          {visibleTabs.map(t => (
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

      {tab === 'office' && perms.isAdmin && (
        <div className="card">
          <div className="card-header"><h3>Office Timing &amp; Location</h3></div>
          <div className="card-body">
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label">Work Days</label>
                <div className="d-flex flex-wrap gap-2">
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => {
                    const sel = officeSettings.workDays.includes(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        className={cx('btn', sel ? 'btn-primary' : 'btn-light')}
                        onClick={() => {
                          const next = sel ? officeSettings.workDays.filter(x => x !== d) : [...officeSettings.workDays, d]
                          dispatch(updateOfficeSettings({ workDays: next }))
                        }}
                      >{d.slice(0, 3)}</button>
                    )
                  })}
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label">Work Start</label>
                <input type="time" className="form-control" value={officeSettings.startTime} onChange={e => dispatch(updateOfficeSettings({ startTime: e.target.value }))} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Work End</label>
                <input type="time" className="form-control" value={officeSettings.endTime} onChange={e => dispatch(updateOfficeSettings({ endTime: e.target.value }))} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Break Start</label>
                <input type="time" className="form-control" value={officeSettings.breakStart} onChange={e => dispatch(updateOfficeSettings({ breakStart: e.target.value }))} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Break End</label>
                <input type="time" className="form-control" value={officeSettings.breakEnd} onChange={e => dispatch(updateOfficeSettings({ breakEnd: e.target.value }))} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Late Threshold (min)</label>
                <input type="number" className="form-control" value={officeSettings.lateThresholdMinutes} onChange={e => dispatch(updateOfficeSettings({ lateThresholdMinutes: Number(e.target.value) }))} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Timezone</label>
                <input className="form-control" value={officeSettings.timezone} onChange={e => dispatch(updateOfficeSettings({ timezone: e.target.value }))} />
              </div>
              <div className="col-md-12">
                <label className="form-label">Office Location</label>
                <input className="form-control" value={officeSettings.officeLocation} onChange={e => dispatch(updateOfficeSettings({ officeLocation: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => toast.success('Office settings saved')}>Save Changes</button>
          </div>
        </div>
      )}

      {tab === 'leave-policy' && perms.isAdmin && (
        <div className="card">
          <div className="card-header"><h3>Leave Policy</h3></div>
          <div className="card-body">
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Carry-over limit (days)</label>
                <input type="number" className="form-control" value={leavePolicy.carryOverLimit} onChange={e => dispatch(updateLeavePolicy({ carryOverLimit: Number(e.target.value) }))} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Auto approve up to (days)</label>
                <input type="number" className="form-control" value={leavePolicy.approvalRequiredAboveDays} onChange={e => dispatch(updateLeavePolicy({ approvalRequiredAboveDays: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="alert alert-info mb-4" role="alert">
              Tip: Leaves shorter than the auto-approve threshold skip to approval for employees reporting to an absent manager.
            </div>
            <button className="btn btn-primary" onClick={() => toast.success('Leave policy saved')}>Save Changes</button>
          </div>
        </div>
      )}

      {tab === 'roles' && perms.isAdmin && (
        <div className="card">
          <div className="card-header"><h3>Roles &amp; Permissions Matrix</h3></div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Permission</th>
                    {['Admin', 'Manager', 'Employee'].map(r => <th key={r} className="text-center">{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map(([key, label], i) => (
                    <tr key={key}>
                      <td>
                        <div className="small fw-semibold">{label}</div>
                        <code className="text-xs text-muted">{key}</code>
                      </td>
                      {['admin', 'manager', 'employee'].map(role => {
                        const enabled = ROLE_PERMISSION_MATRIX[role][i]
                        return (
                          <td key={role} className="text-center">
                            <div className="form-check form-switch d-inline-flex justify-content-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={enabled}
                                onChange={() => toast.success('Permission updated (stub)')}
                                disabled={role === 'admin'}
                              />
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer">
              <button className="btn btn-primary" onClick={() => toast.success('Roles & permissions saved')}>Save Matrix</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'theme' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header"><h3>Appearance Mode</h3></div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <button
                      type="button"
                      className={cx('card border-0 p-3 w-100 text-start text-decoration-none', theme === 'light' && 'ring-primary')}
                      style={theme === 'light' ? { outline: '2px solid #2563eb', background: '#fff' } : { background: '#f8fafc' }}
                      onClick={() => dispatch(setTheme('light'))}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2"><FiSun /> <span className="fw-semibold small">Light</span></div>
                      <div style={{ height: 110, borderRadius: 12, background: 'linear-gradient(180deg,#fff,#f1f5f9)', border: '1px solid #e2e8f0' }} />
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      type="button"
                      className={cx('card border-0 p-3 w-100 text-start text-decoration-none', theme === 'dark' && 'ring-primary')}
                      style={theme === 'dark' ? { outline: '2px solid #2563eb', background: '#0f172a' } : { background: '#0f172a', color: '#fff' }}
                      onClick={() => dispatch(setTheme('dark'))}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2"><FiMoon /> <span className="fw-semibold small">Dark</span></div>
                      <div style={{ height: 110, borderRadius: 12, background: 'linear-gradient(180deg,#1e293b,#0f172a)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 d-flex gap-2">
                  <button className="btn btn-outline" onClick={() => dispatch(toggleTheme())}>
                    {theme === 'light' ? <><FiMoon className="me-1" /> Switch to Dark</> : <><FiSun className="me-1" /> Switch to Light</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header"><h3>Primary Color</h3></div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {[
                    { n: 'Blue', v: '#1e40af' },
                    { n: 'Indigo', v: '#4338ca' },
                    { n: 'Teal', v: '#0d9488' },
                    { n: 'Emerald', v: '#047857' },
                    { n: 'Rose', v: '#be123c' },
                    { n: 'Amber', v: '#d97706' },
                    { n: 'Purple', v: '#7c3aed' },
                  ].map(c => (
                    <button
                      key={c.v}
                      title={c.n}
                      type="button"
                      className="btn"
                      style={{ background: c.v, color: '#fff', width: 44, height: 44, borderRadius: 12 }}
                      onClick={() => {
                        document.documentElement.style.setProperty('--color-primary', c.v)
                        toast.success(`Theme accent: ${c.n}`)
                      }}
                    />
                  ))}
                </div>
                <p className="small text-muted mt-3">Select an accent that matches your brand identity. Changes apply instantly across the interface.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
