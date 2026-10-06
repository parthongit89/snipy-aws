# Database Architecture, Security & Data Protection (Security_db.md)
## Project: Sniply — Anti-Overengineering & Real-Time Code Optimization Assistant

---

## 1. Executive Summary

This specification governs the database architecture, connection pooling, encryption protocols, and user data privacy across **Neon PostgreSQL**, the FastAPI backend gateway, and the Chrome/Edge extension.

Sniply pairs real-time algorithmic coaching with **secure, cloud-native telemetry persistence** to enable continuous learning, personalized AI suggestions, and step-by-step progress tracking on `dashboard.html`.

---

## 2. Neon PostgreSQL Database Topology

```mermaid
flowchart TD
    subgraph Client["Chrome & Edge Extension"]
        Worker["Background Service Worker"]
        LocalStorage["chrome.storage.local (Offline Queue)"]
    end

    subgraph Gateway["FastAPI Backend Gateway"]
        Sanitizer["PII & Secret Sanitizer"]
        Pool["Neon Connection Pool (1-10 Conns)"]
    end

    subgraph NeonDB["Neon Cloud PostgreSQL (SSL Enforced)"]
        Users[("sniply_users Table")]
        Opts[("optimizations Table")]
        Metrics[("daily_metrics Table")]
    end

    subgraph Dash["Dashboard & AI Learning"]
        Dashboard["dashboard.html (Live Query)"]
        Learning["AI Personalization Context Engine"]
    end

    Worker -->|Batch Sync (Daily / Working)| Sanitizer
    LocalStorage -.->|Offline Retry| Worker
    Sanitizer --> Pool
    Pool --> Users
    Pool --> Opts
    Pool --> Metrics
    Users --> Dashboard
    Opts --> Dashboard
    Metrics --> Dashboard
    Opts --> Learning
    Learning -.->|User Feedback Weights| Worker
```

---

## 3. Database Schema Architecture

The database is provisioned on **Neon Serverless PostgreSQL** with automated table creation (`init_db()` in `backend/db.py`):

### 3.1 `sniply_users` Table
Tracks user authentication, identity, and activity timestamps:
```sql
CREATE TABLE IF NOT EXISTS sniply_users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 `optimizations` Table
Maintains the chronological step-by-step history of code optimizations:
```sql
CREATE TABLE IF NOT EXISTS optimizations (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128),
    editor_url TEXT,
    language VARCHAR(50) DEFAULT 'python',
    original_complexity VARCHAR(50),
    optimized_complexity VARCHAR(50),
    summary TEXT,
    lines_before INT DEFAULT 0,
    lines_after INT DEFAULT 0,
    reduction_pct INT DEFAULT 0,
    mistakes_detected JSONB DEFAULT '[]'::jsonb,
    syntax_errors_count INT DEFAULT 0,
    model_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_optimizations_uid ON optimizations(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_optimizations_created ON optimizations(created_at DESC);
```

### 3.3 `daily_metrics` Table
Aggregates daily developer performance for the dashboard scorecard:
```sql
CREATE TABLE IF NOT EXISTS daily_metrics (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128),
    metric_date DATE NOT NULL,
    total_fixes INT DEFAULT 0,
    mistakes_count INT DEFAULT 0,
    syntax_errors_count INT DEFAULT 0,
    model_tokens_used INT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(firebase_uid, metric_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_uid_date ON daily_metrics(firebase_uid, metric_date);
```

---

## 4. Connection Pooling & Transport Security

### 4.1 SSL Enforcement
All connections to Neon PostgreSQL enforce TLS/SSL transport encryption (`sslmode=require`):
```python
DEFAULT_DB_URL = "postgresql://neondb_owner:npg_3Mwy8uNStxsb@ep-empty-shape-atx8rqzu-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 4.2 Connection Pool Management
Connections are managed through `psycopg2.pool.SimpleConnectionPool` with automatic context manager release:
```python
@contextmanager
def get_db_connection():
    db_pool = get_db_pool()
    conn = db_pool.getconn()
    try:
        yield conn
    finally:
        db_pool.putconn(conn)
```

---

## 5. Daily & Working Auto-Sync Pipeline

1. **Working Sync**: When an in-editor tooltip is accepted or rejected, the extension emits an event (`ACCEPT` or `REJECT`) to the backend.
2. **Daily Aggregation**: The backend updates the user's `daily_metrics` row for the current date, incrementing fix counts and tokens consumed.
3. **Offline Resilience**: If the user experiences network drops, events are queued in `chrome.storage.local` and flushed when connectivity resumes.
4. **Adaptive Learning**: User acceptance patterns in `optimizations` are mined to personalize subsequent AWS Bedrock prompts, prioritizing optimizations the user favors.

---

## 6. Privacy & User Data Controls

1. **Secret & Key Sanitization**: Pre-ingestion regex filters redact AWS secrets, API keys, passwords, and sensitive tokens from code snippets before storing in `optimizations`.
2. **Right to Erasure (GDPR / CCPA)**: The `/api/v1/user/purge` endpoint allows users to instantly wipe their complete optimization and metric history from Neon DB.
3. **Mandatory Authenticated Developer Mapping**: Every active developer is uniquely identified via their `firebase_uid` in `sniply_users`. This guarantees that code metrics, syntax error logs, and optimization history are strictly attributed to their verified account with database foreign-key integrity.
