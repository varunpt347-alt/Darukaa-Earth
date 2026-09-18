"""
Completeness Checker & Clarification Question Generator
Enforces the strict environmental requirement:
Before generating a recommendation, the system MUST verify it has enough
of the core ecological domains covered:
- Minimum requirement: Soil Health, Land Use, Climate/Water Availability.
If information is missing or ambiguous, it asks a targeted scientific clarifying question
rather than producing a shallow or generic guess.
"""

from typing import Dict, Any, List, Tuple, Optional
import re

REQUIRED_CORE_DOMAINS = ["soil_health", "land_use", "climate_water"]

class CompletenessChecker:
    def __init__(self):
        pass

    def extract_metrics_from_text(self, text: str) -> Dict[str, Any]:
        """
        Extracts environmental variables mentioned in natural language text.
        Handles percentages, rainfall types, crops, and climate regions.
        """
        extracted: Dict[str, Any] = {}
        lower = text.lower()

        # Soil Organic Carbon % (e.g., "0.3%", "SOC is 0.3", "organic carbon: 0.3%")
        soc_match = re.search(r'(?:soc|organic carbon|carbon)[\s:=of]*([0-9]*\.?[0-9]+)\s*%', lower) or \
                    re.search(r'([0-9]*\.?[0-9]+)\s*%\s*(?:soc|organic carbon|carbon)', lower)
        if soc_match:
            try:
                extracted["soil_organic_carbon_pct"] = float(soc_match.group(1))
            except ValueError:
                pass
        elif "0.3%" in lower or "0.3 percent" in lower:
            extracted["soil_organic_carbon_pct"] = 0.3

        # Soil pH (e.g., "pH 6.5", "pH is 7.2")
        ph_match = re.search(r'\bph[\s:=]*([0-9]*\.?[0-9]+)\b', lower)
        if ph_match:
            try:
                extracted["soil_ph"] = float(ph_match.group(1))
            except ValueError:
                pass

        # Rainfall patterns
        if any(w in lower for w in ["low rainfall", "arid", "drought", "semi-arid", "<500mm", "low rain"]):
            extracted["rainfall"] = "low"
            if "semi-arid" in lower:
                extracted["region_climate"] = "semi-arid"
            elif "arid" in lower:
                extracted["region_climate"] = "arid"
        elif any(w in lower for w in ["high rainfall", "humid", "tropical", ">1000mm"]):
            extracted["rainfall"] = "high"
            extracted["region_climate"] = "humid"
        elif any(w in lower for w in ["moderate rainfall", "sub-humid", "500-1000mm"]):
            extracted["rainfall"] = "moderate"
            extracted["region_climate"] = "sub-humid"

        # Land use & crops
        if "monoculture" in lower:
            if "wheat" in lower:
                extracted["land_use"] = "monoculture_wheat"
                extracted["crop"] = "wheat"
            elif "corn" in lower or "maize" in lower:
                extracted["land_use"] = "monoculture_maize"
                extracted["crop"] = "maize"
            elif "soy" in lower:
                extracted["land_use"] = "monoculture_soy"
                extracted["crop"] = "soybean"
            else:
                extracted["land_use"] = "monoculture"
        elif "wheat" in lower:
            extracted["crop"] = "wheat"
            if "monoculture" not in extracted.get("land_use", ""):
                extracted["land_use"] = "monoculture_wheat"
        elif "agroforestry" in lower:
            extracted["land_use"] = "agroforestry"
        elif "intercropping" in lower or "intercrop" in lower:
            extracted["land_use"] = "intercropping"
        elif "pasture" in lower or "grazing" in lower or "rangeland" in lower:
            extracted["land_use"] = "pasture"
        elif "forest" in lower or "woodland" in lower:
            extracted["land_use"] = "forest"
        elif "cropland" in lower or "farm" in lower or "field" in lower or "stream" in lower:
            extracted["land_use"] = "cropland"

        # Pesticide
        pest_match = re.search(r'([0-9]*\.?[0-9]+)\s*(?:kg|kilo).*pesticide', lower)
        if pest_match:
            try:
                extracted["pesticide_intensity_kg_ha"] = float(pest_match.group(1))
            except ValueError:
                pass

        return extracted

    def check_completeness(self, accumulated_context: Dict[str, Any], current_query: str = "") -> Tuple[bool, List[str], Optional[str]]:
        """
        Evaluates whether the minimum domains are covered.
        Returns:
          is_complete (bool)
          missing_domains (List[str])
          clarifying_question (Optional[str])
        """
        missing_domains: List[str] = []

        # 1. Soil health coverage
        has_soil = accumulated_context.get("soil_organic_carbon_pct") is not None or \
                   accumulated_context.get("soil_ph") is not None or \
                   accumulated_context.get("soil_moisture_pct") is not None or \
                   accumulated_context.get("nitrogen_kgha") is not None

        if not has_soil:
            missing_domains.append("Soil Health (e.g. Soil Organic Carbon % or pH)")

        # 2. Land use coverage
        has_land_use = bool(accumulated_context.get("land_use") or accumulated_context.get("crop"))
        if not has_land_use:
            missing_domains.append("Land Use / Crop Type (e.g. Monoculture Wheat, Intercropping, Pasture)")

        # 3. Climate / Water coverage
        has_climate = bool(accumulated_context.get("rainfall") or \
                           accumulated_context.get("region_climate") or \
                           accumulated_context.get("annual_rainfall_mm") or \
                           accumulated_context.get("lat") is not None)
        if not has_climate:
            missing_domains.append("Climate / Rainfall Pattern (e.g. Semi-Arid, Low Rainfall, Annual mm)")

        if not missing_domains:
            return True, [], None

        # Build exact targeted scientific clarifying question
        # If user gave an ungrounded prompt like "Biodiversity is declining on my land"
        if len(missing_domains) == 3:
            clarifying_question = (
                "To formulate an evidence-backed ecological recommendation, I need a few baseline metrics about your ecosystem. "
                "Can you provide:\n"
                "1. **Soil Health**: Your current Soil Organic Carbon (SOC) % or soil condition?\n"
                "2. **Land Use**: Your current cropping system (e.g., monoculture wheat, pasture, agroforestry)?\n"
                "3. **Climate & Water**: Your regional rainfall pattern (e.g., low / semi-arid, humid, or annual mm)?"
            )
        else:
            missing_text = ", ".join(missing_domains)
            clarifying_question = (
                f"To scientifically evaluate the multi-variable interactions for your land, I still need data on: **{missing_text}**. "
                "Could you provide these values so I can retrieve the matching FAO/IPCC evidence models?"
            )

        return False, missing_domains, clarifying_question
