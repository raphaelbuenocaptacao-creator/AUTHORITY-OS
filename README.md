# AUTHORITY OS

Sistema operacional de autoridade, conteúdo e crescimento local.

## V2 — Produto interativo

A V2 transforma o protótipo em um PWA utilizável, com dados persistidos localmente no aparelho e uma experiência completa de onboarding até acompanhamento comercial.

### Entregue
- PWA instalável e responsivo
- Onboarding estratégico em 3 etapas
- Memória da marca e perfil do cliente
- Authority Score recalculável
- Plano semanal de autoridade
- Calendário editorial de 7 dias
- Content Studio com biblioteca de conteúdos
- Gerador estruturado de Reels, Stories, Posts e Carrosséis
- Radar Local personalizado por cidade, negócio e público
- Growth Intelligence com leitura de funil
- Leads e estágios de oportunidade
- Automações configuráveis
- Centro de comando por objetivo
- Persistência via localStorage
- Funcionamento offline básico via Service Worker

## Princípio do produto

O Authority OS não promete seguidores. Ele organiza posicionamento, conteúdo, consistência, percepção profissional, conversas e oportunidades comerciais.

## Segurança

O frontend público não contém chaves de API. Integrações com Gemini, Meta, TikTok, YouTube e n8n devem ser feitas por um backend seguro ou webhook autenticado.

## Próxima fase
- Backend e autenticação
- Banco multi-tenant em Neon/Postgres
- Gemini real para estratégia e conteúdo
- n8n para execução de automações
- Aprovação de conteúdo antes de publicar
- Meta/Instagram API
- YouTube API
- TikTok API conforme permissões disponíveis
- Coleta de métricas reais
- CRM e follow-up

## Arquitetura alvo

`PWA -> API segura -> Neon/Postgres -> Gemini -> n8n -> APIs oficiais -> métricas -> Growth Intelligence`

## GitHub Pages

Publicação: branch `main`, diretório `/(root)`.

URL esperada:

https://raphaelbuenocaptacao-creator.github.io/AUTHORITY-OS/
