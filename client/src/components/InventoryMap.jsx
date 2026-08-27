// ── Inventory Map View Component ──
// Ticket 3.2: "Map-based inventory view with radius filter"
// Uses Leaflet.js (open-source — no API key needed)

import { useState, useEffect, useRef } from 'react'
import './InventoryMap.css'

// Blood group compatibility colors
const BG_COLORS = {
  'A+': '#e74c3c', 'A-': '#c0392b',
  'B+': '#3498db', 'B-': '#2980b9',
  'O+': '#2ecc71', 'O-': '#27ae60',
  'AB+': '#9b59b6', 'AB-': '#8e44ad',
}

// Demo inventory sources with coordinates (India-based)
const DEMO_SOURCES = [
  { id: 1, name: 'LifeSource Blood Bank', type: 'blood-bank', lat: 19.0760, lng: 72.8777, city: 'Mumbai', phone: '98765 00001', inventory: { 'O+': 18, 'A+': 12, 'B+': 8, 'AB+': 3 }, rating: 4.8 },
  { id: 2, name: 'Red Cross Center', type: 'blood-bank', lat: 19.0596, lng: 72.8295, city: 'Mumbai', phone: '98765 00002', inventory: { 'O+': 5, 'A+': 20, 'B-': 6, 'O-': 9 }, rating: 4.7 },
  { id: 3, name: 'Apollo Hospital', type: 'hospital', lat: 19.1136, lng: 72.8697, city: 'Andheri', phone: '98765 00003', inventory: { 'B+': 14, 'AB+': 7, 'O+': 10 }, rating: 4.9 },
  { id: 4, name: 'KEM Hospital', type: 'hospital', lat: 18.9942, lng: 72.8403, city: 'Parel', phone: '98765 00004', inventory: { 'A-': 4, 'B-': 3, 'O+': 22 }, rating: 4.7 },
  { id: 5, name: 'Hinduja Center', type: 'blood-bank', lat: 19.0565, lng: 72.8271, city: 'Mahim', phone: '98765 00005', inventory: { 'A+': 8, 'O-': 12, 'AB-': 2 }, rating: 4.6 },
  { id: 6, name: 'Wockhardt Hospital', type: 'hospital', lat: 19.0633, lng: 72.8338, city: 'Mumbai Central', phone: '98765 00006', inventory: { 'B+': 6, 'O+': 4, 'A+': 9 }, rating: 4.5 },
]

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function InventoryMap({ selectedBloodGroup = '', radius = 20, onSelectSource }) {
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef([])

  const [sources, setSources] = useState(DEMO_SOURCES)
  const [selectedSource, setSelectedSource] = useState(null)
  const [filterBG, setFilterBG] = useState(selectedBloodGroup)
  const [filterRadius, setFilterRadius] = useState(radius)
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState({ lat: 19.0760, lng: 72.8777 })
  const [mapLoaded, setMapLoaded] = useState(false)

  // Load Leaflet dynamically
  useEffect(() => {
    if (mapLoaded || leafletMap.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      setMapLoaded(true)
      initMap()
    }
    document.head.appendChild(script)

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  const initMap = () => {
    if (!mapRef.current || leafletMap.current) return
    const L = window.L
    if (!L) return

    leafletMap.current = L.map(mapRef.current, {
      center: [19.0760, 72.8777],
      zoom: 13,
      zoomControl: true,
    })

    // OpenStreetMap tiles (no API key needed!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(leafletMap.current)

    renderMarkers(DEMO_SOURCES, L)
  }

  const renderMarkers = (data, L) => {
    if (!leafletMap.current || !L) return

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    data.forEach(source => {
      const bloodGroups = Object.keys(source.inventory || {})
      const totalUnits = Object.values(source.inventory || {}).reduce((a, b) => a + b, 0)
      const isLowStock = totalUnits < 10
      const color = source.type === 'blood-bank' ? '#e53e3e' : '#3182ce'

      // Custom icon
      const icon = L.divIcon({
        className: '',
        html: `
          <div class="map-marker ${source.type} ${isLowStock ? 'low-stock' : ''}">
            <div class="marker-icon">${source.type === 'blood-bank' ? '🏦' : '🏥'}</div>
            <div class="marker-units">${totalUnits}u</div>
          </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
      })

      const marker = L.marker([source.lat, source.lng], { icon })
        .addTo(leafletMap.current)
        .on('click', () => {
          setSelectedSource(source)
          if (onSelectSource) onSelectSource(source)
        })

      // Popup with blood group info
      const popupContent = `
        <div class="map-popup">
          <h4>${source.name}</h4>
          <p class="popup-type">${source.type === 'blood-bank' ? '🏦 Blood Bank' : '🏥 Hospital'}</p>
          <p>📍 ${source.city}</p>
          <div class="popup-inventory">
            ${bloodGroups.map(bg => `
              <span class="bg-badge" style="background:${BG_COLORS[bg] || '#888'}">
                ${bg}: ${source.inventory[bg]}
              </span>
            `).join('')}
          </div>
          <p>⭐ ${source.rating} | 📞 ${source.phone}</p>
        </div>
      `
      marker.bindPopup(popupContent, { maxWidth: 220 })
      markersRef.current.push(marker)
    })
  }

  // Fetch real inventory data from API
  const fetchInventory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: filterRadius,
        ...(filterBG ? { bloodGroup: filterBG } : {}),
      })
      const res = await fetch(`${API_BASE}/api/v1/inventory?${params}`)
      const data = await res.json()

      if (data.success && data.data?.length > 0) {
        setSources(data.data)
        if (mapLoaded && window.L) renderMarkers(data.data, window.L)
      }
    } catch (_) {
      // Demo mode — filter existing sources
      const filtered = filterBG
        ? DEMO_SOURCES.filter(s => s.inventory[filterBG])
        : DEMO_SOURCES
      setSources(filtered)
      if (mapLoaded && window.L) renderMarkers(filtered, window.L)
    }
    setLoading(false)
  }

  // Get user's real location
  const getUserLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        if (leafletMap.current) {
          leafletMap.current.setView([loc.lat, loc.lng], 14)
          const L = window.L
          if (L) {
            L.circle([loc.lat, loc.lng], {
              radius: filterRadius * 1000,
              color: '#e53e3e', fillOpacity: 0.05, weight: 1
            }).addTo(leafletMap.current)
          }
        }
      },
      () => console.log('Location access denied — using default')
    )
  }

  useEffect(() => {
    fetchInventory()
  }, [filterBG, filterRadius])

  const filteredSources = filterBG
    ? sources.filter(s => s.inventory?.[filterBG] > 0)
    : sources

  return (
    <div className="inventory-map-container">
      {/* Filter Bar */}
      <div className="map-filters">
        <select
          value={filterBG}
          onChange={e => setFilterBG(e.target.value)}
          className="filter-select"
        >
          <option value="">All Blood Groups</option>
          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>

        <select
          value={filterRadius}
          onChange={e => setFilterRadius(Number(e.target.value))}
          className="filter-select"
        >
          {[5, 10, 20, 50].map(r => (
            <option key={r} value={r}>{r} km radius</option>
          ))}
        </select>

        <button onClick={getUserLocation} className="location-btn">
          📍 Use My Location
        </button>

        <button onClick={fetchInventory} className="refresh-btn" disabled={loading}>
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      <div className="map-layout">
        {/* Leaflet Map */}
        <div ref={mapRef} className="leaflet-map-container">
          {!mapLoaded && (
            <div className="map-loading">
              <div className="map-loading-spinner"></div>
              <p>Loading map...</p>
            </div>
          )}
        </div>

        {/* Source List Sidebar */}
        <div className="map-sidebar">
          <div className="sidebar-header">
            <h4>📍 {filteredSources.length} Nearby Sources</h4>
            {filterBG && (
              <span className="bg-filter-badge" style={{ background: BG_COLORS[filterBG] }}>
                {filterBG}
              </span>
            )}
          </div>

          <div className="source-list">
            {filteredSources.map(source => (
              <div
                key={source.id}
                className={`source-card ${selectedSource?.id === source.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedSource(source)
                  if (leafletMap.current) leafletMap.current.setView([source.lat, source.lng], 15)
                }}
              >
                <div className="source-header">
                  <span className="source-icon">{source.type === 'blood-bank' ? '🏦' : '🏥'}</span>
                  <div>
                    <div className="source-name">{source.name}</div>
                    <div className="source-city">📍 {source.city}</div>
                  </div>
                  <span className="source-rating">⭐ {source.rating}</span>
                </div>

                <div className="source-inventory">
                  {Object.entries(source.inventory || {})
                    .filter(([bg]) => !filterBG || bg === filterBG)
                    .map(([bg, units]) => (
                      <span
                        key={bg}
                        className="inv-badge"
                        style={{ background: BG_COLORS[bg] + '22', border: `1px solid ${BG_COLORS[bg]}`, color: BG_COLORS[bg] }}
                      >
                        {bg}: {units}u
                      </span>
                    ))}
                </div>

                <div className="source-actions">
                  <button className="contact-btn" onClick={e => { e.stopPropagation(); alert(`Call: ${source.phone}`) }}>
                    📞 Contact
                  </button>
                  <button className="request-btn" onClick={e => { e.stopPropagation(); if (onSelectSource) onSelectSource(source) }}>
                    Request →
                  </button>
                </div>
              </div>
            ))}

            {filteredSources.length === 0 && (
              <div className="no-sources">
                <p>😔 No {filterBG || ''} blood found within {filterRadius} km</p>
                <button onClick={() => setFilterRadius(r => r + 10)}>
                  Expand to {filterRadius + 10} km
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
