import requests
import json

def test_ai_proxy_full():
    url = 'https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/ai-proxy'
    
    # Test with actual buildSystemPrompt from borang.html
    system_prompt = """Anda adalah AIMAN — Wakil Digital Dewan Perniagaan Melayu Malaysia Negeri Johor (DPMMNJ).

Greeting: "Salam, Saya Aiman. Apa yang boleh saya bantu ?"

Jawab soalan pemohon dengan ringkas dan jelas. Guna Bahasa Melayu baku. Sentiasa berbudi bahasa."""
    
    payload = {
        'provider': 'groq',
        'model': 'llama-3.3-70b-versatile',
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': 'Hello, this is a test message.'}
        ],
        'max_tokens': 800
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        print("Sending request to ai-proxy with full system prompt...")
        print(f"URL: {url}")
        print(f"System prompt length: {len(system_prompt)} chars")
        
        response = requests.post(url, json=payload, headers=headers)
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Body: {response.text[:500]}")  # First 500 chars
        
        if response.status_code == 200:
            print("\n✓ Request successful with full system prompt")
        else:
            print(f"\n✗ Request failed with status {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ai_proxy_full()
