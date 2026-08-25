# Authority OS — Architecture

## Runtime

### Frontend
- PWA estática em `index.html`
- Pode continuar publicada no GitHub Pages
- Persistência local para experiência demo/offline
- `app-api.js` conecta o navegador a um backend quando disponível

### Backend
- `api/health.js`: saúde da API
- `api/agent.js`: gateway seguro para Gemini
- `api/n8n.js`: gateway seguro para automações n8n

As chaves ficam apenas no ambiente do servidor. Nunca devem ir para GitHub Pages ou para o JavaScript público.

## Ambientes

### GitHub Pages
Funciona como demonstração/PWA. Para usar IA real, configure no navegador uma URL de backend Vercel através do bridge de API.

### Vercel
Pode hospedar frontend e backend juntos. Nesse caso `/api/*` funciona no mesmo domínio e nenhuma configuração de API base é necessária.

## Variáveis de ambiente
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_TOKEN`
- `DATABASE_URL` (próxima etapa)

## Próximas camadas
1. Neon Auth e multi-tenant
2. Banco para marcas, conteúdos, leads e métricas
3. Integração Meta/Instagram
4. YouTube
5. TikTok, conforme permissões oficiais
6. WhatsApp/CRM
7. Scheduler e fila de publicação
8. Aprendizado baseado em performance

## Guardrails
- Sem compra de seguidores, spam ou automações abusivas
- Sem promessas garantidas de crescimento ou vendas
- Aprovação humana antes de publicações sensíveis
- Tokens sociais e chaves de IA somente no backend
