"""
Darukaa.Earth AI Environmental Scientist Automated Test Suite
Evaluates:
- Case 1: The exact brief benchmark scenario (SOC 0.3%, low rainfall, monoculture wheat, semi-arid)
- Case 2: Incomplete input triggering clarifying questions (completeness checker)
- Case 3: Multi-turn memory persistence and cumulative context combination
- Case 4: Follow-up refinement updating a single variable
- Case 5: High chemical load / pesticide runoff scenario with riparian buffer recommendation
- Case 6: Structured JSON input matching Pydantic schema
- Case 7: /debug/retrieve endpoint inspection for evaluators
"""

try:
    import pytest
except ImportError:
    pytest = None

import os
import sys
import uuid

# Ensure backend root in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.engine import EnvironmentalScientistEngine
from backend.models import EnvironmentalInput

def get_engine():
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
    return EnvironmentalScientistEngine(data_dir=data_dir)

if pytest:
    @pytest.fixture
    def engine():
        return get_engine()

def test_case_1_brief_exact_benchmark(engine):
    sid = f"benchmark_test_{uuid.uuid4().hex[:6]}"
    res = engine.process_turn(
        session_id=sid,
        text="My farm has 0.3% soil organic carbon, low rainfall, monoculture wheat in a semi-arid region."
    )
    
    assert res["is_clarifying_question"] is False
    assert res["recommendation"] is not None
    assert "agroforestry" in res["recommendation"].lower() or "intercrop" in res["recommendation"].lower()
    
    # Verify measurable numbers and impact
    assert "%" in res["impacted_metrics"]
    assert "soil organic carbon" in res["impacted_metrics"].lower() or "soc" in res["impacted_metrics"].lower()
    
    # Verify scientific citation (FAO, IPCC)
    source_lower = res["source"].lower()
    assert "fao" in source_lower or "ipcc" in source_lower
    
    # Verify multi-metric tracing constraint (at least 3 environmental variables)
    assert len(res["variables_traced"]) >= 3
    assert len(res["causal_chain"]) >= 3

def test_case_2_completeness_checker_clarifying_question(engine):
    sid = f"incomplete_session_{uuid.uuid4().hex[:6]}"
    res = engine.process_turn(
        session_id=sid,
        text="Biodiversity is declining on my land"
    )
    
    assert res["is_clarifying_question"] is True
    assert res["clarifying_question"] is not None
    assert len(res["missing_domains"]) >= 2
    # Ensure it asks for soil and rainfall/climate
    q_lower = res["clarifying_question"].lower()
    assert "soil" in q_lower
    assert "rainfall" in q_lower or "climate" in q_lower

def test_case_3_multi_turn_context_tracking(engine):
    sid = f"multi_turn_test_{uuid.uuid4().hex[:6]}"
    
    # Turn 1
    t1 = engine.process_turn(sid, text="Our soil test showed 0.3% soil organic carbon.")
    assert t1["is_clarifying_question"] is True
    assert "0.3" in str(t1["session_context"].get("soil_organic_carbon_pct"))

    # Turn 2
    t2 = engine.process_turn(sid, text="We grow monoculture wheat in a low rainfall semi-arid climate.")
    assert t2["is_clarifying_question"] is False
    assert t2["recommendation"] is not None
    
    # Context combined from turn 1 and turn 2
    assert t2["session_context"]["soil_organic_carbon_pct"] == 0.3
    assert "wheat" in t2["session_context"]["crop"] or "monoculture" in t2["session_context"]["land_use"]
    assert len(t2["variables_traced"]) >= 3

def test_case_4_follow_up_refinement(engine):
    sid = f"refinement_test_{uuid.uuid4().hex[:6]}"
    # Seed prior state
    engine.process_turn(sid, text="0.3% SOC, semi-arid low rainfall, monoculture wheat")
    
    # Follow-up
    res = engine.process_turn(sid, text="What if I switch to agroforestry instead?")
    assert res["is_clarifying_question"] is False
    assert "agroforestry" in res["recommendation"].lower() or "hedgerow" in res["recommendation"].lower()
    assert res["session_context"]["soil_organic_carbon_pct"] == 0.3

def test_case_5_chemical_pollution_riparian_buffer(engine):
    sid = f"pesticide_test_{uuid.uuid4().hex[:6]}"
    res = engine.process_turn(
        session_id=sid,
        text="We apply 4.2 kg pesticide per hectare annually next to a stream on our cropland, with 0.8% SOC in sub-humid climate."
    )
    assert res["is_clarifying_question"] is False
    assert "riparian" in res["recommendation"].lower() or "buffer" in res["recommendation"].lower()
    assert "macroinvertebrate" in res["impacted_metrics"].lower() or "pesticide" in res["impacted_metrics"].lower()
    assert len(res["variables_traced"]) >= 3

def test_case_6_structured_json_input(engine):
    sid = f"json_test_{uuid.uuid4().hex[:6]}"
    structured_payload = {
        "soil_organic_carbon_pct": 0.3,
        "rainfall": "low",
        "land_use": "monoculture_wheat",
        "region_climate": "semi-arid",
        "lat": 31.5,
        "lon": 74.3
    }
    res = engine.process_turn(
        session_id=sid,
        structured_input=structured_payload
    )
    assert res["is_clarifying_question"] is False
    assert res["recommendation"] is not None
    assert "agroforestry" in res["recommendation"].lower() or "legume" in res["recommendation"].lower()

def test_case_7_debug_retrieval(engine):
    retrieval = engine.rag.hybrid_retrieve(
        query="monoculture wheat soil organic carbon semi-arid",
        structured_metrics={"soil_organic_carbon_pct": 0.3, "land_use": "monoculture_wheat", "lat": 32.0, "lon": 75.0}
    )
    assert len(retrieval["retrieved_knowledge_chunks"]) > 0
    assert len(retrieval["matched_thresholds"]) > 0
    assert retrieval["inferred_climate"] is not None

if __name__ == "__main__":
    print("Running test suite directly...")
    e = get_engine()
    test_case_1_brief_exact_benchmark(e)
    print("-> Test 1: Brief exact benchmark PASSED")
    test_case_2_completeness_checker_clarifying_question(e)
    print("-> Test 2: Completeness clarifying question PASSED")
    test_case_3_multi_turn_context_tracking(e)
    print("-> Test 3: Multi-turn context tracking PASSED")
    test_case_4_follow_up_refinement(e)
    print("-> Test 4: Follow-up refinement PASSED")
    test_case_5_chemical_pollution_riparian_buffer(e)
    print("-> Test 5: Chemical pollution & riparian buffer PASSED")
    test_case_6_structured_json_input(e)
    print("-> Test 6: Structured JSON input PASSED")
    test_case_7_debug_retrieval(e)
    print("-> Test 7: Debug retrieval PASSED")
    print("ALL 7 AUTOMATED TEST CASES PASSED SUCCESSFULLY!")
