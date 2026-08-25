# Authority OS — fluxo n8n recomendado

## Entrada
Webhook recebe:
```json
{
  "source": "authority-os",
  "action": "publish_content",
  "payload": {}
}
```

## Pipeline
1. Validar assinatura/token do webhook.
2. Buscar workspace e conteúdo no banco.
3. Verificar se o conteúdo está aprovado.
4. Executar a ação permitida pela API oficial do canal.
5. Registrar resultado e identificador externo.
6. Aguardar/coletar métricas quando aplicável.
7. Atualizar o banco.
8. Notificar o Authority OS.

## Ações sugeridas
- `generate_week_plan`
- `generate_content`
- `schedule_content`
- `publish_content`
- `collect_metrics`
- `sync_leads`
- `weekly_report`

## Regra de segurança
A automação nunca deve publicar, enviar DM em massa ou executar ações irreversíveis sem o nível de aprovação configurado pelo cliente e sem respeitar as permissões oficiais de cada plataforma.
