import { uid } from '@/utils'

const TODAY = new Date()
const YEAR = TODAY.getFullYear()
const MONTH = TODAY.getMonth()
const DAY = TODAY.getDate()

const toIso = (d) => d.toISOString()
const addDays = (base, n) => {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}
const setTime = (base, h, m = 0, s = 0) => {
  const d = new Date(base)
  d.setHours(h, m, s, 0)
  return d
}

export const DEPARTMENTS = [
  { id: 'dept_hr', name: 'Human Resources', headCount: 5 },
  { id: 'dept_eng', name: 'Engineering', headCount: 10 },
  { id: 'dept_sales', name: 'Sales & Marketing', headCount: 6 },
  { id: 'dept_fin', name: 'Finance', headCount: 3 },
  { id: 'dept_ops', name: 'Operations', headCount: 3 },
]

export const DESIGNATIONS = [
  { id: 'des_hrm', title: 'HR Manager', departmentId: 'dept_hr' },
  { id: 'des_hrr', title: 'HR Recruiter', departmentId: 'dept_hr' },
  { id: 'des_emp', title: 'HR Executive', departmentId: 'dept_hr' },
  { id: 'des_cto', title: 'Chief Technology Officer', departmentId: 'dept_eng' },
  { id: 'des_sde', title: 'Senior Software Engineer', departmentId: 'dept_eng' },
  { id: 'des_se', title: 'Software Engineer', departmentId: 'dept_eng' },
  { id: 'des_qae', title: 'QA Engineer', departmentId: 'dept_eng' },
  { id: 'des_sm', title: 'Sales Manager', departmentId: 'dept_sales' },
  { id: 'des_mm', title: 'Marketing Manager', departmentId: 'dept_sales' },
  { id: 'des_ae', title: 'Account Executive', departmentId: 'dept_sales' },
  { id: 'des_fm', title: 'Finance Manager', departmentId: 'dept_fin' },
  { id: 'des_acc', title: 'Accountant', departmentId: 'dept_fin' },
  { id: 'des_om', title: 'Operations Manager', departmentId: 'dept_ops' },
  { id: 'des_oa', title: 'Operations Analyst', departmentId: 'dept_ops' },
]

const makeEmployee = (i, role, departmentId, designationId, firstName, lastName, deptName) => {
  const id = uid('emp')
  const birthMonth = (i * 3 + 1) % 12
  const birthDay = (i * 7 + 3) % 27 + 1
  const joiningYear = YEAR - (i % 5 + 1)
  const joiningMonth = (i + 2) % 12
  return {
    id,
    userId: `u_${id}`,
    employeeId: `EMP-${String(1000 + i).padStart(4, '0')}`,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
    phone: `+1 (555) ${String(100 + i).slice(-3)}-${String(1000 + i * 7).slice(-4)}`,
    photo: null,
    departmentId,
    department: deptName,
    designationId,
    designation: DESIGNATIONS.find((d) => d.id === designationId)?.title || 'Employee',
    dateOfBirth: toIso(new Date(1990 + (i % 12), birthMonth, birthDay)),
    joiningDate: toIso(new Date(joiningYear, joiningMonth, 1 + (i % 20))),
    address: `${100 + i * 7} Market St, Suite ${200 + i}, New York, NY`,
    role,
    status: i % 9 === 0 ? 'inactive' : 'active',
    gender: i % 2 === 0 ? 'Male' : 'Female',
    managerId: i > 3 ? 'emp_manager_1' : null,
  }
}

