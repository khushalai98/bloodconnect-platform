const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

// ── Security Middleware ──
const { apiLimiter, sanitizeInput } = require('./middleware/rateLimiter')

const app = express()
const server = http.createServer(app)

// ── Production CORS Origins ──
// Accepts: local dev + Vercel preview + custom domain
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,                          // Custom domain
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true)
    // Allow Vercel preview URLs (*.vercel.app)
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}

// ── Socket.io Setup ──
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],  // Fallback for proxies
})

// ── Core Middleware ──
app.use(cors(corsOptions))
app.use(express.json({ limit: '10kb' })) // Limit payload size
app.use(sanitizeInput)                   // NoSQL injection prevention
app.use('/api/', apiLimiter)             // Global API rate limiting

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

// ── MongoDB Connection ──
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bloodconnect'

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('⚠️  MongoDB not connected (running in demo mode):', err.message))

// ── Routes (TAD §5 — versioned at /api/v1/) ──
const authRoutes = require('./routes/auth')
const donorRoutes = require('./routes/donors')
const inventoryRoutes = require('./routes/inventory')
const emergencyRoutes = require('./routes/emergency')
const adminRoutes = require('./routes/admin')
const ledgerRoutes = require('./routes/ledger')

// v1 versioned routes (TAD §5)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/donors', donorRoutes)
app.use('/api/v1/inventory', inventoryRoutes)
app.use('/api/v1/requests', emergencyRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/donations', ledgerRoutes)

// Backward-compatible aliases (no breaking changes)
app.use('/api/auth', authRoutes)
app.use('/api/donors', donorRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/admin', adminRoutes)

// ── Health Check (TAD §6 — all services) ──
const { getQueueLength } = require('./services/notificationService')
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected (demo mode)'
  res.json({
    status: 'online',
    version: 'v1',
    platform: 'BloodConnect PS-01',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      api:             'online',
      database:        dbStatus,
      socket:          'online',
      matchingEngine:  'online',
      notificationQueue: `online (${getQueueLength()} queued)`,
      ledger:          'online',
      mlPrediction:    'offline (Phase 2)',  // Graceful degradation (TAD §6)
    },
    endpoints: '/api/v1/',
  })
})
app.get('/api/v1/health', (req, res) => res.redirect('/api/health'))

// ── Socket.io Events ──
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  // Join room based on role
  socket.on('join-room', (room) => {
    socket.join(room)
    console.log(`📢 ${socket.id} joined room: ${room}`)
  })

  // Emergency SOS broadcast
  socket.on('emergency-sos', (data) => {
    console.log(`🆘 SOS broadcast: ${data.bloodGroup} at ${data.location}`)
    // Broadcast to all blood banks and donors
    io.to('blood-banks').emit('new-emergency', data)
    io.to('donors').emit('new-emergency', data)
    socket.emit('sos-acknowledged', {
      message: 'SOS broadcast sent to all connected blood banks and eligible donors',
      timestamp: new Date().toISOString()
    })
  })

  // Inventory update
  socket.on('inventory-update', (data) => {
    io.to('hospitals').emit('inventory-updated', data)
    console.log(`📦 Inventory updated: ${data.bloodGroup} at ${data.bankId}`)
  })

  // Donor response to alert
  socket.on('donor-response', (data) => {
    io.to(`request-${data.requestId}`).emit('donor-responded', data)
    console.log(`🩸 Donor responded: ${data.donorId} for request ${data.requestId}`)
  })

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`)
  })
})

// ── Start Server ──
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🩸 BloodConnect PS-01 Server       ║
  ║   Running on: http://localhost:${PORT}   ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚══════════════════════════════════════╝
  `)
})

module.exports = { app, io }
