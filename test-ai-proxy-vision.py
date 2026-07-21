import requests
import json

def test_ai_proxy_vision():
    url = 'https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/ai-proxy'
    
    # Test with vision payload (simulating what borang.html sends)
    # Using a public image URL for testing
    image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Vd-Orig.png/100px-Vd-Orig.png"
    
    payload = {
        'provider': 'groq',
        'type': 'vision',
        'model': 'qwen/qwen3.6-27b',
        'messages': [
            {
                'role': 'user', 
                'content': [
                    {'type': 'text', 'text': 'What is in this image?'},
                    {'type': 'image_url', 'image_url': {'url': image_url}}
                ]
            }
        ],
        'max_tokens': 512
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        print("Sending vision request to ai-proxy...")
        print(f"URL: {url}")
        print(f"Model: {payload['model']}")
        print(f"Type: {payload['type']}")
        
        response = requests.post(url, json=payload, headers=headers)
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Body: {response.text[:500]}")  # First 500 chars
        
        if response.status_code == 200:
            print("\n✓ Vision request successful")
        else:
            print(f"\n✗ Vision request failed with status {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ai_proxy_vision()
