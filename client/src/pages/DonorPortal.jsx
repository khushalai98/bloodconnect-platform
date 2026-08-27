import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Portal.css'

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'profile', icon: '👤', label: 'My Profile' },
  { id: 'history', icon: '📋', label: 'Donation History' },
  { id: 'badges', icon: '🏆', label: 'Badges & Rewards' },
  { id: 'alerts', icon: '🔔', label: 'Emergency Alerts' },
  { id: 'map', icon: '🗺️', label: 'Nearby Banks' },
]

const MOCK_DONATIONS = [
  { id: 1, date: '15 May 2026', bank: 'LifeSource Blood Bank', city: 'Mumbai', group: 'O+', units: 1, certified: true },
  { id: 2, date: '10 Jan 2026', bank: 'Apollo Hospital', city: 'Pune', group: 'O+', units: 1, certified: true },
  { id: 3, date: '22 Sep 2025', bank: 'Red Cross Center', city: 'Mumbai', group: 'O+', units: 1, certified: true },
]

const BADGES = [
  { icon: '🩸', name: 'First Drop', desc: 'Completed first donation', earned: true },
  { icon: '🔥', name: 'On Fire', desc: '3 donations in a year', earned: true },
  { icon: '⭐', name: 'Rising Star', desc: '5+ verified donations', earned: false },
  { icon: '🦸', name: 'Life Hero', desc: '10+ verified donations', earned: false },
  { icon: '🏆', name: 'Legend', desc: '25+ verified donations', earned: false },
  { icon: '💎', name: 'Diamond', desc: '50+ verified donations', earned: false },
]

const ALERTS = [
  { id: 1, time: '2 hours ago', group: 'O+', hospital: 'Lilavati Hospital', city: 'Mumbai', urgency: 'critical', responded: false },
  { id: 2, time: '1 day ago', group: 'O-', hospital: 'KEM Hospital', city: 'Mumbai', urgency: 'high', responded: true },
  { id: 3, time: '3 days ago', group: 'O+', hospital: 'Tata Memorial', city: 'Mumbai', urgency: 'normal', responded: false },
]

