import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const ROLES = [
  { id: 'donor', icon: '🩸', label: 'Donor', desc: 'I want to donate blood' },
  { id: 'hospital', icon: '🏥', label: 'Hospital Staff', desc: 'I need blood for patients' },
  { id: 'blood-bank', icon: '🏦', label: 'Blood Bank Admin', desc: 'I manage blood inventory' },
  { id: 'admin', icon: '🛡️', label: 'Platform Admin', desc: 'System administration' },
]

const DEMO_USERS = {
  donor: { name: 'Arjun Sharma', email: 'donor@bloodconnect.in', role: 'donor', bloodGroup: 'O+', trustScore: 87, city: 'Mumbai' },
  hospital: { name: 'Dr. Priya Nair', email: 'hospital@bloodconnect.in', role: 'hospital', hospital: 'Apollo Hospital', city: 'Mumbai' },
  'blood-bank': { name: 'Ravi Kumar', email: 'bank@bloodconnect.in', role: 'blood-bank', bankName: 'LifeSource Blood Bank', city: 'Delhi' },
  admin: { name: 'Admin', email: 'admin@bloodconnect.in', role: 'admin' },
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState('donor')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulate login with demo data
    await new Promise(r => setTimeout(r, 1200))

    const userData = DEMO_USERS[selectedRole]
    login(userData)

    const routes = {
      donor: '/donor',
      hospital: '/hospital',
      'blood-bank': '/blood-bank',
      admin: '/admin',
    }
    navigate(routes[selectedRole])
    setLoading(false)
  }

  const handleDemoLogin = () => {
    const userData = DEMO_USERS[selectedRole]
    login(userData)
    const routes = { donor: '/donor', hospital: '/hospital', 'blood-bank': '/blood-bank', admin: '/admin' }
    navigate(routes[selectedRole])
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left">
          <Link to="/" className="auth-logo">
            <div className="nav-logo-icon" style={{ width: 48, height: 48, fontSize: '1.4rem' }}>🩸</div>
            <div>
              <div className="auth-brand">Blood<span className="gradient-text">Connect</span></div>
              <div className="auth-brand-sub">PS-01 Platform</div>
            </div>
          </Link>

          <div className="auth-left-content">
            <h2 className="auth-hero-text">Save Lives.<br /><span className="gradient-text">Every Day.</span></h2>
            <p className="auth-hero-desc">Join India's most trusted blood donation platform. Real-time inventory, instant matching, verified donors.</p>

            <div className="auth-stats">
              {[
                { n: '48K+', l: 'Verified Donors' },
                { n: '156', l: 'Blood Banks' },
                { n: '< 5min', l: 'Response Time' },
              ].map((s, i) => (
                <div key={i} className="auth-stat">
                  <div className="auth-stat-n">{s.n}</div>
                  <div className="auth-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="auth-right">
          <div className="auth-form-card">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your BloodConnect account</p>

            {/* Role Selector */}
            <div className="role-selector">
              <div className="role-selector-label">Login as</div>
              <div className="role-grid">
                {ROLES.map(role => (
                  <button
                    key={role.id}
                    id={`role-${role.id}`}
                    className={`role-btn ${selectedRole === role.id ? 'active' : ''}`}
                    onClick={() => setSelectedRole(role.id)}
                    type="button"
                  >
                    <span className="role-icon">{role.icon}</span>
                    <span className="role-label">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <form id="login-form" onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <button id="login-submit-btn" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                {loading ? <span className="loading-spinner" /> : 'Sign In →'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or try demo</span>
            </div>

            <button id="demo-login-btn" className="btn btn-secondary w-full" onClick={handleDemoLogin}>
              ⚡ Demo Login as {ROLES.find(r => r.id === selectedRole)?.label}
            </button>

            <p className="auth-switch">
              New here? <Link to="/register" className="auth-link">Create Account</Link>
            </p>

            <div className="auth-emergency">
              <Link to="/emergency" className="btn btn-danger w-full btn-sm">
                🆘 Emergency? Skip Login — Instant SOS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