export const EMPLOYEES = [
  makeEmployee(1, 'admin', 'dept_hr', 'des_hrm', 'Sophia', 'Anderson', 'Human Resources'),
  makeEmployee(2, 'manager', 'dept_eng', 'des_cto', 'Daniel', 'Patel', 'Engineering'),
  makeEmployee(3, 'manager', 'dept_sales', 'des_sm', 'Olivia', 'Martinez', 'Sales & Marketing'),
  makeEmployee(4, 'employee', 'dept_eng', 'des_sde', 'Liam', 'Johnson', 'Engineering'),
  makeEmployee(5, 'employee', 'dept_eng', 'des_se', 'Noah', 'Williams', 'Engineering'),
  makeEmployee(6, 'employee', 'dept_eng', 'des_se', 'Emma', 'Brown', 'Engineering'),
  makeEmployee(7, 'employee', 'dept_eng', 'des_qae', 'Ava', 'Jones', 'Engineering'),
  makeEmployee(8, 'employee', 'dept_eng', 'des_qae', 'Mason', 'Garcia', 'Engineering'),
  makeEmployee(9, 'employee', 'dept_sales', 'des_ae', 'Sophia', 'Miller', 'Sales & Marketing'),
  makeEmployee(10, 'employee', 'dept_sales', 'des_ae', 'Lucas', 'Davis', 'Sales & Marketing'),
  makeEmployee(11, 'employee', 'dept_sales', 'des_mm', 'Isabella', 'Rodriguez', 'Sales & Marketing'),
  makeEmployee(12, 'employee', 'dept_hr', 'des_hrr', 'Mia', 'Wilson', 'Human Resources'),
  makeEmployee(13, 'employee', 'dept_hr', 'des_emp', 'Ethan', 'Lopez', 'Human Resources'),
  makeEmployee(14, 'employee', 'dept_fin', 'des_fm', 'Charlotte', 'Hill', 'Finance'),
  makeEmployee(15, 'employee', 'dept_fin', 'des_acc', 'Amelia', 'Scott', 'Finance'),
  makeEmployee(16, 'employee', 'dept_fin', 'des_acc', 'Logan', 'Green', 'Finance'),
  makeEmployee(17, 'employee', 'dept_ops', 'des_om', 'Harper', 'Adams', 'Operations'),
  makeEmployee(18, 'employee', 'dept_ops', 'des_oa', 'Aiden', 'Baker', 'Operations'),
  makeEmployee(19, 'employee', 'dept_eng', 'des_sde', 'Evelyn', 'Nelson', 'Engineering'),
  makeEmployee(20, 'employee', 'dept_sales', 'des_ae', 'James', 'Carter', 'Sales & Marketing'),
  makeEmployee(21, 'employee', 'dept_ops', 'des_oa', 'Abigail', 'Mitchell', 'Operations'),
  makeEmployee(22, 'employee', 'dept_hr', 'des_hrr', 'Benjamin', 'Perez', 'Human Resources'),
]
EMPLOYEES[0].id = 'emp_admin'
EMPLOYEES[1].id = 'emp_manager_1'
EMPLOYEES[2].id = 'emp_manager_2'

export const USERS = EMPLOYEES.map((e, idx) => {
  let password = 'Employee@123'
  if (idx === 0) password = 'Admin@123'
  else if (idx <= 2) password = 'Manager@123'
  return {
    id: e.userId,
    employeeId: e.id,
    email: e.email,
    role: e.role,
    password,
    isActive: e.status === 'active',
  }
})

export const LEAVE_TYPES = [
  { id: 'lt_casual', name: 'Casual Leave', color: '#0ea5e9', daysAllocated: 12, description: 'For personal errands and short-term needs.' },
  { id: 'lt_sick', name: 'Sick Leave', color: '#10b981', daysAllocated: 10, description: 'For health-related absences with medical proof.' },
  { id: 'lt_paid', name: 'Paid Leave', color: '#6366f1', daysAllocated: 15, description: 'Annual vacation carry-forward leave.' },
  { id: 'lt_emergency', name: 'Emergency Leave', color: '#f59e0b', daysAllocated: 5, description: 'Urgent personal emergencies.' },
  { id: 'lt_wfh', name: 'Work From Home', color: '#0d9488', daysAllocated: 20, description: 'Remote work days per year.' },
]

export const LEAVE_BALANCE = EMPLOYEES.flatMap((e) =>
  LEAVE_TYPES.map((lt) => ({
    id: uid('lb'),
    employeeId: e.id,
    leaveTypeId: lt.id,
    year: YEAR,
    used: Math.floor(Math.random() * (lt.daysAllocated / 2)),
    remaining: lt.daysAllocated - Math.floor(Math.random() * (lt.daysAllocated / 2)),
  }))
)

const STATUSES = ['present', 'present', 'present', 'late', 'wfh', 'halfday', 'absent', 'leave']
export const ATTENDANCE = EMPLOYEES.flatMap((e) => {
  const records = []
  for (let i = 0; i < 35; i++) {
    const date = addDays(TODAY, -i)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)]
    if (status === 'leave') continue
    const punchIn = status === 'absent' ? null : setTime(date, status === 'late' ? 9 + (i % 3) + 1 : 8, 30 + (i % 15))
    const punchOut =
      status === 'absent'
        ? null
        : status === 'halfday'
        ? setTime(date, 12, 30 + (i % 15))
        : setTime(date, status === 'wfh' ? 16 : 17, 30 + (i % 30))
    records.push({
      id: uid('att'),
      employeeId: e.id,
      date: toIso(date).split('T')[0],
      punchIn: punchIn ? toIso(punchIn) : null,
      punchOut: punchOut ? toIso(punchOut) : null,
      workingMinutes:
        punchIn && punchOut ? Math.round((punchOut - punchIn) / 60000) : 0,
      status,
      location: status === 'wfh' ? 'Work From Home' : 'Office - HQ New York',
      note: status === 'late' ? 'Heavy traffic' : '',
    })
  }
  return records
})

