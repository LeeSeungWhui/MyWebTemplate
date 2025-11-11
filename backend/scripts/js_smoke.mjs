// Minimal JS smoke to hit a couple of endpoints using built-in fetch (Node >=18)
const BASE = process.env.BASE || 'http://localhost:2000';

async function smoke() {
  const health = await fetch(`${BASE}/healthz`);
  if (!health.ok) throw new Error(`healthz failed: ${health.status}`);
  const ready = await fetch(`${BASE}/readyz`);
  if (![200,503].includes(ready.status)) throw new Error(`readyz unexpected: ${ready.status}`);
  console.log('JS smoke OK');
}

smoke().catch((e) => { console.error(e); process.exit(1); });
