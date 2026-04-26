"""SQLModel table definitions for alerts and citizen reports."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class PollutionType(str, Enum):
    ALGAL_BLOOM = "ALGAL_BLOOM"
    TURBIDITY = "TURBIDITY"
    CHEMICAL = "CHEMICAL"
    FOAM = "FOAM"
    OIL_SLICK = "OIL_SLICK"
    OTHER = "OTHER"


class AlertSource(str, Enum):
    SATELLITE = "satellite"
    CITIZEN = "citizen"


class Alert(SQLModel, table=True):
    """Satellite-detected pollution event."""
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    lat: float
    lon: float
    ndci_max: float
    turbidity_max: float
    severity: Severity
    pollution_type: PollutionType
    area_ha: float
    source: AlertSource = AlertSource.SATELLITE
    scene_date: str  # ISO date of the Sentinel-2 acquisition
    description: str = ""
    # ML anomaly detection fields (additive, optional)
    ml_anomaly_score: Optional[float] = Field(default=None)
    ml_confidence: Optional[int] = Field(default=None)
    ml_pollution_type: Optional[str] = Field(default=None)
    ml_model: Optional[str] = Field(default=None)


class CitizenReport(SQLModel, table=True):
    """Ground-truth report submitted by a citizen via Galileo GNSS positioning."""
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    lat: float
    lon: float
    pollution_type: PollutionType
    description: str
    photo_url: Optional[str] = None
