# Validação - Dia 4 (Orquestração & Resiliência)

**Objetivo:** Verificar se o `CampaignManager` gerencia o fluxo completo (Ler Excel -> Disparar -> Salvar Progresso) e se os Logs estão seguros.

## Passo 1: Executar Teste de Integração
Este teste simula uma campanha sem precisar conectar no WhatsApp real (usa Mocks).
```bash
node tests/test-campaign.js
```

**Critério de Sucesso:**
- Deve processar as linhas do arquivo `template.xlsx`.
- Deve criar o arquivo `data/campaign_state.json`.
- Deve exibir `✅ CHECKPOINT PASSED`.

## Passo 2: Verificar Logs e Sanitização
Abra o arquivo de log mais recente em `data/logs/app-YYYY-MM-DD.log`.
**Critério:**
- Procure por números de telefone.
- Eles devem estar mascarados (ex: `55119****8888`) se o log veio do `logger.info`.

## Passo 3: Teste de Resiliência (Manual)
1. Rode o teste novamente.
2. O sistema deve ver que as linhas já estão no `campaign_state.json` e pular elas (não enviar duplicado).
3. Isso prova que se o PC desligar, ele volta de onde parou.
