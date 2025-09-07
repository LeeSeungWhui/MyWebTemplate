// JS smoke test using openapi-client-axios
import OpenAPIClientAxios from 'openapi-client-axios';

async function main() {
  const defUrl = process.env.OPENAPI_URL || 'http://localhost:8000/openapi.json';
  const api = new OpenAPIClientAxios({ definition: defUrl });
  const client = await api.init();
  // Simple health check request (axios compatibility)
  const res = await client.get('http://localhost:8000/healthz');
  if (res.status !== 200 || res.data?.status !== true) {
    console.error('Smoke failed', res.status, res.data);
    process.exit(1);
  }
  console.log('JS smoke OK');
}

main().catch((e) => {
  console.error('Smoke exception', e);
  process.exit(1);
});

