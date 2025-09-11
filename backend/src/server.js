/**
 * GhostDrop Backend Server
 * Secure, Ephemeral, Collaborative File Sharing Platform
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger'); // We'll create this next

const app = express();
const server = createServer(app);

// Placeholder for Socket.IO authentication middleware
// const authenticateSocket = (socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) {
//     return next(new Error('Authentication error: Token missing.'));
//   }
//   // In a real scenario, validate the Clerk JWT here
//   try {
//     // const decoded = jwt.verify(token, process.env.CLERK_JWT_SECRET);
//     // socket.user = decoded; // Attach user info to socket
//     next();
//   } catch (error) {
//     next(new Error('Authentication error: Invalid token.'));
//   }
// };

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});

// Apply Socket.IO authentication middleware (if uncommented)
// io.use(authenticateSocket);

// --- Middleware --- //

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "x-client-id", "x-client-secret"]
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100), // Max 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again after an hour.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply to all requests that start with /api/
app.use('/api/', limiter);

// --- Health and Readiness Endpoints --- //

app.get('/health', (req, res) => {
  logger.info('Health check requested.');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'GhostDrop backend is operational.'
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

// --- Root API Route (Example) --- //
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the GhostDrop API!',
    version: '1.0.0',
    docs: '/api-docs' // Placeholder for future API documentation
  });
});

// --- Socket.IO connection handling --- //
io.on('connection', (socket) => {
  logger.info(`User connected to Socket.IO: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected from Socket.IO: ${socket.id}`);
  });

  // Add more socket event handlers here as needed for real-time features
});

// --- Error Handling Middleware --- //
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack, path: req.path });
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.'
  });
});

// --- 404 Handler --- //
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found.`
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`🚀 GhostDrop Backend Server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔗 API status: http://localhost:${PORT}/api/status`);
  logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export app and server for testing purposes
module.exports = { app, server, io };
