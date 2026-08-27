import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Portal.css'

const INVENTORY = [
  { group: 'A+', wholeBlood: 45, plasma: 22, platelets: 12, expirySoon: 3, status: 'normal' },
  { group: 'A-', wholeBlood: 8, plasma: 5, platelets: 2, expirySoon: 0, status: 'low' },
  { group: 'B+', wholeBlood: 34, plasma: 18, platelets: 9, expirySoon: 2, status: 'normal' },
  { group: 'B-', wholeBlood: 4, plasma: 2, platelets: 1, expirySoon: 1, status: 'critical' },
  { group: 'O+', wholeBlood: 67, plasma: 31, platelets: 15, expirySoon: 5, status: 'high' },
  { group: 'O-', wholeBlood: 11, plasma: 6, platelets: 3, expirySoon: 0, status: 'low' },
  { group: 'AB+', wholeBlood: 23, plasma: 11, platelets: 6, expirySoon: 1, status: 'normal' },
  { group: 'AB-', wholeBlood: 3, plasma: 1, platelets: 0, expirySoon: 0, status: 'critical' },
]

const EXPIRING_UNITS = [
  { id: 'U001', group: 'O+', component: 'Whole Blood', collected: '25 Jul 2026', expiry: '01 Sep 2026', daysLeft: 5, bank: 'Self' },
  { id: 'U002', group: 'B-', component: 'Plasma', collected: '28 Jul 2026', expiry: '03 Sep 2026', daysLeft: 7, bank: 'Self' },
  { id: 'U003', group: 'A+', component: 'Platelets', collected: '01 Aug 2026', expiry: '06 Sep 2026', daysLeft: 10, bank: 'Self' },
]

const TRANSFER_REQUESTS = [
  { id: 'TR001', from: 'Apollo Hospital', group: 'O-', units: 3, status: 'pending', time: '1 hour ago' },
  { id: 'TR002', from: 'Hinduja Hospital', group: 'B+', units: 5, status: 'approved', time: '2 days ago' },
]

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'inventory', icon: '🩸', label: 'Inventory' },
  { id: 'expiry', icon: '⚠️', label: 'Expiry Alerts' },
  { id: 'transfers', icon: '🔄', label: 'Transfer Requests' },
  { id: 'settings', icon: '⚙️', label: 'Alert Settings' },
]

