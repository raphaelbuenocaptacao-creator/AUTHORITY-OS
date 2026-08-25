# AUTHORITY OS

Sistema operacional de autoridade, conteúdo e crescimento local.

## Pilot 2.2

O Authority OS já funciona como PWA interativo no GitHub Pages e agora possui uma camada de backend preparada para IA e automação.

### Produto
- PWA instalável e responsivo
- Onboarding estratégico
- Memória da marca
- Authority Score
- Plano semanal e calendário
- Content Studio
- Radar Local
- Growth Intelligence
- Leads e oportunidades
- Automações configuráveis
- Centro de comando por objetivo
- Persistência local/offline

### Backend pronto no repositório
- `/api/health` — saúde da API
- `/api/status` — status Gemini, n8n e banco
- `/api/agent` — gateway seguro para Gemini
- `/api/n8n` — gateway seguro para n8n
- CORS preparado para frontend em domínio separado
- `.env.example` sem segredos
- `vercel.json`

### Dados
- `db/schema.sql` contém o blueprint de produção para workspaces, marcas, conteúdos, leads, automações e métricas.

## Modos de operação

### GitHub Pages
O app funciona normalmente em modo demonstração/local. Na aba **Integrações**, informe a URL do backend Vercel para ativar IA e automações reais.

### Vercel
Hospedando o mesmo repositório na Vercel, frontend e `/api/*` podem operar no mesmo domínio.

## Variáveis server-side
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_TOKEN`
- `DATABASE_URL`
- `APP_ORIGIN`

Nunca coloque essas chaves no `index.html` ou no JavaScript público.

## Princípio do produto

O Authority OS não promete seguidores. O sistema melhora a máquina de autoridade: posicionamento, consistência, percepção profissional, distribuição, conversas e oportunidades comerciais.

## Arquitetura

`PWA -> API segura -> Neon/Postgres -> Gemini -> n8n -> APIs oficiais -> métricas -> Growth Intelligence`

## Roadmap
Consulte:
- `docs/ARCHITECTURE.md`
- `docs/PRODUCT-ROADMAP.md`
- `docs/N8N-FLOW.md`
- `docs/CLIENT-PILOT.md`
- `SETUP.md`

## GitHub Pages

https://raphaelbuenocaptacao-creator.github.io/AUTHORITY-OS/
