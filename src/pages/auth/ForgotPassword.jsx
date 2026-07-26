import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { authService } from '@/services/authService'
import { FiMail, FiArrowLeft, FiBriefcase, FiShield, FiBarChart2 } from 'react-icons/fi'

const schema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
})

const FEATURES = [
  { icon: FiShield, label: 'Secure password reset via email' },
  { icon: FiBriefcase, label: 'Minimal steps to regain access' },
  { icon: FiBarChart2, label: 'Enterprise-grade security' },
]

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values) => {
    try {
      const r = await authService.forgotPassword(values)
      toast.success(r.message)
      reset()
    } catch (e) {
      toast.error(e?.message || 'Something went wrong')
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
          <h2>Forgot your password? No problem.</h2>
          <p>Enter your work email and we'll send you a secure link to reset your password right away.</p>
          <ul className="features-list">
            {FEATURES.map((f) => (
              <li key={f.label}>
                <span className="tick"><f.icon size={14} /></span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="hero-footer">Need help? Contact your IT administrator.</div>
      </aside>
      <div className="auth-form-wrap">
        <Link to="/login" className="d-inline-flex align-items-center gap-2 text-decoration-none small text-muted mb-4">
          <FiArrowLeft /> Back to sign in
        </Link>
        <div className="form-header">
          <h3>Reset password</h3>
          <p>We'll email you a secure reset link.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="text-field">
            <label className="form-label" htmlFor="email">Work email</label>
            <div className="input-group">
              <span className="input-group-text"><FiMail /></span>
              <input id="email" {...register('email')} type="email" className="form-control" placeholder="you@company.com" />
            </div>
            {errors.email && <div className="field-error">{errors.email.message}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending link…' : 'Send reset link'}
          </button>
        </form>
        <div className="auth-footer-text">
          Remembered it? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword
