# Authentication, Credential Security & User State (Authentication.md)
## Project: Sniply — Anti-Overengineering & Real-Time Code Optimization Assistant

---

## 1. Executive Summary

This specification governs the authentication lifecycle, credential isolation, and database user synchronization across:
1. **The Web Landing Surface (`landing.html` / `index.html`)**: Mandatory Firebase Google OAuth registration gate prior to downloading the extension package, ensuring every user is registered in Neon DB.
2. **The Multi-Browser Extension Sandbox**: Isolated credentials storage (`chrome.storage.local`) in Google Chrome & Microsoft Edge, automatically synced with the registered developer's `firebase_uid`.
3. **The Backend Gateway & Database**: Secure Neon PostgreSQL connection pooling (`sslmode=require`) and AWS Bedrock IAM least-privilege policies.

---

## 2. Authentication Flow & State Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Landing as Landing Page (landing.html)
    participant AuthModal as Google OAuth Modal
    participant Ext as Chrome/Edge Extension
    participant API as Backend Gateway
    participant Neon as Neon PostgreSQL Database
    participant AWS as AWS Bedrock (Claude 3.5 Haiku)

    Note over Dev,Landing: Mandatory Developer Registration Gate
    Dev->>Landing: Clicks "Download .zip package"
    Landing->>AuthModal: Triggers Google OAuth Modal
    Dev->>AuthModal: Signs in with Google
    AuthModal->>Landing: Returns firebase_uid & profile
    Landing->>API: POST /api/v1/auth/register (firebase_uid, email, displayName)
    API->>Neon: UPSERT INTO sniply_users
    Landing-->>Dev: Downloads sniply-extension.zip (Unlocked)
    Landing->>Ext: Syncs firebase_uid to chrome.storage.local

    Note over Dev,Ext: In-Editor Simplicity Coaching & Telemetry Tracking
    Dev->>Ext: Presses [Ctrl + .] in Code Editor
    Ext->>API: POST /api/v1/optimize (Snippet, Context, userId=firebase_uid)
    API->>AWS: Invoke Claude 3.5 Haiku via IAM / Mantle
    AWS-->>API: Streamed Optimization JSON
    API-->>Ext: Return In-Editor Tooltip Payload
    API->>Neon: Log Optimization & Telemetry mapped to sniply_users
    Ext->>API: POST /api/v1/feedback (action=ACCEPT/REJECT, userId=firebase_uid)
    API->>Neon: Record user feedback in daily_metrics
```

---

## 3. Extension Acquisition & User Gating Policy

### 3.1 Mandatory Registration Gate Before Download
- **Principle**: 100% developer tracking and data integrity. The `.zip` download on `landing.html` is strictly gated behind Google OAuth authentication.
- **Enforced Registration**: Unauthenticated downloads are strictly prohibited. When a developer clicks "Get extension" or "Download .zip package", the Google OAuth modal is triggered immediately.
- **Neon DB User Entity**: Upon successful Google sign-in, the user's profile is upserted into `sniply_users` with their `firebase_uid`, `email`, and `display_name`.
- **Automatic Package Delivery**: Only after the user's identity is registered in Neon DB does the `sniply-extension.zip` download initiate automatically.
- **Synchronized Telemetry**: The developer's `firebase_uid` is synced across `chrome.storage.local` and `localStorage`, ensuring all future code simplifications, syntax error catches, and circular gauge stats on `dashboard.html` are mapped directly to their account.

---

## 4. Extension Sandbox Storage Security (Manifest V3)

### 4.1 Strict Context Isolation
- All sensitive credentials (such as optional custom AWS keys or Anthropic API tokens) are strictly stored in `chrome.storage.local` within the background service worker context.
- **Content scripts running inside web editors (Jupyter, Colab, LeetCode) never access raw credentials**.
- Communication between content scripts and background workers occurs exclusively through validated Chrome runtime message passing:

```javascript
// Secure credential retrieval inside background/service_worker.js
async function getSecureCredentials() {
  const data = await chrome.storage.local.get([
    "apiKey",
    "awsRegion",
    "modelId",
    "backendUrl"
  ]);
  return {
    apiKey: data.apiKey || "",
    awsRegion: data.awsRegion || "us-east-1",
    modelId: data.modelId || "anthropic.claude-3-5-haiku-20241022-v1:0",
    backendUrl: data.backendUrl || "https://aws-2-u2md.onrender.com"
  };
}
```

---

## 5. Neon PostgreSQL Database Security & User Synchronization

### 5.1 Connection Pooling with Enforced SSL
All backend database connections to Neon PostgreSQL enforce SSL encryption in transit:

```python
# backend/db.py
DEFAULT_DB_URL = "postgresql://neondb_owner:npg_3Mwy8uNStxsb@ep-empty-shape-atx8rqzu-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=DATABASE_URL
)
```

### 5.2 User Upsert Protocol (`upsert_user`)
When a user signs in via Google OAuth on `landing.html`, the backend idempotently upserts their profile into Neon DB:

```sql
INSERT INTO sniply_users (firebase_uid, email, display_name, photo_url, last_active)
VALUES (%s, %s, %s, %s, NOW())
ON CONFLICT (firebase_uid)
DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    photo_url = EXCLUDED.photo_url,
    last_active = NOW();
```

---

## 6. AWS IAM Least-Privilege Policy for Bedrock

When deploying the backend gateway with AWS IAM roles or service accounts, permissions are restricted strictly to Claude 3.5 Haiku inference:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowClaude35HaikuInferenceOnly",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*:*:foundation-model/anthropic.claude-3-5-haiku-20241022-v1:0"
      ]
    }
  ]
}
```

---

## 7. Rate Limiting & Abuse Prevention

The FastAPI backend enforces per-IP and per-UID rate limiting via `slowapi` to prevent API token exhaustion:
- `/api/v1/optimize`: 60 requests per minute per IP.
- `/api/v1/auth/register`: 20 requests per minute per IP.
- `/api/v1/sync`: 30 requests per minute per UID.
