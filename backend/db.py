import os
import json
import logging
from contextlib import contextmanager
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor

logger = logging.getLogger("sniply-db")

DATABASE_URL = os.getenv("DATABASE_URL", "")

_pool = None

def get_db_pool():
    global _pool
    if _pool is None:
        if not DATABASE_URL:
            logger.warning("DATABASE_URL environment variable is not configured. Neon PostgreSQL is disabled.")
            raise ValueError("DATABASE_URL environment variable is required for database operations.")
        try:
            logger.info("Initializing Neon PostgreSQL connection pool...")
            _pool = pool.SimpleConnectionPool(
                minconn=1,
                maxconn=10,
                dsn=DATABASE_URL
            )
            logger.info("Neon PostgreSQL connection pool initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize database pool: {e}")
            raise
    return _pool

@contextmanager
def get_db_connection():
    db_pool = get_db_pool()
    conn = db_pool.getconn()
    try:
        yield conn
    finally:
        db_pool.putconn(conn)

def init_db():
    """Create initial tables if they do not exist."""
    create_tables_sql = """
    CREATE TABLE IF NOT EXISTS sniply_users (
        id SERIAL PRIMARY KEY,
        firebase_uid VARCHAR(128) UNIQUE NOT NULL,
        email VARCHAR(255),
        display_name VARCHAR(255),
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

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

    CREATE INDEX IF NOT EXISTS idx_optimizations_uid ON optimizations(firebase_uid);
    CREATE INDEX IF NOT EXISTS idx_optimizations_created ON optimizations(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_daily_metrics_uid_date ON daily_metrics(firebase_uid, metric_date);

    -- Dynamic schema migrations for existing tables
    ALTER TABLE optimizations ADD COLUMN IF NOT EXISTS code_snippet TEXT;
    ALTER TABLE optimizations ADD COLUMN IF NOT EXISTS full_optimized_code TEXT;
    ALTER TABLE optimizations ADD COLUMN IF NOT EXISTS line_changes JSONB DEFAULT '[]'::jsonb;

    ALTER TABLE sniply_users ADD COLUMN IF NOT EXISTS custom_preferences TEXT DEFAULT '';
    ALTER TABLE sniply_users ADD COLUMN IF NOT EXISTS preferred_languages JSONB DEFAULT '["Python"]'::jsonb;
    ALTER TABLE sniply_users ADD COLUMN IF NOT EXISTS ai_mode VARCHAR(50) DEFAULT 'anti-overengineering';
    ALTER TABLE sniply_users ADD COLUMN IF NOT EXISTS context_window INT DEFAULT 150;
    ALTER TABLE sniply_users ADD COLUMN IF NOT EXISTS pref_theme BOOLEAN DEFAULT true;
    ALTER TABLE sniply_users ADD COLUMN IF NOT EXISTS pref_auto_suggestions BOOLEAN DEFAULT false;
    ALTER TABLE sniply_users ADD COLUMN IF NOT EXISTS daily_tokens INT DEFAULT 10;
    ALTER TABLE sniply_users ADD COLUMN IF NOT EXISTS tokens_last_reset DATE DEFAULT CURRENT_DATE;
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(create_tables_sql)
            conn.commit()
            logger.info("Neon PostgreSQL schema checked and ready.")
    except Exception as e:
        logger.error(f"Error during init_db: {e}")

def upsert_user(firebase_uid, email=None, display_name=None, photo_url=None):
    sql = """
    INSERT INTO sniply_users (firebase_uid, email, display_name, photo_url, last_active)
    VALUES (%s, %s, %s, %s, NOW())
    ON CONFLICT (firebase_uid)
    DO UPDATE SET
        email = COALESCE(EXCLUDED.email, sniply_users.email),
        display_name = COALESCE(EXCLUDED.display_name, sniply_users.display_name),
        photo_url = COALESCE(EXCLUDED.photo_url, sniply_users.photo_url),
        last_active = NOW()
    RETURNING id, firebase_uid, email, display_name, photo_url, created_at, last_active;
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (firebase_uid, email, display_name, photo_url))
            user = cur.fetchone()
        conn.commit()
        return dict(user) if user else None

