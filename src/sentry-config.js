// ============================================================
// SENTRY CONFIGURATION
// Configures Sentry for error tracking and AI monitoring
// ============================================================

import * as Sentry from '@sentry/node';

// Initialize Sentry for Node.js (server-side)
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn('SENTRY_DSN not configured - Sentry disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    
    // Set traces sample rate to 1.0 to capture 100% of transactions
    // In production, this should be lower (e.g., 0.1) to reduce cost
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Enable AI monitoring integrations
    integrations: [
      // Add AI-specific integrations when AI SDKs are detected
      // Sentry.openAIIntegration(), // Uncomment when using OpenAI
      // Sentry.anthropicAIIntegration(), // Uncomment when using Anthropic
    ],
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry event (dev mode):', event);
        return null;
      }
      
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
        environment: process.env.NODE_ENV || 'development'
      }
    }
  });
  
  console.log('Sentry initialized');
}

// Capture AI API call
export function captureAICall(model, prompt, response, metadata = {}) {
  Sentry.startSpan({
    op: 'gen_ai.request',
    name: `AI request: ${model}`,
    attributes: {
      'gen_ai.request.model': model,
      'gen_ai.request.messages': JSON.stringify([{ role: 'user', content: prompt }]),
      'gen_ai.usage.input_tokens': metadata.inputTokens || 0,
      'gen_ai.usage.output_tokens': metadata.outputTokens || 0,
      'gen_ai.agent.name': metadata.agentName || 'aiman',
    }
  }, async (span) => {
    // The actual AI call happens here
    // This span will track duration and token usage
    return response;
  });
}

// Capture error with context
export function captureError(error, context = {}) {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      ...context.tags
    }
  });
}

// Capture message
export function captureMessage(message, level = 'info') {
  Sentry.captureMessage(message, {
    level
  });
}

// Set user context
export function setUser(user) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name
  });
}

// Clear user context
export function clearUser() {
  Sentry.setUser(null);
}

export default {
  initSentry,
  captureAICall,
  captureError,
  captureMessage,
  setUser,
  clearUser
};
