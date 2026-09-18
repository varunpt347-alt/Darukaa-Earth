"""
Session-based Multi-Turn Memory with SQLite Persistence
Stores conversation history, cumulative environmental parameters, and turn states.
Persists across page refreshes and demo restarts.
"""

import sqlite3
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "sessions.sqlite")

class SessionMemoryManager:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP,
                    cumulative_context TEXT
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    sender TEXT,
                    text TEXT,
                    structured_payload TEXT,
                    recommendation_payload TEXT,
                    timestamp TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
                )
            """)
            conn.commit()

    def get_or_create_session(self, session_id: str) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT session_id, cumulative_context FROM sessions WHERE session_id = ?", (session_id,))
            row = cursor.fetchone()
            if row:
                try:
                    context = json.loads(row[1]) if row[1] else {}
                except Exception:
                    context = {}
                return {"session_id": row[0], "cumulative_context": context}
            else:
                now = datetime.utcnow().isoformat()
                cursor.execute(
                    "INSERT INTO sessions (session_id, created_at, updated_at, cumulative_context) VALUES (?, ?, ?, ?)",
                    (session_id, now, now, json.dumps({}))
                )
                conn.commit()
                return {"session_id": session_id, "cumulative_context": {}}

    def update_cumulative_context(self, session_id: str, new_parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merges new incoming environmental variables into the cumulative session state.
        Allows follow-up refinement (e.g. updating only 'land_use' to 'agroforestry'
        while preserving 'soil_organic_carbon_pct' and 'rainfall').
        """
        session = self.get_or_create_session(session_id)
        current = session["cumulative_context"]

        for k, v in new_parameters.items():
            if v is not None:
                current[k] = v

        now = datetime.utcnow().isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE sessions SET cumulative_context = ?, updated_at = ? WHERE session_id = ?",
                (json.dumps(current), now, session_id)
            )
            conn.commit()

        return current

    def append_message(self, session_id: str, sender: str, text: str, structured_payload: Optional[Dict] = None, recommendation_payload: Optional[Dict] = None):
        self.get_or_create_session(session_id)
        now = datetime.utcnow().isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO messages (session_id, sender, text, structured_payload, recommendation_payload, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                session_id,
                sender,
                text,
                json.dumps(structured_payload) if structured_payload else None,
                json.dumps(recommendation_payload) if recommendation_payload else None,
                now
            ))
            conn.commit()

    def get_messages(self, session_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT sender, text, structured_payload, recommendation_payload, timestamp
                FROM messages WHERE session_id = ? ORDER BY id ASC
            """, (session_id,))
            rows = cursor.fetchall()
            messages = []
            for r in rows:
                messages.append({
                    "sender": r[0],
                    "text": r[1],
                    "structured_payload": json.loads(r[2]) if r[2] else None,
                    "recommendation_payload": json.loads(r[3]) if r[3] else None,
                    "timestamp": r[4]
                })
            return messages

    def list_sessions(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT session_id, created_at, updated_at, cumulative_context FROM sessions ORDER BY updated_at DESC")
            rows = cursor.fetchall()
            results = []
            for r in rows:
                results.append({
                    "session_id": r[0],
                    "created_at": r[1],
                    "updated_at": r[2],
                    "cumulative_context": json.loads(r[3]) if r[3] else {}
                })
            return results
