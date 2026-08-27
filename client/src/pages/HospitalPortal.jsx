import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InventoryMap from '../components/InventoryMap'
import './Portal.css'


const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const NEARBY_INVENTORY = [
  { bank: 'LifeSource Blood Bank', type: 'blood-bank', distance: '1.2 km', city: 'Mumbai', group: 'O+', units: 45, available: true, rating: 4.8, lat: 19.076, lng: 72.877 },
  { bank: 'Hinduja Hospital', type: 'hospital', distance: '2.1 km', city: 'Mumbai', group: 'O+', units: 12, available: true, rating: 4.9, lat: 19.065, lng: 72.830 },
  { bank: 'KEM Hospital', type: 'hospital', distance: '3.4 km', city: 'Mumbai', group: 'O+', units: 8, available: true, rating: 4.7, lat: 19.005, lng: 72.840 },
  { bank: 'Breach Candy Hospital', type: 'hospital', distance: '4.2 km', city: 'Mumbai', group: 'O+', units: 0, available: false, rating: 4.6, lat: 18.975, lng: 72.808 },
]

const ACTIVE_REQUESTS = [
  { id: 'ER001', patient: 'Anonymous Patient', group: 'O-', units: 2, urgency: 'critical', status: 'searching', createdAt: '5 mins ago', matchFound: true },
  { id: 'ER002', patient: 'Anonymous Patient', group: 'AB+', units: 1, urgency: 'high', status: 'fulfilled', createdAt: '2 hours ago', matchFound: true },
  { id: 'ER003', patient: 'Anonymous Patient', group: 'B-', units: 3, urgency: 'normal', status: 'pending', createdAt: '1 day ago', matchFound: false },
]

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'search', icon: '🔍', label: 'Blood Search' },
  { id: 'request', icon: '📋', label: 'New Request' },
  { id: 'my-requests', icon: '📂', label: 'My Requests' },
  { id: 'map', icon: '🗺️', label: 'Map View' },
]