def record_optimization(firebase_uid, editor_url, language, original_complexity, optimized_complexity,
                        summary, lines_before, lines_after, reduction_pct, mistakes_detected,
                        syntax_errors_count, model_id, code_snippet=None, full_optimized_code=None, line_changes=None):
    sql = """
    INSERT INTO optimizations (
        firebase_uid, editor_url, language, original_complexity, optimized_complexity,
        summary, lines_before, lines_after, reduction_pct, mistakes_detected,
        syntax_errors_count, model_id, code_snippet, full_optimized_code, line_changes, created_at
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
    RETURNING id, created_at;
    """
    daily_sql = """
    INSERT INTO daily_metrics (firebase_uid, metric_date, total_fixes, mistakes_count, syntax_errors_count, model_tokens_used, last_updated)
    VALUES (%s, CURRENT_DATE, 1, %s, %s, 150, NOW())
    ON CONFLICT (firebase_uid, metric_date)
    DO UPDATE SET
        total_fixes = daily_metrics.total_fixes + 1,
        mistakes_count = daily_metrics.mistakes_count + EXCLUDED.mistakes_count,
        syntax_errors_count = daily_metrics.syntax_errors_count + EXCLUDED.syntax_errors_count,
        model_tokens_used = daily_metrics.model_tokens_used + 150,
        last_updated = NOW();
    """
    uid_key = firebase_uid or "guest"
    mistake_inc = len(mistakes_detected) if mistakes_detected else 0

    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (
                firebase_uid, editor_url, language, original_complexity, optimized_complexity,
                summary, lines_before, lines_after, reduction_pct, json.dumps(mistakes_detected or []),
                syntax_errors_count, model_id, code_snippet, full_optimized_code, json.dumps(line_changes or [])
            ))
            res = cur.fetchone()

            cur.execute(daily_sql, (uid_key, mistake_inc, syntax_errors_count))
        conn.commit()
        return dict(res) if res else None

