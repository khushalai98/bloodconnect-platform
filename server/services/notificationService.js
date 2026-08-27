// ── Notification Service ──
// TAD Section 2: "Dispatches SMS (Twilio) and push (FCM); delivery tracking"
// Decoupled from request path via async dispatch

// ── Notification Queue (in-memory, Redis in production) ──
const notificationQueue = []
let isProcessing = false

/**
 * Add notification job to queue (async — non-blocking)
 */
const enqueue = (job) => {
  notificationQueue.push({ ...job, enqueuedAt: Date.now(), attempts: 0 })
  if (!isProcessing) processQueue()
}

/**
 * Process notification queue
 */
const processQueue = async () => {
  isProcessing = true
  while (notificationQueue.length > 0) {
    const job = notificationQueue.shift()
    try {
      await dispatch(job)
    } catch (err) {
      // Retry up to 3 times
      if (job.attempts < 3) {
        job.attempts++
        notificationQueue.push(job)
      } else {
        console.error(`❌ Notification failed after 3 attempts:`, job.type)
      }
    }
  }
  isProcessing = false
}

/**
 * Dispatch a single notification
 */
const dispatch = async (job) => {
  switch (job.channel) {
    case 'sms':
      await sendSMS(job.phone, job.message)
      break
    case 'push':
      await sendPushNotification(job.deviceToken, job.title, job.message)
      break
    case 'socket':
      // Real-time via Socket.io (handled separately)
      break
    default:
      console.warn(`Unknown notification channel: ${job.channel}`)
  }
  await logDelivery(job)
}

// ── SMS via Twilio ──
const sendSMS = async (phone, message) => {
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'your_twilio_sid') {
    // Demo mode — log only
    console.log(`📱 [DEMO SMS] To: ${phone} | Message: ${message.substring(0, 60)}...`)
    return { success: true, demo: true }
  }

  try {
    const twilio = require('twilio')
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: phone,
    })
    console.log(`📱 SMS sent: ${result.sid}`)
    return { success: true, sid: result.sid }
  } catch (err) {
    console.error(`📱 SMS failed:`, err.message)
    throw err
  }
}

// ── Push via Firebase FCM ──
const sendPushNotification = async (deviceToken, title, body) => {
  if (!process.env.FIREBASE_SERVER_KEY || process.env.FIREBASE_SERVER_KEY === 'your_firebase_key') {
    console.log(`🔔 [DEMO PUSH] Title: ${title} | Body: ${body.substring(0, 60)}...`)
    return { success: true, demo: true }
  }

  try {
    const fetch = require('node-fetch')
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: deviceToken,
        notification: { title, body },
        priority: 'high',
      }),
    })
    const data = await response.json()
    return { success: data.success === 1 }
  } catch (err) {
    console.error(`🔔 Push failed:`, err.message)
    throw err
  }
}

// ── Delivery Tracking ──
const logDelivery = async (job) => {
  try {
    const { NotificationLog } = require('../models')
    await NotificationLog.findOneAndUpdate(
      { recipientId: job.recipientId, requestId: job.requestId },
      { responseStatus: 'delivered', $set: { deliveredAt: new Date() } }
    )
  } catch (_) {
    // Non-blocking
  }
}

// ── Notification Templates ──
const TEMPLATES = {
  EMERGENCY_SOS: (bloodGroup, location, urgency) =>
    `🆘 BLOODCONNECT ALERT: ${urgency.toUpperCase()} need for ${bloodGroup} blood near ${location}. Can you donate? Reply YES or visit app.`,

  NEAR_EXPIRY: (bloodGroup, daysLeft, bankName) =>
    `⚠️ BloodConnect: ${bloodGroup} blood at ${bankName} expires in ${daysLeft} days. Prioritize usage or arrange redistribution.`,

  LOW_STOCK: (bloodGroup, units, bankName) =>
    `🚨 BloodConnect: ${bloodGroup} stock at ${bankName} is critically low (${units} units). Immediate donor outreach recommended.`,

  DONATION_CONFIRMED: (donorName, bankName, certId) =>
    `✅ BloodConnect: Thank you ${donorName}! Your donation at ${bankName} is confirmed. Certificate: ${certId}`,

  ELIGIBILITY_REMINDER: (donorName, date) =>
    `🩸 BloodConnect: Hi ${donorName}, you're eligible to donate again from ${date}! Your blood saves lives.`,

  TRUST_SCORE_LOW: (donorName, score) =>
    `ℹ️ BloodConnect: Hi ${donorName}, your reliability score is ${score}/100. Respond to alerts to improve your score.`,
}

// ── Public API ──

/**
 * Send emergency SOS notification to a donor
 */
const notifyDonorSOS = (donor, request) => {
  const message = TEMPLATES.EMERGENCY_SOS(
    request.bloodGroup,
    request.location?.description || 'nearby',
    request.urgencyLevel
  )
  enqueue({
    channel: 'sms',
    phone: donor.phone,
    message,
    recipientId: donor._id,
    requestId: request._id,
    type: 'EMERGENCY_SOS',
  })
}

/**
 * Notify bank about near-expiry stock
 */
const notifyNearExpiry = (bankContact, bloodGroup, daysLeft, bankName) => {
  enqueue({
    channel: 'sms',
    phone: bankContact,
    message: TEMPLATES.NEAR_EXPIRY(bloodGroup, daysLeft, bankName),
    type: 'NEAR_EXPIRY',
  })
}

/**
 * Notify bank about low stock
 */
const notifyLowStock = (bankContact, bloodGroup, units, bankName) => {
  enqueue({
    channel: 'sms',
    phone: bankContact,
    message: TEMPLATES.LOW_STOCK(bloodGroup, units, bankName),
    type: 'LOW_STOCK',
  })
}

/**
 * Confirm donation — notify donor with certificate
 */
const notifyDonationConfirmed = (donor, bankName, certId) => {
  enqueue({
    channel: 'sms',
    phone: donor.phone,
    message: TEMPLATES.DONATION_CONFIRMED(donor.name, bankName, certId),
    recipientId: donor._id,
    type: 'DONATION_CONFIRMED',
  })
}

module.exports = {
  enqueue,
  notifyDonorSOS,
  notifyNearExpiry,
  notifyLowStock,
  notifyDonationConfirmed,
  TEMPLATES,
  getQueueLength: () => notificationQueue.length,
}
