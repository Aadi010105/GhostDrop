/**
 * GhostDrop Backend Server
 * Secure, Ephemeral, Collaborative File Sharing Platform
 */

require('dotenv').config();
console.log("ENV loaded:", process.env.JWT_SECRET ? "yes" : "no");

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const prisma = require('./utils/prisma');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const Roles = require('./config/roles');
const fileRoutes = require('./routes/fileRoutes');
const folderRoutes = require('./routes/folderRoutes');
const shareRoutes = require('./routes/shareRoutes');
const uploadProgressHandler = require('./socketHandlers/uploadProgressHandler');

const app = express();
app.set('trust proxy', 1);
const server = createServer(app);

// --- Socket.IO setup ---
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = (
        process.env.CORS_ORIGIN ||
        "http://localhost:5173,http://127.0.0.1:8080,http://localhost:8080"
      ).split(',');
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  logger.info(`[Socket] User connected: ${socket.id}`);
  uploadProgressHandler(io, socket);
});

// --- Middleware --- //

// Security headers
app.use(helmet());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- CORS setup for API routes ---
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = (
      process.env.CORS_ORIGIN ||
      "http://localhost:5173,http://127.0.0.1:8080,http://localhost:8080"
    ).split(',');
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "x-client-id", "x-client-secret"]
}));

// Handle preflight OPTIONS requests globally
app.options('*', cors());

// --- Rate limiting middleware ---
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/shares', shareRoutes);

// Apply rate limiting
app.use('/api/', limiter);

// --- Example protected route ---
app.get('/api/protected', authMiddleware([Roles.ADMIN, Roles.OWNER]), (req, res) => {
  logger.info(`Protected route accessed by user: ${req.auth.userId}`);
  res.json({
    message: 'This is a protected resource for ADMINs/OWNERs',
    userId: req.auth.userId,
    userRole: req.auth.role
  });
});

// --- Health & status endpoints ---
app.get('/health', (req, res) => {
  logger.info('Health check requested.');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/status', (req, res) => {
  logger.info('API status requested.');
  res.json({
    message: 'GhostDrop API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root API route
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the GhostDrop API!',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// --- Error handling ---
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack, path: req.path });
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.'
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found.`
  });
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`🚀 GhostDrop Backend Server running on port ${PORT}`);
});

module.exports = { app, server, io };
