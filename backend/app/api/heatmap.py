"""
API route: GET /api/heatmap?date=YYYY-MM-DD

Returns a synthetic-but-deterministic GeoJSON heatmap for any requested date.
Used by the frontend time-slider to display historical pollution levels without
re-running the full scan pipeline. Seeded by date so the same date is reproducible.
"""
from __future__ import annotations

from datetime import date as Date
from typing import Any

import numpy as np
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/heatmap", tags=["heatmap"])

# Demo region: Bega canal, Timișoara
DEMO_BBOX = (21.20, 45.74, 21.30, 45.77)

# Known pollution hotspot locations for the demo
HOTSPOTS = [
    {"lat": 45.755, "lon": 21.285, "intensity": 0.18},  # East industrial zone
    {"lat": 45.748, "lon": 21.215, "intensity": 0.09},  # West Bega
]


@router.get("/")
def get_heatmap(date: str = Query(default=str(Date.today()))) -> dict[str, Any]:
    """
    Generate a reproducible pollution heatmap for the given ISO date.
    The synthetic data simulates a Sentinel-2 NDCI / turbidity scan.
    """
    west, south, east, north = DEMO_BBOX
    nx, ny = 35, 25
    rng = np.random.default_rng(abs(hash(date)) % (2 ** 32))

    lons_1d = np.linspace(west, east, nx)
    lats_1d = np.linspace(south, north, ny)
    lons, lats = np.meshgrid(lons_1d, lats_1d)

    # Base noise
    ndci = rng.uniform(-0.1, 0.02, (ny, nx))
    turbidity = rng.uniform(0.95, 1.1, (ny, nx))

    # Add pollution blobs around known hotspot locations
    for hs in HOTSPOTS:
        dist = np.sqrt((lats - hs["lat"]) ** 2 + (lons - hs["lon"]) ** 2)
        bloom = hs["intensity"] * np.exp(-dist / 0.006)
        ndci += bloom
        turbidity += bloom * 0.5

    features = []
    for i in range(ny):
        for j in range(nx):
            nd = float(ndci[i, j])
            tb = float(turbidity[i, j])
            pollution = float(np.clip(nd * 5 + max(0, tb - 1.0) * 2, 0, 1))
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(float(lons[i, j]), 6), round(float(lats[i, j]), 6)],
                },
                "properties": {
                    "ndci": round(nd, 4),
                    "turbidity": round(tb, 4),
                    "pollution": round(pollution, 4),
                },
            })

    return {"type": "FeatureCollection", "features": features, "date": date}