const REASONS = [
  'Family vacation',
  'Medical appointment',
  'Home renovation',
  'Child care',
  'Moving to new home',
  'Wedding ceremony',
  'Personal work',
  'Sick - flu symptoms',
]

export const LEAVES = Array.from({ length: 20 }, (_, i) => {
  const e = EMPLOYEES[3 + (i % (EMPLOYEES.length - 3))]
  const lt = LEAVE_TYPES[i % LEAVE_TYPES.length]
  const startOffset = i + 2
  const duration = (i % 5) + 1
  const from = addDays(TODAY, startOffset - 10)
  const to = addDays(from, duration - 1)
  const statusList = ['pending', 'pending', 'approved', 'approved', 'approved', 'rejected', 'cancelled']
  const status = statusList[i % statusList.length]
  return {
    id: uid('lv'),
    employeeId: e.id,
    employeeName: e.name,
    leaveTypeId: lt.id,
    leaveType: lt.name,
    fromDate: toIso(from).split('T')[0],
    toDate: toIso(to).split('T')[0],
    days: duration,
    reason: REASONS[i % REASONS.length],
    status,
    appliedAt: toIso(addDays(from, -3)),
    reviewedAt: status !== 'pending' ? toIso(addDays(from, -2)) : null,
    managerRemarks:
      status === 'approved'
        ? 'Approved. Please delegate your tasks.'
        : status === 'rejected'
        ? 'Busy month, please reschedule.'
        : status === 'cancelled'
        ? 'Withdrawn by requester.'
        : '',
    approvedBy: status !== 'pending' && status !== 'cancelled' ? 'emp_manager_1' : null,
    attachments: [],
  }
})

export const HOLIDAYS = [
  { id: uid('hd'), date: toIso(new Date(YEAR, 0, 1)).split('T')[0], name: "New Year's Day", type: 'national' },
  { id: uid('hd'), date: toIso(new Date(YEAR, MONTH, DAY + 4)).split('T')[0], name: 'Company Founders Day', type: 'company' },
  { id: uid('hd'), date: toIso(new Date(YEAR, MONTH, DAY + 11)).split('T')[0], name: 'Regional Festival', type: 'optional' },
  { id: uid('hd'), date: toIso(new Date(YEAR, MONTH + 1, 5)).split('T')[0], name: 'Spring Festival', type: 'national' },
  { id: uid('hd'), date: toIso(new Date(YEAR, MONTH + 1, 21)).split('T')[0], name: 'Team Offsite Day', type: 'company' },
  { id: uid('hd'), date: toIso(new Date(YEAR, 3, 7)).split('T')[0], name: 'Good Friday', type: 'national' },
  { id: uid('hd'), date: toIso(new Date(YEAR, 3, 10)).split('T')[0], name: 'Easter Monday', type: 'national' },
  { id: uid('hd'), date: toIso(new Date(YEAR, 4, 1)).split('T')[0], name: 'Labour Day', type: 'national' },
  { id: uid('hd'), date: toIso(new Date(YEAR, 6, 4)).split('T')[0], name: 'Independence Day Observed', type: 'national' },
  { id: uid('hd'), date: toIso(new Date(YEAR, 8, 2)).split('T')[0], name: 'Labour Day', type: 'national' },
  { id: uid('hd'), date: toIso(new Date(YEAR, 10, 28)).split('T')[0], name: 'Thanksgiving', type: 'national' },
  { id: uid('hd'), date: toIso(new Date(YEAR, 10, 29)).split('T')[0], name: 'Thanksgiving Friday', type: 'company' },
  { id: uid('hd'), date: toIso(new Date(YEAR, 11, 24)).split('T')[0], name: 'Christmas Eve', type: 'optional' },
  { id: uid('hd'), date: toIso(new Date(YEAR, 11, 25)).split('T')[0], name: 'Christmas Day', type: 'national' },
  { id: uid('hd'), date: toIso(new Date(YEAR, 11, 31)).split('T')[0], name: "New Year's Eve (Half day)", type: 'company' },
]

