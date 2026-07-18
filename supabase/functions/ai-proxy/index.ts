import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

Deno.serve(async (req: Request) => {
  try {
    const { provider, type, model, messages, image, prompt, options } = await req.json();

    if (!provider) {
      return new Response(JSON.stringify({ error: 'Provider is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let response;
    let apiKey;

    if (provider === 'groq') {
      apiKey = GROQ_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (type === 'vision') {
        // Groq Vision API for Isi Pintar
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model || 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: image } }
              ]
            }],
            temperature: 0.1,
            max_tokens: 512
          })
        });
      } else {
        // Groq Chat API for Aiman
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model || 'llama-3.3-70b-versatile',
            messages,
            max_tokens: 800,
            ...options
          })
        });
      }
    } else if (provider === 'gemini') {
      apiKey = GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
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
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return new Response(JSON.stringify({ 
        error: error?.error?.message || `API error ${response.status}` 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
