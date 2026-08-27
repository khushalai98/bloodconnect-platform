import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Portal.css'

const ALL_DONORS = [
  { id: 'D001', name: 'Arjun Sharma', group: 'O+', city: 'Mumbai', phone: '+91 98765 43210', trustScore: 87, donations: 3, verified: true, status: 'active', lastDonation: '15 May 2026', flagged: false },
  { id: 'D002', name: 'Priya Mehta', group: 'A+', city: 'Delhi', phone: '+91 87654 32109', trustScore: 94, donations: 7, verified: true, status: 'active', lastDonation: '3 Apr 2026', flagged: false },
  { id: 'D003', name: 'Rahul Singh', group: 'B-', city: 'Pune', phone: '+91 76543 21098', trustScore: 12, donations: 0, verified: false, status: 'suspicious', lastDonation: '—', flagged: true },
  { id: 'D004', name: 'Sneha Joshi', group: 'AB+', city: 'Bangalore', phone: '+91 65432 10987', trustScore: 71, donations: 4, verified: true, status: 'active', lastDonation: '20 Jan 2026', flagged: false },
  { id: 'D005', name: 'Karan Patel', group: 'O-', city: 'Ahmedabad', phone: '+91 54321 09876', trustScore: 45, donations: 2, verified: true, status: 'inactive', lastDonation: '5 Oct 2025', flagged: false },
  { id: 'D006', name: 'Fake User XYZ', group: 'A-', city: 'Mumbai', phone: '+91 00000 00000', trustScore: 0, donations: 0, verified: false, status: 'blocked', lastDonation: '—', flagged: true },
]

const BLOOD_BANKS = [
  { id: 'BB001', name: 'LifeSource Blood Bank', city: 'Delhi', type: 'Private', verified: true, stock: 245, status: 'active' },
  { id: 'BB002', name: 'Red Cross Center', city: 'Mumbai', type: 'NGO', verified: true, stock: 189, status: 'active' },
  { id: 'BB003', name: 'City Hospital Bank', city: 'Pune', type: 'Government', verified: false, stock: 67, status: 'pending' },
]