def record_feedback(firebase_uid, action="ACCEPT", line_code=None, reason=None):
    """Logs user accept/reject feedback to Neon PostgreSQL for adaptive learning."""
    uid_key = firebase_uid or "guest"
    is_accept = 1 if action.upper() == "ACCEPT" else 0
    sql = """
    INSERT INTO daily_metrics (firebase_uid, metric_date, total_fixes, mistakes_count, syntax_errors_count, model_tokens_used, last_updated)
    VALUES (%s, CURRENT_DATE, %s, 0, 0, 50, NOW())
    ON CONFLICT (firebase_uid, metric_date)
    DO UPDATE SET
        total_fixes = daily_metrics.total_fixes + %s,
        last_updated = NOW();
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (uid_key, is_accept, is_accept))
            conn.commit()
            logger.info(f"Feedback {action} recorded in Neon DB for user {uid_key}")
            return True
    except Exception as e:
        logger.error(f"Error logging feedback to Neon DB: {e}")
        return False

def get_user_stats(firebase_uid=None):
    """
    Returns aggregated stats for circular gauges:
    - fixes_pct (scaled incrementally: 1 fix = 1%, starting strictly at 0%)
    - mistakes_pct (scaled incrementally per mistake detected, starting strictly at 0%)
    - syntax_pct (scaled incrementally per syntax error, starting strictly at 0%)
    - usage_pct (Sniply.ai Bedrock rate limit usage up to 100 reviews)
    - total_fixes (count of runs)
    - recent_optimizations
    """
    MAX_REVIEWS_LIMIT = 100

    # If no specific user ID is provided, strictly return fresh 0% baseline
    if not firebase_uid:
        return {
            "total_fixes": 0,
            "fixes_pct": 0,
            "mistakes_pct": 0,
            "syntax_pct": 0,
            "usage_pct": 0,
            "max_limit": MAX_REVIEWS_LIMIT,
            "remaining_reviews": MAX_REVIEWS_LIMIT,
            "is_rate_limited": False,
            "recent_optimizations": []
        }

    stats_sql = """
    SELECT
        COUNT(*) AS total_runs,
        COALESCE(SUM(CASE WHEN reduction_pct > 0 THEN 1 ELSE 0 END), 0) AS total_improved,
        COALESCE(SUM(CASE WHEN jsonb_array_length(mistakes_detected) > 0 THEN jsonb_array_length(mistakes_detected) ELSE 0 END), 0) AS total_mistakes_count,
        COALESCE(SUM(syntax_errors_count), 0) AS total_syntax_errors
    FROM optimizations
    WHERE firebase_uid = %s;
    """

    recent_sql = """
    SELECT id, language, original_complexity, optimized_complexity, summary,
           lines_before, lines_after, reduction_pct, mistakes_detected, created_at, editor_url,
           code_snippet, full_optimized_code, line_changes
    FROM optimizations
    WHERE firebase_uid = %s
    ORDER BY created_at DESC
    LIMIT 20;
    """

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(stats_sql, (firebase_uid,))
                agg = cur.fetchone() or {}

                cur.execute(recent_sql, (firebase_uid,))
                recent = cur.fetchall() or []
    except Exception as e:
        logger.error(f"Error executing stats SQL for {firebase_uid}: {e}")
        agg = {}
        recent = []

    total_runs = agg.get("total_runs", 0) or 0
    total_improved = agg.get("total_improved", 0) or 0
    total_mistakes = agg.get("total_mistakes_count", 0) or 0
    total_syntax = agg.get("total_syntax_errors", 0) or 0

    # Rate limit: 100 reviews max per user (= 100% usage limit)
    usage_pct = min(100, int((total_runs / MAX_REVIEWS_LIMIT) * 100))
    is_rate_limited = (usage_pct >= 100)

    # Initial state per user starts with 0% and increases incrementally with usage
    if total_runs > 0:
        # Scale incrementally (e.g. 1 fix = 1%, not jumping to 100% on 1 review)
        fixes_pct = min(100, int(total_improved))
        mistakes_pct = min(100, int(total_mistakes))
        syntax_pct = min(100, int(total_syntax))
    else:
        fixes_pct = 0
        mistakes_pct = 0
        syntax_pct = 0
        usage_pct = 0

    return {
        "total_fixes": total_runs,
        "fixes_pct": fixes_pct,
        "mistakes_pct": mistakes_pct,
        "syntax_pct": syntax_pct,
        "usage_pct": usage_pct,
        "max_limit": MAX_REVIEWS_LIMIT,
        "remaining_reviews": max(0, MAX_REVIEWS_LIMIT - total_runs),
        "is_rate_limited": is_rate_limited,
        "recent_optimizations": [dict(r) for r in recent]
    }

def save_user_preferences(firebase_uid, prefs):
    """Saves custom coding rules, preferred languages, and assistant settings."""
    if not firebase_uid:
        return False
    sql = """
    UPDATE sniply_users
    SET
        custom_preferences = COALESCE(%s, custom_preferences),
        preferred_languages = COALESCE(%s, preferred_languages),
        ai_mode = COALESCE(%s, ai_mode),
        context_window = COALESCE(%s, context_window),
        pref_theme = COALESCE(%s, pref_theme),
        pref_auto_suggestions = COALESCE(%s, pref_auto_suggestions),
        last_active = NOW()
    WHERE firebase_uid = %s;
    """
    custom_prefs = prefs.get("custom_preferences")
    pref_langs = json.dumps(prefs.get("preferred_languages")) if "preferred_languages" in prefs else None
    ai_mode = prefs.get("ai_mode")
    ctx_win = min(150, int(prefs.get("context_window", 150))) if "context_window" in prefs else None
    pref_theme = prefs.get("pref_theme")
    pref_auto = prefs.get("pref_auto_suggestions")

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (custom_prefs, pref_langs, ai_mode, ctx_win, pref_theme, pref_auto, firebase_uid))
            conn.commit()
            return True
    except Exception as e:
        logger.error(f"Error saving user preferences: {e}")
        return False

def get_user_preferences(firebase_uid):
    """Retrieves saved user preferences."""
    if not firebase_uid:
        return {}
    sql = """
    SELECT custom_preferences, preferred_languages, ai_mode, context_window, pref_theme, pref_auto_suggestions,
           daily_tokens, tokens_last_reset
    FROM sniply_users
    WHERE firebase_uid = %s;
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, (firebase_uid,))
                row = cur.fetchone()
                return dict(row) if row else {}
    except Exception as e:
        logger.error(f"Error getting user preferences: {e}")
        return {}