export default function HospitalPortal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchGroup, setSearchGroup] = useState('O+')
  const [searchRadius, setSearchRadius] = useState('10')
  const [searchResults, setSearchResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [reqForm, setReqForm] = useState({ group: '', units: '', urgency: 'high', notes: '' })
  const [reqSubmitted, setReqSubmitted] = useState(false)

  const handleSearch = () => {
    setSearchResults(NEARBY_INVENTORY.filter(b => b.available))
    setSearched(true)
  }

  const handleSubmitRequest = () => {
    setReqSubmitted(true)
  }

  const hospitalName = user?.hospital || 'Apollo Hospital'
  const city = user?.city || 'Mumbai'

  return (
    <div className="portal-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{hospitalName}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Hospital Portal</div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="avatar">PN</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name || 'Dr. Priya Nair'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Hospital Staff • {city}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} id={`hospital-nav-${item.id}`} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
          <div style={{ marginTop: 24 }} />
          <Link to="/emergency" className="nav-item" style={{ color: '#FF4D6D' }}>
            <span>🆘</span> Emergency SOS
          </Link>
          <button className="nav-item" onClick={() => { logout(); navigate('/') }}>
            <span>🚪</span> Logout
          </button>
        </nav>
      </aside>

      <main className="portal-main">
        <header className="portal-header">
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{hospitalName}</p>
          </div>
          <div className="flex gap-md items-center">
            <button id="new-request-btn" className="btn btn-primary btn-sm" onClick={() => setActiveTab('request')}>+ New Request</button>
            <button id="hospital-sos-btn" className="btn btn-danger btn-sm" onClick={() => navigate('/emergency')}>🆘 SOS</button>
          </div>
        </header>

        <div className="portal-content">
          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              {ACTIVE_REQUESTS.find(r => r.urgency === 'critical' && r.status === 'searching') && (
                <div className="alert alert-danger" style={{ marginBottom: 24 }}>
                  🚨 <strong>Critical request active!</strong> ER001 — O- blood being sourced. Match found nearby.
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setActiveTab('my-requests')}>View</button>
                </div>
              )}

              <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                  { icon: '📋', label: 'Active Requests', value: ACTIVE_REQUESTS.filter(r => r.status !== 'fulfilled').length, color: '#DC143C' },
                  { icon: '✅', label: 'Fulfilled Today', value: '1', color: '#00E676' },
                  { icon: '🕐', label: 'Avg. Response Time', value: '< 5 min', color: '#FFB300', small: true },
                  { icon: '🏦', label: 'Banks Connected', value: '12', color: '#29B6F6' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
                    <div className="stat-number" style={{ background: `linear-gradient(135deg, #fff, ${s.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: s.small ? '1.1rem' : '1.8rem' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Search */}
              <div className="glass-card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>⚡ Quick Blood Search</h3>
                <div className="flex gap-md items-center flex-wrap">
                  <select className="form-select" style={{ flex: 1, minWidth: 150 }} value={searchGroup} onChange={e => setSearchGroup(e.target.value)}>
                    {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                  </select>
                  <select className="form-select" style={{ flex: 1, minWidth: 120 }} value={searchRadius} onChange={e => setSearchRadius(e.target.value)}>
                    {['5', '10', '20', '50'].map(r => <option key={r} value={r}>{r} km radius</option>)}
                  </select>
                  <button id="quick-search-btn" className="btn btn-primary" onClick={() => { setSearched(true); setSearchResults(NEARBY_INVENTORY); setActiveTab('search') }}>
                    🔍 Search Now
                  </button>
                </div>
              </div>

              {/* Active Requests */}
              <div className="glass-card">
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📋 Recent Requests</h3>
                {ACTIVE_REQUESTS.map(req => (
                  <div key={req.id} className="alert-row" style={{ borderLeft: `3px solid ${req.urgency === 'critical' ? '#FF1744' : req.urgency === 'high' ? '#FFB300' : '#29B6F6'}` }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex gap-sm items-center" style={{ marginBottom: 4 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>#{req.id}</span>
                          <span className={`badge ${req.urgency === 'critical' ? 'badge-red' : req.urgency === 'high' ? 'badge-yellow' : 'badge-blue'}`}>{req.urgency.toUpperCase()}</span>
                          <span className="blood-badge" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>{req.group}</span>
                          <span style={{ fontSize: '0.875rem' }}>× {req.units} units</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{req.createdAt}</div>
                      </div>
                      <span className={`badge ${req.status === 'fulfilled' ? 'badge-green' : req.status === 'searching' ? 'badge-yellow' : 'badge-red'}`}>
                        {req.status === 'fulfilled' ? '✅ Fulfilled' : req.status === 'searching' ? '🔍 Searching' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SEARCH ── */}
          {activeTab === 'search' && (
            <div className="animate-fade-in">
              <div className="glass-card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🔍 Search Blood Availability</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select id="search-group" className="form-select" value={searchGroup} onChange={e => setSearchGroup(e.target.value)}>
                      {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Component</label>
                    <select id="search-component" className="form-select">
                      {['Whole Blood', 'Plasma', 'Platelets', 'Any'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Radius</label>
                    <select id="search-radius" className="form-select" value={searchRadius} onChange={e => setSearchRadius(e.target.value)}>
                      {['5', '10', '20', '50'].map(r => <option key={r}>{r} km</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ opacity: 0 }}>.</label>
                    <button id="run-search-btn" className="btn btn-primary" style={{ height: 46 }} onClick={handleSearch}>Search</button>
                  </div>
                </div>
              </div>

              {searched && (
                <>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
                    Found <strong>{searchResults.length} available</strong> sources within {searchRadius} km for <strong>{searchGroup}</strong>
                  </p>
                  {searchResults.map((result, i) => (
                    <div key={i} className="glass-card" style={{ marginBottom: 12 }}>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-md items-center">
                          <div className="avatar" style={{ width: 48, height: 48, fontSize: '1.2rem', borderRadius: 12, background: result.type === 'blood-bank' ? 'rgba(220,20,60,0.2)' : 'rgba(41,182,246,0.2)' }}>
                            {result.type === 'blood-bank' ? '🏦' : '🏥'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{result.bank}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                              📍 {result.distance} • {result.city} • ⭐ {result.rating}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-sm items-center">
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>{result.units} units</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{searchGroup} available</div>
                          </div>
                          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('request')}>Request</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── NEW REQUEST ── */}
          {activeTab === 'request' && (
            <div className="animate-fade-in">
              {reqSubmitted ? (
                <div className="glass-card text-center">
                  <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 8 }}>Request Submitted!</h2>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
                    Emergency request <strong>#ER004</strong> is active. System is searching nearby blood banks and donors.
                  </p>
                  <div className="alert alert-success" style={{ marginBottom: 24 }}>
                    🎯 Match found! LifeSource Blood Bank has {reqForm.group} blood — 1.2 km away.
                  </div>
                  <div className="flex gap-md justify-center">
                    <button className="btn btn-primary" onClick={() => { setReqSubmitted(false); setActiveTab('my-requests') }}>View Request Status</button>
                    <button className="btn btn-secondary" onClick={() => { setReqSubmitted(false); setReqForm({ group: '', units: '', urgency: 'high', notes: '' }) }}>New Request</button>
                  </div>
                </div>
              ) : (
                <div className="glass-card" style={{ maxWidth: 600 }}>
                  <h2 style={{ fontWeight: 800, marginBottom: 8 }}>📋 New Blood Request</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
                    System will automatically match to nearest available blood bank or eligible donors.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Blood Group Required</label>
                        <select id="req-blood-group" className="form-select" value={reqForm.group} onChange={e => setReqForm(p => ({ ...p, group: e.target.value }))}>
                          <option value="">Select Blood Group</option>
                          {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Units Needed</label>
                        <input id="req-units" type="number" className="form-input" placeholder="e.g. 2" value={reqForm.units} onChange={e => setReqForm(p => ({ ...p, units: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Urgency Level</label>
                      <div className="flex gap-md">
                        {['critical', 'high', 'normal'].map(level => (
                          <button key={level} type="button"
                            className="btn"
                            style={{
                              flex: 1,
                              background: reqForm.urgency === level ? (level === 'critical' ? 'rgba(255,23,68,0.2)' : level === 'high' ? 'rgba(255,179,0,0.2)' : 'rgba(41,182,246,0.2)') : 'var(--glass-bg)',
                              border: `1px solid ${reqForm.urgency === level ? (level === 'critical' ? '#FF1744' : level === 'high' ? '#FFB300' : '#29B6F6') : 'var(--glass-border)'}`,
                              color: reqForm.urgency === level ? (level === 'critical' ? '#FF1744' : level === 'high' ? '#FFB300' : '#29B6F6') : 'var(--color-text-secondary)',
                            }}
                            onClick={() => setReqForm(p => ({ ...p, urgency: level }))}
                          >
                            {level === 'critical' ? '🚨' : level === 'high' ? '⚡' : '📋'} {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Additional Notes</label>
                      <textarea id="req-notes" className="form-input" style={{ resize: 'vertical', minHeight: 80 }} placeholder="Patient condition, special requirements..." value={reqForm.notes} onChange={e => setReqForm(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                    <button id="submit-request-btn" className="btn btn-danger btn-lg w-full" onClick={handleSubmitRequest} disabled={!reqForm.group || !reqForm.units}>
                      🆘 Submit Emergency Request
                    </button>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      System will return results in under 3 seconds. Donors will be alerted if no inventory found.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MY REQUESTS ── */}
          {activeTab === 'my-requests' && (
            <div className="animate-fade-in">
              {ACTIVE_REQUESTS.map(req => (
                <div key={req.id} className="glass-card" style={{ marginBottom: 16, borderLeft: `4px solid ${req.urgency === 'critical' ? '#FF1744' : req.urgency === 'high' ? '#FFB300' : '#29B6F6'}` }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                    <div className="flex gap-sm items-center">
                      <span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>#{req.id}</span>
                      <span className={`badge ${req.urgency === 'critical' ? 'badge-red' : req.urgency === 'high' ? 'badge-yellow' : 'badge-blue'}`}>{req.urgency.toUpperCase()}</span>
                      <span className="blood-badge" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{req.group}</span>
                      <span>× {req.units} units</span>
                    </div>
                    <span className={`badge ${req.status === 'fulfilled' ? 'badge-green' : req.status === 'searching' ? 'badge-yellow' : 'badge-red'}`}>
                      {req.status === 'fulfilled' ? '✅ Fulfilled' : req.status === 'searching' ? '🔍 Searching...' : '⏳ Queued'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Created: {req.createdAt} • {req.matchFound ? '✅ Match found' : '❌ No match yet — broadcasting to donors'}
                  </div>
                  {req.status === 'searching' && (
                    <div className="progress-bar" style={{ marginTop: 12 }}>
                      <div className="progress-fill" style={{ width: '65%', animation: 'none' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── MAP ── */}
          {activeTab === 'map' && (
            <div className="animate-fade-in">
              <InventoryMap selectedBloodGroup={searchGroup} radius={searchRadius} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
