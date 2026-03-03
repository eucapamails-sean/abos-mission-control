#!/usr/bin/env python3
"""ABOS CGI-bin API — Persistent storage via SQLite"""

import json
import os
import sqlite3
import sys
import uuid
from datetime import datetime
from urllib.parse import parse_qs

# Database path — in the project directory
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "abos.db")

def get_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    db.execute("PRAGMA foreign_keys=ON")
    
    # Create tables if they don't exist
    db.executescript("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id TEXT NOT NULL,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS memory (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_conversations_agent_session ON conversations(agent_id, session_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id);
        CREATE INDEX IF NOT EXISTS idx_memory_agent ON memory(agent_id);
    """)
    return db

def read_body():
    content_length = int(os.environ.get("CONTENT_LENGTH", 0))
    if content_length > 0:
        return json.loads(sys.stdin.read(content_length))
    return {}

def respond(data, status=200):
    print(f"Status: {status}")
    print("Content-Type: application/json")
    print()
    print(json.dumps(data))

def handle_settings(method, query_params, body):
    db = get_db()
    
    if method == "GET":
        rows = db.execute("SELECT key, value FROM settings").fetchall()
        result = {}
        for row in rows:
            try:
                result[row["key"]] = json.loads(row["value"])
            except (json.JSONDecodeError, TypeError):
                result[row["key"]] = row["value"]
        respond(result)
    
    elif method == "POST":
        for key, value in body.items():
            serialized = json.dumps(value) if not isinstance(value, str) else value
            db.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                [key, serialized]
            )
        db.commit()
        respond({"success": True}, 201)
    
    else:
        respond({"error": "Method not allowed"}, 400)

def handle_conversations(method, query_params, body):
    db = get_db()
    
    if method == "GET":
        agent_id = query_params.get("agent_id", [None])[0]
        session_id = query_params.get("session_id", [None])[0]
        
        if agent_id and session_id:
            # Get messages for a specific session
            rows = db.execute(
                "SELECT id, agent_id, session_id, role, content, created_at FROM conversations WHERE agent_id = ? AND session_id = ? ORDER BY created_at ASC",
                [agent_id, session_id]
            ).fetchall()
            respond([dict(r) for r in rows])
        
        elif agent_id:
            # Get all sessions with message counts for an agent
            rows = db.execute(
                "SELECT DISTINCT session_id, COUNT(*) as msg_count FROM conversations WHERE agent_id = ? GROUP BY session_id",
                [agent_id]
            ).fetchall()
            respond([dict(r) for r in rows])
        
        else:
            respond({"error": "agent_id required"}, 400)
    
    elif method == "POST":
        agent_id = body.get("agentId")
        session_id = body.get("sessionId")
        role = body.get("role")
        content = body.get("content")
        
        if not all([agent_id, session_id, role, content]):
            respond({"error": "agentId, sessionId, role, content required"}, 400)
            return
        
        db.execute(
            "INSERT INTO conversations (agent_id, session_id, role, content) VALUES (?, ?, ?, ?)",
            [agent_id, session_id, role, content]
        )
        # Update session message count
        db.execute(
            "UPDATE sessions SET message_count = message_count + 1 WHERE id = ?",
            [session_id]
        )
        db.commit()
        
        row = db.execute("SELECT id, agent_id, session_id, role, content, created_at FROM conversations WHERE rowid = last_insert_rowid()").fetchone()
        respond(dict(row), 201)
    
    else:
        respond({"error": "Method not allowed"}, 400)

def handle_sessions(method, query_params, body):
    db = get_db()
    
    if method == "GET":
        agent_id = query_params.get("agent_id", [None])[0]
        if not agent_id:
            respond({"error": "agent_id required"}, 400)
            return
        
        rows = db.execute(
            "SELECT id, agent_id, title, message_count, created_at FROM sessions WHERE agent_id = ? ORDER BY created_at DESC",
            [agent_id]
        ).fetchall()
        respond([dict(r) for r in rows])
    
    elif method == "POST":
        agent_id = body.get("agentId")
        title = body.get("title", "New Session")
        session_id = body.get("id") or ("s-" + uuid.uuid4().hex[:12])
        
        if not agent_id:
            respond({"error": "agentId required"}, 400)
            return
        
        now = datetime.utcnow().isoformat() + "Z"
        db.execute(
            "INSERT OR REPLACE INTO sessions (id, agent_id, title, message_count, created_at) VALUES (?, ?, ?, 0, ?)",
            [session_id, agent_id, title, now]
        )
        db.commit()
        respond({"id": session_id, "agent_id": agent_id, "title": title, "message_count": 0, "created_at": now}, 201)
    
    else:
        respond({"error": "Method not allowed"}, 400)

def handle_memory(method, query_params, body):
    db = get_db()
    
    if method == "GET":
        agent_id = query_params.get("agent_id", [None])[0]
        if not agent_id:
            # Return all memories
            rows = db.execute("SELECT id, agent_id, key, value, created_at FROM memory ORDER BY created_at DESC").fetchall()
        else:
            rows = db.execute(
                "SELECT id, agent_id, key, value, created_at FROM memory WHERE agent_id = ? ORDER BY created_at DESC",
                [agent_id]
            ).fetchall()
        respond([dict(r) for r in rows])
    
    elif method == "POST":
        agent_id = body.get("agentId")
        key = body.get("key")
        value = body.get("value")
        memory_id = body.get("id") or ("mem-" + uuid.uuid4().hex[:12])
        
        if not all([agent_id, key, value]):
            respond({"error": "agentId, key, value required"}, 400)
            return
        
        now = datetime.utcnow().isoformat() + "Z"
        db.execute(
            "INSERT OR REPLACE INTO memory (id, agent_id, key, value, created_at) VALUES (?, ?, ?, ?, ?)",
            [memory_id, agent_id, key, value, now]
        )
        db.commit()
        respond({"id": memory_id, "agent_id": agent_id, "key": key, "value": value, "created_at": now}, 201)
    
    elif method == "PUT":
        memory_id = body.get("id")
        key = body.get("key")
        value = body.get("value")
        
        if not all([memory_id, key, value]):
            respond({"error": "id, key, value required"}, 400)
            return
        
        now = datetime.utcnow().isoformat() + "Z"
        db.execute(
            "UPDATE memory SET key = ?, value = ?, created_at = ? WHERE id = ?",
            [key, value, now, memory_id]
        )
        db.commit()
        respond({"id": memory_id, "key": key, "value": value, "created_at": now})
    
    elif method == "DELETE":
        memory_id = query_params.get("id", [None])[0]
        if not memory_id:
            respond({"error": "id required"}, 400)
            return
        
        db.execute("DELETE FROM memory WHERE id = ?", [memory_id])
        db.commit()
        respond({"success": True})
    
    else:
        respond({"error": "Method not allowed"}, 400)

def handle_bulk_seed(method, query_params, body):
    """Bulk seed endpoint for initial data population"""
    db = get_db()
    
    if method != "POST":
        respond({"error": "POST only"}, 400)
        return
    
    sessions = body.get("sessions", [])
    conversations = body.get("conversations", [])
    memories = body.get("memories", [])
    
    for s in sessions:
        db.execute(
            "INSERT OR IGNORE INTO sessions (id, agent_id, title, message_count, created_at) VALUES (?, ?, ?, ?, ?)",
            [s["id"], s["agent_id"], s["title"], s.get("message_count", 0), s.get("created_at", datetime.utcnow().isoformat() + "Z")]
        )
    
    for c in conversations:
        db.execute(
            "INSERT INTO conversations (agent_id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
            [c["agent_id"], c["session_id"], c["role"], c["content"], c.get("created_at", datetime.utcnow().isoformat() + "Z")]
        )
    
    for m in memories:
        db.execute(
            "INSERT OR IGNORE INTO memory (id, agent_id, key, value, created_at) VALUES (?, ?, ?, ?, ?)",
            [m["id"], m["agent_id"], m["key"], m["value"], m.get("created_at", datetime.utcnow().isoformat() + "Z")]
        )
    
    db.commit()
    respond({"success": True, "sessions": len(sessions), "conversations": len(conversations), "memories": len(memories)}, 201)

def main():
    method = os.environ.get("REQUEST_METHOD", "GET")
    path_info = os.environ.get("PATH_INFO", "")
    query_string = os.environ.get("QUERY_STRING", "")
    query_params = parse_qs(query_string)
    
    body = {}
    if method in ("POST", "PUT", "PATCH"):
        try:
            body = read_body()
        except Exception:
            body = {}
    
    # Route based on PATH_INFO
    path = path_info.strip("/")
    
    try:
        if path == "settings":
            handle_settings(method, query_params, body)
        elif path == "conversations":
            handle_conversations(method, query_params, body)
        elif path == "sessions":
            handle_sessions(method, query_params, body)
        elif path == "memory":
            handle_memory(method, query_params, body)
        elif path == "bulk-seed":
            handle_bulk_seed(method, query_params, body)
        else:
            respond({"error": f"Unknown endpoint: /{path}", "available": ["/settings", "/conversations", "/sessions", "/memory", "/bulk-seed"]}, 404)
    except Exception as e:
        respond({"error": str(e)}, 422)

if __name__ == "__main__":
    main()
