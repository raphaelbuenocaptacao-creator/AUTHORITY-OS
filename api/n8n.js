function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  if (!process.env.N8N_WEBHOOK_URL) {
    return res.status(200).json({
      ok: true,
      demo: true,
      message: 'Automação registrada em modo demonstração. Configure N8N_WEBHOOK_URL para executar fluxos reais.'
    });
  }

  try {
    const body = parseBody(req);
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.N8N_WEBHOOK_TOKEN ? { authorization: `Bearer ${process.env.N8N_WEBHOOK_TOKEN}` } : {})
      },
      body: JSON.stringify({ source: 'authority-os', receivedAt: new Date().toISOString(), ...body })
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { message: text }; }

    return res.status(response.ok ? 200 : 502).json({ ok: response.ok, upstreamStatus: response.status, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'Automation gateway error' });
  }
}
