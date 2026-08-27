import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './EmergencySOS.css'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const URGENCY_LEVELS = [
  { id: 'critical', label: 'Critical', desc: 'Life-threatening — need blood in < 1 hour', color: '#FF1744', icon: '🚨' },
  { id: 'high', label: 'High', desc: 'Urgent surgery — need blood in 2–4 hours', color: '#FFB300', icon: '⚡' },
  { id: 'normal', label: 'Normal', desc: 'Planned procedure — need blood today', color: '#29B6F6', icon: '📋' },
]

const MOCK_MATCHES = [
  { type: 'bank', name: 'LifeSource Blood Bank', distance: '1.2 km', units: 8, eta: '8 min', contact: '+91 98765 00001' },
  { type: 'bank', name: 'Red Cross Center', distance: '2.8 km', units: 5, eta: '15 min', contact: '+91 98765 00002' },
  { type: 'donor', name: 'Nearby Donor (Arjun)', distance: '0.8 km', units: 1, eta: '25 min', contact: 'Notified via SMS' },
  { type: 'donor', name: 'Nearby Donor (Priya)', distance: '1.5 km', units: 1, eta: '30 min', contact: 'Notified via SMS' },
]

export default function EmergencySOS() {
  const navigate = useNavigate()
  const [step, setStep] = useState('form') // form | searching | results
  const [form, setForm] = useState({ name: '', phone: '', group: '', units: '1', urgency: 'critical', location: '', notes: '' })
  const [searchProgress, setSearchProgress] = useState(0)
  const [broadcastCount, setBroadcastCount] = useState(0)
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    if (step === 'searching') {
      const interval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) { clearInterval(interval); setStep('results'); return 100 }
          return prev + 5
        })
        setBroadcastCount(prev => Math.min(prev + 3, 47))
        setTimer(prev => prev + 1)
      }, 150)
      return () => clearInterval(interval)
    }
  }, [step])

  const handleSOS = () => {
    if (!form.group) return
    setStep('searching')
  }

  return (
    <div className="sos-page">
      {/* Background */}
      <div className="sos-bg">
        <div className="sos-orb sos-orb-1" />
        <div className="sos-orb sos-orb-2" />
        <div className="sos-grid" />
      </div>

      {/* Navbar */}
      <nav className="sos-nav">
        <Link to="/" className="sos-logo">
          <span>🩸</span>
          <span style={{ fontWeight: 800 }}>BloodConnect</span>
        </Link>
        <div className="flex gap-md">
          <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link to="/" className="btn btn-ghost btn-sm">← Back to Home</Link>
        </div>
      </nav>

      <div className="sos-container">
        {/* Header */}
        <div className="sos-header">
          <div className="sos-icon animate-pulse-red">🆘</div>
          <h1 className="sos-title">Emergency Blood Request</h1>
          <p className="sos-subtitle">
            No login required. Fill this form and we'll broadcast instantly to all connected blood banks and eligible donors nearby.
          </p>
        </div>

        {/* ── FORM ── */}
        {step === 'form' && (
          <div className="sos-form-card glass-card animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Your Name / Requester</label>
                <input id="sos-name" className="form-input" placeholder="Ramesh Gupta" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input id="sos-phone" type="tel" className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
              <div className="form-group">
                <label className="form-label">Blood Group Needed *</label>
                <select id="sos-blood-group" className="form-select" value={form.group} onChange={e => setForm(p => ({ ...p, group: e.target.value }))}>
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Units Required</label>
                <input id="sos-units" type="number" className="form-input" min="1" max="10" value={form.units} onChange={e => setForm(p => ({ ...p, units: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label className="form-label" style={{ marginBottom: 12, display: 'block' }}>Urgency Level *</label>
              <div className="urgency-grid">
                {URGENCY_LEVELS.map(level => (
                  <div
                    key={level.id}
                    id={`urgency-${level.id}`}
                    className={`urgency-card ${form.urgency === level.id ? 'active' : ''}`}
                    style={{ '--urgency-color': level.color }}
                    onClick={() => setForm(p => ({ ...p, urgency: level.id }))}
                  >
                    <div className="urgency-icon">{level.icon}</div>
                    <div className="urgency-label">{level.label}</div>
                    <div className="urgency-desc">{level.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="form-group">
                <label className="form-label">Hospital / Location</label>
                <input id="sos-location" className="form-input" placeholder="Apollo Hospital, Andheri, Mumbai" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea id="sos-notes" className="form-input" style={{ resize: 'vertical', minHeight: 70 }} placeholder="Patient condition, component type needed, contact person..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>

            <button
              id="trigger-sos-btn"
              className="btn btn-danger btn-lg w-full animate-pulse-red"
              style={{ marginTop: 24, fontSize: '1.1rem', padding: '18px', borderRadius: 'var(--radius-full)' }}
              onClick={handleSOS}
              disabled={!form.group}
            >
              🆘 SEND EMERGENCY SOS NOW
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 12 }}>
              Broadcasts to all connected blood banks + eligible donors within 50 km. Response expected in under 5 minutes.
            </p>
          </div>
        )}

        {/* ── SEARCHING ── */}
        {step === 'searching' && (
          <div className="sos-searching glass-card animate-fade-in">
            <div className="searching-icon">🔍</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Broadcasting SOS...</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
              Reaching all blood banks and eligible donors near {form.location || 'your location'}
            </p>

            <div className="searching-progress">
              <div className="progress-bar" style={{ height: 12, marginBottom: 12 }}>
                <div className="progress-fill" style={{ width: `${searchProgress}%` }} />
              </div>
              <div className="flex justify-between" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <span>Searching inventory...</span>
                <span>{searchProgress}%</span>
              </div>
            </div>

            <div className="searching-stats" style={{ marginTop: 32 }}>
              {[
                { icon: '🏦', label: 'Blood banks checked', value: Math.floor(broadcastCount / 3) },
                { icon: '🩸', label: 'Donors alerted', value: broadcastCount },
                { icon: '⏱️', label: 'Time elapsed', value: `${(timer * 0.15).toFixed(1)}s` },
              ].map((s, i) => (
                <div key={i} className="stat-card text-center">
                  <div style={{ fontSize: '1.6rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-primary-light)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="live-feed">
              <div className="live-feed-title">📡 Live Activity</div>
              {[
                '✅ LifeSource Blood Bank — 8 units O+ available',
                '📱 Notifying 15 eligible donors within 5 km...',
                '✅ Red Cross Center — 5 units O+ available',
                '📱 Donor Arjun S. (0.8 km) — Notification sent',
                '📱 Donor Priya M. (1.5 km) — Notification sent',
              ].slice(0, Math.ceil(broadcastCount / 10)).map((msg, i) => (
                <div key={i} className="feed-item animate-slide-in">{msg}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {step === 'results' && (
          <div className="animate-fade-in">
            <div className="sos-results-header glass-card" style={{ marginBottom: 24, borderColor: 'rgba(0, 230, 118, 0.3)', background: 'rgba(0, 230, 118, 0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
              <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 8 }}>
                {MOCK_MATCHES.length} Sources Found!
              </h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Blood available for <span className="blood-badge" style={{ width: 32, height: 32, fontSize: '0.7rem', display: 'inline-flex' }}>{form.group || 'O+'}</span> •
                <strong> 47 donors notified</strong> • <strong>2 blood banks matched</strong>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {MOCK_MATCHES.map((match, i) => (
                <div key={i} className="glass-card" style={{ borderLeft: `4px solid ${match.type === 'bank' ? 'var(--color-primary)' : '#29B6F6'}` }}>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-md items-center">
                      <div className="avatar" style={{ width: 52, height: 52, fontSize: '1.4rem', borderRadius: 12, background: match.type === 'bank' ? 'rgba(220,20,60,0.2)' : 'rgba(41,182,246,0.2)' }}>
                        {match.type === 'bank' ? '🏦' : '🩸'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{match.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          📍 {match.distance} • 🕐 ETA: {match.eta} • {match.type === 'bank' ? `${match.units} units available` : 'Can donate 1 unit'}
                        </div>
                        <div style={{ fontSize: '0.8rem', marginTop: 4 }}>{match.contact}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '1.1rem' }}>
                        {match.units} unit{match.units > 1 ? 's' : ''}
                      </div>
                      <button className={`btn btn-sm ${match.type === 'bank' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginTop: 8 }}>
                        {match.type === 'bank' ? 'Reserve Now' : 'Contact'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card" style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
                Need more help? Our 24/7 emergency line is always available.
              </p>
              <div className="flex gap-md justify-center flex-wrap">
                <button className="btn btn-danger" onClick={() => navigate('/register')}>🩸 Register as Donor</button>
                <button className="btn btn-secondary" onClick={() => setStep('form')}>Submit Another SOS</button>
                <Link to="/" className="btn btn-ghost">← Home</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
