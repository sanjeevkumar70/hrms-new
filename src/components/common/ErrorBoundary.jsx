import React from 'react'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] caught:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            background:
              'radial-gradient(1200px 600px at 20% -10%, rgba(30,64,175,0.15), transparent 60%), radial-gradient(900px 500px at 110% 20%, rgba(13,148,136,0.18), transparent 55%), #f8fafc',
            fontFamily:
              '"Plus Jakarta Sans", Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          }}
        >
          <div
            className="card-glass"
            style={{
              maxWidth: 520,
              width: '100%',
              borderRadius: 20,
              padding: 36,
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow:
                '0 20px 45px -20px rgba(15,23,42,0.25), 0 2px 6px -2px rgba(15,23,42,0.08)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                margin: '0 auto 18px',
                borderRadius: 22,
                display: 'grid',
                placeItems: 'center',
                background:
                  'linear-gradient(135deg, rgba(251,146,60,0.18), rgba(239,68,68,0.18))',
                color: '#ef4444',
                fontSize: 34,
              }}
            >
              <FiAlertTriangle />
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
              Something went wrong
            </h2>
            <p style={{ marginTop: 10, color: '#475569', lineHeight: 1.6 }}>
              An unexpected error occurred while rendering this page. You can retry or go back to
              the dashboard.
            </p>
            {this.state.error?.message && (
              <div
                style={{
                  marginTop: 16,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(15,23,42,0.04)',
                  border: '1px dashed rgba(15,23,42,0.1)',
                  color: '#334155',
                  fontSize: 13,
                  textAlign: 'left',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  wordBreak: 'break-word',
                }}
              >
                {String(this.state.error.message)}
              </div>
            )}
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 20px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  fontWeight: 600,
                  background:
                    'linear-gradient(135deg, #1e40af 0%, #0d9488 100%)',
                  boxShadow:
                    '0 10px 25px -12px rgba(30,64,175,0.6), 0 4px 10px -4px rgba(13,148,136,0.4)',
                }}
              >
                <FiRefreshCw /> Retry
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.hash = ''
                  if (typeof window !== 'undefined') window.location.href = '/dashboard'
                }}
                style={{
                  padding: '11px 20px',
                  borderRadius: 999,
                  border: '1px solid rgba(15,23,42,0.12)',
                  cursor: 'pointer',
                  color: '#0f172a',
                  fontWeight: 600,
                  background: '#fff',
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
