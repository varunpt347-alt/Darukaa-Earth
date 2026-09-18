"""
Darukaa.Earth AI Biodiversity Intelligence API
FastAPI Backend Application
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMSMiddleware
from typing import Dict, Any, List, Optional
import os

from .models import (
    EnvironmentalInput,
    ChatRequest,
    RecommendationOutput,
    RetrieveDebugRequest,
    RetrieveDebugResponse
)
from .engine import EnvironmentalScientistEngine

app = FastAPI(
    title="Darukaa.Earth AI Biodiversity Intelligence API",
    description="Evidence-backed AI Environmental Scientist conversational system with hybrid RAG and causal reasoning.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = EnvironmentalScientistEngine()

@app.get("/")
def read_root():
    return {
        "system": "Darukaa.Earth AI Environmental Scientist",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Darukaa.Earth Biodiversity Intelligence Engine",
        "rag_knowledge_chunks": len(engine.rag.knowledge_chunks),
        "causal_graph_nodes": len(engine.causal_engine.graph),
        "database": "sqlite3_session_store_active"
    }

@app.post("/api/chat", response_model=RecommendationOutput)
def chat_endpoint(request: ChatRequest):
    structured_dict = request.structured_data.dict() if request.structured_data else None
    result = engine.process_turn(
        session_id=request.session_id,
        text=request.message,
        structured_input=structured_dict
    )
    return result

@app.post("/api/structured-input", response_model=RecommendationOutput)
def structured_input_endpoint(data: EnvironmentalInput, session_id: str = "structured_session"):
    result = engine.process_turn(
        session_id=session_id,
        text=None,
        structured_input=data.dict()
    )
    return result

@app.post("/debug/retrieve", response_model=RetrieveDebugResponse)
def debug_retrieve_endpoint(request: RetrieveDebugRequest):
    retrieval = engine.rag.hybrid_retrieve(
        query=request.query,
        structured_metrics=request.structured_metrics or {},
        top_k=request.top_k
    )
    causal_analysis = engine.causal_engine.evaluate_system(request.structured_metrics or {})

    return {
        "query": request.query,
        "inferred_climate": retrieval.get("inferred_climate"),
        "matched_thresholds": retrieval.get("matched_thresholds", []),
        "retrieved_knowledge_chunks": retrieval.get("retrieved_knowledge_chunks", []),
        "causal_variables_activated": causal_analysis.get("variables_traced", [])
    }

@app.get("/api/sessions")
def list_sessions():
    return engine.memory.list_sessions()

@app.get("/api/sessions/{session_id}")
def get_session(session_id: str):
    session = engine.memory.get_or_create_session(session_id)
    messages = engine.memory.get_messages(session_id)
    return {
        "session": session,
        "messages": messages
    }
