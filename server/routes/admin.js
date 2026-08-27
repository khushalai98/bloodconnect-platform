const express = require('express')
const router = express.Router()

// ── GET /api/admin/stats ── Platform overview
router.get('/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalDonors: 48241,
        verifiedDonors: 44180,
        blockedDonors: 6,
        flaggedDonors: 2,
        totalBloodBanks: 156,
        verifiedBanks: 149,
        activeRequests: 3,
        fulfilledToday: 12,
        avgResponseTime: '4.2 min',
        fraudRate: '1.8%',
        systemUptime: '99.8%',
        kpis: {
          avgTimeToLocate: { value: '4.2 min', target: '< 5 min', met: true },
          fulfillmentRate: { value: '91.3%', target: '> 90%', met: true },
          wastageReduction: { value: '28%', target: '> 30%', met: false },
          fraudRate: { value: '1.8%', target: '< 2%', met: true },
          donorResponseRate: { value: '27.4%', target: '> 25%', met: true },
        }
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/admin/donors/:id/flag ── Flag a donor
router.post('/donors/:id/flag', async (req, res) => {
  try {
    const { reason } = req.body
    res.json({ success: true, message: `Donor ${req.params.id} flagged`, reason })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/admin/donors/:id/block ── Block a donor
router.post('/donors/:id/block', async (req, res) => {
  try {
    res.json({ success: true, message: `Donor ${req.params.id} blocked` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/admin/donors/:id/verify ── Verify a donor
router.post('/donors/:id/verify', async (req, res) => {
  try {
    res.json({ success: true, message: `Donor ${req.params.id} verified` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/admin/donations/:id/confirm ── Confirm a donation
router.post('/donations/:id/confirm', async (req, res) => {
  try {
    const { confirmedBy } = req.body
    const certificateId = `BC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    res.json({ success: true, message: 'Donation confirmed', certificateId, confirmedBy })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/admin/fraud-detection ── Fraud signals
router.get('/fraud-detection', async (req, res) => {
  try {
    res.json({
      success: true,
      signals: [
        { type: 'no-donation-6months', count: 2, severity: 'medium' },
        { type: 'duplicate-phone', count: 1, severity: 'high' },
        { type: 'low-trust-score', count: 1, severity: 'high' },
      ],
      fraudRate: '1.8%',
      target: '< 2%',
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/admin/system-health ── System status
router.get('/system-health', async (req, res) => {
  try {
    res.json({
      success: true,
      services: [
        { name: 'API Server', status: 'online', uptime: '99.8%', latency: '45ms' },
        { name: 'MongoDB', status: 'online', uptime: '99.9%', latency: '12ms' },
        { name: 'Socket.io', status: 'online', uptime: '99.5%' },
        { name: 'SMS Service', status: 'online', uptime: '98.2%' },
      ],
      overallUptime: '99.8%',
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
