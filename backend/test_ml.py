import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

with TestClient(app) as client:
    print("Test 1: Clean water")
    r1 = client.post("/api/ml/analyze", json={"ndwi": 0.6, "ndci": -0.15, "turbidity": 0.8})
    print(r1.json())

    print("\nTest 2: Polluted water")
    r2 = client.post("/api/ml/analyze", json={"ndwi": 0.3, "ndci": 0.12, "turbidity": 2.5})
    print(r2.json())

    print("\nTest 3: Scan pipeline integration")
    r3 = client.post("/api/scan", json={"west": 21.20, "south": 45.74, "east": 21.30, "north": 45.77})
    res3 = r3.json()
    print("Scan response keys:", res3.keys())
    print("Number of alerts:", len(res3.get("alert_ids", [])))

    # Let's fetch the alerts from the DB to see if ML fields were persisted
    r4 = client.get("/api/alerts")
    alerts = r4.json()
    if alerts:
        print("\nFirst alert details:")
        a = alerts[0]
        print(f"ID: {a['id']}, ML Conf: {a.get('ml_confidence')}, ML Type: {a.get('ml_pollution_type')}")
    else:
        print("\nNo alerts found.")
