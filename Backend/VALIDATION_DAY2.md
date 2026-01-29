# Validação - Dia 2 (Conectividade e Multi-Sessão)

**Objetivo:** Verificar se o sistema consegue gerenciar múltiplas sessões do WhatsApp e usar o Load Balancer.

## Passo 1: Preparação
1. Tenha em mãos **dois aparelhos celulares** com WhatsApp instalado (ou um aparelho onde você possa desconectar e conectar outro número, embora simultâneo seja o ideal).
2. Garanta que a pasta `data/sessions` existe (se não, o sistema criará).

## Passo 2: Executar Teste Interativo
No terminal, execute:
```bash
node tests/test-multisession.js
```

## Passo 3: O que esperar
1. O terminal mostrará: "Initializing Session: chip_1...".
2. Um **QR Code** aparecerá no terminal.
3. **Escaneie com o Celular 1** (WhatsApp > Menu > Aparelhos Conectados > Conectar Aparelho).
4. O terminal deve confirmar: `[chip_1] Client authenticated.` e depois `Client is ready!`.
5. Em seguida (ou simultaneamente), ele pedirá o **chip_2**.
6. **Escaneie com o Celular 2** (ou o mesmo, se quiser testar a lógica, mas o ideal são números diferentes para provar isolamento).
7. O loop de teste mostrará:
   ```
   [STATUS CHECK] Total Sessions: 2 | Ready: 2
   >> LoadBalancer Test: Selected [chip_1]...
   ```
   E depois de 5 segundos:
   ```
   >> LoadBalancer Test: Selected [chip_2]...
   ```
   Isso prova que o **Load Balancer (Round-Robin)** está funcionando.

## Passo 4: Teste de Failover (Opcional)
1. Com os dois conectados, desligue a internet do Celular 1.
2. Aguarde alguns segundos.
3. O log deve mostrar: `[chip_1] Client disconnected`.
4. O LoadBalancer deve parar de selecionar o `chip_1` e selecionar apenas o `chip_2`.

## Passo 5: Finalização
Pressione `Ctrl + C` para encerrar o teste. As sessões ficam salvas em `data/sessions` para o próximo uso.
