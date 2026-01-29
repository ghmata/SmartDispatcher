# PLANO DE IMPLEMENTAÇÃO TÉCNICA - DISPARADOR WHATSAPP PORTÁTIL

## 1. VISÃO GERAL DO PROJETO
Desenvolvimento de uma solução de software desktop **"Portable Windows Application"** para automação de disparo de mensagens via WhatsApp. O sistema resolve o problema de **custo proibitivo** e **risco de banimento** enfrentado pelo cliente, substituindo plataformas SaaS por uma arquitetura local (On-Premise) de custo recorrente zero. 

O core da solução é o tratamento "humano" das interações, utilizando algoritmos de distribuição probabilística para delays e variação semântica de conteúdo (Spintax), operando sobre uma infraestrutura de **Load Balancing** que distribui a carga entre múltiplos chips (identidades) do cliente.

## 2. STACK TECNOLÓGICA (Definição Arquitetural)

| Componente | Tecnologia | Versão | Justificativa Técnica |
|------------|------------|--------|-----------------------|
| **Runtime** | Node.js | v20 LTS | Garante estabilidade de longo prazo e acesso ao vasto ecossistema de automação de browser. Vital para o uso de `puppeteer`. |
| **WhatsApp Engine** | whatsapp-web.js | v1.23+ | Abstração madura do protocolo Web. Escolhida por suportar nativamente `LocalAuth`, permitindo persistência de sessão em arquivos locais (crítico para aplicação portátil). |
| **Browser Driver** | Puppeteer | v22+ | Controle de Chrome/Chromium headless. Superior ao Selenium para este caso por menor overhead e integração nativa com Node.js. |
| **Input Parser** | ExcelJS | v4.x | Biblioteca de streaming para Excel. Permite ler arquivos grandes sem carregar tudo em memória, evitando crash em máquinas modestas. |
| **Bundler** | Vercel PKG | v5.8+ | Compilação de binário `.exe`. Permite entregar um único arquivo executável que roda sem dependências instaladas no host. |
| **Logging** | Winston | v3.11+ | Sistema de logs estruturados e rotativos. Essencial para debug remoto sem expor dados sensíveis do cliente. |

## 3. CRONOGRAMA DETALHADO (5 Dias Úteis / 40h)

### DIA 1: Fundação e Camada de Input
**Objetivo:** Estabelecer a arquitetura do projeto e garantir a integridade dos dados de entrada.
**Tarefas:**
- [ ] **T1.1: Project Scaffold & Environment (3h)** 
    - Inicializar Node.js, configurar ESLint/Prettier (Code Quality).
    - Implementar estrutura de pastas portáteis (`data/sessions`, `data/logs`).
    - **Tecnologia:** `fs` nativo do Node.
- [ ] **T1.2: Excel Parser Module (5h)** 
    - Implementar `ExcelParser` com `ExcelJS`.
    - Lógica de sanitização de telefones (Regex Internacional: `^55\d{10,11}$`).
    - Validação de colunas obrigatórias e linhas vazias.
    - **Dependência:** T1.1
**Checkpoint (Dia 1):** Script de teste `test-parser.js` processa planilha de 1.000 linhas em < 5 segundos, gerando JSON limpo e relatório de erros.

### DIA 2: Conectividade Core e Multi-Sessão
**Objetivo:** Implementar o gerenciamento de múltiplas instâncias do WhatsApp Web isoladas.
**Tarefas:**
- [ ] **T2.1: Session Factory Manager (4h)**
    - Criar `SessionManager` para orquestrar N clientes `whatsapp-web.js`.
    - Implementar persistência `LocalAuth` apontando para pastas relativas `./data/sessions/{chipID}`.
    - **Dependência:** T1.1
- [ ] **T2.2: Load Balancer (Round-Robin) (4h)**
    - Implementar lógica de distribuição circular de jobs.
    - Tratamento de falha: Se Chip A cair, Load Balancer deve redirecionar para Chip B automaticamente.
    - **Dependência:** T2.1
**Checkpoint (Dia 2):** Aplicação conecta 2 números simultaneamente. Ao desconectar a internet de um, o sistema detecta e isola a falha, mantendo o outro ativo.

### DIA 3: Compliance Engine (Anti-Ban) e Spintax
**Objetivo:** Implementar as camadas de segurança lógica e humanização. **(Crítico)**
**Tarefas:**
- [ ] **T3.1: Spintax Resolver (3h)**
    - Criar parser de strings para tratar variações `{Olá|Oi|Ei} {nome}`.
    - Garantir aleatoriedade criptográfica simples para evitar repetições de padrão.
    - **Dependência:** T1.2
- [ ] **T3.2: Human Behavior Algorithms (5h)**
    - Implementar Delays com Distribuição Normal (Box-Muller) e não uniforme, para evitar "fingerprinting" de bot.
    - Simulação de Digitação: Estado `typing` variável baseado no comprimento da mensagem (50-150ms/char).
    - **Dependência:** T2.1
**Checkpoint (Dia 3):** Log de teste demonstra intervalos de envio não-determinísticos (ex: 32s, 45s, 89s) e mensagens com textos variados.

### DIA 4: Orquestração, Logs e Resiliência
**Objetivo:** Unificar módulos e blindar a aplicação contra erros de execução.
**Tarefas:**
- [ ] **T4.1: Campaign Manager (Orquestrador) (4h)**
    - Unir Parser -> Load Balancer -> Compliance -> Session Manager.
    - Controle de fila e estado da campanha (Pausar/Retomar).
    - **Dependência:** T3.2
