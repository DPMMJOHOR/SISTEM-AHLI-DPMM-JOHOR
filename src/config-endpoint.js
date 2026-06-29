import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.CONFIG_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // Max 100 requests per window

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key);
    }
  }
  
  // Get or create rate limit entry
  const entry = rateLimitMap.get(ip) || { count: 0, timestamp: now };
  
  if (now - entry.timestamp > RATE_LIMIT_WINDOW) {
    // Reset if window expired
    entry.count = 0;
    entry.timestamp = now;
  }
  
  entry.count++;
  rateLimitMap.set(ip, entry);
  
  // Check if limit exceeded
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    const resetTime = entry.timestamp + RATE_LIMIT_WINDOW;
    const retryAfter = Math.ceil((resetTime - now) / 1000);
    
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter
    });
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX_REQUESTS - entry.count);
  res.setHeader('X-RateLimit-Reset', entry.timestamp + RATE_LIMIT_WINDOW);
  
  next();
}

// Apply rate limiting to all routes
app.use(rateLimit);

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
}

// 404 handler
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
}

// Generate CSP nonce
function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

// CSP nonce middleware
app.use((req, res, next) => {
  res.locals.nonce = generateNonce();
  next();
});

// CSRF token generation
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF token middleware
app.use((req, res, next) => {
  // Generate new CSRF token for each request
  res.locals.csrfToken = generateCsrfToken();
  next();
});

// HTTPS enforcement middleware
function enforceHttps(req, res, next) {
  // Only enforce in production
  if (process.env.NODE_ENV === 'production') {
    if (req.protocol === 'http' && !req.secure) {
      const httpsUrl = `https://${req.headers.host}${req.url}`;
      return res.redirect(301, httpsUrl);
    }
  }
  next();
}

// Apply HTTPS enforcement
app.use(enforceHttps);

// Security headers middleware
function securityHeaders(req, res, next) {
  // HSTS header (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

// Apply security headers
app.use(securityHeaders);

// Security logging middleware
function securityLogger(req, res, next) {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const method = req.method;
  const path = req.path;
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // Log security-relevant events
  if (logLevel === 'debug' || logLevel === 'info') {
    console.log(`[${timestamp}] ${ip} ${method} ${path} - ${userAgent}`);
  }
  
  // Log suspicious activity
  if (path.includes('..') || path.includes('%2e%2e')) {
    console.warn(`[${timestamp}] SUSPICIOUS: Path traversal attempt from ${ip}: ${path}`);
  }
  
  // Log rate limit hits
  const originalJson = res.json;
  res.json = function(data) {
    if (data && data.error && data.error.includes('Too many requests')) {
      console.warn(`[${timestamp}] RATE_LIMIT: ${ip} exceeded rate limit`);
    }
    return originalJson.call(this, data);
  };
  
  next();
}

// Apply security logging
app.use(securityLogger);

// Configuration endpoint - returns only safe, non-sensitive values
app.get('/api/config', (req, res) => {
  try {
    // Return safe configuration values only
    // API keys remain server-side and are never exposed
    const safeConfig = {
      supabaseUrl: process.env.SUPABASE_URL || null,
      // Never expose SUPABASE_ANON_KEY or other secrets
      // These are used server-side for backend API calls only
      environment: process.env.NODE_ENV || 'development',
      apiVersion: '1.0.0',
      // CSP nonce for inline scripts
      cspNonce: res.locals.nonce,
      // EmailJS configuration (service and template IDs are not secrets)
      emailjs: {
        serviceId: process.env.EMAILJS_SERVICE_ID || null,
        templateAdmin: process.env.EMAILJS_TEMPLATE_ADMIN || null,
        templateApplicant: process.env.EMAILJS_TEMPLATE_APPLICANT || null
      },
      // Admin contact information (not secrets)
      admin: {
        email: process.env.ADMIN_EMAIL || null,
        whatsapp: process.env.ADMIN_WHATSAPP || null
      },
      // Feature flags
      features: {
        captcha: !!process.env.TURNSTILE_SITE_KEY,
        csrf: true,
        rateLimit: true,
        fileUpload: true
      },
      // Turnstile site key for CAPTCHA
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
      // CSRF token for form protection
      csrfToken: res.locals.csrfToken
    };

    res.json({
      success: true,
      config: safeConfig
    });
  } catch (error) {
    console.error('Configuration endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load configuration'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Apply error handlers (must be after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`Configuration server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
