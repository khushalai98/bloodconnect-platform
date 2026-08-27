import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const STATS = [
  { number: '2,847', label: 'Lives Saved', suffix: '+' },
  { number: '156', label: 'Blood Banks Connected', suffix: '' },
  { number: '48,200', label: 'Verified Donors', suffix: '+' },
  { number: '< 5', label: 'Mins to Find Blood', suffix: 'min' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '🩸',
    title: 'Register & Verify',
    desc: 'Create your profile, verify identity via OTP, and set your blood group and location. Done in under 3 minutes.'
  },
  {
    step: '02',
    icon: '🗺️',
    title: 'Real-Time Matching',
    desc: 'Our engine instantly scans all connected blood banks and hospitals to find the nearest available match.'
  },
  {
    step: '03',
    icon: '🆘',
    title: 'Instant SOS Dispatch',
    desc: 'If no stock is found, eligible donors nearby are alerted within seconds via SMS, push, and app notifications.'
  }
]

const PORTAL_CARDS = [
  {
    id: 'donor',
    icon: '🩸',
    title: 'I Want to Donate',
    subtitle: 'Donor Portal',
    desc: 'Register, track eligibility, earn badges, and respond to emergency alerts near you.',
    gradient: 'from-red to-crimson',
    route: '/register',
    btnText: 'Become a Donor',
    color: '#DC143C'
  },
  {
    id: 'hospital',
    icon: '🏥',
    title: 'I Need Blood',
    subtitle: 'Hospital Portal',
    desc: 'Search real-time inventory, submit emergency requests, and get instant donor matching.',
    gradient: 'from-blue to-navy',
    route: '/login',
    btnText: 'Access Hospital Portal',
    color: '#29B6F6'
  },
  {
    id: 'blood-bank',
    icon: '🏦',
    title: 'Manage Inventory',
    subtitle: 'Blood Bank Portal',
    desc: 'Update stock, track expiry, receive demand alerts, and coordinate with hospitals.',
    gradient: 'from-orange to-amber',
    route: '/login',
    btnText: 'Access Blood Bank Portal',
    color: '#FF8F00'
  },
  {
    id: 'emergency',
    icon: '🆘',
    title: 'Emergency SOS',
    subtitle: 'Immediate Help',
    desc: 'One-tap emergency that broadcasts simultaneously to all donors, banks, and logistics.',
    gradient: 'from-red to-dark',
    route: '/emergency',
    btnText: 'Emergency SOS',
    color: '#FF1744',
    isPrimary: true
  }
]

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0)
  const numericTarget = parseInt(target.replace(/[^0-9]/g, ''))

  useEffect(() => {
    let start = 0
    const duration = 2000
    const step = numericTarget / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= numericTarget) {
        setCount(numericTarget)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [numericTarget])

  return (
    <span>{target.includes('<') ? '< ' : ''}{count.toLocaleString()}{suffix}</span>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [selectedGroup, setSelectedGroup] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [countersVisible, setCountersVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      if (window.scrollY > 300) setCountersVisible(true)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = () => {
    if (selectedGroup) {
      navigate(`/hospital?group=${selectedGroup}&location=${searchLocation}`)
    }
  }

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner container">
          <div className="nav-logo">
            <div className="nav-logo-icon">🩸</div>
            <span className="nav-logo-text">Blood<span className="gradient-text">Connect</span></span>
          </div>
          <div className="nav-links">
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#portals" className="nav-link">Portals</a>
            <a href="#stats" className="nav-link">Impact</a>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Register</button>
          </div>
          <button className="nav-emergency-btn" onClick={() => navigate('/emergency')}>
            🆘 Emergency SOS
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content container">
          <div className="hero-badge animate-fade-in">
            <span className="hero-badge-dot" />
            <span>Live Network • 156 Blood Banks Connected</span>
          </div>

          <h1 className="hero-title animate-fade-in">
            Every Second<br />
            <span className="gradient-text text-glow">Saves a Life.</span>
          </h1>

          <p className="hero-subtitle animate-fade-in">
            India's first centralized real-time blood inventory and donor matching platform.<br />
            From request to fulfillment — <strong>under 5 minutes.</strong>
          </p>

          {/* Quick Search */}
          <div className="hero-search animate-fade-in">
            <div className="search-label">🔍 Find Blood Now</div>
            <div className="search-bar">
              <select
                id="blood-group-select"
                className="search-select"
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <input
                id="location-input"
                className="search-input"
                placeholder="Enter city or pin code"
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
              />
              <button id="search-blood-btn" className="search-btn" onClick={handleSearch}>
                Search Availability
              </button>
            </div>
          </div>

          <div className="hero-cta animate-fade-in">
            <button id="hero-register-btn" className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              🩸 Register as Donor
            </button>
            <button id="hero-sos-btn" className="btn btn-danger btn-lg animate-pulse-red" onClick={() => navigate('/emergency')}>
              🆘 Emergency SOS
            </button>
          </div>

          {/* Blood group pills */}
          <div className="hero-blood-pills animate-fade-in">
            {BLOOD_GROUPS.map(g => (
              <div key={g} className="blood-pill" onClick={() => navigate(`/hospital?group=${g}`)}>
                <span className="blood-badge" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>{g}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating blood drop animation */}
        <div className="hero-illustration animate-float">
          <div className="blood-drop">
            <div className="drop-inner">🩸</div>
            <div className="drop-pulse" />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((stat, i) => (
              <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="stat-number">
                  {countersVisible ? <AnimatedCounter target={stat.number} suffix={stat.suffix} /> : '0'}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="how-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <p className="section-eyebrow">Simple & Fast</p>
            <h2 className="section-heading">How BloodConnect Works</h2>
            <p className="section-desc">From emergency to fulfillment in 3 simple steps</p>
          </div>
          <div className="how-grid">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="how-card glass-card">
                <div className="how-step-badge">{item.step}</div>
                <div className="how-icon">{item.icon}</div>
                <h3 className="how-title">{item.title}</h3>
                <p className="how-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portal Cards ── */}
      <section id="portals" className="portals-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <p className="section-eyebrow">Choose Your Role</p>
            <h2 className="section-heading">One Platform, Every Role</h2>
            <p className="section-desc">Tailored portals for every stakeholder in the blood supply chain</p>
          </div>
          <div className="portals-grid">
            {PORTAL_CARDS.map((card) => (
              <div
                key={card.id}
                id={`portal-card-${card.id}`}
                className={`portal-card glass-card ${card.isPrimary ? 'portal-card-primary' : ''}`}
                style={{ '--card-color': card.color }}
              >
                <div className="portal-card-icon" style={{ background: `${card.color}22`, color: card.color }}>
                  {card.icon}
                </div>
                <div className="portal-card-subtitle">{card.subtitle}</div>
                <h3 className="portal-card-title">{card.title}</h3>
                <p className="portal-card-desc">{card.desc}</p>
                <button
                  className="btn w-full"
                  style={{
                    background: card.isPrimary ? `linear-gradient(135deg, ${card.color}, #8B0000)` : `${card.color}22`,
                    color: card.isPrimary ? 'white' : card.color,
                    border: `1px solid ${card.color}44`,
                    marginTop: 16
                  }}
                  onClick={() => navigate(card.route)}
                >
                  {card.btnText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blood Groups Available ── */}
      <section className="blood-groups-section">
        <div className="container">
          <h2 className="section-heading text-center" style={{ marginBottom: 32 }}>
            Real-Time Availability
          </h2>
          <div className="blood-groups-grid">
            {[
              { group: 'A+', units: 142, status: 'high' },
              { group: 'A-', units: 23, status: 'low' },
              { group: 'B+', units: 89, status: 'medium' },
              { group: 'B-', units: 11, status: 'critical' },
              { group: 'O+', units: 204, status: 'high' },
              { group: 'O-', units: 31, status: 'low' },
              { group: 'AB+', units: 67, status: 'medium' },
              { group: 'AB-', units: 8, status: 'critical' },
            ].map(({ group, units, status }) => (
              <div key={group} className={`blood-group-card glass-card blood-status-${status}`}>
                <div className="blood-badge blood-badge-lg">{group}</div>
                <div className="bgroup-units">{units} units</div>
                <div className={`bgroup-status badge-${status === 'high' ? 'green' : status === 'medium' ? 'yellow' : 'red'}`}>
                  {status === 'high' ? '✅ Available' : status === 'medium' ? '⚠️ Limited' : status === 'low' ? '🔴 Low' : '🆘 Critical'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card glass-card">
            <div className="cta-orb" />
            <div className="cta-content">
              <h2 className="cta-title">Ready to Save a Life Today?</h2>
              <p className="cta-desc">Join 48,000+ verified donors. Registration takes under 3 minutes.</p>
              <div className="cta-buttons">
                <button id="cta-register-btn" className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                  🩸 Register as Donor
                </button>
                <button id="cta-register-bank-btn" className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
                  Register Blood Bank / Hospital
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo" style={{ marginBottom: 12 }}>
                <div className="nav-logo-icon">🩸</div>
                <span className="nav-logo-text">Blood<span className="gradient-text">Connect</span></span>
              </div>
              <p className="footer-tagline">Centralized real-time blood inventory & donor engagement platform. PS-01.</p>
            </div>
            <div className="footer-links-group">
              <h4>Platform</h4>
              <a href="/register">Donor Registration</a>
              <a href="/login">Hospital Login</a>
              <a href="/login">Blood Bank Login</a>
              <a href="/emergency">Emergency SOS</a>
            </div>
            <div className="footer-links-group">
              <h4>About</h4>
              <a href="#">About BloodConnect</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Us</a>
            </div>
            <div className="footer-links-group">
              <h4>Blood Groups</h4>
              {BLOOD_GROUPS.map(g => <a key={g} href={`/hospital?group=${g}`}>Find {g} Blood</a>)}
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 BloodConnect. Built to save lives. PS-01 Platform.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