- [ ] **T4.2: Logging System (Winston) (2h)**
    - Logs rotativos (`sucesso.log`, `erro.log`).
    - Sanitização de PII (não logar conteúdo sensível da mensagem).
    - **Dependência:** T1.1
- [ ] **T4.3: Error Handlers Globais (2h)**
    - Captura de `UncaughtException` e desconexões de socket.
**Checkpoint (Dia 4):** Simulação de campanha com 100 contatos roda do início ao fim, gerando logs auditáveis, sobrevivendo a uma reinicialização simulada do app.

### DIA 5: Empacotamento, Testes Finais e Documentação
**Objetivo:** Transformar código em produto.
**Tarefas:**
- [ ] **T5.1: Build Portátil (.exe) (4h)**
    - Configurar `pkg` p/ incluir binary do Chromium.
    - Testar portabilidade: Mover pasta para Pen Drive e executar em outra máquina (VM limpa).
    - **Dependência:** T4.3
- [ ] **T5.2: Documentação do Usuário (2h)**
    - PDF com screenshots: "Como ler QR Code", "Como formatar Planilha".
- [ ] **T5.3: Validação Final (2h)**
    - Execução da Bateria de Testes de Aceite.
**Checkpoint (Dia 5):** Entrega do arquivo ZIP contendo `.exe` funcional + Manual + Configs Padrão.

## 4. DETALHAMENTO TÉCNICO POR MÓDULO

### 📂 Módulo: Input Layer (`src/modules/parser`)
- **Responsabilidade:** Sanitizar e validar dados brutos.
- **Implementação:** Leitura via Stream.
- **Regra de Aceite:** Deve rejeitar linhas sem telefone válido mas continuar o processamento das demais (Falha Parcial Permitida).

### 🧠 Módulo: Core Logic & Anti-Ban (`src/modules/campaign`)
- **Load Balancer:**
    - Estratégia: *Active-Active Round Robin*.
    - Estado: Mantém métrica de `envios_sucesso` por chip para relatórios.
- **Compliance Engine:**
    - **Algoritmo de Delay:** `Delay = Base + (Random * Variância)`.
    - **Limiter:** "Token Bucket" virtual para limitar envios/hora (ex: 50 msg/h) por chip.

### 🔌 Módulo: Connectivity (`src/modules/whatsapp`)
- **Session Manager:**
    - Abstrai a complexidade do `whatsapp-web.js`.
    - Monitora eventos `disconnected` e dispara tentativa de reconexão (Backoff Exponencial: 5s, 10s, 30s).
- **Persistência:**
    - Caminho Relativo Obrigatório: `path.join(process.cwd(), 'data', 'sessions')`. Nada de `%APPDATA%` para garantir portabilidade.

## 5. ESTRATÉGIAS DE MITIGAÇÃO DE RISCOS

| Risco | Probabilidade | Impacto | Mitigação Técnica |
|-------|---------------|---------|-------------------|
| **Banimento de Número** | Alta (Inerente) | Crítico | Implementação rígida de limites (Rate Limiting) e variação de conteúdo (Spintax). Aviso visual ao usuário se configs forem agressivas. |
| **Quebra do WhatsApp Web (DOM Update)** | Média | Alto | Usar versão fixa (`pinned`) do `whatsapp-web.js` e do Chromium. Desabilitar updates automáticos no browser headless. |
| **Falso Positivo Antivírus (.exe)** | Média | Médio | Assinatura digital (se houver orçamento) ou instrução de Whitelist no manual. Build limpo sem ofuscação excessiva. |
| **Corrupção de Sessão Local** | Baixa | Médio | Backup automático dos tokens de sessão na inicialização. Opção de "Limpar Cache" no menu do CLI. |

## 6. CRITÉRIOS DE ACEITE FINAL

Para entrega, o sistema deve passar no seguinte checklist automatizado/manual:
1.  [ ] **Zero Configuração:** O .exe abre em Windows 10/11 "virgem" sem pedir instalação de nada.
2.  [ ] **Multi-Chip:** 3 sessões conectadas enviam mensagens de forma intercalada (Chip 1 -> Chip 2 -> Chip 3 -> Chip 1).
3.  [ ] **Input Resiliente:** Planilha com 1.000 linhas carrega em < 10s.
4.  [ ] **Anti-Ban Verificável:** Em um teste de 10 envios, nenhum intervalo de tempo entre mensagens é igual ao outro.
5.  [ ] **Recuperação:** Se a internet cair e voltar, o robô retoma o envio de onde parou sem duplicar mensagens.

## 7. ANEXOS / ARTEFATOS

### Estrutura de Pastas (Portable)
```text
/SmartDispatcher
│   SmartDispatcher.exe
│   config.json          <-- Configurações editáveis pelo usuário (limites, delays)
│   input_template.xlsx  <-- Modelo de importação
│
├───data
│   ├───sessions         <-- Tokens de sessão (não editar)
│   └───logs             <-- Histórico de execução
```

### Exemplo de Configuração (`config.json`)
```json
{
  "compliance": {
    "min_delay_seconds": 30,
    "max_delay_seconds": 90,
    "max_messages_per_hour": 50,
    "simulate_typing": true
  },
  "behavior": {
    "work_hours_only": false
  }
}
```
