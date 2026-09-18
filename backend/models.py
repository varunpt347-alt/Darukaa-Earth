from typing import Optional, List, Dict, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

    def Field(default=None, default_factory=None, description=""):
        if default_factory is not None:
            return default_factory()
        return default

class EnvironmentalInput(BaseModel):
    soil_organic_carbon_pct: Optional[float] = Field(None, description="Soil organic carbon percentage (e.g. 0.3%)")
    soil_ph: Optional[float] = Field(None, description="Soil pH value (e.g. 6.8)")
    soil_moisture_pct: Optional[float] = Field(None, description="Volumetric soil moisture percentage")
    nitrogen_kgha: Optional[float] = Field(None, description="Available soil nitrogen in kg/ha")
    
    land_use: Optional[str] = Field(None, description="Land use or crop type, e.g. monoculture_wheat, intercropping, agroforestry")
    crop: Optional[str] = Field(None, description="Specific crop species, e.g. wheat, maize, soybean")
    
    rainfall: Optional[str] = Field(None, description="Rainfall pattern: low, moderate, high or arid, semi-arid, humid")
    annual_rainfall_mm: Optional[float] = Field(None, description="Annual rainfall in mm")
    region_climate: Optional[str] = Field(None, description="Climate region, e.g. semi-arid, arid, sub-humid, Mediterranean")
    
    pesticide_intensity_kg_ha: Optional[float] = Field(None, description="Pesticide active ingredient applied per year")
    lat: Optional[float] = Field(None, description="Latitude for geographical climate inference")
    lon: Optional[float] = Field(None, description="Longitude for geographical climate inference")

class ChatRequest(BaseModel):
    session_id: str = Field(default="default_session", description="Session identifier for multi-turn conversational memory")
    message: Optional[str] = Field(None, description="Free-form user chat query")
    structured_data: Optional[EnvironmentalInput] = Field(None, description="Optional structured environmental parameters")

class RecommendationOutput(BaseModel):
    is_clarifying_question: bool = False
    clarifying_question: Optional[str] = None
    missing_domains: List[str] = Field(default_factory=list)
    
    recommendation: Optional[str] = None
    why_it_works: Optional[str] = None
    impacted_metrics: Optional[str] = None
    time_horizon: Optional[str] = None
    confidence_level: Optional[str] = None
    source: Optional[str] = None
    
    # Evidence and reasoning breakdown for evaluation
    variables_traced: List[str] = Field(default_factory=list)
    causal_chain: List[str] = Field(default_factory=list)
    retrieved_sources: List[Dict[str, Any]] = Field(default_factory=list)
    session_context: Dict[str, Any] = Field(default_factory=dict)

class RetrieveDebugRequest(BaseModel):
    query: str
    structured_metrics: Optional[Dict[str, Any]] = None
    top_k: int = 4

class RetrieveDebugResponse(BaseModel):
    query: str
    inferred_climate: Optional[Dict[str, Any]] = None
    matched_thresholds: List[Dict[str, Any]]
    retrieved_knowledge_chunks: List[Dict[str, Any]]
    causal_variables_activated: List[str]
