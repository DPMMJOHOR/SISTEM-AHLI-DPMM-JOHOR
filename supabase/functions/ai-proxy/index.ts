import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  try {
    const { provider, type, model, messages, image, prompt, options } = await req.json();
    
    // Move environment variable access inside handler
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!provider) {
      return new Response(JSON.stringify({ error: 'Provider is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    let apiKey;
    let response;

    if (provider === 'groq') {
      apiKey = GROQ_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Use vision model for vision requests, chat model for regular chat
      const groqModel = type === 'vision' 
        ? (model || 'llama-3.2-90b-vision-preview')
        : (model || 'llama-3.3-70b-versatile');

      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: groqModel,
          messages,
          max_tokens: 800,
          ...options
        })
      });
    } else if (provider === 'gemini') {
      apiKey = GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Gemini API
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          ...options
        })
      });
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported provider' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return new Response(JSON.stringify({ 
        error: error?.error?.message || `API error ${response.status}` 
      }), {
        status: response.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
