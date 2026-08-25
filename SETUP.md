# Authority OS — ativação da IA real

A interface continua funcionando como PWA no GitHub Pages. Para transformar os botões em operações reais, o backend precisa rodar em um ambiente server-side.

## 1. Backend
Implante este mesmo repositório na Vercel. Os endpoints ficam em:
- `/api/health`
- `/api/agent`
- `/api/n8n`

## 2. Gemini
Na Vercel, adicione:
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (opcional; padrão no código)

Sem a chave, `/api/agent` devolve uma estratégia de demonstração segura para permitir testes da interface.

## 3. n8n
Adicione:
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_TOKEN` (opcional, recomendado)

O n8n deve receber ações do Authority OS e controlar publicação, agendamento, captura de métricas e integrações aprovadas pelas plataformas.

## 4. Banco
`db/schema.sql` contém o blueprint do Neon. A aplicação ainda não aplica esse arquivo automaticamente. Faça uma migração revisada antes de usar dados de clientes em produção.

## 5. Segurança
- Nunca cole Gemini/API keys no `index.html`.
- Nunca salve access token de Instagram/TikTok/YouTube em `localStorage`.
- OAuth e refresh tokens devem ficar no backend.
- Use aprovação humana antes de publicar conteúdo sensível.
