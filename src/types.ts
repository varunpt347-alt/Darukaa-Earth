export interface EnvironmentalInput {
  soil_organic_carbon_pct?: number;
  soil_ph?: number;
  soil_moisture_pct?: number;
  nitrogen_kgha?: number;
  land_use?: string;
  crop?: string;
  rainfall?: string;
  annual_rainfall_mm?: number;
  region_climate?: string;
  pesticide_intensity_kg_ha?: number;
  lat?: number;
  lon?: number;
}

export interface KnowledgeChunk {
  id: string;
  title?: string;
  domain?: string;
  subdomain?: string;
  source: string;
  content: string;
  keywords?: string[];
  metrics?: string[];
  retrieval_score?: number;
}

export interface MatchedThreshold {
  variable: string;
  value: string;
  classification?: string;
  status?: string;
  hazard?: string;
  biodiversity_score?: number;
  habitat_fragmentation_risk?: string;
  pollinator_support?: string;
  soil_erosion_rate?: string;
  recommended_intervention?: string;
  scientific_source?: string;
}

export interface InferredClimate {
  latitude: number;
  longitude: number;
  inferred_climate_zone: string;
  estimated_annual_rainfall: string;
  source: string;
}

export interface RecommendationResponse {
  is_clarifying_question: boolean;
  clarifying_question?: string | null;
  missing_domains: string[];
  recommendation?: string | null;
  why_it_works?: string | null;
  impacted_metrics?: string | null;
  time_horizon?: string | null;
  confidence_level?: string | null;
  source?: string | null;
  variables_traced: string[];
  causal_chain: string[];
  retrieved_sources: KnowledgeChunk[];
  session_context: Record<string, any>;
  inferred_climate?: InferredClimate | null;
  matched_thresholds?: MatchedThreshold[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  structured_payload?: EnvironmentalInput;
  recommendation_payload?: RecommendationResponse;
}

export interface SessionInfo {
  session_id: string;
  created_at: string;
  updated_at: string;
  cumulative_context: EnvironmentalInput;
}
