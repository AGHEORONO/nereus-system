"""
API route: POST /api/scan

Orchestrates the full pipeline:
  1. Fetch Sentinel-2 L2A bands (openEO or synthetic fallback)
  2. Compute spectral indices (NDWI, NDCI, turbidity)
  3. Detect anomalies within the water mask
  4. Persist Alert rows for significant anomalies
  5. Return heatmap GeoJSON + alert IDs
"""
from __future__ import annotations

import concurrent.futures
import logging
from datetime import date, timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session

from app.config import settings
from app.database import get_session
from app.models import Alert, AlertSource
from app.services.anomaly import detect_anomalies
from app.services.copernicus import fetch_scene, _synthetic_bands
from app.services.indices import compute_ndci, compute_ndwi, compute_turbidity, water_mask

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scan", tags=["scan"])

# Maximum seconds to wait for the openEO fetch before falling back
_OPENEO_TIMEOUT_S = 10


class ScanRequest(BaseModel):
    west: float = 21.20
    south: float = 45.74
    east: float = 21.30
    north: float = 45.77
    start_date: str = str(date.today() - timedelta(days=10))
    end_date: str = str(date.today())


class ScanResponse(BaseModel):
    scene_date: str
    scene_source: str
    heatmap: dict[str, Any]   # GeoJSON FeatureCollection
    alert_ids: list[int]
    statistics: dict[str, float]


@router.post("/", response_model=ScanResponse)
def run_scan(
    req: ScanRequest,
    session: Annotated[Session, Depends(get_session)],
) -> ScanResponse:
    bbox = (req.west, req.south, req.east, req.north)
    used_demo = False

    if settings.is_demo:
        # Fast path — skip openEO entirely
        logger.info("Demo mode active — using synthetic data (no openEO call).")
        bands = _synthetic_bands(bbox, req.start_date)
        used_demo = True
    else:
        # Attempt openEO with a hard timeout; any failure → synthetic fallback
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                future = pool.submit(
                    fetch_scene,
                    bbox=bbox,
                    start_date=req.start_date,
                    end_date=req.end_date,
                    offline=False,
                )
                bands = future.result(timeout=_OPENEO_TIMEOUT_S)
        except Exception as exc:
            logger.warning(
                "openEO fetch failed or timed out (%s) — falling back to synthetic data.",
                exc,
            )
            bands = _synthetic_bands(bbox, req.start_date)
            used_demo = True

    ndwi = compute_ndwi(bands["b03"], bands["b08"])
    wmask = water_mask(ndwi)
    ndci = compute_ndci(bands["b05"], bands["b04"])
    turb = compute_turbidity(bands["b04"], bands["b03"])

    anomalies = detect_anomalies(
        ndci=ndci,
        turbidity=turb,
        mask=wmask,
        lats=bands["lats"],
        lons=bands["lons"],
    )

    # Persist alerts
    alert_ids: list[int] = []
    for a in anomalies:
        alert = Alert(
            lat=a.lat,
            lon=a.lon,
            ndci_max=round(a.ndci_max, 4),
            turbidity_max=round(a.turbidity_max, 4),
            severity=a.severity,
            pollution_type=a.pollution_type,
            area_ha=a.area_ha,
            source=AlertSource.SATELLITE,
            scene_date=bands["scene_date"],
            description=f"Detected via Sentinel-2 scene {bands['scene_date']}. "
                        f"Anomaly area: {a.area_ha} ha.",
        )
        session.add(alert)
        session.commit()
        session.refresh(alert)
        alert_ids.append(alert.id)  # type: ignore[arg-type]

    heatmap = _build_heatmap_geojson(ndci, turb, wmask, bands["lats"], bands["lons"])

    return ScanResponse(
        scene_date=bands["scene_date"],
        scene_source="synthetic" if used_demo else "copernicus",
        heatmap=heatmap,
        alert_ids=alert_ids,
        statistics={
            "ndci_mean": round(float(ndci[wmask].mean()) if wmask.any() else 0, 4),
            "ndci_max": round(float(ndci[wmask].max()) if wmask.any() else 0, 4),
            "turbidity_mean": round(float(turb[wmask].mean()) if wmask.any() else 0, 4),
            "water_pixels": int(wmask.sum()),
            "anomaly_area_ha": sum(a.area_ha for a in anomalies),
        },
    )


def _build_heatmap_geojson(ndci, turb, wmask, lats, lons) -> dict[str, Any]:
    """Convert 2-D index arrays into a GeoJSON FeatureCollection of points."""
    import numpy as np

    features = []
    it = np.nditer([ndci, turb, wmask, lats, lons])
    for nd, tb, wm, la, lo in it:
        if not wm:
            continue
        # Combined pollution score [0-1] for heatmap weight
        pollution = float(np.clip(float(nd) * 5 + max(0, float(tb) - 1.0) * 2, 0, 1))
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [round(float(lo), 6), round(float(la), 6)]},
            "properties": {
                "ndci": round(float(nd), 4),
                "turbidity": round(float(tb), 4),
                "pollution": round(pollution, 4),
                "water": bool(wm),
            },
        })

    return {"type": "FeatureCollection", "features": features}
