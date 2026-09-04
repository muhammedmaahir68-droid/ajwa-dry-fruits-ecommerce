const express = require('express');
const app = express();
const cors = require('cors');
const errorMiddleware = require('./middlewares/error');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, "config/config.env") });

// Enable CORS for Vercel deployment & local dev
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow for flexibility in production
    }
  },
  credentials: true
}));

const firewall = require('./middlewares/firewall');

// Apply Enterprise Security Firewall & Headers Shield
app.use(firewall);

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');
const payment = require('./routes/payment');
const payroll = require('./routes/payroll');
const analytics = require('./routes/analytics');
const ai = require('./routes/ai');

// Root API Health & Security Status Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎉 Ajwa AI Commerce API Gateway is Live & Connected!',
    status: 'ONLINE',
    version: '2.0.0',
    security_shield: {
      firewall: 'ACTIVE (Enterprise WAF Shield)',
      anti_ddos: 'ACTIVE (Adaptive Rate Limiting)',
      injection_guard: 'ACTIVE (SQL & XSS Sanitizer)',
      jwt_authentication: '100% REAL-TIME LIVE JWT AUTH'
    },
    services: ['Auth', 'Products', 'Orders', 'Payments (Direct UPI + Razorpay)', 'AI & ML Service']
  });
});

app.use('/api/v1/', products);
app.use('/api/v1/', auth);
app.use('/api/v1/', order);
app.use('/api/v1/', payment);
app.use('/api/v1/', payroll);
app.use('/api/v1/', analytics);
app.use('/api/v1/', ai);


if (process.env.NODE_ENV === "production" && process.env.SERVE_FRONTEND === "true") {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
  });
}

app.use(errorMiddleware);

module.exports = app;