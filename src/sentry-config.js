// ============================================================
// SENTRY CONFIGURATION
// Configures Sentry for error tracking and AI monitoring
// ============================================================

// Initialize Sentry for browser
function initSentry() {
  // Check if Sentry DSN is available from config
  var dsn = (typeof window !== 'undefined' && window.CONFIG && window.CONFIG.SENTRY_DSN) ? window.CONFIG.SENTRY_DSN : null;
  
  if (!dsn) {
    console.warn('SENTRY_DSN not configured - Sentry disabled');
    return;
  }

  // Load Sentry SDK dynamically
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@sentry/browser@7.101.1/build/bundle.min.js';
  script.crossOrigin = 'anonymous';
  script.onload = function() {
    if (typeof Sentry !== 'undefined') {
      Sentry.init({
        dsn: dsn,
        environment: (typeof window !== 'undefined' && window.CONFIG && window.CONFIG.SENTRY_ENVIRONMENT) ? window.CONFIG.SENTRY_ENVIRONMENT : 'development',
        
        // Set traces sample rate to 1.0 to capture 100% of transactions
        // In production, this should be lower (e.g., 0.1) to reduce cost
        tracesSampleRate: 0.1,
        
        // Filter out sensitive data
        beforeSend: function(event, hint) {
          // Filter out sensitive data from events
          if (event.request) {
            // Remove passwords from request data
            if (event.request.data) {
              delete event.request.data.password;
              delete event.request.data.kata_laluan;
            }
          }
          
          return event;
        },
        
        // Capture context
        initialScope: {
          tags: {
            project: 'dpmm-johor',
            environment: (typeof window !== 'undefined' && window.CONFIG && window.CONFIG.SENTRY_ENVIRONMENT) ? window.CONFIG.SENTRY_ENVIRONMENT : 'development'
          }
        }
      });
      
      console.log('Sentry initialized');
    }
  };
  script.onerror = function() {
    console.error('Failed to load Sentry SDK');
  };
  document.head.appendChild(script);
}

// Capture error with context
function captureError(error, context) {
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(error, {
      extra: context || {},
      tags: (context && context.tags) ? context.tags : {}
    });
  }
}

// Capture message
function captureMessage(message, level) {
  if (typeof Sentry !== 'undefined') {
    Sentry.captureMessage(message, {
      level: level || 'info'
    });
  }
}

// Set user context
function setUser(user) {
  if (typeof Sentry !== 'undefined') {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name
    });
  }
}

// Clear user context
function clearUser() {
  if (typeof Sentry !== 'undefined') {
    Sentry.setUser(null);
  }
}

// Initialize Sentry on load
if (typeof window !== 'undefined') {
  // Wait for config to load
  if (window.CONFIG) {
    initSentry();
  } else {
    // Retry after a short delay if config isn't ready
    setTimeout(function() {
      if (window.CONFIG) {
        initSentry();
      }
    }, 100);
  }
}
