import React, { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { authService } from '@/services/authService'
import { FiLock, FiArrowLeft, FiCheckCircle, FiBriefcase, FiShield, FiUnlock } from 'react-icons/fi'

const FEATURES = [
  { icon: FiShield, label: 'Strong password = strong security' },
  { icon: FiUnlock, label: 'Use 8+ chars with symbols & numbers' },
  { icon: FiCheckCircle, label: 'We never store plain-text passwords' },
]

const schema = Yup.object({
  password: Yup.string()
    .min(8, 'Use at least 8 characters')
    .matches(/[A-Z]/, 'Add an uppercase letter')
    .matches(/[0-9]/, 'Add a number')
    .matches(/[^A-Za-z0-9]/, 'Add a symbol like $ @ !')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Required'),
})

const scorePassword = (pwd) => {
  let s = 0
  if (pwd?.length >= 8) s++
  if (/[A-Z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return s
}

const ResetPassword = () => {
  const { token = 'demo-token' } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const pwd = watch('password')
  const score = useMemo(() => scorePassword(pwd), [pwd])
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['#f43f5e', '#f59e0b', '#0ea5e9', '#10b981']

  const onSubmit = async (values) => {
    try {
      const r = await authService.resetPassword({ token, password: values.password })
      toast.success(r.message)
      setTimeout(() => navigate('/login'), 1500)
    } catch (e) {
      toast.error(e?.message || 'Failed to reset')
    }
  }

  return (
    <>
      <aside className="auth-hero">
        <div className="brand">
          <div className="logo-icon"><FiBriefcase /></div>
          <div className="brand-name">HRMS Pro</div>
        </div>
        <div className="hero-text">
          <h2>Create a new, strong password.</h2>
          <p>We recommend using a unique combination you haven't used elsewhere.</p>
          <ul className="features-list">
            {FEATURES.map((f) => (
              <li key={f.label}>
                <span className="tick"><f.icon size={14} /></span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="hero-footer">Tip: Use a password manager to store it safely.</div>
      </aside>
      <div className="auth-form-wrap">
        <Link to="/login" className="d-inline-flex align-items-center gap-2 text-decoration-none small text-muted mb-4">
          <FiArrowLeft /> Back to sign in
        </Link>
        <div className="form-header">
          <h3>Set new password</h3>
          <p>Your token: <code className="text-primary">{token.slice(0, 12)}…</code></p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="text-field">
            <label className="form-label" htmlFor="password">New password</label>
            <div className="input-group">
              <span className="input-group-text"><FiLock /></span>
              <input id="password" {...register('password')} type="password" className="form-control" placeholder="At least 8 characters" />
            </div>
            {pwd && (
              <div className="mt-3">
                <div className="progress" style={{ height: 6, borderRadius: 99 }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${((score) / 4) * 100}%`,
                      background: colors[Math.max(0, score - 1)] || '#e2e8f0',
                      transition: 'all 0.3s',
                    }}
                  />
                </div>
                <small className="d-block mt-1" style={{ color: colors[Math.max(0, score - 1)] }}>
                  Strength: {labels[Math.max(0, score - 1)] || 'Enter a password…'}
                </small>
              </div>
            )}
            {errors.password && <div className="field-error">{errors.password.message}</div>}
          </div>
          <div className="text-field">
            <label className="form-label" htmlFor="confirmPassword">Confirm new password</label>
            <div className="input-group">
              <span className="input-group-text"><FiLock /></span>
              <input id="confirmPassword" {...register('confirmPassword')} type="password" className="form-control" placeholder="Re-type password" />
            </div>
            {errors.confirmPassword && <div className="field-error">{errors.confirmPassword.message}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating…' : (<>Update password <FiCheckCircle /></>)}
          </button>
        </form>
      </div>
    </>
  )
}

export default ResetPassword
