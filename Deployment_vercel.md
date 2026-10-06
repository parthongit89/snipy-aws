# Multi-Tier Deployment Strategy & Infrastructure (Deployment_vercel.md)
## Project: Sniply — Anti-Overengineering & Real-Time Code Optimization Assistant

---

## 1. Multi-Tier Deployment Topology

The system is deployed across three synchronized channels:
1. **Frontend Landing & Step-by-Step Dashboard**: Hosted on **Vercel** with global edge CDN distribution.
2. **AI Gateway & Neon Database Service**: Hosted on **Render / AWS App Runner** with direct low-latency peering to AWS Bedrock and Neon PostgreSQL.
3. **Multi-Browser Extension Distribution**: Packaged as `sniply-extension.zip` hosted directly on `landing.html` for **Google Chrome** and **Microsoft Edge**.

```mermaid
flowchart TD
    subgraph VercelEdge["Vercel Global Edge Network"]
        Landing["Landing Page (index.html / landing.html)"]
        Dash["Progress Dashboard (dashboard.html)"]
        ZipStore["Direct Extension ZIP (sniply-extension.zip)"]
    end

    subgraph UserBrowsers["Client Browsers"]
        Chrome["Google Chrome (chrome://extensions/)"]
        Edge["Microsoft Edge (edge://extensions/)"]
    end

    subgraph CloudBackend["Cloud Backend Gateway (Render / App Runner)"]
        FastAPI["FastAPI AI Gateway Engine"]
        AST["AST Static Complexity Analyzer"]
    end

    subgraph ExternalCloud["Cloud Services"]
        Bedrock["AWS Bedrock (Claude 3.5 Haiku)"]
        NeonDB[("Neon PostgreSQL Cloud Database")]
    end

    Landing -->|1-Click Download (Auth/Unauth)| ZipStore
    ZipStore -->|Extract & Load Unpacked| Chrome
    ZipStore -->|Extract & Load Unpacked| Edge

    Chrome -->|Ctrl + . / REST| FastAPI
    Edge -->|Ctrl + . / REST| FastAPI
    Dash -->|Query Analytics| FastAPI

    FastAPI --> Bedrock
    FastAPI --> NeonDB
```

---

## 2. Vercel Configuration (`frontend/vercel.json`)

```json
{
  "version": 2,
  "name": "sniply-frontend",
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## 3. Multi-Browser Installation & Setup Guide

### 3.1 Google Chrome Installation
1. Navigate to the Sniply landing page (`landing.html` / `index.html`) and click **"Get extension"**.
2. Save and extract `sniply-extension.zip` to a local folder.
3. Open Google Chrome and enter `chrome://extensions/` in the address bar.
4. Toggle **Developer mode** in the top-right corner.
5. Click **Load unpacked** and select the extracted `extension/` folder.
6. Open any code editor (Google Colab, LeetCode, Jupyter) and press **`Ctrl + .`** to activate!

### 3.2 Microsoft Edge Installation
1. Download and extract `sniply-extension.zip`.
2. Open Microsoft Edge and navigate to `edge://extensions/`.
3. Enable the **Developer mode** toggle in the bottom-left sidebar.
4. Click **Load unpacked** in the top navigation bar and select the `extension/` folder.
5. In your web editor, start typing and press **`Ctrl + .`** to initialize real-time coaching!

---

## 4. Backend Environment Variables (`backend/.env`)

Configure the following variables in the Render / AWS App Runner environment dashboard:

```ini
# AWS Bedrock Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0

# Neon PostgreSQL Database Configuration (SSL Enforced)
DATABASE_URL=postgresql://neondb_owner:npg_3Mwy8uNStxsb@ep-empty-shape-atx8rqzu-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require

# Application Settings
ENVIRONMENT=production
CORS_ORIGINS=https://aws2-frontend.vercel.app,http://localhost:8000,chrome-extension://*
RATE_LIMIT_PER_MINUTE=60
```
