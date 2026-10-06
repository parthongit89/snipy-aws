"""
Sniply — Sync .env to Extension
Reads root .env and generates gitignored extension/env.js for seamless local development
without exposing any credentials to git.
"""

import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT_DIR / ".env"
TARGET_FILES = [
    ROOT_DIR / "extension" / "env.js",
    ROOT_DIR / "extension" / "background" / "env.js"
]

def sync():
    if not ENV_FILE.exists():
        print("[Sniply] No .env file found at root. Copy .env.example to .env to populate credentials.")
        return

    config = {}
    with open(ENV_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            config[key.strip()] = val.strip().strip('"').strip("'")

    api_key = config.get("AWS_BEDROCK_API_KEY", "")
    aws_region = config.get("AWS_REGION", "ap-southeast-2")
    model_id = config.get("AWS_BEDROCK_MODEL_ID", "qwen.qwen3-coder-30b-a3b-instruct")
    window_lines = config.get("SLIDING_WINDOW_LINES", "120")

    js_content = f"""// AUTO-GENERATED FROM ROOT .env — DO NOT COMMIT
// This file is strictly excluded by .gitignore.
self.SNIPLY_ENV = {{
  apiKey: "{api_key}",
  awsRegion: "{aws_region}",
  modelId: "{model_id}",
  slidingWindowLines: {window_lines}
}};
"""

    for target in TARGET_FILES:
        with open(target, "w", encoding="utf-8") as f:
            f.write(js_content)
        print(f"[Sniply] Successfully synced .env -> {target.relative_to(ROOT_DIR)}")

    print(f"[Sniply] Successfully synced .env -> {TARGET_FILE.relative_to(ROOT_DIR)}")
    print("[Sniply] extension/env.js is gitignored and will never be tracked by git.")

if __name__ == "__main__":
    sync()
