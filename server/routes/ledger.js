// ── Ledger / Donation Routes ──
// TAD §5: POST /api/v1/donations/:id/confirm — Bank Admin confirms donation
//          GET  /api/v1/donations/certificate/:certId — verify certificate

const express = require('express')
const router = express.Router()
const { authenticate, authorize } = require('../middleware/auth')
const { rbac } = require('../middleware/rbac')
const { adminLimiter } = require('../middleware/rateLimiter')
const { logAction, auditMiddleware } = require('../middleware/auditLog')
const { createLedgerEntry, verifyCertificate, verifyLedgerIntegrity } = require('../services/ledgerService')
const { updateDonorTrustScore } = require('../utils/trustScore')
const { notifyDonationConfirmed } = require('../services/notificationService')

// ── POST /api/v1/donations/:id/confirm ──
// TAD §5: "Bank confirms a completed donation" — Bank Admin role
// Security: triggers trust score update + ledger hash-chain entry
router.post('/:id/confirm', authenticate, authorize(['blood-bank', 'admin']),
  rbac('donation_ledger', 'write'),
  auditMiddleware('DONATION_CONFIRMED'),
  async (req, res) => {
    try {
      const { id } = req.params
      const { donorId, bloodGroup, units = 1, notes } = req.body

      const donation = {
        _id: id !== 'new' ? id : undefined,
        donorId: donorId || req.body.donorId,
        bankId: req.user.orgId,
        bloodGroup,
        units,
        confirmedBy: req.user.name || req.user.id,
        confirmedById: req.user.id,
        timestamp: new Date(),
        notes,
      }

      // Step 7 → 8: Confirm → Trust Score → Ledger (TAD §3)
      const [ledgerResult, trustUpdate] = await Promise.all([
        createLedgerEntry(donation),
        updateDonorTrustScore(donorId, 'DONATION_VERIFIED'),
      ])

      // Notify donor with certificate
      if (donorId) {
        notifyDonationConfirmed(
          { _id: donorId, name: 'Donor', phone: req.body.donorPhone },
          req.body.bankName || 'Blood Bank',
          ledgerResult.certificateId
        )
      }

      return res.status(200).json({
        success: true,
        message: 'Donation confirmed and recorded in ledger',
        certificateId: ledgerResult.certificateId,
        ledgerHash: ledgerResult.ledgerHash,
        trustScoreUpdate: trustUpdate,
        donation: {
          donorId,
          bloodGroup,
          units,
          confirmedBy: donation.confirmedBy,
          timestamp: donation.timestamp,
        },
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

// ── GET /api/v1/donations/certificate/:certId ──
// Public: anyone can verify a certificate by ID
router.get('/certificate/:certId', async (req, res) => {
  try {
    const result = await verifyCertificate(req.params.certId)
    if (!result.valid) {
      return res.status(404).json({ valid: false, message: result.message })
    }
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/v1/donations/integrity ──
// Admin only: verify full ledger hash-chain integrity
router.get('/integrity', authenticate, authorize(['admin']), adminLimiter, async (req, res) => {
  try {
    const result = await verifyLedgerIntegrity()
    await logAction(req, 'BULK_DATA_ACCESS', {
      resourceType: 'donation_ledger',
      details: { action: 'integrity_check', result: result.integrity }
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/v1/donations ── List donation records (own bank)
router.get('/', authenticate, rbac('donation_ledger', 'read'), async (req, res) => {
  try {
    const { DonationRecord } = require('../models')
    const filter = req.user.role === 'blood-bank'
      ? { bankId: req.user.orgId }
      : req.user.role === 'donor'
      ? { donorId: req.user.id }
      : {}

    const records = await DonationRecord
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('donorId', 'name bloodGroup')
      .populate('bankId', 'name city')

    res.json({ success: true, count: records.length, records })
  } catch (_) {
    // Demo fallback
    res.json({
      success: true,
      count: 3,
      demo: true,
      records: [
        { certificateId: 'BC-001-DEMO', bloodGroup: 'O+', units: 1, verified: true, timestamp: new Date() },
        { certificateId: 'BC-002-DEMO', bloodGroup: 'A+', units: 2, verified: true, timestamp: new Date() },
        { certificateId: 'BC-003-DEMO', bloodGroup: 'B+', units: 1, verified: true, timestamp: new Date() },
      ]
    })
  }
})

module.exports = router
