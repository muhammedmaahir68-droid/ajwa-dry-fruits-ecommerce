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

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');
const payment = require('./routes/payment');
const payroll = require('./routes/payroll');
const analytics = require('./routes/analytics');

// Root API Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎉 Ajwa Dry Fruits Backend API is Live & Connected!',
    status: 'ONLINE',
    version: '1.0.0'
  });
});

app.use('/api/v1/', products);
app.use('/api/v1/', auth);
app.use('/api/v1/', order);
app.use('/api/v1/', payment);
app.use('/api/v1/', payroll);
app.use('/api/v1/', analytics);


if (process.env.NODE_ENV === "production" && process.env.SERVE_FRONTEND === "true") {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
  });
}

app.use(errorMiddleware);

module.exports = app;