export default function DonorPortal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const donor = user || { name: 'Arjun Sharma', bloodGroup: 'O+', city: 'Mumbai', trustScore: 87, eligible: true }
  const initials = donor.name?.split(' ').map(n => n[0]).join('') || 'AS'
  const nextDonationDate = new Date(Date.now() + 12 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="portal-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🩸</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>BloodConnect</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Donor Portal</div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="avatar" style={{ width: 48, height: 48, fontSize: '1rem' }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{donor.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <span className="blood-badge" style={{ width: 28, height: 28, fontSize: '0.65rem', display: 'inline-flex' }}>{donor.bloodGroup || 'O+'}</span>
              {' '}{donor.city}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu</div>
          {NAV_ITEMS.map(item => (
            <button key={item.id} id={`donor-nav-${item.id}`} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="nav-section-title" style={{ marginTop: 24 }}>Quick Actions</div>
          <Link to="/emergency" className="nav-item" style={{ color: '#FF4D6D' }}>
            <span className="nav-item-icon">🆘</span> Emergency SOS
          </Link>
          <button className="nav-item" onClick={handleLogout}>
            <span className="nav-item-icon">🚪</span> Logout
          </button>
        </nav>

        {/* Eligibility Status */}
        <div className="sidebar-eligibility">
          <div className={`eligibility-badge ${donor.eligible !== false ? 'eligible' : 'not-eligible'}`}>
            {donor.eligible !== false ? '✅ Eligible to Donate' : `⏳ Eligible on ${donor.nextEligible}`}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="portal-main">
        {/* Header */}
        <header className="portal-header">
          <div className="flex items-center gap-md">
            <button className="btn btn-ghost" style={{ display: 'none' }} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Welcome back, {donor.name?.split(' ')[0]}!</p>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <span className="badge badge-red">🩸 {donor.bloodGroup || 'O+'}</span>
            <div className="avatar">{initials}</div>
          </div>
        </header>

        <div className="portal-content">
          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              {/* Alert Banner */}
              {ALERTS.filter(a => !a.responded)[0] && (
                <div className="alert alert-danger" style={{ marginBottom: 24 }}>
                  🆘 <strong>Emergency nearby!</strong> {ALERTS.filter(a => !a.responded)[0].group} blood needed at {ALERTS.filter(a => !a.responded)[0].hospital}, {ALERTS.filter(a => !a.responded)[0].city}
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>Respond Now</button>
                </div>
              )}

              {/* Stats Row */}
              <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                  { icon: '🩸', label: 'Total Donations', value: '3', color: '#DC143C' },
                  { icon: '⭐', label: 'Trust Score', value: `${donor.trustScore || 87}/100`, color: '#FFD700' },
                  { icon: '📅', label: 'Next Eligible', value: nextDonationDate, color: '#29B6F6', small: true },
                  { icon: '🏆', label: 'Badges Earned', value: '2/6', color: '#00E676' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
                    <div className={`stat-number ${s.small ? 'stat-number-sm' : ''}`} style={{ background: `linear-gradient(135deg, #fff, ${s.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: s.small ? '1rem' : '1.8rem' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Trust Score Bar */}
              <div className="glass-card" style={{ marginBottom: 24 }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>⭐ Trust Score</h3>
                  <span className="badge badge-yellow">{donor.trustScore || 87} / 100</span>
                </div>
                <div className="trust-meter">
                  <div className="trust-fill high" style={{ width: `${donor.trustScore || 87}%` }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 8 }}>Score increases with every verified donation. Reach 100 to unlock VIP status.</p>
              </div>

              {/* Recent Donation */}
              <div className="glass-card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📋 Recent Donations</h3>
                <div className="timeline">
                  {MOCK_DONATIONS.slice(0, 2).map(d => (
                    <div key={d.id} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="flex justify-between items-center">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.bank}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{d.date} • {d.city}</div>
                        </div>
                        <div className="flex gap-sm">
                          <span className="blood-badge" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{d.group}</span>
                          {d.certified && <span className="badge badge-green">✅ Certified</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('history')}>View All →</button>
              </div>

              {/* Upcoming Alerts */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>🔔 Emergency Alerts Near You</h3>
                {ALERTS.map(alert => (
                  <div key={alert.id} className="alert-row" style={{ borderLeft: `3px solid ${alert.urgency === 'critical' ? '#FF1744' : alert.urgency === 'high' ? '#FFB300' : '#29B6F6'}` }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{alert.hospital}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{alert.city} • {alert.time}</div>
                      </div>
                      <div className="flex gap-sm items-center">
                        <span className="blood-badge" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{alert.group}</span>
                        <span className={`badge ${alert.urgency === 'critical' ? 'badge-red' : alert.urgency === 'high' ? 'badge-yellow' : 'badge-blue'}`}>{alert.urgency}</span>
                        {alert.responded ? <span className="badge badge-green">Responded</span> : <button className="btn btn-primary btn-sm">Respond</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="glass-card">
                  <div className="profile-header">
                    <div className="avatar" style={{ width: 80, height: 80, fontSize: '1.8rem' }}>{initials}</div>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{donor.name}</h2>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{donor.city} • Donor since 2024</p>
                      <div className="flex gap-sm" style={{ marginTop: 8 }}>
                        <span className="blood-badge blood-badge-lg">{donor.bloodGroup || 'O+'}</span>
                        <span className="badge badge-green">✅ Verified</span>
                      </div>
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="profile-details">
                    {[
                      { l: 'Email', v: donor.email || 'arjun@example.com' },
                      { l: 'Phone', v: '+91 98765 43210' },
                      { l: 'Blood Group', v: donor.bloodGroup || 'O+' },
                      { l: 'City', v: donor.city || 'Mumbai' },
                      { l: 'Last Donation', v: '15 May 2026' },
                      { l: 'Total Donations', v: '3 verified' },
                    ].map((row, i) => (
                      <div key={i} className="preview-row">
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{row.l}</span>
                        <strong style={{ fontSize: '0.9rem' }}>{row.v}</strong>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-secondary w-full" style={{ marginTop: 16 }}>✏️ Edit Profile</button>
                </div>
                <div>
                  <div className="glass-card" style={{ marginBottom: 16 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>⭐ Trust Score Breakdown</h3>
                    {[
                      { label: 'Verified Donations', points: 60, max: 100 },
                      { label: 'Response Rate', points: 20, max: 30 },
                      { label: 'Profile Completeness', points: 7, max: 20 },
                    ].map((item, i) => (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <div className="flex justify-between" style={{ marginBottom: 6, fontSize: '0.85rem' }}>
                          <span>{item.label}</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>{item.points}/{item.max}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(item.points / item.max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="glass-card">
                    <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🩺 Eligibility Status</h3>
                    <div className={`eligibility-badge ${donor.eligible !== false ? 'eligible' : 'not-eligible'}`} style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                      {donor.eligible !== false ? '✅ Currently Eligible to Donate' : `⏳ Next Eligible: ${donor.nextEligible}`}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      90-day rule: Wait 90 days between whole blood donations. Last donation: 15 May 2026.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORY ── */}
          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Blood Bank / Hospital</th>
                      <th>City</th>
                      <th>Group</th>
                      <th>Units</th>
                      <th>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_DONATIONS.map(d => (
                      <tr key={d.id}>
                        <td>{d.date}</td>
                        <td><strong>{d.bank}</strong></td>
                        <td>{d.city}</td>
                        <td><span className="blood-badge" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{d.group}</span></td>
                        <td>{d.units} unit</td>
                        <td>{d.certified ? <span className="badge badge-green">✅ Download</span> : <span className="badge badge-yellow">Pending</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── BADGES ── */}
          {activeTab === 'badges' && (
            <div className="animate-fade-in">
              <div className="grid-3">
                {BADGES.map((badge, i) => (
                  <div key={i} className={`glass-card text-center ${!badge.earned ? 'badge-locked' : ''}`}>
                    <div style={{ fontSize: '3rem', marginBottom: 12, filter: badge.earned ? 'none' : 'grayscale(1) opacity(0.4)' }}>{badge.icon}</div>
                    <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{badge.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{badge.desc}</p>
                    <div style={{ marginTop: 12 }}>
                      {badge.earned ? <span className="badge badge-green">✅ Earned</span> : <span className="badge" style={{ opacity: 0.5 }}>🔒 Locked</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass-card" style={{ marginTop: 24, textAlign: 'center' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>🏙️ City Leaderboard — Mumbai</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>Your rank: #47 out of 2,340 donors</p>
                {[
                  { rank: 1, name: 'Priya M.', group: 'A+', donations: 24 },
                  { rank: 2, name: 'Rahul S.', group: 'O+', donations: 21 },
                  { rank: 3, name: 'Anita K.', group: 'B+', donations: 19 },
                  { rank: 47, name: `${donor.name} (You)`, group: 'O+', donations: 3 },
                ].map(entry => (
                  <div key={entry.rank} className={`alert-row ${entry.rank === 47 ? 'highlight-row' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-md">
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: entry.rank <= 3 ? 'var(--color-gold)' : 'var(--color-text-muted)', minWidth: 30 }}>#{entry.rank}</span>
                        <span>{entry.name}</span>
                      </div>
                      <div className="flex gap-sm">
                        <span className="blood-badge" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>{entry.group}</span>
                        <span style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>{entry.donations} donations</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {activeTab === 'alerts' && (
            <div className="animate-fade-in">
              <div className="alert alert-info" style={{ marginBottom: 24 }}>
                🔔 You have {ALERTS.filter(a => !a.responded).length} pending emergency alerts near you.
              </div>
              {ALERTS.map(alert => (
                <div key={alert.id} className="glass-card" style={{ marginBottom: 16, borderLeft: `4px solid ${alert.urgency === 'critical' ? '#FF1744' : alert.urgency === 'high' ? '#FFB300' : '#29B6F6'}` }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex gap-sm items-center" style={{ marginBottom: 8 }}>
                        <span className={`badge ${alert.urgency === 'critical' ? 'badge-red' : alert.urgency === 'high' ? 'badge-yellow' : 'badge-blue'}`}>
                          {alert.urgency.toUpperCase()}
                        </span>
                        <span className="blood-badge" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{alert.group}</span>
                      </div>
                      <h3 style={{ fontWeight: 700 }}>{alert.hospital}</h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{alert.city} • {alert.time}</p>
                    </div>
                    <div>
                      {alert.responded
                        ? <span className="badge badge-green">✅ You Responded</span>
                        : <button className="btn btn-danger">🩸 I Can Donate</button>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MAP ── */}
          {activeTab === 'map' && (
            <div className="animate-fade-in">
              <div className="glass-card" style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: '4rem' }}>🗺️</div>
                <h3 style={{ fontWeight: 700 }}>Blood Availability Map</h3>
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Interactive map showing all blood banks and hospitals near Mumbai with real-time inventory.</p>
                <button className="btn btn-primary" onClick={() => navigate('/hospital')}>
                  Open Full Map View →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
