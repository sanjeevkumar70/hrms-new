import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from '@/components/common/PageHeader'
import Avatar from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/Badges'
import { useAuth } from '@/hooks/useAuth'
import { refreshUser } from '@/redux/slices/authSlice'
import { fetchLeaveBalance } from '@/redux/slices/leaveSlice'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { FiEdit3, FiLock, FiMail, FiUser, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiAward } from 'react-icons/fi'
import { formatDate, cx, getInitials } from '@/utils'
import { toast } from 'react-toastify'

const profileSchema = Yup.object({
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  phone: Yup.string().min(8).required('Required'),
  address: Yup.string().min(5, 'Address too short').required('Required'),
})

const pwdSchema = Yup.object({
  oldPassword: Yup.string().min(6, 'Required').required('Required'),
  newPassword: Yup.string()
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'Add uppercase')
    .matches(/[0-9]/, 'Add number')
    .required('Required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Must match new password').required('Required'),
})

const Profile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { employee, role } = useAuth()
  const balance = useSelector(s => s.leave.balance)
  const [editOpen, setEditOpen] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)

  useEffect(() => {
    if (employee?.id) dispatch(fetchLeaveBalance(employee.id))
  }, [dispatch, employee])

  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      address: employee?.address || '',
      gender: employee?.gender || 'Male',
    },
  })

  const pwdForm = useForm({ resolver: yupResolver(pwdSchema), defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' } })

  const onSaveProfile = async (values) => {
    dispatch(refreshUser({
      ...employee,
      firstName: values.firstName,
      lastName: values.lastName,
      name: `${values.firstName} ${values.lastName}`,
      phone: values.phone,
      address: values.address,
      gender: values.gender,
    }))
    toast.success('Profile updated')
    setEditOpen(false)
  }
  const onSavePwd = async (values) => {
    await new Promise(r => setTimeout(r, 400))
    toast.success('Password changed successfully')
    setPwdOpen(false)
    pwdForm.reset()
  }

  if (!employee) return <div className="p-5 text-center text-muted">No profile data.</div>

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information, avatar, and security."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => setPwdOpen(true)}><FiLock className="me-1" /> Change Password</button>
            <button className="btn btn-primary" onClick={() => setEditOpen(true)}><FiEdit3 className="me-1" /> Edit Profile</button>
          </>
        }
      />

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card p-0 overflow-hidden">
            <div className="profile-banner" style={{
              height: 140,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #0d9488 100%)',
              position: 'relative',
            }}>
              <div className="position-absolute end-3 top-3 p-3">
                <StatusBadge status="present" pulse />
              </div>
            </div>
            <div className="profile-row d-flex align-items-end gap-4 px-4" style={{ marginTop: -50 }}>
              <div className="avatar xxl" style={{ border: '5px solid #fff', boxShadow: '0 10px 30px rgba(15,23,42,0.18)' }}>
                {getInitials(employee.name)}
              </div>
              <div className="pb-2">
                <h3 className="m-0">{employee.name}</h3>
                <div className="text-muted small">{employee.designation} · {employee.department}</div>
                <div className="mt-1">
                  <span className="badge badge-info text-lowercase" style={{ textTransform: 'none' }}>
                    {role}
                  </span>
                  <span className="badge badge-success ms-1 text-lowercase" style={{ textTransform: 'none' }}>
                    ID: {employee.employeeId}
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <h5 className="mb-3">Information</h5>
              <div className="d-flex flex-column gap-3">
                <InfoRow icon={FiMail} label="Email" value={employee.email} />
                <InfoRow icon={FiPhone} label="Phone" value={employee.phone} />
                <InfoRow icon={FiMapPin} label="Address" value={employee.address} />
                <InfoRow icon={FiBriefcase} label="Department" value={employee.department} />
                <InfoRow icon={FiAward} label="Designation" value={employee.designation} />
                <InfoRow icon={FiCalendar} label="Joining Date" value={formatDate(employee.joiningDate)} />
                <InfoRow icon={FiUser} label="Gender" value={employee.gender} />
                <InfoRow icon={FiCalendar} label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card mb-4">
            <div className="card-header">
              <h3>Leave Balance</h3>
              <span className="small text-muted">Current year — {new Date().getFullYear()}</span>
            </div>
            <div className="card-body">
              {balance.length === 0 ? <div className="text-muted">Loading balance…</div> : (
                <div className="row g-3">
                  {balance.map(b => {
                    const pct = Math.min(100, Math.round((b.used / (b.allocated || 1)) * 100))
                    return (
                      <div key={b.id} className="col-md-6">
                        <div className="p-3 border rounded-3" style={{ background: 'rgba(248,250,252,0.7)' }}>
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="status-dot" style={{ background: b.color }} />
                              <span className="fw-semibold small">{b.leaveType}</span>
                            </div>
                            <span className="small text-muted">{b.used}/{b.allocated} used</span>
                          </div>
                          <div className="progress mb-1" style={{ height: 10 }}>
                            <div className="progress-bar" style={{ width: `${pct}%`, background: b.color }} />
                          </div>
                          <div className="d-flex justify-content-between small">
                            <span>Remaining: <strong>{b.remaining}</strong></span>
                            <span className="text-muted">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3>Security</h3>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <div className="d-flex gap-3 align-items-center">
                  <div className="avatar md"><FiLock /></div>
                  <div>
                    <div className="fw-semibold small">Password</div>
                    <div className="text-muted small">Last changed 3 months ago</div>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setPwdOpen(true)}>Change</button>
              </div>
              <div className="d-flex align-items-center justify-content-between py-2">
                <div className="d-flex gap-3 align-items-center">
                  <div className="avatar md"><FiMail /></div>
                  <div>
                    <div className="fw-semibold small">Two-factor Auth</div>
                    <div className="text-muted small">Recommended for extra account security.</div>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => toast.info('Enable 2FA (stub)')}>Enable</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={editOpen} toggle={() => setEditOpen(false)} size="lg" centered scrollable>
        <ModalHeader toggle={() => setEditOpen(false)}>Edit Profile</ModalHeader>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} noValidate>
          <ModalBody>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">First Name *</label>
                <input className="form-control" {...profileForm.register('firstName')} />
                {profileForm.formState.errors.firstName && <div className="field-error">{profileForm.formState.errors.firstName.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name *</label>
                <input className="form-control" {...profileForm.register('lastName')} />
                {profileForm.formState.errors.lastName && <div className="field-error">{profileForm.formState.errors.lastName.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input className="form-control" disabled {...profileForm.register('email')} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone *</label>
                <input className="form-control" {...profileForm.register('phone')} />
                {profileForm.formState.errors.phone && <div className="field-error">{profileForm.formState.errors.phone.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Gender</label>
                <select className="form-select" {...profileForm.register('gender')}>
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-12">
                <label className="form-label">Address *</label>
                <textarea rows="2" className="form-control" {...profileForm.register('address')} />
                {profileForm.formState.errors.address && <div className="field-error">{profileForm.formState.errors.address.message}</div>}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-light" onClick={() => setEditOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={profileForm.formState.isSubmitting}>Save Changes</button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={pwdOpen} toggle={() => setPwdOpen(false)} size="md" centered>
        <ModalHeader toggle={() => setPwdOpen(false)}>Change Password</ModalHeader>
        <form onSubmit={pwdForm.handleSubmit(onSavePwd)} noValidate>
          <ModalBody>
            <div className="d-flex flex-column gap-3">
              <div>
                <label className="form-label">Current Password *</label>
                <input type="password" className="form-control" {...pwdForm.register('oldPassword')} />
                {pwdForm.formState.errors.oldPassword && <div className="field-error">{pwdForm.formState.errors.oldPassword.message}</div>}
              </div>
              <div>
                <label className="form-label">New Password *</label>
                <input type="password" className="form-control" {...pwdForm.register('newPassword')} />
                {pwdForm.formState.errors.newPassword && <div className="field-error">{pwdForm.formState.errors.newPassword.message}</div>}
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <input type="password" className="form-control" {...pwdForm.register('confirmPassword')} />
                {pwdForm.formState.errors.confirmPassword && <div className="field-error">{pwdForm.formState.errors.confirmPassword.message}</div>}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-light" onClick={() => setPwdOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={pwdForm.formState.isSubmitting}>Update Password</button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="d-flex align-items-start gap-3 py-2 border-bottom">
    <div className="avatar md" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
      <Icon />
    </div>
    <div>
      <div className="small text-muted">{label}</div>
      <div className="fw-semibold small">{value}</div>
    </div>
  </div>
)

export default Profile
