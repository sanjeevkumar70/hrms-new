import React from 'react'

const Footer = () => {
  const year = new Date().getFullYear()
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0'
  return (
    <footer className="app-footer">
      <div>
        © {year} <strong className="text-primary">HRMS Pro</strong>. All rights reserved.
      </div>
      <div className="d-flex gap-3 align-items-center">
        <span>v{version}</span>
        <a href="#" onClick={(e) => e.preventDefault()}>Docs</a>
        <a href="#" onClick={(e) => e.preventDefault()}>Support</a>
        <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
      </div>
    </footer>
  )
}

export default Footer