export const ACTIVITIES = [
  { id: uid('act'), employeeId: EMPLOYEES[3].id, employeeName: EMPLOYEES[3].name, action: 'punched in', detail: 'at Office - HQ', at: toIso(setTime(TODAY, 8, 45)), type: 'attendance' },
  { id: uid('act'), employeeId: EMPLOYEES[4].id, employeeName: EMPLOYEES[4].name, action: 'applied for leave', detail: 'Sick Leave for 2 days', at: toIso(setTime(TODAY, 8, 20)), type: 'leave' },
  { id: uid('act'), employeeId: EMPLOYEES[5].id, employeeName: EMPLOYEES[5].name, action: 'was marked late', detail: 'Punched in at 10:12 AM', at: toIso(setTime(TODAY, 10, 12)), type: 'attendance' },
  { id: uid('act'), employeeId: EMPLOYEES[6].id, employeeName: EMPLOYEES[6].name, action: 'leave approved', detail: 'By Manager Daniel', at: toIso(setTime(addDays(TODAY, -1), 17, 4)), type: 'leave' },
  { id: uid('act'), employeeId: EMPLOYEES[7].id, employeeName: EMPLOYEES[7].name, action: 'joined the team', detail: 'Software Engineer', at: toIso(setTime(addDays(TODAY, -2), 9, 0)), type: 'employee' },
  { id: uid('act'), employeeId: EMPLOYEES[8].id, employeeName: EMPLOYEES[8].name, action: 'punched out', detail: 'Working 8h 12m', at: toIso(setTime(addDays(TODAY, -1), 17, 6)), type: 'attendance' },
  { id: uid('act'), employeeId: EMPLOYEES[9].id, employeeName: EMPLOYEES[9].name, action: 'profile updated', detail: 'Contact information', at: toIso(setTime(addDays(TODAY, -1), 14, 3)), type: 'profile' },
  { id: uid('act'), employeeId: EMPLOYEES[10].id, employeeName: EMPLOYEES[10].name, action: 'punched in', detail: 'Work From Home', at: toIso(setTime(TODAY, 9, 10)), type: 'attendance' },
  { id: uid('act'), employeeId: EMPLOYEES[11].id, employeeName: EMPLOYEES[11].name, action: 'leave rejected', detail: 'Casual Leave 1 day', at: toIso(setTime(addDays(TODAY, -2), 16, 30)), type: 'leave' },
  { id: uid('act'), employeeId: EMPLOYEES[12].id, employeeName: EMPLOYEES[12].name, action: 'payslip released', detail: 'June 2026', at: toIso(setTime(addDays(TODAY, -3), 10, 0)), type: 'payroll' },
]

export const NOTIFICATIONS = [
  { id: uid('ntf'), title: 'Leave request from Liam Johnson', subtitle: 'Casual Leave · Today', unread: true, createdAt: toIso(setTime(TODAY, 9, 20)) },
  { id: uid('ntf'), title: 'New employee onboarding', subtitle: 'Evelyn Nelson joins Engineering', unread: true, createdAt: toIso(setTime(addDays(TODAY, -1), 15, 20)) },
  { id: uid('ntf'), title: 'Monthly report is ready', subtitle: 'Attendance report for June', unread: false, createdAt: toIso(setTime(addDays(TODAY, -2), 11, 0)) },
  { id: uid('ntf'), title: 'Upcoming holiday', subtitle: 'Founders Day in 3 days', unread: false, createdAt: toIso(setTime(addDays(TODAY, -1), 8, 0)) },
  { id: uid('ntf'), title: 'Birthday today', subtitle: "It's Noah Williams' birthday", unread: true, createdAt: toIso(setTime(TODAY, 7, 30)) },
]

export const TODAYS_BIRTHDAYS = EMPLOYEES.filter((e) => {
  const d = new Date(e.dateOfBirth)
  return d.getMonth() === MONTH && Math.abs(d.getDate() - DAY) <= 3
}).slice(0, 4)

export const OFFICE_SETTINGS = {
  workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '09:00',
  endTime: '18:00',
  breakStart: '13:00',
  breakEnd: '14:00',
  lateThresholdMinutes: 15,
  halfDayThresholdHours: 4,
  timezone: 'America/New_York',
  officeLocation: '500 Market St, HQ, New York, NY',
}
