export default async function handler(req, res) {
  const integrations = {
    gemini: Boolean(process.env.GEMINI_API_KEY),
    n8n: Boolean(process.env.N8N_WEBHOOK_URL),
    database: Boolean(process.env.DATABASE_URL)
  };
  const connected = Object.values(integrations).filter(Boolean).length;
  res.status(200).json({
    ok: true,
    mode: connected ? 'connected' : 'demo',
    integrations,
    connected,
    total: Object.keys(integrations).length,
    version: '2.2.0'
  });
}
