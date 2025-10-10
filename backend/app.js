const express = require('express');
const cors = require('cors');

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// CORS configuration - allow development ports
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc)
    if (!origin) return callback(null, true);
    
    // Allow localhost with any port for development
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    
    // Allow local network IPs with development ports
    if (/^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) || 
        /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// JSON parsing with size limit
app.use(express.json({ limit: '10mb' }));

// Rate limiting for requests
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, []);
  }
  
  const requests = requestCounts.get(clientIP);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  validRequests.push(now);
  requestCounts.set(clientIP, validRequests);
  
  next();
});

// Clean up old rate limit data every 5 minutes
setInterval(() => {
  const now = Date.now();
  requestCounts.forEach((requests, ip) => {
    const validRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    if (validRequests.length === 0) {
      requestCounts.delete(ip);
    } else {
      requestCounts.set(ip, validRequests);
    }
  });
}, 5 * 60 * 1000);

module.exports = app;