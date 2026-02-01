# Plano Final de Implementação — Executável Portátil por Pasta (Empresa A/B)

Este plano descreve os passos para transformar a aplicação web atual (Next.js + Node.js) em um executável portátil independente, permitindo múltiplas instâncias isoladas no mesmo computador (uma por pasta).

## Critérios de Aceitação do Produto

1.  **Isolamento Total:** Copiar o app para `EmpresaA\` e `EmpresaB\` gera dados (sessões, logs, estados) separados e localizados dentro de `./data` de cada pasta.
2.  **Zero Config:** O cliente não precisa configurar URLs de API ou WebSocket.
3.  **Concorrência Real:** É possível rodar as duas empresas ao mesmo tempo sem conflito de portas.
4.  **UX Simplificada:** Um clique no executável abre a janela da aplicação.

---

## 1) Porta Dinâmica para Multi-Instância
**Objetivo:** Eliminar a dependência da porta fixa `3001` que impede múltiplas instâncias.

*   **Ações:**
    *   Backend deve aceitar porta via variável de ambiente (`PORT`) ou argumento de linha de comando.
    *   Backend deve tentar usar a porta 0 (aleatória livre do SO) se nenhuma for definida, e informar qual porta foi alocada.
    *   Implementar endpoint `/health` que retorna `200 OK` quando o servidor estiver pronto.
*   **Teste:** Abrir duas instâncias do backend manualmente; ambas devem subir em portas diferentes.

## 2) Frontend Next.js → Exportação Estática (`out/`)
**Objetivo:** Eliminar a necessidade de um servidor Next.js rodando em produção.

*   **Ações:**
    *   Configurar `next.config.mjs` com `output: 'export'`.
    *   Verificar compatibilidade de imagens (`unoptimized: true` já implementado).
    *   Gerar build de produção (`npm run build`).
*   **Teste:** A pasta `Frontend/out/` é gerada e pode ser servida por qualquer servidor HTTP estático simples.

## 3) Remover Configuração de API/WS do Usuário (Zero Setup)
**Objetivo:** Frontend agnóstico que se conecta "a si mesmo", independente da porta.

*   **Ações:**
    *   **API Client:** Alterar URLs absolutas (`http://localhost:3001/api`) para relativas (`/api/...`).
    *   **Socket.io:** Configurar cliente para conectar na origem atual (`window.location.origin` ou `undefined` para auto-detect).
    *   **UI:** Remover ou esconder telas de configuração de "URL da API".
*   **Teste:** Rodar o app e usá-lo sem definir variáveis de ambiente para URL no frontend.

## 4) Servidor Único (Express) para UI + API + WS
**Objetivo:** unificar a aplicação em uma única origem (Single Origin), eliminando problemas de CORS e complexidade de portas.

*   **Ações:**
    *   Configurar o Express (Backend) para servir os arquivos estáticos da pasta `Frontend/out/` na rota raiz `/`.
    *   Manter rotas de API em `/api/*`.
    *   Implementar **Fallback SPA:** Qualquer requisição GET desconhecida (que não seja API ou estático) deve retornar `index.html`.
*   **Teste:** Acessar `http://127.0.0.1:<porta_aletoria>` e carregar o Dashboard completo.

## 5) Electron (Launcher) — "One Click"
**Objetivo:** Criar o invólucro nativo que inicia o backend e exibe a interface.

*   **Ações:**
    *   Adicionar `electron` como dependência de desenvolvimento.
    *   Criar `electron/main.js`:
        1.  Descobrir `AppRoot` (pasta do executável).
        2.  Iniciar processo filho (Node Backend) definindo `cwd = AppRoot`.
        3.  Capturar a porta escolhida pelo Backend (via stdout ou arquivo temporário).
        4.  Aguardar `/health` check.
        5.  Criar `BrowserWindow` apontando para `http://127.0.0.1:<porta>`.
        6.  Garantir que ao fechar a janela, o processo filho do backend seja morto.
*   **Teste:** Duas cópias do app em pastas diferentes abrem duas janelas independentes com dados isolados.

## 6) Persistência e Estrutura (Portabilidade Real)
**Objetivo:** Garantir que todos os dados vivam apenas dentro da pasta da instalação.

*   **Ações:**
    *   Verificar `PathHelper` (já ajustado) para garantir raízes corretas.
    *   Backend deve garantir criação automática na inicialização de:
        *   `./data/sessions`
        *   `./data/logs`
        *   `./data/uploads`
        *   Arquivos JSON de estado.
*   **Teste:** Apagar a pasta `./data`, iniciar o app e verificar se a estrutura é recriada limpa.

## 7) Empacotamento e Entrega (Release)
**Objetivo:** Gerar o artefato final para o cliente.

*   **Ações:**
    *   Configurar `electron-builder` ou similar.
    *   Incluir o Backend (transpilado ou fontes mínimos) e o Frontend (static `out/`) no pacote.
    *   Gerar um `.zip` "Portable" (sem instalador, apenas extrair e rodar).
*   **Instrução ao Cliente:** "Crie uma pasta por empresa (ex: CobrancaA, CobrancaB), extraia o conteúdo do ZIP dentro de cada uma e execute o SmartDispatcher.exe."

---

## 8) Ordem Ideal de Execução (Roadmap)

Para evitar retrabalho, siga esta sequência exata:

1.  **Porta Dinâmica + Health Check (Backend):** Fundamentação para rodar em paralelo.
2.  **Frontend Estático (Next Export):** Preparação para servir via Express.
3.  **Refatoração API/WS (Frontend):** Trocar para caminhos relativos (preparar para Single Origin).
4.  **Integração Express (Backend):** Servir o estático e testar tudo em uma porta só no navegador.
5.  **Electron Launcher:** Criar o script que orquestra tudo isso nativamente.
6.  **Empacotamento:** Gerar o ZIP final.

---

## Checklist Final de Release

*   [ ] App abre sem pedir configuração de URL.
*   [ ] API e WhatsApp Socket funcionam na mesma origem.
*   [ ] É possível abrir duas instâncias simultâneas (pastas diferentes) sem erro de porta.
*   [ ] Dados (sessões, logs) aparecem EXCLUSIVAMENTE dentro da pasta `./data` da instância.
*   [ ] Fechar a janela encerra todos os processos Node em segundo plano.
*   [ ] O pacote ZIP funciona em uma máquina limpa (sandbox).
