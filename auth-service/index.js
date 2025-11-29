require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authController = require('./src/authController');

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Middleware pour logger les headers du gateway
app.use((req, res, next) => {
  console.log('[Gateway Info]', {
    requestId: req.headers['x-request-id'],
    realIp: req.headers['x-real-ip'],
    gateway: req.headers['x-gateway-name']
  });
  next();
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes d'authentification
app.use('/auth', authController);

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Login: POST http://localhost:${PORT}/auth/login`);
  console.log(`📝 Register: POST http://localhost:${PORT}/auth/register`);
});

module.exports = app;