def get_and_sync_daily_tokens(firebase_uid):
    """
    Syncs the 10 tokens per day system.
    Resets to 10 tokens on a new calendar day.
    """
    if not firebase_uid:
        return {"tokens_remaining": 10, "max_tokens": 10, "resets_today": False}

    sql_select = "SELECT daily_tokens, tokens_last_reset FROM sniply_users WHERE firebase_uid = %s;"
    sql_reset = "UPDATE sniply_users SET daily_tokens = 10, tokens_last_reset = CURRENT_DATE WHERE firebase_uid = %s RETURNING daily_tokens;"

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql_select, (firebase_uid,))
                row = cur.fetchone()
                if not row:
                    return {"tokens_remaining": 10, "max_tokens": 10, "resets_today": False}

                last_reset = row.get("tokens_last_reset")
                from datetime import date
                today = date.today()

                if not last_reset or str(last_reset) != str(today):
                    cur.execute(sql_reset, (firebase_uid,))
                    conn.commit()
                    return {"tokens_remaining": 10, "max_tokens": 10, "resets_today": True}

                return {"tokens_remaining": row.get("daily_tokens", 10), "max_tokens": 10, "resets_today": False}
    except Exception as e:
        logger.error(f"Error checking daily tokens: {e}")
        return {"tokens_remaining": 10, "max_tokens": 10, "resets_today": False}

def consume_daily_token(firebase_uid):
    """Decrements 1 daily auto-suggestion token."""
    if not firebase_uid:
        return {"tokens_remaining": 9, "success": True}

    sql = """
    UPDATE sniply_users
    SET daily_tokens = GREATEST(0, daily_tokens - 1)
    WHERE firebase_uid = %s
    RETURNING daily_tokens;
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (firebase_uid,))
                row = cur.fetchone()
            conn.commit()
            tokens_left = (row.get("daily_tokens") if isinstance(row, dict) else row[0]) if row else 0
            return {"tokens_remaining": tokens_left, "success": tokens_left >= 0}
    except Exception as e:
        logger.error(f"Error consuming token: {e}")
        return {"tokens_remaining": 0, "success": False}

def delete_optimization(opt_id, firebase_uid=None):
    """Deletes a single optimization entry strictly scoped to the authenticated user."""
    if not firebase_uid:
        logger.warning(f"delete_optimization rejected: firebase_uid required (opt_id: {opt_id})")
        return False
    sql = "DELETE FROM optimizations WHERE id = %s AND firebase_uid = %s;"
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (opt_id, firebase_uid))
                deleted = cur.rowcount
            conn.commit()
            return deleted > 0
    except Exception as e:
        logger.error(f"Error deleting optimization {opt_id}: {e}")
        return False

def clear_user_optimizations(firebase_uid):
    """Deletes all optimizations for a user."""
    if not firebase_uid:
        return 0
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM optimizations WHERE firebase_uid = %s;", (firebase_uid,))
                deleted = cur.rowcount
            conn.commit()
            return deleted
    except Exception as e:
        logger.error(f"Error clearing optimizations for {firebase_uid}: {e}")
        return 0