const KPI_DATA = [
  { metric: 'Avg. Time to Locate Blood', value: '4.2 min', target: '< 5 min', met: true },
  { metric: 'Emergency Fulfillment Rate', value: '91.3%', target: '> 90%', met: true },
  { metric: 'Blood Wastage Reduction', value: '28%', target: '> 30%', met: false },
  { metric: 'Fraudulent Accounts', value: '1.8%', target: '< 2%', met: true },
  { metric: 'Donor Response Rate', value: '27.4%', target: '> 25%', met: true },
]

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Admin Dashboard' },
  { id: 'donors', icon: '🩸', label: 'Donor Management' },
  { id: 'banks', icon: '🏦', label: 'Blood Banks' },
  { id: 'fraud', icon: '🚨', label: 'Fraud Detection' },
  { id: 'kpis', icon: '📈', label: 'KPI Tracker' },
  { id: 'system', icon: '⚙️', label: 'System Health' },
]

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [donorFilter, setDonorFilter] = useState('all')
  const [donors, setDonors] = useState(ALL_DONORS)

  const flagDonor = (id) => setDonors(prev => prev.map(d => d.id === id ? { ...d, flagged: true, status: 'blocked' } : d))
  const unflagDonor = (id) => setDonors(prev => prev.map(d => d.id === id ? { ...d, flagged: false, status: 'active' } : d))
  const verifyDonor = (id) => setDonors(prev => prev.map(d => d.id === id ? { ...d, verified: true } : d))

  const filteredDonors = donors.filter(d => {
    if (donorFilter === 'all') return true
    if (donorFilter === 'flagged') return d.flagged
    if (donorFilter === 'verified') return d.verified
    if (donorFilter === 'unverified') return !d.verified
    return true
  })

  return (
    <div className="portal-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🛡️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>Admin Panel</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Platform Control</div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="avatar" style={{ background: 'linear-gradient(135deg, #8B0000, #DC143C)' }}>AD</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Super Admin • PS-01</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} id={`admin-nav-${item.id}`} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
          <div style={{ marginTop: 24 }} />
          <button className="nav-item" onClick={() => { logout(); navigate('/') }}>
            <span>🚪</span> Logout
          </button>
        </nav>

        <div className="sidebar-eligibility">
          <div className="eligibility-badge eligible" style={{ fontSize: '0.75rem' }}>
            🟢 System Healthy — 99.8% Uptime
          </div>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-header">
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>BloodConnect PS-01 • Admin Control Center</p>
          </div>
          <div className="flex gap-md items-center">
            <span className="badge badge-green">🟢 Live</span>
            <span className="badge badge-red">🚨 {donors.filter(d => d.flagged).length} Flagged</span>
          </div>
        </header>

        <div className="portal-content">
          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                  { icon: '🩸', label: 'Total Donors', value: donors.length.toLocaleString(), color: '#DC143C' },
                  { icon: '🏦', label: 'Blood Banks', value: BLOOD_BANKS.length, color: '#29B6F6' },
                  { icon: '🚨', label: 'Flagged Accounts', value: donors.filter(d => d.flagged).length, color: '#FF1744' },
                  { icon: '✅', label: 'KPIs Met', value: `${KPI_DATA.filter(k => k.met).length}/${KPI_DATA.length}`, color: '#00E676' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
                    <div className="stat-number" style={{ background: `linear-gradient(135deg, #fff, ${s.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* KPI Quick View */}
              <div className="glass-card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📈 KPI Status Overview</h3>
                {KPI_DATA.map((kpi, i) => (
                  <div key={i} className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{kpi.metric}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Target: {kpi.target}</div>
                    </div>
                    <div className="flex gap-sm items-center">
                      <strong style={{ color: kpi.met ? 'var(--color-success)' : 'var(--color-warning)' }}>{kpi.value}</strong>
                      <span className={`badge ${kpi.met ? 'badge-green' : 'badge-yellow'}`}>{kpi.met ? '✅ Met' : '⚠️ Below'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Fraud Flags */}
              <div className="glass-card">
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🚨 Recent Fraud Alerts</h3>
                {donors.filter(d => d.flagged).map(d => (
                  <div key={d.id} className="alert-row" style={{ borderLeft: '3px solid #FF1744' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <strong>{d.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{d.id} • Trust Score: {d.trustScore} • {d.donations} donations</div>
                      </div>
                      <div className="flex gap-sm">
                        {!d.verified && <button className="btn btn-success btn-sm" onClick={() => verifyDonor(d.id)}>Verify</button>}
                        <button className="btn btn-danger btn-sm" onClick={() => flagDonor(d.id)}>Block</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DONORS ── */}
          {activeTab === 'donors' && (
            <div className="animate-fade-in">
              <div className="flex gap-sm" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
                {['all', 'verified', 'unverified', 'flagged'].map(f => (
                  <button key={f} className={`chip ${donorFilter === f ? 'active' : ''}`} onClick={() => setDonorFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? donors.length : f === 'verified' ? donors.filter(d => d.verified).length : f === 'unverified' ? donors.filter(d => !d.verified).length : donors.filter(d => d.flagged).length})
                  </button>
                ))}
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Blood</th>
                      <th>City</th>
                      <th>Trust Score</th>
                      <th>Donations</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonors.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{d.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{d.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{d.phone}</div>
                        </td>
                        <td><span className="blood-badge" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{d.group}</span></td>
                        <td>{d.city}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar" style={{ width: 60 }}>
                              <div className="progress-fill" style={{ width: `${d.trustScore}%`, background: d.trustScore > 60 ? 'linear-gradient(90deg, #00E676, #00BFA5)' : d.trustScore > 30 ? 'linear-gradient(90deg, #FFB300, #FF8F00)' : 'linear-gradient(90deg, #FF1744, #B71C1C)' }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{d.trustScore}</span>
                          </div>
                        </td>
                        <td>{d.donations}</td>
                        <td>
                          <span className={`badge ${d.status === 'active' ? 'badge-green' : d.status === 'blocked' ? 'badge-red' : d.status === 'suspicious' ? 'badge-yellow' : 'badge-blue'}`}>
                            {d.status}
                          </span>
                          {d.verified && <span className="badge badge-blue" style={{ marginLeft: 4 }}>✅</span>}
                        </td>
                        <td>
                          <div className="flex gap-xs">
                            {!d.verified && <button className="btn btn-success btn-sm" onClick={() => verifyDonor(d.id)} title="Verify">Verify</button>}
                            {!d.flagged ? (
                              <button className="btn btn-danger btn-sm" onClick={() => flagDonor(d.id)} title="Flag/Block">Flag</button>
                            ) : (
                              <button className="btn btn-secondary btn-sm" onClick={() => unflagDonor(d.id)} title="Unflag">Unflag</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── BLOOD BANKS ── */}
          {activeTab === 'banks' && (
            <div className="animate-fade-in">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>City</th>
                      <th>Type</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BLOOD_BANKS.map(bank => (
                      <tr key={bank.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{bank.id}</td>
                        <td><strong>{bank.name}</strong></td>
                        <td>{bank.city}</td>
                        <td><span className="badge badge-blue">{bank.type}</span></td>
                        <td style={{ fontWeight: 700 }}>{bank.stock} units</td>
                        <td>
                          <span className={`badge ${bank.verified ? 'badge-green' : 'badge-yellow'}`}>
                            {bank.verified ? '✅ Verified' : '⏳ Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-sm">
                            {!bank.verified && <button className="btn btn-success btn-sm">Verify</button>}
                            <button className="btn btn-secondary btn-sm">View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── FRAUD DETECTION ── */}
          {activeTab === 'fraud' && (
            <div className="animate-fade-in">
              <div className="alert alert-danger" style={{ marginBottom: 24 }}>
                🤖 Fraud Detection Engine detected <strong>{donors.filter(d => d.flagged).length} suspicious accounts</strong> based on: zero donations after 6 months, duplicate phone patterns, and trust score analysis.
              </div>

              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="glass-card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🔍 Fraud Signals</h3>
                  {[
                    { signal: 'Registered but never donated (> 6 months)', count: 2, severity: 'medium' },
                    { signal: 'Duplicate phone number detected', count: 1, severity: 'high' },
                    { signal: 'Multiple failed OTP attempts', count: 1, severity: 'low' },
                    { signal: 'Trust score below threshold (< 10)', count: 1, severity: 'high' },
                  ].map((s, i) => (
                    <div key={i} className="alert-row" style={{ borderLeft: `3px solid ${s.severity === 'high' ? '#FF1744' : s.severity === 'medium' ? '#FFB300' : '#29B6F6'}` }}>
                      <div className="flex justify-between items-center">
                        <span style={{ fontSize: '0.875rem' }}>{s.signal}</span>
                        <span className={`badge ${s.severity === 'high' ? 'badge-red' : s.severity === 'medium' ? 'badge-yellow' : 'badge-blue'}`}>{s.count} account{s.count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="glass-card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📊 Fraud Stats</h3>
                  {[
                    { label: 'Current fraud rate', value: '1.8%', target: '< 2%', ok: true },
                    { label: 'Blocked accounts', value: donors.filter(d => d.status === 'blocked').length },
                    { label: 'Pending review', value: donors.filter(d => d.status === 'suspicious').length },
                    { label: 'Auto-flagged this week', value: '3' },
                  ].map((s, i) => (
                    <div key={i} className="preview-row">
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{s.label}</span>
                      <strong style={{ color: s.ok === true ? 'var(--color-success)' : s.ok === false ? 'var(--color-danger)' : 'white' }}>{s.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card">
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🚨 Flagged Accounts</h3>
                {donors.filter(d => d.flagged).map(d => (
                  <div key={d.id} className="glass-card" style={{ marginBottom: 12, background: 'rgba(255,23,68,0.05)', borderColor: 'rgba(255,23,68,0.2)' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <strong>{d.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{d.id} • {d.city} • Trust: {d.trustScore}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{d.phone}</div>
                      </div>
                      <div className="flex gap-sm">
                        <button className="btn btn-success btn-sm" onClick={() => verifyDonor(d.id)}>Verify</button>
                        <button className="btn btn-danger btn-sm" onClick={() => flagDonor(d.id)}>Permanent Block</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => unflagDonor(d.id)}>Clear Flag</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── KPIs ── */}
          {activeTab === 'kpis' && (
            <div className="animate-fade-in">
              <div className="grid-2" style={{ marginBottom: 24 }}>
                {KPI_DATA.map((kpi, i) => (
                  <div key={i} className="glass-card" style={{ borderLeft: `4px solid ${kpi.met ? 'var(--color-success)' : 'var(--color-warning)'}` }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{kpi.metric}</h3>
                      <span className={`badge ${kpi.met ? 'badge-green' : 'badge-yellow'}`}>{kpi.met ? '✅ On Target' : '⚠️ Below Target'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: kpi.met ? 'var(--color-success)' : 'var(--color-warning)' }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Current</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{kpi.target}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Target</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SYSTEM HEALTH ── */}
          {activeTab === 'system' && (
            <div className="animate-fade-in">
              <div className="grid-3" style={{ marginBottom: 24 }}>
                {[
                  { name: 'API Server', status: 'online', uptime: '99.8%', latency: '45ms', icon: '⚡' },
                  { name: 'MongoDB', status: 'online', uptime: '99.9%', latency: '12ms', icon: '🗄️' },
                  { name: 'Socket.io', status: 'online', uptime: '99.5%', latency: '8ms', icon: '🔌' },
                  { name: 'SMS Service', status: 'online', uptime: '98.2%', latency: '—', icon: '📱' },
                  { name: 'OTP Verification', status: 'online', uptime: '99.1%', latency: '—', icon: '🔐' },
                  { name: 'Notification Queue', status: 'online', uptime: '99.7%', latency: '—', icon: '🔔' },
                ].map((service, i) => (
                  <div key={i} className="glass-card">
                    <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                      <div className="flex gap-sm items-center">
                        <span style={{ fontSize: '1.4rem' }}>{service.icon}</span>
                        <strong>{service.name}</strong>
                      </div>
                      <span className="badge badge-green">🟢 {service.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 24, fontSize: '0.875rem' }}>
                      <div>
                        <div style={{ color: 'var(--color-success)', fontWeight: 700 }}>{service.uptime}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Uptime</div>
                      </div>
                      {service.latency !== '—' && (
                        <div>
                          <div style={{ fontWeight: 700 }}>{service.latency}</div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Latency</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
