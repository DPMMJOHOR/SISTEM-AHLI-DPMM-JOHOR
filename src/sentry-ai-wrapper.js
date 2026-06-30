// ============================================================
// SENTRY AI WRAPPER
// Wraps AI API calls with Sentry monitoring
// ============================================================

import { captureAICall, captureError } from './sentry-config.js';

/**
 * Wrap Groq API call with Sentry monitoring
 */
export async function monitoredGroqCall(apiKey, messages, options = {}) {
  const model = options.model || 'llama3-70b-8192';
  
  try {
    const startTime = Date.now();
    
    // Start Sentry span
    const response = await captureAICall(
      model,
      JSON.stringify(messages),
      null,
      { agentName: 'aiman' }
    );
    
    // Make the actual API call
    const fetchResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        ...options
      })
    });
    
    const data = await fetchResponse.json();
    const duration = Date.now() - startTime;
    
    // Capture token usage if available
    if (data.usage) {
      Sentry.addBreadcrumb({
        category: 'ai',
        message: `Groq call completed`,
        level: 'info',
        data: {
          model,
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
          duration
        }
      });
    }
    
    if (!fetchResponse.ok) {
      throw new Error(`Groq API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    captureError(error, {
      tags: {
        ai_provider: 'groq',
        model
      }
    });
    throw error;
  }
}

/**
 * Wrap Gemini API call with Sentry monitoring
 */
export async function monitoredGeminiCall(apiKey, prompt, options = {}) {
  const model = options.model || 'gemini-1.5-flash';
  
  try {
    const startTime = Date.now();
    
    // Start Sentry span
    const response = await captureAICall(
      model,
      prompt,
      null,
      { agentName: 'aiman' }
    );
    
    // Make the actual API call
    const fetchResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        ...options
      })
    });
    
    const data = await fetchResponse.json();
    const duration = Date.now() - startTime;
    
    // Capture token usage if available
    if (data.usageMetadata) {
      Sentry.addBreadcrumb({
        category: 'ai',
        message: `Gemini call completed`,
        level: 'info',
        data: {
          model,
          inputTokens: data.usageMetadata.promptTokenCount,
          outputTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount,
          duration
        }
      });
    }
    
    if (!fetchResponse.ok) {
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    captureError(error, {
      tags: {
        ai_provider: 'gemini',
        model
      }
    });
    throw error;
  }
}

/**
 * Rate limit tracker for AI API calls
 */
class AIRateLimiter {
  constructor(maxRequestsPerMinute = 60) {
    this.maxRequests = maxRequestsPerMinute;
    this.requests = [];
  }
  
  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = Math.ceil((oldestRequest + 60000 - now) / 1000);
      
      Sentry.captureMessage(`AI rate limit exceeded - wait ${waitTime}s`, {
        level: 'warning',
        tags: {
          ai_provider: 'rate_limiter'
        }
      });
      
      return { allowed: false, waitTime };
    }
    
    this.requests.push(now);
    return { allowed: true, waitTime: 0 };
  }
  
  getRemainingRequests() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);
    return this.maxRequests - this.requests.length;
  }
}

export const aiRateLimiter = new AIRateLimiter(60); // 60 requests per minute

export default {
  monitoredGroqCall,
  monitoredGeminiCall,
  aiRateLimiter
};
