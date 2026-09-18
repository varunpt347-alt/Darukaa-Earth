"""
Hybrid RAG & Retrieval Engine
Combines:
1. Vector similarity search across summarized scientific documents (FAO, IPCC, USDA, IPBES).
2. Structured threshold lookup against quantitative agroecological databases.
3. Geographical climate inference from lat/lon coordinates.
"""

import json
import math
import os
import re
from typing import Dict, Any, List, Tuple

class HybridRAGEngine:
    def __init__(self, data_dir: str = "/data"):
        self.data_dir = data_dir
        self.knowledge_chunks: List[Dict[str, Any]] = []
        self.thresholds: Dict[str, Any] = {}
        self._load_datasets()

    def _load_datasets(self):
        kb_path = os.path.join(self.data_dir, "knowledge_base.json")
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                self.knowledge_chunks = json.load(f)
        else:
            # Fallback if relative path
            fallback = os.path.join(os.path.dirname(__file__), "..", "data", "knowledge_base.json")
            if os.path.exists(fallback):
                with open(fallback, "r", encoding="utf-8") as f:
                    self.knowledge_chunks = json.load(f)

        thresh_path = os.path.join(self.data_dir, "structured_thresholds.json")
        if os.path.exists(thresh_path):
            with open(thresh_path, "r", encoding="utf-8") as f:
                self.thresholds = json.load(f)
        else:
            fallback = os.path.join(os.path.dirname(__file__), "..", "data", "structured_thresholds.json")
            if os.path.exists(fallback):
                with open(fallback, "r", encoding="utf-8") as f:
                    self.thresholds = json.load(f)

    def infer_climate_from_coords(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Bonus feature: Inactive climate zone inference from geo-coordinates.
        Approximates Köppen-Geiger zones based on latitudinal bands and continental arid zones.
        """
        abs_lat = abs(lat)
        zone = "Temperate Sub-Humid"
        rainfall_est = "600 - 900 mm/year"
        
        # Tropical belt
        if abs_lat < 15:
            zone = "Humid Tropical"
            rainfall_est = "1200 - 2400 mm/year"
        # Subtropical dry belt / Mediterranean / Semi-Arid (e.g. Sahel, Middle East, Southwest US, Mediterranean basin, Indus basin)
        elif 15 <= abs_lat <= 38:
            if (20 <= lon <= 85) or (-120 <= lon <= -100) or (115 <= lon <= 145 and lat < -20):
                zone = "Semi-Arid to Arid"
                rainfall_est = "200 - 450 mm/year"
            else:
                zone = "Subtropical / Mediterranean"
                rainfall_est = "400 - 700 mm/year"
        elif 38 < abs_lat <= 55:
            zone = "Temperate Continental"
            rainfall_est = "500 - 850 mm/year"
        else:
            zone = "Boreal / Cold Arid"
            rainfall_est = "250 - 450 mm/year"

        return {
            "latitude": lat,
            "longitude": lon,
            "inferred_climate_zone": zone,
            "estimated_annual_rainfall": rainfall_est,
            "source": "Global Köppen-Geiger Climate Classification model approximation"
        }

    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-\.]{2,}\b', text)]

    def search_knowledge_chunks(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Cosine similarity search over knowledge base chunks using TF-IDF term weights.
        """
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return self.knowledge_chunks[:top_k]

        # Compute document frequencies
        doc_count = len(self.knowledge_chunks)
        df: Dict[str, int] = {}
        for chunk in self.knowledge_chunks:
            tokens = set(self._tokenize(chunk["content"] + " " + " ".join(chunk.get("keywords", []))))
            for t in tokens:
                df[t] = df.get(t, 0) + 1

        # Score chunks
        scored_chunks: List[Tuple[float, Dict[str, Any]]] = []
        for chunk in self.knowledge_chunks:
            full_text = chunk["content"] + " " + " ".join(chunk.get("keywords", [])) + " " + chunk.get("source", "")
            chunk_tokens = self._tokenize(full_text)
            chunk_set = set(chunk_tokens)
            
            score = 0.0
            for qt in query_tokens:
                if qt in chunk_set:
                    idf = math.log((doc_count + 1) / (df.get(qt, 0) + 1)) + 1.0
                    tf = chunk_tokens.count(qt) / len(chunk_tokens)
                    score += tf * idf * 10.0
                    
                    # Exact domain/keyword boost
                    if qt in chunk.get("keywords", []):
                        score += 3.0

            # Add source relevance boost
            scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, chunk in scored_chunks[:top_k]:
            item = dict(chunk)
            item["retrieval_score"] = round(float(score), 3)
            results.append(item)
        return results

    def lookup_structured_thresholds(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Matches empirical user environmental metrics against FAO/IPCC scientific thresholds.
        """
        matches = []
        domains = self.thresholds.get("domains", {})

        # Soil Organic Carbon Check
        soc = metrics.get("soil_organic_carbon_pct")
        if soc is not None:
            soc_rules = domains.get("soil_health", {}).get("organic_carbon_pct", {})
            if soc < 0.6:
                rule = soc_rules.get("critical_low", {})
                matches.append({
                    "variable": "soil_organic_carbon_pct",
                    "value": f"{soc}%",
                    "classification": "Critical Low (<0.6%)",
                    "status": rule.get("status"),
                    "hazard": rule.get("hazard"),
                    "scientific_source": rule.get("source")
                })
            elif 0.6 <= soc <= 1.5:
                rule = soc_rules.get("moderate", {})
                matches.append({
                    "variable": "soil_organic_carbon_pct",
                    "value": f"{soc}%",
                    "classification": "Sub-optimal (0.6% - 1.5%)",
                    "status": rule.get("status"),
                    "hazard": rule.get("hazard"),
                    "scientific_source": rule.get("source")
                })

        # Land Use Check
        land_use = str(metrics.get("land_use") or "").lower()
        crop = str(metrics.get("crop") or "").lower()
        land_rules = domains.get("land_use", {})
        
        if "monoculture" in land_use or "wheat" in crop or "wheat" in land_use:
            rule = land_rules.get("monoculture_wheat", {})
            matches.append({
                "variable": "land_use",
                "value": "Monoculture Wheat",
                "biodiversity_score": rule.get("biodiversity_score"),
                "habitat_fragmentation_risk": rule.get("habitat_fragmentation_risk"),
                "pollinator_support": rule.get("pollinator_support"),
                "soil_erosion_rate": f"{rule.get('soil_erosion_rate_t_ha_yr')} t/ha/yr",
                "scientific_source": rule.get("source")
            })

        # Climate / Rainfall Check
        rainfall = str(metrics.get("rainfall") or "").lower()
        climate = str(metrics.get("region_climate") or "").lower()
        climate_rules = domains.get("climate_zones", {})
        
        if "semi-arid" in climate or "semi-arid" in rainfall or "low" in rainfall:
            rule = climate_rules.get("semi-arid", {})
            matches.append({
                "variable": "climate_rainfall",
                "value": "Semi-Arid Low Rainfall (<500mm)",
                "evapotranspiration_ratio": rule.get("evapotranspiration_ratio"),
                "vulnerability": rule.get("vulnerability"),
                "recommended_intervention": rule.get("key_intervention"),
                "scientific_source": rule.get("source")
            })

        # Pesticide Check
        pest = metrics.get("pesticide_intensity_kg_ha")
        if pest and pest > 2.0:
            p_rule = domains.get("human_impact_metrics", {}).get("pesticide_intensity", {}).get("high_hazard", {})
            matches.append({
                "variable": "pesticide_intensity",
                "value": f"{pest} kg a.i./ha",
                "hazard": p_rule.get("effect"),
                "scientific_source": p_rule.get("source")
            })

        return matches

    def hybrid_retrieve(self, query: str, structured_metrics: Dict[str, Any] = None, top_k: int = 4) -> Dict[str, Any]:
        """
        Executes hybrid retrieval: Vector Search + Structured Threshold Lookup + Coordinates inference.
        """
        metrics = structured_metrics or {}
        chunks = self.search_knowledge_chunks(query, top_k=top_k)
        threshold_matches = self.lookup_structured_thresholds(metrics)

        climate_inference = None
        if metrics.get("lat") is not None and metrics.get("lon") is not None:
            climate_inference = self.infer_climate_from_coords(metrics["lat"], metrics["lon"])

        return {
            "query": query,
            "inferred_climate": climate_inference,
            "matched_thresholds": threshold_matches,
            "retrieved_knowledge_chunks": chunks
        }
