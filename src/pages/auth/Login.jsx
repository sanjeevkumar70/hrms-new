import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { login } from '@/redux/slices/authSlice'
import { FiMail, FiLock, FiArrowRight, FiCheckCircle, FiBriefcase, FiShield, FiBarChart2 } from 'react-icons/fi'
import { Button } from 'reactstrap'

const schema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  remember: Yup.boolean().optional(),
})

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'sophia.anderson@company.com', password: 'Admin@123' },
  { role: 'Manager', email: 'daniel.patel@company.com', password: 'Manager@123' },
  { role: 'Employee', email: 'liam.johnson@company.com', password: 'Employee@123' },
]

const FEATURES = [
  { icon: FiShield, label: 'Role-based access control with 3 tiers' },
  { icon: FiBriefcase, label: 'End-to-end employee lifecycle' },
  { icon: FiBarChart2, label: 'Real-time analytics & reporting' },
]

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const loading = useSelector((s) => s.auth.loading)
  const [showDemo, setShowDemo] = useState(false)
  const redirect = location.state?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const onSubmit = async (values) => {
    const res = await dispatch(login({ email: values.email, password: values.password }))
    if (res.meta.requestStatus === 'fulfilled') {
      navigate(redirect, { replace: true })
    }
  }

  const quickFill = (acc) => {
    document.getElementsByName('email')[0].value = acc.email
    document.getElementsByName('password')[0].value = acc.password
  }

  return (
    <>
      <aside className="auth-hero">
        <div className="brand">
          <div className="logo-icon"><FiBriefcase /></div>
          <div className="brand-name">HRMS Pro</div>
        </div>
        <div className="hero-text">
          <h2>Manage your workforce with clarity &amp; confidence.</h2>
          <p>Everything from attendance, leaves, and payroll-grade reporting — in one beautifully designed platform.</p>
          <ul className="features-list">
            {FEATURES.map((f) => (
              <li key={f.label}>
                <span className="tick"><f.icon size={14} /></span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="hero-footer">© {new Date().getFullYear()} HRMS Pro. Secure, simple, scalable.</div>
      </aside>
      <div className="auth-form-wrap">
        <div className="form-header">
          <h3>Welcome back 👋</h3>
          <p>Sign in to continue to your dashboard.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="text-field">
            <label className="form-label" htmlFor="email">Email address</label>
            <div className="input-group">
              <span className="input-group-text"><FiMail /></span>
              <input id="email" {...register('email')} type="email" className="form-control" placeholder="you@company.com" />
            </div>
            {errors.email && <div className="field-error">{errors.email.message}</div>}
          </div>
          <div className="text-field">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="small">Forgot password?</Link>
            </div>
            <div className="input-group">
              <span className="input-group-text"><FiLock /></span>
              <input id="password" {...register('password')} type="password" className="form-control" placeholder="••••••••" />
            </div>
            {errors.password && <div className="field-error">{errors.password.message}</div>}
          </div>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="form-check">
              <input id="remember" {...register('remember')} className="form-check-input" type="checkbox" />
              <label htmlFor="remember" className="form-check-label small">Remember me</label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : (<>Sign in <FiArrowRight /></>)}
          </button>
        </form>
        <div className="demo-accounts">
          <div className="demo-title d-flex align-items-center justify-content-between">
            <span>Demo accounts</span>
            <button type="button" className="btn btn-link text-primary p-0 small" onClick={() => setShowDemo(v => !v)}>
              {showDemo ? 'Hide' : 'Show'}
            </button>
          </div>
          {showDemo && DEMO_ACCOUNTS.map((a) => (
            <div key={a.role} className="demo-row" onClick={() => quickFill(a)} role="button">
              <span className="demo-role">{a.role}</span>
              <span>{a.email} / {a.password}</span>
            </div>
          ))}
        </div>
        <div className="divider"><span>New here?</span></div>
        <div className="auth-footer-text">
          Contact your administrator to request an account.
        </div>
      </div>
    </>
  )
}

export default Login
