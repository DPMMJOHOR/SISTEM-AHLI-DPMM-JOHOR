import requests
import json

def test_ai_proxy():
    url = 'https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/ai-proxy'
    
    # Test with minimal chat payload
    payload = {
        'provider': 'groq',
        'model': 'llama-3.3-70b-versatile',
        'messages': [
            {'role': 'system', 'content': 'You are a helpful assistant.'},
            {'role': 'user', 'content': 'Hello, this is a test message.'}
        ],
        'max_tokens': 100
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        print("Sending request to ai-proxy...")
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, headers=headers)
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("\n✓ Request successful")
        else:
            print(f"\n✗ Request failed with status {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ai_proxy()
