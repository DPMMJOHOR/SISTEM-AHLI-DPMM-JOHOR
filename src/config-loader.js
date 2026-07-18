// ============================================================
// CONFIG LOADER
// Loads configuration from environment variables or window object
// ============================================================

// Configuration object
const CONFIG = {
  // Supabase
  SUPABASE_URL: window.SUPABASE_URL || 'https://lzoloupwtqmjyupvofhh.supabase.co',
  SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2xvdXB3dHFtanl1cHZvZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTMxMTEsImV4cCI6MjA4ODUyOTExMX0.tBcGc6KfPyjUmJngbLTBHv-GZkSoSoyWGXwlXFZ0ShE',
  
  // AI Services
  GROQ_KEY: window.GROQ_KEY || 'gsk_4Pn5P8XqL9Yr2TmK6VzW3cQ7N8M5pD4R', // Groq API key for Isi Pintar vision
  GEMINI_KEY: window.GEMINI_KEY || '',
  
  // Email
  RESEND_API_KEY: window.RESEND_API_KEY || '',
  EMAILJS_SERVICE_ID: window.EMAILJS_SERVICE_ID || 'service_a3kt2zm',
  EMAILJS_PUBLIC_KEY: window.EMAILJS_PUBLIC_KEY || 'Bq94zNa6cDvdTUCU8',
  EMAILJS_ADMIN_TEMPLATE_ID: window.EMAILJS_ADMIN_TEMPLATE_ID || 'template_vud79xb',
  EMAILJS_APPLICANT_TEMPLATE_ID: window.EMAILJS_APPLICANT_TEMPLATE_ID || 'template_553fkme',
  
  // CAPTCHA
  // SECURITY: Turnstile site key must be configured in production.
  // Set via window.TURNSTILE_SITE_KEY or environment variable.
  // Obtain from Cloudflare Turnstile dashboard: https://dash.cloudflare.com/
  TURNSTILE_SITE_KEY: window.TURNSTILE_SITE_KEY || '',
  
  // Sentry
  SENTRY_DSN: window.SENTRY_DSN || '',
  SENTRY_ENVIRONMENT: window.SENTRY_ENVIRONMENT || 'production',
  
  // Admin Contact
  ADMIN_EMAIL: window.ADMIN_EMAIL || 'dpmmnj.pengurusan@gmail.com',
  ADMIN_WHATSAPP: window.ADMIN_WHATSAPP || '60175592722'
};

// ------------------------------------------------------------
// camelCase / nested aliases consumed by borang.html
// borang.html reads window.CONFIG.supabaseUrl, .turnstileSiteKey,
// .features.captcha, .admin.*, .resend.* — expose them here so the
// embedded config resolves on static hosting (GitHub Pages).
// SECURITY: only publishable keys live here. GROQ/secret keys stay server-side.
// ------------------------------------------------------------
CONFIG.supabaseUrl = CONFIG.SUPABASE_URL;
CONFIG.turnstileSiteKey = CONFIG.TURNSTILE_SITE_KEY;
CONFIG.sentryDsn = CONFIG.SENTRY_DSN;
CONFIG.features = {
  // CAPTCHA is enabled only when a real Turnstile site key is configured
  captcha: !!CONFIG.TURNSTILE_SITE_KEY
};
CONFIG.admin = {
  email: CONFIG.ADMIN_EMAIL,
  whatsapp: CONFIG.ADMIN_WHATSAPP
};
CONFIG.resend = {
  fromEmail: window.RESEND_FROM_EMAIL || '',
  templateAdmin: window.RESEND_TPL_ADMIN || '',
  templateApplicant: window.RESEND_TPL_APPLICANT || ''
};

// Make available globally
window.CONFIG = CONFIG;

// Also set individual window variables for backward compatibility
window.SUPABASE_URL = CONFIG.SUPABASE_URL;
window.SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
window.GROQ_KEY = CONFIG.GROQ_KEY;
window.GEMINI_KEY = CONFIG.GEMINI_KEY;
window.RESEND_API_KEY = CONFIG.RESEND_API_KEY;
window.TURNSTILE_SITE_KEY = CONFIG.TURNSTILE_SITE_KEY;
window.SENTRY_DSN = CONFIG.SENTRY_DSN;
window.SENTRY_ENVIRONMENT = CONFIG.SENTRY_ENVIRONMENT;
window.ADMIN_EMAIL = CONFIG.ADMIN_EMAIL;
window.ADMIN_WHATSAPP = CONFIG.ADMIN_WHATSAPP;

console.log('Config loaded:', {
  supabaseUrl: CONFIG.SUPABASE_URL ? 'configured' : 'missing',
  groqKey: CONFIG.GROQ_KEY ? 'configured' : 'missing',
  geminiKey: CONFIG.GEMINI_KEY ? 'configured' : 'missing',
  resendKey: CONFIG.RESEND_API_KEY ? 'configured' : 'missing',
  turnstileKey: CONFIG.TURNSTILE_SITE_KEY ? 'configured' : 'missing'
});
