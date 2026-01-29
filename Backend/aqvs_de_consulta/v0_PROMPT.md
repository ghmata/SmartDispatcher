# PROMPT MESTRE PARA V0.DEV (VERCEL)

**Contexto:**
Você é um Arquiteto de Software e UI/UX Designer Especialista.
Seu objetivo é criar um **Dashboard Profissional (Single Page Application)** para um sistema de Automação de WhatsApp ("Smart Dispatcher").
O software roda localmente (localhost:3000) e o frontend deve se comunicar com ele via HTTP e WebSocket (Socket.io).

**Tecnologias Obrigatórias:**
- React
- Tailwind CSS (Estilo "Modern SaaS", dark mode default ou toggle)
- Lucide React (Ícones)
- Socket.io Client (para eventos em tempo real)

---

## 1. Estrutura Visual (Layout)
- **Sidebar Lateral:** Menu com ícones e textos: "Dashboard", "Conexões (Chips)", "Nova Campanha", "Configurações".
- **Área Principal:** Conteúdo dinâmico da rota atual.
- **Barra de Status (Bottom/Top):** Indicador global ("Sistema Online", "Fila de Envio: 45/100").

## 2. Detalhe das Telas

### A. Dashboard (Home)
- **Cards de Métricas:**
  - Total Enviado Hoje (Número grande).
  - Taxa de Entrega (% com gráfico circular).
  - Chips Conectados (X de Y).
- **Gráfico de Linha:** Envios por hora (últimas 24h).
- **Terminal de Logs (Live):**
  - Um painel estilo "console" (fundo preto, fonte monospace verde/branca).
  - Deve ouvir o evento socket `log` e adicionar linhas em tempo real.
  - Ex: `[10:00:22] [chip_1] Envio com sucesso para 5511999...`

### B. Gerenciador de Chips (Conexões)
- **Grid de Cards:** Um card para cada instância (chip_1, chip_2, etc).
- **Estado do Card:**
  - *Desconectado:* Borda vermelha. Botão "Conectar".
  - *Carregando/QR:* Borda amarela. Mostra imagem do QR Code (Base64 recebido via socket).
  - *Online:* Borda verde. Mostra foto do perfil, nome e status da bateria (simulado).
- **Ação:** Botão "Adicionar Novo Chip" (chama API `POST /api/session/new`).

### C. Criar Campanha (Wizard)
- **Passo 1: Upload:** Input file para `.xlsx` ou `.csv`. Mostra prévia das primeiras 5 linhas em uma tabela.
- **Passo 2: Mensagem:**
  - Textarea grande para escrever a mensagem.
  - **Feature Chave:** Highlight colorido para Spintax (ex: `{Olá|Oi}` fica destacado).
  - Botões de Variáveis: `[Nome]`, `[Telefone]`, `[Link]` (clicar insere o placeholder na mensagem).
- **Passo 3: Configuração:**
  - Sliders para configurar "Delay Minimo" e "Delay Máximo".
- **Passo 4: Disparar:** Botão grande "Iniciar Campanha". Vai para a tela de monitoramento.

## 3. Contrato de API (Simulado - Instrua o código a usar isso)

O Frontend deve assumir que o Backend (Node.js) expõe:

**HTTP Endpoints:**
- `GET /api/status` -> `{ active_campaigns: 1, total_sent: 500 }`
- `GET /api/sessions` -> `[{ id: 'chip_1', status: 'READY' }, { id: 'chip_2', status: 'DISCONNECTED' }]`
- `POST /api/campaign/start` -> Body: `{ file: ..., message: ... }`

**Socket.io Events (Listen):**
- `log`: Recebe string de log.
- `qr_code`: Recebe `{ chipId: 'chip_1', qr: 'data:image/png;base64,...' }`
- `session_change`: Recebe `{ chipId: 'chip_1', status: 'READY' }`

**Instrução Especial:**
Gere o código completo, focando na ESTÉTICA PREMIUM (cores sóbrias, glassmorphism sutil, animações suaves). Use componentes do `shadcn/ui` se possível (Cards, Alerts, Badges).
