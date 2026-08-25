import { cors } from './_cors.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const integrations = {
    gemini: Boolean(process.env.GEMINI_API_KEY),
    n8n: Boolean(process.env.N8N_WEBHOOK_URL),
    database: Boolean(process.env.DATABASE_URL),
    meta: Boolean(process.env.META_ACCESS_TOKEN),
    youtube: Boolean(process.env.YOUTUBE_REFRESH_TOKEN),
    tiktok: Boolean(process.env.TIKTOK_ACCESS_TOKEN)
  };
  const connected = Object.values(integrations).filter(Boolean).length;
  res.status(200).json({
    ok: true,
    mode: connected ? 'connected' : 'demo',
    integrations,
    capabilities: {
      strategy: true,
      contentStudio: true,
      profileAudit: true,
      approvalGate: true,
      publishingGateway: true
    },
    connected,
    total: Object.keys(integrations).length,
    version: '2.3.0'
  });
}
