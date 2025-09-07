import { OpenAPIClientAxios } from 'openapi-client-axios';

const BASE = process.env.BASE || 'http://localhost:8000';

async function smoke() {
  const api = new OpenAPIClientAxios({ definition: `${BASE}/openapi.json` });
  const client = await api.init();
  const health = await client.get('/healthz');
  if (health.status !== 200) throw new Error(`healthz failed: ${health.status}`);
  const ready = await client.get('/readyz');
  if (![200, 503].includes(ready.status)) throw new Error(`readyz unexpected: ${ready.status}`);
  console.log('JS smoke OK');
}

smoke().catch((e) => { console.error(e); process.exit(1); });
