import requests

data = {
    "west": 21.15,
    "south": 45.72,
    "east": 21.35,
    "north": 45.78,
    "start_date": "2025-04-01",
    "end_date": "2025-04-26"
}
try:
    print("Triggering real scan...")
    resp = requests.post("http://localhost:8000/api/scan/", json=data)
    print(f"Status: {resp.status_code}")
    print(resp.json())
except Exception as e:
    print(f"Error: {e}")
