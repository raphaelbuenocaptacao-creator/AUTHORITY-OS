import { cors } from './_cors.js';

const SYSTEM = `Você é o Authority OS, um estrategista de autoridade digital e crescimento local.\n\nSua missão é transformar conhecimento, posicionamento e presença digital em autoridade, conversas e oportunidades comerciais.\n\nRegras:\n- Responda sempre em português do Brasil.\n- Nunca prometa crescimento garantido, seguidores garantidos ou vendas garantidas.\n- Gere recomendações práticas, específicas e acionáveis.\n- Priorize clareza, posicionamento, prova social, conteúdo útil, consistência, relacionamento e conversão.\n- Quando houver cidade/público-alvo, adapte a estratégia ao contexto local.\n- Evite spam, automações abusivas, compra de seguidores e táticas que violem políticas das plataformas.\n\nQuando solicitado a criar estratégia, devolva JSON válido com estas chaves: summary, authorityScore, priorities, contentPlan, radar, ctas, nextActions.\nauthorityScore deve ser um número de 0 a 100. priorities e nextActions devem ser arrays curtos. contentPlan deve conter itens com format, title, hook, outline, cta e objective.`;

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function demoStrategy(input) {
  const city = input.city || 'sua cidade';
  const audience = input.audience || 'seu público ideal';
  const goal = input.goal || 'aumentar autoridade e gerar oportunidades';
  return {
    demo: true,
    summary: `Plano inicial para fortalecer sua autoridade em ${city} e aproximar você de ${audience}.`,
    authorityScore: 64,
    priorities: [
      'Deixar a proposta de valor explícita no perfil',
      'Aumentar frequência de vídeos curtos com opinião própria',
      'Criar prova social e chamadas para conversa'
    ],
    contentPlan: [
      { format: 'Reel', title: 'Opinião que posiciona', hook: `3 erros que profissionais de ${city} ainda cometem`, outline: 'Problema > ponto de vista > exemplo local > recomendação', cta: 'Me chama no direct e eu te mostro como aplicaria isso no seu caso.', objective: 'Autoridade' },
      { format: 'Stories', title: 'Bastidor com contexto', hook: 'O que estou observando hoje', outline: 'Bastidor > insight > enquete > CTA', cta: 'Responda este story com a sua dúvida.', objective: 'Relacionamento' },
      { format: 'Carrossel', title: 'Guia prático', hook: `Como ${audience} pode tomar uma decisão melhor esta semana`, outline: 'Capa > 4 passos > exemplo > síntese', cta: 'Salve para consultar depois.', objective: 'Salvamentos' }
    ],
    radar: [
      `Conecte um tema do seu mercado a um acontecimento ou hábito relevante de ${city}.`,
      'Teste uma collab com um negócio ou profissional complementar.',
      'Use prova social contextualizada, sem exageros.'
    ],
    ctas: ['Me chama no direct.', 'Quer que eu analise o seu caso?', 'Salve para usar depois.'],
    nextActions: ['Definir a mensagem principal do perfil', 'Gravar o primeiro Reel em até 24h', 'Publicar e medir visitas ao perfil e conversas'],
    goal
  };
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const body = parseBody(req);
  const input = body.input || body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(200).json({ ok: true, ...demoStrategy(input), provider: 'demo' });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const prompt = `${SYSTEM}\n\nContexto do cliente:\n${JSON.stringify(input, null, 2)}\n\nDevolva somente JSON válido, sem markdown.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.65, responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini error', response.status, errorText);
      return res.status(502).json({ ok: false, error: 'AI provider error' });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '{}';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { summary: text }; }
    return res.status(200).json({ ok: true, provider: 'gemini', ...parsed });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
