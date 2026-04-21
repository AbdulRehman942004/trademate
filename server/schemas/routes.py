from typing import Optional
from pydantic import BaseModel, Field


# ── Request ────────────────────────────────────────────────────────────────────

class RouteEvaluationRequest(BaseModel):
    origin_city: str = Field(
        ...,
        description="City of origin in Pakistan",
        examples=["Karachi", "Lahore", "Faisalabad"]
    )
    destination_city: str = Field(
        ...,
        description="Destination city in the USA",
        examples=["Los Angeles", "New York", "Chicago"]
    )
    cargo_type: str = Field(
        ...,
        description="FCL_20 | FCL_40 | FCL_40HC | LCL | AIR",
        examples=["FCL_40HC"]
    )
    cargo_value_usd: float = Field(
        ...,
        gt=0,
        description="Total declared cargo value in USD"
    )
    hs_code: Optional[str] = Field(
        None,
        description="HS code (first 2–6 digits) for duty calculation",
        examples=["6109", "6204"]
    )
    # Required for LCL
    cargo_volume_cbm: Optional[float] = Field(
        None,
        gt=0,
        description="Cargo volume in CBM (required for LCL)"
    )
    # Required for AIR
    cargo_weight_kg: Optional[float] = Field(
        None,
        gt=0,
        description="Cargo weight in kg (required for AIR)"
    )
    # Cargo dimensions for air volumetric weight (optional)
    cargo_length_cm: Optional[float] = Field(None, gt=0)
    cargo_width_cm: Optional[float] = Field(None, gt=0)
    cargo_height_cm: Optional[float] = Field(None, gt=0)
    # Number of containers (FCL only — multiplies per-container costs)
    container_count: int = Field(
        default=1,
        ge=1,
        description="Number of FCL containers. Freight, THC, and drayage are multiplied by this value."
    )
    # Optimization preference: 0 = minimize time, 1 = minimize cost
    cost_weight: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="0 = prioritize speed, 1 = prioritize cost"
    )


# ── Response ───────────────────────────────────────────────────────────────────

class CostBreakdown(BaseModel):
    inland_haulage:        float
    origin_thc:            float
    ocean_air_freight_min: float
    ocean_air_freight_max: float
    transshipment_thc:     float
    fixed_charges:         float
    destination_thc:       float
    customs_broker:        float
    drayage:               float
    hmf:                   float
    mpf:                   float
    import_duty:           float
    total_min:             float
    total_max:             float


class TransitBreakdown(BaseModel):
    inland_days:       float
    sea_air_days_min:  int
    sea_air_days_max:  int
    port_processing:   int
    customs_days:      int
    total_min:         float
    total_max:         float


class RouteAlert(BaseModel):
    level:   str   # "info" | "warning" | "critical"
    message: str


class RouteResult(BaseModel):
    id:                str
    name:              str
    mode:              str
    origin_port:       str
    hubs:              list[str]
    destination_ports: list[str]
    carriers:          list[str]
    frequency_per_week: int
    reliability_score: float
    cost:              CostBreakdown
    transit:           TransitBreakdown
    score:             float          # normalized weighted score (lower = better)
    tag:               Optional[str]  # "cheapest" | "fastest" | "balanced" | None
    alerts:            list[RouteAlert]
    rate_source:       str = "static" # "live" | "static"


class RouteEvaluationResponse(BaseModel):
    origin_city:      str
    destination_city: str
    cargo_type:       str
    cargo_value_usd:  float
    hs_code:          Optional[str]
    duty_rate_pct:    float
    cost_weight:      float
    routes:           list[RouteResult]
    recommended:      dict[str, str]   # {cheapest, fastest, balanced} → route id
    disclaimer:       str
