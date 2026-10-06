/**
 * Sniply — Sync .env to Extension (Node.js)
 * Reads root .env and generates gitignored extension/env.js for seamless local development.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envFile = path.join(rootDir, '.env');
const targetFile = path.join(rootDir, 'extension', 'env.js');

function sync() {
  if (!fs.existsSync(envFile)) {
    console.log('[Sniply] No .env file found at root. Copy .env.example to .env to populate credentials.');
    return;
  }

  const raw = fs.readFileSync(envFile, 'utf8');
  const lines = raw.split(/\r?\n/);
  const config = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...rest] = trimmed.split('=');
    const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
    config[key.trim()] = val;
  }

  const apiKey = config['AWS_BEDROCK_API_KEY'] || '';
  const awsRegion = config['AWS_REGION'] || 'ap-southeast-2';
  const modelId = config['AWS_BEDROCK_MODEL_ID'] || 'qwen.qwen3-coder-30b-a3b-instruct';
  const windowLines = config['SLIDING_WINDOW_LINES'] || '120';

  const jsContent = `// AUTO-GENERATED FROM ROOT .env — DO NOT COMMIT
// This file is strictly excluded by .gitignore.
self.SNIPLY_ENV = {
  apiKey: ${JSON.stringify(apiKey)},
  awsRegion: ${JSON.stringify(awsRegion)},
  modelId: ${JSON.stringify(modelId)},
  slidingWindowLines: ${parseInt(windowLines, 10) || 120}
};
`;

  fs.writeFileSync(targetFile, jsContent, 'utf8');
  console.log('[Sniply] Successfully synced .env -> extension/env.js');
  console.log('[Sniply] extension/env.js is gitignored and will never be tracked by git.');
}

sync();