export default function BloodBankPortal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStock, setNewStock] = useState({ group: '', component: 'Whole Blood', units: '', collectionDate: '' })
  const [threshold, setThreshold] = useState({ 'A+': 10, 'B+': 10, 'O+': 15, 'O-': 5 })

  const bankName = user?.bankName || 'LifeSource Blood Bank'
  const city = user?.city || 'Delhi'

  const totalUnits = INVENTORY.reduce((sum, i) => sum + i.wholeBlood + i.plasma + i.platelets, 0)
  const criticalCount = INVENTORY.filter(i => i.status === 'critical').length
  const expiryCount = INVENTORY.reduce((sum, i) => sum + i.expirySoon, 0)

  return (
    <div className="portal-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏦</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{bankName}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Blood Bank Portal</div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="avatar">RK</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name || 'Ravi Kumar'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Bank Admin • {city}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} id={`bank-nav-${item.id}`} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
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

        {criticalCount > 0 && (
          <div className="sidebar-eligibility">
            <div className="eligibility-badge not-eligible">
              🚨 {criticalCount} blood group(s) critical!
            </div>
          </div>
        )}
      </aside>

      <main className="portal-main">
        <header className="portal-header">
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{bankName} • {city}</p>
          </div>
          <div className="flex gap-md items-center">
            {expiryCount > 0 && <span className="badge badge-yellow">⚠️ {expiryCount} expiring soon</span>}
            <button id="add-stock-btn" className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>+ Add Stock</button>
          </div>
        </header>

        <div className="portal-content">
          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              {criticalCount > 0 && (
                <div className="alert alert-danger" style={{ marginBottom: 24 }}>
                  🚨 <strong>{criticalCount} blood groups</strong> are critically low! Immediate action required.
                </div>
              )}

              <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                  { icon: '🩸', label: 'Total Units', value: totalUnits, color: '#DC143C' },
                  { icon: '🚨', label: 'Critical Groups', value: criticalCount, color: '#FF1744' },
                  { icon: '⚠️', label: 'Expiring Soon', value: expiryCount, color: '#FFB300' },
                  { icon: '🔄', label: 'Transfer Requests', value: TRANSFER_REQUESTS.filter(t => t.status === 'pending').length, color: '#29B6F6' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
                    <div className="stat-number" style={{ background: `linear-gradient(135deg, #fff, ${s.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Blood Group Overview */}
              <div className="glass-card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🩸 Blood Group Overview</h3>
                <div className="blood-groups-mini-grid">
                  {INVENTORY.map(item => (
                    <div key={item.group} className={`blood-mini-card status-${item.status}`}>
                      <div className="blood-badge" style={{ width: 36, height: 36, fontSize: '0.75rem', margin: '0 auto 8px' }}>{item.group}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{item.wholeBlood + item.plasma + item.platelets}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>units</div>
                      {item.expirySoon > 0 && <div style={{ fontSize: '0.7rem', color: 'var(--color-warning)' }}>⚠️ {item.expirySoon} expiring</div>}
                      <div className={`mini-status badge-${item.status === 'high' ? 'green' : item.status === 'normal' ? 'blue' : item.status === 'low' ? 'yellow' : 'red'}`}>
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Transfers */}
              {TRANSFER_REQUESTS.filter(t => t.status === 'pending').length > 0 && (
                <div className="glass-card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🔄 Pending Transfer Requests</h3>
                  {TRANSFER_REQUESTS.filter(t => t.status === 'pending').map(tr => (
                    <div key={tr.id} className="alert-row">
                      <div className="flex justify-between items-center">
                        <div>
                          <strong>{tr.from}</strong> requests <span className="blood-badge" style={{ width: 28, height: 28, fontSize: '0.65rem', display: 'inline-flex' }}>{tr.group}</span> × {tr.units} units
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{tr.time}</div>
                        </div>
                        <div className="flex gap-sm">
                          <button className="btn btn-success btn-sm">Approve</button>
                          <button className="btn btn-secondary btn-sm">Decline</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── INVENTORY ── */}
          {activeTab === 'inventory' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                <div>
                  <h2 className="section-title">Complete Inventory</h2>
                  <p className="section-subtitle">All blood groups and components</p>
                </div>
                <button id="add-inventory-btn" className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Stock</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Whole Blood (Units)</th>
                      <th>Plasma (Units)</th>
                      <th>Platelets (Units)</th>
                      <th>Expiring Soon</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INVENTORY.map(item => (
                      <tr key={item.group}>
                        <td><span className="blood-badge" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>{item.group}</span></td>
                        <td style={{ fontWeight: 700 }}>{item.wholeBlood}</td>
                        <td>{item.plasma}</td>
                        <td>{item.platelets}</td>
                        <td>
                          {item.expirySoon > 0
                            ? <span className="badge badge-yellow">⚠️ {item.expirySoon} units</span>
                            : <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                          }
                        </td>
                        <td>
                          <span className={`badge ${item.status === 'high' ? 'badge-green' : item.status === 'normal' ? 'badge-blue' : item.status === 'low' ? 'badge-yellow' : 'badge-red'}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td><button className="btn btn-secondary btn-sm">Update</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── EXPIRY ALERTS ── */}
          {activeTab === 'expiry' && (
            <div className="animate-fade-in">
              <div className="alert alert-warning" style={{ marginBottom: 24 }}>
                ⚠️ <strong>{EXPIRING_UNITS.length} units</strong> are expiring within 10 days. Prioritize usage or arrange redistribution.
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Unit ID</th>
                      <th>Blood Group</th>
                      <th>Component</th>
                      <th>Collected</th>
                      <th>Expiry Date</th>
                      <th>Days Left</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXPIRING_UNITS.map(unit => (
                      <tr key={unit.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{unit.id}</td>
                        <td><span className="blood-badge" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>{unit.group}</span></td>
                        <td>{unit.component}</td>
                        <td>{unit.collected}</td>
                        <td style={{ color: unit.daysLeft <= 5 ? 'var(--color-danger)' : 'var(--color-warning)' }}>{unit.expiry}</td>
                        <td>
                          <span className={`badge ${unit.daysLeft <= 5 ? 'badge-red' : 'badge-yellow'}`}>
                            {unit.daysLeft} days
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-sm">
                            <button className="btn btn-secondary btn-sm">Redistribute</button>
                            <button className="btn btn-ghost btn-sm">Mark Used</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TRANSFERS ── */}
          {activeTab === 'transfers' && (
            <div className="animate-fade-in">
              {TRANSFER_REQUESTS.map(tr => (
                <div key={tr.id} className="glass-card" style={{ marginBottom: 16 }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex gap-sm items-center" style={{ marginBottom: 8 }}>
                        <span className="badge badge-blue">#{tr.id}</span>
                        <span className={`badge ${tr.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>{tr.status.toUpperCase()}</span>
                      </div>
                      <h3 style={{ fontWeight: 700 }}>From: {tr.from}</h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Requesting <strong>{tr.units} units</strong> of <span className="blood-badge" style={{ width: 28, height: 28, fontSize: '0.65rem', display: 'inline-flex' }}>{tr.group}</span>
                        {' '}• {tr.time}
                      </p>
                    </div>
                    {tr.status === 'pending' && (
                      <div className="flex gap-sm">
                        <button className="btn btn-success">✅ Approve</button>
                        <button className="btn btn-secondary">❌ Decline</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <div className="glass-card">
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>⚙️ Low-Stock Alert Thresholds</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
                  Set minimum unit counts. When stock drops below threshold, automatic alerts will be sent.
                </p>
                <div className="grid-4">
                  {Object.entries(threshold).map(([group, val]) => (
                    <div key={group} className="form-group">
                      <label className="form-label">
                        <span className="blood-badge" style={{ width: 24, height: 24, fontSize: '0.6rem', display: 'inline-flex', marginRight: 6 }}>{group}</span>
                        {group} Threshold
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={val}
                        onChange={e => setThreshold(prev => ({ ...prev, [group]: parseInt(e.target.value) }))}
                      />
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ marginTop: 20 }}>Save Thresholds</button>
              </div>

              <div className="glass-card" style={{ marginTop: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🔔 Notification Preferences</h3>
                {['Email alerts for low stock', 'SMS for critical levels', 'Expiry alerts (5 days before)', 'Transfer request notifications'].map((pref, i) => (
                  <div key={i} className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.9rem' }}>{pref}</span>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-track" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>➕ Add Blood Stock</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>Enter new unit details. Expiry will be auto-calculated (42 days from collection).</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select id="add-stock-group" className="form-select" value={newStock.group} onChange={e => setNewStock(p => ({ ...p, group: e.target.value }))}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Component Type</label>
                <select id="add-stock-component" className="form-select" value={newStock.component} onChange={e => setNewStock(p => ({ ...p, component: e.target.value }))}>
                  {['Whole Blood', 'Plasma', 'Platelets', 'Red Blood Cells', 'Cryoprecipitate'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Units</label>
                <input id="add-stock-units" type="number" className="form-input" placeholder="Enter unit count" value={newStock.units} onChange={e => setNewStock(p => ({ ...p, units: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Collection Date</label>
                <input id="add-stock-date" type="date" className="form-input" value={newStock.collectionDate} onChange={e => setNewStock(p => ({ ...p, collectionDate: e.target.value }))} />
              </div>
              {newStock.collectionDate && (
                <div className="alert alert-info">
                  📅 Expiry Date (auto): <strong>{new Date(new Date(newStock.collectionDate).getTime() + 42 * 86400000).toLocaleDateString('en-IN')}</strong>
                </div>
              )}
              <div className="flex gap-md">
                <button id="add-stock-submit" className="btn btn-primary flex-1" onClick={() => { alert('Stock added successfully!'); setShowAddModal(false) }}>Add Stock</button>
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
