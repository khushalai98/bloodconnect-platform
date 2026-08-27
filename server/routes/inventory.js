const express = require('express')
const router = express.Router()

const DEMO_INVENTORY = [
  { bankId: 'bank-001', bankName: 'LifeSource Blood Bank', city: 'Delhi', bloodGroup: 'A+', componentType: 'Whole Blood', units: 45, status: 'available', lat: 28.6139, lng: 77.2090 },
  { bankId: 'bank-001', bankName: 'LifeSource Blood Bank', city: 'Delhi', bloodGroup: 'O+', componentType: 'Whole Blood', units: 67, status: 'available', lat: 28.6139, lng: 77.2090 },
  { bankId: 'bank-002', bankName: 'Red Cross Center', city: 'Mumbai', bloodGroup: 'B+', componentType: 'Whole Blood', units: 34, status: 'available', lat: 19.0760, lng: 72.8777 },
  { bankId: 'bank-002', bankName: 'Red Cross Center', city: 'Mumbai', bloodGroup: 'O-', componentType: 'Whole Blood', units: 11, status: 'available', lat: 19.0760, lng: 72.8777 },
  { bankId: 'bank-003', bankName: 'Apollo Hospital', city: 'Mumbai', bloodGroup: 'AB+', componentType: 'Plasma', units: 23, status: 'available', lat: 19.0822, lng: 72.8416 },
  { bankId: 'bank-003', bankName: 'Apollo Hospital', city: 'Mumbai', bloodGroup: 'A-', componentType: 'Whole Blood', units: 8, status: 'available', lat: 19.0822, lng: 72.8416 },
  { bankId: 'bank-004', bankName: 'KEM Hospital', city: 'Mumbai', bloodGroup: 'B-', componentType: 'Whole Blood', units: 4, status: 'near-expiry', lat: 19.0047, lng: 72.8427 },
  { bankId: 'bank-004', bankName: 'KEM Hospital', city: 'Mumbai', bloodGroup: 'AB-', componentType: 'Whole Blood', units: 3, status: 'available', lat: 19.0047, lng: 72.8427 },
]

// ── GET /api/inventory ── Search by blood group + city
router.get('/', async (req, res) => {
  try {
    const { bloodGroup, city, status, radius } = req.query

    // Try MongoDB
    try {
      const { Inventory } = require('../models')
      const query = { status: { $in: ['available', 'near-expiry'] } }
      if (bloodGroup) query.bloodGroup = bloodGroup
      const inventory = await Inventory.find(query).populate('bankId', 'name city location')
      return res.json({ success: true, data: inventory })
    } catch (_) {
      // Demo mode
      let data = DEMO_INVENTORY
      if (bloodGroup) data = data.filter(i => i.bloodGroup === bloodGroup)
      if (city) data = data.filter(i => i.city.toLowerCase().includes(city.toLowerCase()))
      if (status) data = data.filter(i => i.status === status)
      return res.json({ success: true, data, total: data.length, demo: true })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/inventory/expiring-soon ── Units expiring in 5 days
router.get('/expiring-soon', async (req, res) => {
  try {
    const expiringSoon = DEMO_INVENTORY.filter(i => i.status === 'near-expiry')
    res.json({ success: true, data: expiringSoon, count: expiringSoon.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/inventory/low-stock ── Below threshold
router.get('/low-stock', async (req, res) => {
  try {
    const THRESHOLDS = { 'A+': 10, 'A-': 5, 'B+': 10, 'B-': 5, 'O+': 15, 'O-': 8, 'AB+': 8, 'AB-': 3 }
    const lowStock = DEMO_INVENTORY.filter(i => i.units < (THRESHOLDS[i.bloodGroup] || 10))
    res.json({ success: true, data: lowStock, count: lowStock.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/inventory ── Add new stock
router.post('/', async (req, res) => {
  try {
    const { bankId, bloodGroup, componentType, units, collectionDate } = req.body

    // Auto-calculate expiry
    const collDate = new Date(collectionDate)
    const expiryDays = componentType === 'Platelets' ? 5 : componentType === 'Plasma' ? 365 : 42
    const expiryDate = new Date(collDate.getTime() + expiryDays * 86400000)

    try {
      const { Inventory } = require('../models')
      const unit = new Inventory({ bankId, bloodGroup, componentType, units, collectionDate: collDate, expiryDate })
      await unit.save()
      return res.status(201).json({ success: true, data: unit })
    } catch (_) {
      // Demo mode
      return res.status(201).json({
        success: true,
        data: { bankId, bloodGroup, componentType, units, collectionDate, expiryDate, status: 'available' },
        demo: true
      })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PUT /api/inventory/:id ── Update stock
router.put('/:id', async (req, res) => {
  try {
    res.json({ success: true, message: 'Inventory updated', data: req.body })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/inventory/transfer-request ── Inter-hospital transfer
router.post('/transfer-request', async (req, res) => {
  try {
    const { fromBankId, toBankId, bloodGroup, units } = req.body
    res.status(201).json({
      success: true,
      message: 'Transfer request submitted',
      requestId: `TR-${Date.now()}`,
      data: { fromBankId, toBankId, bloodGroup, units, status: 'pending' }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
