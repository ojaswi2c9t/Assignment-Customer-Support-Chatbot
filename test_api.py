import requests
import json

# Test the customers endpoint
try:
    response = requests.get('http://localhost:3001/api/customers')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")