📋 CONTEXTO OPERACIONAL E TÉCNICOContexto de Negócio
Você está desenvolvendo um software comercial real para um cliente empresário que gerencia 2 empresas distintas. Este cliente enfrenta dois problemas críticos:
Custo Proibitivo: Plataformas de disparo em massa cobram por mensagem (R$ 0,10-0,35/msg), tornando campanhas de 1000+ mensagens economicamente inviáveis
Risco de Banimento: Uso de APIs não-oficiais ou padrões de spam resultam em bloqueio permanente dos números WhatsApp
Solução Contratada:
Software desktop portátil para Windows que dispara mensagens via WhatsApp Web legítimo, utilizando múltiplos chips do próprio cliente com sistema inteligente de rotação e humanização para evitar detecção.Restrições Comerciais Críticas:

Orçamento: R$ 350,00 (projeto fechado, sem margem para refatoração ou retrabalho)
Prazo: 5 dias úteis (prazo agressivo, exige foco em MVP funcional)
Usuário Final: Não possui conhecimento técnico (interface deve ser intuitiva, erros claros)
Infraestrutura: Zero custos recorrentes (sem servidores, APIs pagas ou banco de dados cloud)
Contexto TécnicoPlataforma de Execução:

Sistema Operacional: Windows 10/11 (64-bit)
Ambiente: Aplicação desktop standalone (não requer Node.js instalado na máquina do usuário)
Arquitetura Validada:
Conforme diagramas arquiteturais anexos, o sistema está organizado em 3 camadas dentro de um PORTABLE APP FOLDER:
INPUT LAYER:

User File System (interface para selecionar planilha)
Excel Parser Module (validação e extração de dados)



CORE APPLICATION LOGIC:

Campaign Manager (orquestrador principal)
Message Builder (montagem de mensagens com Spintax)
Compliance Engine (sistema anti-ban com delays e limites)
Load Balancer (distribuição inteligente entre chips)



CONNECTIVITY LAYER:

Local Session Tokens (persistência de autenticações WhatsApp)
Multi-Device Session Manager (gestão de N sessões simultâneas)
Headless Browser Engine (Puppeteer controlando WhatsApp Web)


Funcionalidades Core (Não-Negociáveis):

✅ Multi-Empresa: Isolamento completo por duplicação de pasta
✅ Multi-Chip: Suporte a 3-5 números WhatsApp simultâneos com load balancing
✅ Anti-Ban: Delays aleatórios (30-90s) + Spintax + simulação de digitação
✅ Input Excel: Parser robusto com validação de telefones internacionais
🎯 OBJETIVO EXECUTÁVEL E MENSURÁVELEntregáveis ObrigatóriosVocê DEVE gerar os seguintes arquivos funcionais e prontos para entrega ao cliente:1. Código-Fonte Completo
disparador-whatsapp/
├── src/
│   ├── main/
│   │   ├── index.js                      # Entry point do Electron
│   │   ├── config/
│   │   │   └── settings.js               # Gerenciamento de config.json
│   │   ├── modules/
│   │   │   ├── parser/
│   │   │   │   ├── excelParser.js        # Input Layer
│   │   │   │   └── validator.js          # Validações de telefone/dados
│   │   │   ├── campaign/
│   │   │   │   ├── campaignManager.js    # Core Logic - Orquestrador
│   │   │   │   ├── messageBuilder.js     # Spintax + templates
│   │   │   │   └── complianceEngine.js   # Anti-Ban (delays, limites)
│   │   │   ├── whatsapp/
│   │   │   │   ├── sessionManager.js     # Multi-Device Manager
│   │   │   │   ├── loadBalancer.js       # Rotação de chips
│   │   │   │   └── whatsappClient.js     # Interface com wwebjs
│   │   │   └── utils/
│   │   │       ├── logger.js             # Winston logging
│   │   │       └── pathHelper.js         # Paths relativos
│   ├── renderer/                          # UI minimalista (se houver)
│   └── preload.js                         # Electron security bridge
├── tests/
│   ├── unit/
│   │   ├── parser.test.js
│   │   ├── spintax.test.js
│   │   └── loadBalancer.test.js
│   └── integration/
│       └── campaign.test.js
├── assets/
│   ├── icon.ico                           # Ícone do .exe
│   └── template.xlsx                      # Planilha modelo
├── package.json                           # Dependências e scripts
├── electron-builder.config.js             # Config do builder
└── README-DEV.md                          # Doc técnica2. Arquivos de Configuraçãoconfig.json (valores padrão seguros):
json{
  "compliance": {
    "minDelay": 30000,
    "maxDelay": 90000,
    "maxMessagesPerHour": 50,
    "maxMessagesPerDay": 300
  },
  "loadBalancer": {
    "strategy": "round-robin"
  },
  "logging": {
    "level": "info",
    "maxFiles": 7,
    "maxSize": "10m"
  }
}.env.example:
# Configurações opcionais
HEADLESS_MODE=true
SESSION_TIMEOUT=3600000
MAX_RETRY_ATTEMPTS=33. Assets e Recursostemplate.xlsx com estrutura de colunas:
NomeTelefoneVariavel1Variavel2Mensagemmanual-usuario.pdf: Guia completo em linguagem não-técnica (ver seção 11)4. Build Configurationpackage.json (seção completa):
json{
  "name": "disparador-whatsapp",
  "version": "1.0.0",
  "description": "Disparador Humanizado de Mensagens WhatsApp",
  "main": "src/main/index.js",
  "author": "Seu Nome",
  "license": "MIT",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev",
    "build": "electron-builder --win --x64",
    "build:portable": "electron-builder --win portable",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/"
  },
  "build": {
    "appId": "com.disparador.whatsapp",
    "productName": "Disparador WhatsApp",
    "directories": {
      "output": "dist",
      "buildResources": "assets"
    },
    "win": {
      "target": [
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "assets/icon.ico",
      "artifactName": "${productName}-${version}-Portable.${ext}"
    },
    "files": [
      "src/**/*",
      "node_modules/**/*",
      "package.json",
      "config.json"
    ],
    "extraResources": [
      {
        "from": "assets/template.xlsx",
        "to": "template.xlsx"
      },
      {
        "from": "assets/manual-usuario.pdf",
        "to": "manual-usuario.pdf"
      }
    ],
    "portable": {
      "artifactName": "${productName}-${version}-Portable.${ext}"
    }
  },
  "dependencies": {
    "whatsapp-web.js": "^1.23.0",
    "qrcode-terminal": "^0.12.0",
    "exceljs": "^4.4.0",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "electron-store": "^8.1.0"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "eslint": "^8.56.0"
  }
}Métricas de Sucesso (Critérios de Aceite)Seu código será considerado APROVADO apenas se:✅ Executabilidade:

Compila sem erros com npm run build
Gera .exe portátil funcional em dist/
Executa em Windows 10/11 limpo (sem Node.js instalado)
Inicia em < 10 segundos
✅ Funcionalidade Completa:

Conecta 3+ números WhatsApp simultaneamente
Parser valida e processa planilhas com 1000+ linhas
Load Balancer distribui mensagens uniformemente entre chips
Compliance Engine aplica delays aleatórios (verificável em logs)
Spintax gera mensagens diferentes a cada envio
Sistema reconecta automaticamente se sessão cair
✅ Resiliência:

Trata todos os erros possíveis (arquivo inválido, rede caída, sessão desconectada)
Logs informativos (Winston) com níveis apropriados (ERROR, WARN, INFO, DEBUG)
Não perde mensagens pendentes em caso de falha
Exibe mensagens de erro compreensíveis para usuário leigo
✅ Performance:

Parser: 1000 linhas em < 10 segundos
Memória: < 500MB com 3 sessões ativas
CPU: < 30% durante envios normais
Não trava interface durante operações longas
✅ Segurança Anti-Ban:

Delays com distribuição normal (não uniforme)
User-Agent randomizado
Simulação de digitação (50-150ms/caractere)
Limite de 50 msg/hora por chip (configurável)
✅ Portabilidade:

Todos os paths são relativos (sem C:\Users\...)
Sessões e configs em ./data/
Funciona copiando pasta inteira para outra máquina
👨‍💻 ROLE: DESENVOLVEDOR FULL-STACK SÊNIORVocê é um Desenvolvedor Full-Stack Sênior com as seguintes especializações:Expertises Técnicas

Automação RPA: 5+ anos com Puppeteer/Playwright, especialista em bypass de detecção de bots
Electron: Desenvolvimento de aplicações desktop cross-platform production-ready
WhatsApp Web Engineering: Conhecimento profundo do DOM do WhatsApp Web, estratégias de anti-banimento
Arquitetura Anti-Detecção: Fingerprinting, behavior simulation, traffic pattern obfuscation
Engenharia de Software Ágil: Entrega de MVPs em prazos críticos sem comprometer qualidade essencial
Filosofia de Desenvolvimento para Este ProjetoPRIORIDADES (em ordem decrescente):

Funcionalidade: Tudo especificado DEVE funcionar perfeitamente
Confiabilidade: Sistema não pode crashar ou perder dados
Usabilidade: Usuário não-técnico deve conseguir usar sem suporte
Performance: Adequada, mas não precisa ser NASA-level
Elegância de Código: Apreciada, mas não ao custo das prioridades acima
EVITAR ABSOLUTAMENTE:

❌ Over-engineering (padrões de design complexos desnecessários)
❌ Bibliotecas experimentais ou com < 1000 stars no GitHub
❌ Arquiteturas que exigem microserviços ou containers
❌ Otimizações prematuras (99% de eficiência quando 80% já resolve)
❌ Documentação excessiva no código (comentar apenas lógica não-óbvia)
ABRAÇAR:

✅ Pragmatismo técnico (usa soluções testadas e comprovadas)
✅ Fail-fast com mensagens de erro claras
✅ Logs verbosos para facilitar debug
✅ Tratamento defensivo de erros (assume que tudo pode falhar)
✅ Configurações via arquivo, não hardcoded
🔒 ESCOPO E LIMITES TÉCNICOS EXPLÍCITOSMATRIZ DE PRIORIZAÇÃOMUST HAVE (Obrigatório - Sem isso não entrega)Módulo Input Layer:

 Parser de Excel (.xlsx, .xls, .csv) com ExcelJS
 Validação robusta de telefones (regex internacional: ^55\d{10,11}$)
 Suporte a templates com variáveis: Olá {nome}, seu link: {link}
 Tratamento de linhas vazias/corrompidas (log erro, continua processamento)
 Relatório de erros ao final do parsing (array com linha + motivo)
Módulo Core Logic:

 Campaign Manager como orquestrador central
 Message Builder com Spintax: {Olá|Oi|Bom dia} {nome}!
 Compliance Engine:

Delays aleatórios com distribuição normal (Box-Muller)
Limite de mensagens/hora configurável
Simulação de digitação humana


 Load Balancer com estratégia round-robin
 Sistema de fila de mensagens pendentes
Módulo Connectivity:

 Multi-Device Session Manager (suportar 3-5 sessões)
 Integração com whatsapp-web.js v1.23+
 Persistência de sessões (LocalAuth do wwebjs)
 QR Code display no console (qrcode-terminal)
 Detecção de desconexão + reconexão automática (max 3 tentativas)
Infraestrutura Portátil:

 Estrutura de paths relativos (usar process.cwd() como raiz)
 Armazenamento em ./data/sessions/ e ./data/logs/
 Config via config.json na raiz
 Build como portable .exe (electron-builder)
SHOULD HAVE (Importante mas pode ser simplificado)
 Interface CLI minimalista (não precisa ser GUI completa)
 Testes unitários para componentes críticos (parser, spintax, load balancer)
 Logging com rotação de arquivos (Winston daily-rotate)
 Manual de usuário em PDF
COULD HAVE (Se sobrar tempo)
 Interface gráfica com Electron renderer
 Progresso visual com barras (cli-progress)
 Estatísticas de campanha (total enviado, sucesso rate, etc.)
 Export de relatórios em Excel
WON'T HAVE (Fora do Escopo)
❌ Integração com APIs externas (Asaas, Pipedrive, etc.)
❌ Agendamento de campanhas (cron jobs)
❌ Suporte a mídia rica (vídeo, áudio, documentos)
❌ Banco de dados (PostgreSQL, MySQL, MongoDB)
❌ Painel web para gerenciamento remoto
❌ Suporte a Linux ou macOS nesta versão
⚙️ REQUISITOS TÉCNICOS E DECISÕES DE IMPLEMENTAÇÃOStack Tecnológica (Não-Negociável)json{
  "runtime": "Node.js 18.x LTS",
  "framework": "Electron 28.x (última stable)",
  "whatsapp": {
    "lib": "whatsapp-web.js v1.23+",
    "justificativa": "Biblioteca mais madura e estável, ampla documentação, suporta multi-device nativamente",
    "alternativa": "Baileys (se wwebjs falhar nos testes iniciais)"
  },
  "excel": {
    "lib": "exceljs v4.4+",
    "justificativa": "Zero dependências nativas, suporta .xlsx/.xls/.csv, streaming para arquivos grandes"
  },
  "logging": {
    "lib": "winston v3.11+ com winston-daily-rotate-file",
    "justificativa": "Produção-ready, suporte a múltiplos transportes, rotação automática"
  },
  "builder": "electron-builder v24.9+",
  "testing": "jest v29.7+ (cobertura mínima 60%)"
}Arquitetura de Código (Estrutura Rígida)javascript// src/main/index.js - Entry Point
const { app, BrowserWindow } = require('electron');
const path = require('path');
const CampaignManager = require('./modules/campaign/campaignManager');
const logger = require('./modules/utils/logger');

// Garantir paths relativos
global.APP_ROOT = app.isPackaged 
  ? path.dirname(app.getPath('exe'))
  : process.cwd();

global.DATA_DIR = path.join(global.APP_ROOT, 'data');
global.SESSIONS_DIR = path.join(global.DATA_DIR, 'sessions');
global.LOGS_DIR = path.join(global.DATA_DIR, 'logs');
global.CONFIG_FILE = path.join(global.APP_ROOT, 'config.json');

// Criar diretórios se não existirem
const fs = require('fs');
[global.DATA_DIR, global.SESSIONS_DIR, global.LOGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.whenReady().then(() => {
  logger.info('Aplicação iniciada');
  // Inicializar sistema
  const campaignManager = new CampaignManager();
  campaignManager.start();
});Padrões de Código Obrigatórios1. Async/Await (Nunca Callbacks)javascript// ❌ ERRADO
fs.readFile('file.xlsx', (err, data) => {
  if (err) throw err;
  parser.parse(data, (err, result) => {
    // Callback hell...
  });
});

// ✅ CORRETO
async function processExcel(filePath) {
  try {
    const data = await fs.promises.readFile(filePath);
    const result = await parser.parse(data);
    return result;
  } catch (error) {
    logger.error(`Erro ao processar Excel: ${error.message}`);
    throw new Error(`Planilha inválida: ${error.message}`);
  }
}2. Try-Catch em Operações Críticasjavascript// Toda operação de I/O, rede, parsing DEVE ter try-catch
async function sendMessage(session, contact, message) {
  try {
    // Validar sessão
    if (!session.client.info) {
      throw new Error('Sessão não autenticada');
    }
    
    // Enviar
    await session.client.sendMessage(
      `${contact.phone}@c.us`,
      message
    );
    
    logger.info(`Mensagem enviada para ${contact.phone}`);
    return { success: true, contact };
    
  } catch (error) {
    logger.error(`Falha ao enviar para ${contact.phone}: ${error.message}`);
    
    // Retornar erro estruturado (não throw)
    return {
      success: false,
      contact,
      error: error.message,
      retryable: error.message.includes('timeout')
    };
  }
}3. Logging Estruturado (Winston)javascript// src/main/modules/utils/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return stack 
        ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
        : `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    // Console (desenvolvimento)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Arquivo com rotação diária
    new DailyRotateFile({
      filename: path.join(global.LOGS_DIR, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '7d',
      level: 'info'
    }),
    // Arquivo separado para erros
    new DailyRotateFile({
      filename: path.join(global.LOGS_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '14d',
      level: 'error'
    })
  ]
});

module.exports = logger;Implementações Detalhadas ObrigatóriasEXEMPLO 1: Parser de Excel com Validação Robustajavascript// src/main/modules/parser/excelParser.js
const ExcelJS = require('exceljs');
const logger = require('../utils/logger');

class ExcelParser {
  constructor() {
    this.requiredColumns = ['Nome', 'Telefone'];
    this.phoneRegex = /^55\d{10,11}$/; // Formato BR: 5511999887766
  }

  /**
   * Parsear planilha Excel e retornar contatos válidos
   * @param {string} filePath - Caminho para arquivo .xlsx/.xls/.csv
   * @returns {Promise<{contacts: Array, errors: Array}>}
   */
  async parse(filePath) {
    const workbook = new ExcelJS.Workbook();
    const validContacts = [];
    const errors = [];

    try {
      logger.info(`Iniciando parsing de ${filePath}`);
      
      // Suportar .xlsx, .xls e .csv
      if (filePath.endsWith('.csv')) {
        await workbook.csv.readFile(filePath);
      } else {
        await workbook.xlsx.readFile(filePath);
      }

      const worksheet = workbook.getWorksheet(1);
      
      if (!worksheet) {
        throw new Error('Planilha vazia ou inválida');
      }

      // Validar headers (primeira linha)
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value?.toString().trim();
      });

      // Verificar colunas obrigatórias
      const missingColumns = this.requiredColumns.filter(
        col => !headers.includes(col)
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `Colunas obrigatórias faltando: ${missingColumns.join(', ')}\n` +
          `Colunas encontradas: ${headers.filter(Boolean).join(', ')}`
        );
      }

      // Mapear índices das colunas
      const columnMap = {};
      headers.forEach((header, index) => {
        if (header) columnMap[header] = index;
      });

      // Processar linhas de dados
      let processedRows = 0;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        try {
          const contact = this._parseRow(row, columnMap, rowNumber);
          
          // Validar telefone
          if (!this._validatePhone(contact.phone)) {
            errors.push({
              line: rowNumber,
              field: 'Telefone',
              value: contact.phone,
              message: 'Formato inválido. Use: 5511999887766'
            });
            return;
          }

          // Validar nome
          if (!contact.name || contact.name.length < 2) {
            errors.push({
              line: rowNumber,
              field: 'Nome',
              value: contact.name,
              message: 'Nome deve ter pelo menos 2 caracteres'
            });
            return;
          }

          validContacts.push(contact);
          processedRows++;

        } catch (error) {
          errors.push({
            line: rowNumber,
            message: error.message
          });
        }
      });

      logger.info(
        `Parsing concluído: ${validContacts.length} válidos, ` +
        `${errors.length} erros em ${processedRows + errors.length} linhas`
      );

      return { contacts: validContacts, errors };

    } catch (error) {
      logger.error(`Erro fatal ao processar planilha: ${error.message}`);
      throw new Error(
        `Não foi possível processar a planilha.\n` +
        `Erro: ${error.message}\n` +
        `Verifique se o arquivo está no formato correto (.xlsx, .xls ou .csv)`
      );
    }
  }

  /**
   * Extrair dados de uma linha
   */
  _parseRow(row, columnMap, rowNumber) {
    const getValue = (columnName) => {
      const cellIndex = columnMap[columnName];
      if (!cellIndex) return '';
      
      const cell = row.getCell(cellIndex);
      return cell.value?.toString().trim() || '';
    };

    return {
      name: getValue('Nome'),
      phone: getValue('Telefone').replace(/\D/g, ''), // Remove não-dígitos
      var1: getValue('Variavel1'),
      var2: getValue('Variavel2'),
      customMessage: getValue('Mensagem'),
      rowNumber
    };
  }

  /**
   * Validar formato de telefone brasileiro
   */
  _validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    
    // Remove caracteres não-numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Valida formato: 5511999887766 (código país + DDD + número)
    return this.phoneRegex.test(cleaned);
  }

  /**
   * Normalizar telefone para formato internacional
   */
  normalizePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    // Se não tem código do país, adiciona 55
    if (cleaned.length === 10 || cleaned.length === 11) {
      return '55' + cleaned;
    }
    
    return cleaned;
  }
}

module.exports = ExcelParser;EXEMPLO 2: Load Balancer com Round-Robinjavascript// src/main/modules/whatsapp/loadBalancer.js
const logger = require('../utils/logger');

class LoadBalancer {
  constructor(config = {}) {
    this.sessions = []; // Array de {id, client, stats}
    this.strategy = config.strategy || 'round-robin';
    this.lastUsedIndex = -1;
  }

  /**
   * Adicionar sessão ao pool
   */
  addSession(session) {
    const sessionData = {
      id: session.id,
      client: session.client,
      stats: {
        messageCount: 0,
        lastUsed: 0,
        errors: 0,
        isActive: true
      }
    };

    this.sessions.push(sessionData);
    logger.info(`Sessão ${session.id} adicionada ao load balancer`);
  }

  /**
   * Remover sessão do pool
   */
  removeSession(sessionId) {
    const index = this.sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      this.sessions.splice(index, 1);
      logger.info(`Sessão ${sessionId} removida do load balancer`);
    }
  }

  /**
   * Obter próxima sessão disponível
   */
  getNextSession() {
    const activeSessions = this._getActiveSessions();

    if (activeSessions.length === 0) {
      throw new Error(
        'Nenhuma sessão WhatsApp disponível.\n' +
        'Conecte pelo menos um número antes de iniciar a campanha.'
      );
    }

    let selectedSession;

    if (this.strategy === 'round-robin') {
      selectedSession = this._roundRobin(activeSessions);
    } else if (this.strategy === 'least-loaded') {
      selectedSession = this._leastLoaded(activeSessions);
    } else {
      selectedSession = activeSessions[0]; // Fallback
    }

    logger.debug(
      `Sessão selecionada: ${selectedSession.id} ` +
      `(${selectedSession.stats.messageCount} msgs enviadas)`
    );

    return selectedSession;
  }

  /**
   * Registrar uso de uma sessão
   */
  recordUsage(sessionId, success = true) {
    const session = this.sessions.find(s => s.id === sessionId);
    
    if (session) {
      session.stats.messageCount++;
      session.stats.lastUsed = Date.now();
      
      if (!success) {
        session.stats.errors++;
        
        // Desativar sessão se muitos erros consecutivos
        if (session.stats.errors >= 3) {
          session.stats.isActive = false;
          logger.warn(
            `Sessão ${sessionId} desativada após 3 erros consecutivos`
          );
        }
      } else {
        session.stats.errors = 0; // Reset contador de erros
      }
    }
  }

  /**
   * Marcar sessão como ativa/inativa
   */
  setSessionStatus(sessionId, isActive) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.stats.isActive = isActive;
      logger.info(`Sessão ${sessionId} ${isActive ? 'ativada' : 'desativada'}`);
    }
  }

  /**
   * Obter estatísticas de todas as sessões
   */
  getStats() {
    return this.sessions.map(s => ({
      id: s.id,
      messageCount: s.stats.messageCount,
      lastUsed: s.stats.lastUsed,
      errors: s.stats.errors,
      isActive: s.stats.isActive
    }));
  }

  // ========== Estratégias de Balanceamento ==========

  /**
   * Estratégia Round-Robin (revezamento circular)
   */
  _roundRobin(activeSessions) {
    this.lastUsedIndex = (this.lastUsedIndex + 1) % activeSessions.length;
    return activeSessions[this.lastUsedIndex];
  }

  /**
   * Estratégia Least-Loaded (sessão com menos mensagens)
   */
  _leastLoaded(activeSessions) {
    return activeSessions.reduce((least, current) => {
      return current.stats.messageCount < least.stats.messageCount
        ? current
        : least;
    });
  }

  /**
   * Filtrar apenas sessões ativas e conectadas
   */
  _getActiveSessions() {
    return this.sessions.filter(session => {
      // Verificar se está ativa
      if (!session.stats.isActive) return false;

      // Verificar se cliente está conectado
      try {
        return session.client && session.client.info;
      } catch (error) {
        logger.warn(`Sessão ${session.id} não está conectada`);
        return false;
      }
    });
  }
}

module.exports = LoadBalancer;EXEMPLO 3: Compliance Engine (Anti-Ban Completo)javascript// src/main/modules/campaign/complianceEngine.js
const logger = require('../utils/logger');

class ComplianceEngine {
  constructor(config = {}) {
    // Delays (em milissegundos)
    this.minDelay = config.minDelay || 30000; // 30s
    this.maxDelay = config.maxDelay || 90000; // 90s
    
    // Limites de envio
    this.maxMessagesPerHour = config.maxMessagesPerHour || 50;
    this.maxMessagesPerDay = config.maxMessagesPerDay || 300;
    
    // Histórico de mensagens (timestamps)
    this.messageHistory = [];
    
    // Configurações de simulação humana
    this.typingSpeed = {
      min: 50,  // 50ms por caractere (rápido)
      max: 150  // 150ms por caractere (lento)
    };

    logger.info('Compliance Engine inicializado', {
      minDelay: this.minDelay / 1000 + 's',
      maxDelay: this.maxDelay / 1000 + 's',
      maxPerHour: this.maxMessagesPerHour
    });
  }

  /**
   * Aguardar antes de enviar próxima mensagem
   * (Aplica todas as regras de compliance)
   */
  async waitBeforeSend() {
    // Regra 1: Verificar limite de mensagens/hora
    await this._checkHourlyLimit();

    // Regra 2: Verificar limite de mensagens/dia
    await this._checkDailyLimit();

    // Regra 3: Aplicar delay aleatório humanizado
    const delay = this._getRandomDelay();
    
    logger.debug(
      `Aguardando ${Math.round(delay / 1000)}s antes do próximo envio ` +
      `(${this.messageHistory.length} msgs na última hora)`
    );

    await this._sleep(delay);

    // Registrar timestamp deste envio
    this.messageHistory.push(Date.now());
  }

  /**
   * Simular digitação humana antes de enviar
   */
  async simulateTyping(client, chatId, message) {
    try {
      // Enviar presença "disponível"
      await client.sendPresenceAvailable();

      // Enviar indicador "digitando..."
      await client.sendPresenceUpdate('composing', chatId);

      // Calcular tempo de digitação baseado no tamanho da mensagem
      const typingTime = this._calculateTypingTime(message);

      logger.debug(`Simulando digitação por ${typingTime}ms`);
      await this._sleep(typingTime);

      // Pausar digitação
      await client.sendPresenceUpdate('paused', chatId);

    } catch (error) {
      // Não é crítico se falhar, apenas loga
      logger.warn(`Erro ao simular digitação: ${error.message}`);
    }
  }

  /**
   * Obter estatísticas de compliance
   */
  getStats() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    return {
      messagesLastHour: this.messageHistory.filter(t => t > oneHourAgo).length,
      messagesLastDay: this.messageHistory.filter(t => t > oneDayAgo).length,
      limits: {
        hourly: this.maxMessagesPerHour,
        daily: this.maxMessagesPerDay
      }
    };
  }

  // ========== Métodos Privados ==========

  /**
   * Verificar limite de mensagens/hora
   */
  async _checkHourlyLimit() {
    const oneHourAgo = Date.now() - 3600000;
    
    // Limpar histórico antigo (> 1 hora)
    this.messageHistory = this.messageHistory.filter(ts => ts > oneHourAgo);

    if (this.messageHistory.length >= this.maxMessagesPerHour) {
      const oldestMessage = Math.min(...this.messageHistory);
      const waitTime = oldestMessage + 3600000 - Date.now();

      logger.warn(
        `Limite de ${this.maxMessagesPerHour} msg/hora atingido. ` +
        `Aguardando ${Math.round(waitTime / 60000)} minutos...`
      );

      await this._sleep(waitTime);
      
      // Limpar histórico após espera
      this.messageHistory = [];
    }
  }

  /**
   * Verificar limite de mensagens/dia
   */
  async _checkDailyLimit() {
    const oneDayAgo = Date.now() - 86400000;
    const messagesLastDay = this.messageHistory.filter(ts => ts > oneDayAgo);

    if (messagesLastDay.length >= this.maxMessagesPerDay) {
      const oldestMessage = Math.min(...messagesLastDay);
      const waitTime = oldestMessage + 86400000 - Date.now();

      logger.error(
        `Limite DIÁRIO de ${this.maxMessagesPerDay} mensagens atingido! ` +
        `Campanha pausada até ${new Date(Date.now() + waitTime).toLocaleString()}`
      );

      throw new Error(
        `Limite diário de ${this.maxMessagesPerDay} mensagens atingido.\n` +
        `Aguarde ${Math.round(waitTime / 3600000)} horas ou aumente o limite em config.json`
      );
    }
  }

  /**
   * Gerar delay aleatório com distribuição normal (Box-Muller)
   */
  _getRandomDelay() {
    const mean = (this.minDelay + this.maxDelay) / 2;
    const stdDev = (this.maxDelay - this.minDelay) / 6;

    // Box-Muller Transform (distribuição normal)
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const delay = Math.round(mean + stdDev * z);

    // Garantir que está dentro dos limites
    return Math.max(this.minDelay, Math.min(this.maxDelay, delay));
  }

  /**
   * Calcular tempo de digitação baseado no tamanho da mensagem
   */
  _calculateTypingTime(message) {
    const charCount = message.length;
    
    // Tempo aleatório por caractere (50-150ms)
    const msPerChar = 
      this.typingSpeed.min + 
      Math.random() * (this.typingSpeed.max - this.typingSpeed.min);

    // Tempo base + variação aleatória
    const baseTime = charCount * msPerChar;
    const variation = baseTime * 0.2; // ±20% de variação

    return Math.round(baseTime + (Math.random() - 0.5) * variation);
  }

  /**
   * Sleep assíncrono
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ComplianceEngine;EXEMPLO 4: Message Builder com Spintaxjavascript// src/main/modules/campaign/messageBuilder.js
const logger = require('../utils/logger');

class MessageBuilder {
  /**
   * Construir mensagem personalizada para um contato
   * @param {Object} contact - Dados do contato {name, phone, var1, var2, customMessage}
   * @param {string} template - Template base (opcional se contact tem customMessage)
   * @returns {string} Mensagem final processada
   */
  build(contact, template = null) {
    try {
      // Usar mensagem customizada do Excel ou template padrão
      let message = contact.customMessage || template;

      if (!message) {
        throw new Error('Nenhuma mensagem ou template fornecido');
      }

      // Passo 1: Substituir variáveis
      message = this._replaceVariables(message, contact);

      // Passo 2: Processar Spintax (variações aleatórias)
      message = this._parseSpintax(message);

      // Passo 3: Limpar espaços extras
      message = message.replace(/\s+/g, ' ').trim();

      logger.debug(`Mensagem construída para ${contact.name}: ${message.substring(0, 50)}...`);

      return message;

    } catch (error) {
      logger.error(`Erro ao construir mensagem para ${contact.phone}: ${error.message}`);
      throw new Error(`Falha ao construir mensagem: ${error.message}`);
    }
  }

  /**
   * Substituir variáveis no formato {variavel}
   */
  _replaceVariables(message, contact) {
    const variables = {
      nome: contact.name,
      telefone: contact.phone,
      variavel1: contact.var1 || '',
      variavel2: contact.var2 || '',
      var1: contact.var1 || '',
      var2: contact.var2 || ''
    };

    let result = message;

    // Substituir cada variável
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'gi');
      result = result.replace(regex, variables[key]);
    });

    // Verificar se sobraram variáveis não substituídas
    const unresolvedVars = result.match(/{([^{}]+)}/g);
    if (unresolvedVars && unresolvedVars.length > 0) {
      logger.warn(`Variáveis não encontradas: ${unresolvedVars.join(', ')}`);
    }

    return result;
  }

  /**
   * Processar Spintax: {opção1|opção2|opção3}
   * Exemplos:
   * - "{Olá|Oi|Bom dia}" → escolhe uma opção aleatoriamente
   * - "Como {vai|está}?" → "Como vai?" ou "Como está?"
   */
  _parseSpintax(text) {
    const regex = /{([^{}]+)}/g;
    let result = text;
    let match;

    // Processar todos os blocos {a|b|c}
    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];        // "{Olá|Oi}"
      const options = match[1].split('|'); // ["Olá", "Oi"]

      // Escolher opção aleatória
      const chosen = options[Math.floor(Math.random() * options.length)];

      // Substituir no texto
      result = result.replace(fullMatch, chosen.trim());
    }

    return result;
  }

  /**
   * Validar se uma mensagem é válida
   */
  validate(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Mensagem vazia ou inválida' };
    }

    if (message.length < 5) {
      return { valid: false, error: 'Mensagem muito curta (mínimo 5 caracteres)' };
    }

    if (message.length > 4096) {
      return { valid: false, error: 'Mensagem muito longa (máximo 4096 caracteres)' };
    }

    return { valid: true };
  }

  /**
   * Gerar preview de mensagem (para testes)
   */
  preview(template, sampleContact) {
    const examples = [];

    // Gerar 3 variações para mostrar efeito do Spintax
    for (let i = 0; i < 3; i++) {
      const message = this.build(sampleContact, template);
      examples.push(message);
    }

    return {
      template,
      contact: sampleContact,
      variations: examples,
      spintaxDetected: /{[^{}]+\|[^{}]+}/.test(template)
    };
  }
}

module.exports = MessageBuilder;📋 FORMATO DE SAÍDA ESTRUTURADOApós implementar todo o código, você DEVE entregar a seguinte documentação estruturada:markdown# 🚀 ENTREGA DE IMPLEMENTAÇÃO - DISPARADOR WHATSAPP

## 1. RESUMO EXECUTIVO

[Parágrafo de 3-5 linhas confirmando:]
- Todos os módulos arquiteturais implementados
- Funcionalidades testadas e funcionando
- Build gerado com sucesso
- Pronto para entrega ao cliente

## 2. ARQUIVOS GERADOS

### 2.1 Código-Fonte Principal

**Total de arquivos:** X arquivos JavaScript

**Estrutura:**
- `src/main/index.js` (234 linhas) - Entry point do Electron
- `src/main/modules/parser/excelParser.js` (187 linhas) - Parser de Excel com validação
- `src/main/modules/campaign/campaignManager.js` (315 linhas) - Orquestrador principal
- `src/main/modules/campaign/messageBuilder.js` (142 linhas) - Construtor com Spintax
- `src/main/modules/campaign/complianceEngine.js` (231 linhas) - Sistema Anti-Ban
- `src/main/modules/whatsapp/sessionManager.js` (198 linhas) - Gerenciador de sessões
- `src/main/modules/whatsapp/loadBalancer.js` (156 linhas) - Load balancer round-robin
- `src/main/modules/whatsapp/whatsappClient.js` (209 linhas) - Interface wwebjs
- `src/main/modules/utils/logger.js` (67 linhas) - Winston logging
- `src/main/modules/utils/pathHelper.js` (34 linhas) - Helpers de paths relativos
- [Listar todos os outros arquivos...]

### 2.2 Arquivos de Configuração

**config.json:**
```json{
"compliance": {
"minDelay": 30000,
"maxDelay": 90000,
"maxMessagesPerHour": 50,
"maxMessagesPerDay": 300
},
"loadBalancer": {
"strategy": "round-robin"
},
"logging": {
"level": "info",
"maxFiles": 7,
"maxSize": "10m"
}
}

**package.json:** [Incluir conteúdo completo com todas as dependências]

**.env.example:**HEADLESS_MODE=true
SESSION_TIMEOUT=3600000
MAX_RETRY_ATTEMPTS=3

### 2.3 Assets e Recursos

**template.xlsx:**
Planilha com estrutura de colunas:
| Nome | Telefone | Variavel1 | Variavel2 | Mensagem |

**manual-usuario.pdf:** 
Manual completo de 8 páginas com:
- Primeiro uso (QR code, planilha)
- Funcionalidades avançadas (multi-chip, spintax)
- Perguntas frequentes
- Troubleshooting

## 3. INSTRUÇÕES DE BUILD

### Pré-requisitos
- Node.js 18.x ou superior
- Windows 10/11 (64-bit)
- 2GB de espaço em disco

### Passos:
```bash1. Instalar dependências
npm install2. Executar em modo desenvolvimento (para testes)
npm run dev3. Gerar executável portátil
npm run buildResultado:
dist/DisparadorWhatsApp-1.0.0-Portable.exe (aprox. 150MB)

### Troubleshooting do Build:
- Se erro "gyp ERR!": Instalar `windows-build-tools`
- Se erro "ENOENT": Verificar se `assets/` contém todos os arquivos
- Se erro "electron-builder": Limpar cache com `npm cache clean --force`

## 4. GUIA DE TESTE

### Teste 1: Instalação e Inicialização[✓] Extrair pasta para C:\MeusDispadores
[✓] Executar DisparadorWhatsApp.exe
[✓] Verificar que interface CLI aparece
[✓] Verificar criação automática de data/sessions/ e data/logs/
Tempo esperado: < 30 segundos

### Teste 2: Conexão Multi-Chip[✓] Executar aplicação
[✓] Escanear QR code para Chip 1
[✓] Aguardar "Sessão chip-1 conectada"
[✓] Pressionar "Conectar Novo Chip"
[✓] Escanear QR code para Chip 2
[✓] Verificar no console: "2 sessões ativas"
[✓] Verificar logs em data/logs/app-YYYY-MM-DD.log
Tempo esperado: 2-5 minutos

### Teste 3: Parser de Excel[✓] Preparar planilha com:
- 3 contatos válidos (55119...)
- 1 contato com telefone inválido
- 1 linha vazia
[✓] Selecionar planilha no menu
[✓] Verificar console: "3 contatos válidos, 1 erros"
[✓] Verificar que erro foi logado (linha + motivo)
Tempo esperado: < 10 segundos

### Teste 4: Envio com Load Balancer[✓] Conectar 2 chips
[✓] Carregar planilha com 10 contatos
[✓] Iniciar campanha
[✓] Observar logs: "Sessão selecionada: chip-1", depois "chip-2", depois "chip-1"...
[✓] Verificar que mensagens foram alternadas entre chips
Tempo esperado: 5-15 minutos (com delays)

### Teste 5: Compliance (Anti-Ban)[✓] Monitorar logs durante envio de 10 mensagens
[✓] Verificar delays aleatórios (não devem ser iguais)
[✓] Confirmar: "Aguardando 47s..." depois "Aguardando 63s..."
[✓] Verificar que nenhum delay foi < 30s ou > 90s
[✓] Verificar presença de "Simulando digitação por Xms"

### Teste 6: Spintax (Variação de Texto)[✓] Criar planilha com mensagem: "Olá {nome}! {Como vai|Tudo bem}?"
[✓] Enviar para 5 contatos
[✓] Verificar nos logs que mensagens foram diferentes:
- "Olá João! Como vai?"
- "Olá Maria! Tudo bem?"
- "Olá Pedro! Como vai?"
[✓] Confirmar que nenhuma mensagem foi idêntica

### Teste 7: Portabilidade[✓] Copiar pasta inteira para outro diretório
[✓] Executar .exe da nova localização
[✓] Verificar que funcionou normalmente
[✓] Confirmar que sessões não foram perdidas
Esperado: Funciona sem erros

### Teste 8: Tratamento de Erros[✓] Desconectar internet durante envio
[✓] Verificar mensagem de erro clara
[✓] Reconectar internet
[✓] Verificar que sistema retoma de onde parou
[✓] Forçar fechamento de WhatsApp Web (navegador)
[✓] Verificar reconexão automática

## 5. DECISÕES TÉCNICAS IMPORTANTES

### Biblioteca WhatsApp: whatsapp-web.js
**Por quê:** 
- Maturidade: 4+ anos de desenvolvimento ativo
- Multi-device nativo (não requer parear com celular)
- Documentação extensa e comunidade ativa (15k+ stars)
- Suporte a LocalAuth (persistência de sessões)

**Alternativa considerada:** Baileys
**Descartada porque:** API de baixo nível, requer mais código boilerplate

### Estratégia de Load Balancer: Round-Robin
**Por quê:**
- Simples de implementar e debugar
- Distribui carga uniformemente
- Previsível para o usuário

**Alternativa:** Least-Loaded
**Quando usar:** Se cliente solicitar otimização futura

### Persistência: LocalAuth + config.json
**Por quê:**
- Zero dependências externas (sem banco de dados)
- Facilita portabilidade (copiar/colar pasta)
- Suficiente para escopo do projeto

**Não usamos:** SQLite ou MongoDB
**Porque:** Over-engineering para escopo atual

### Delays com Distribuição Normal (Box-Muller)
**Por quê:**
- Mais realista que distribuição uniforme
- Evita padrões previsíveis
- Comprovado em estudos de anti-detecção de bots

**Alternativa:** Math.random() simples
**Por que não:** Distribuição uniforme é facilmente detectável

## 6. LIMITAÇÕES CONHECIDAS

1. **Máximo de 5 sessões simultâneas**
   - Motivo: Limitação de memória (cada sessão = ~100MB)
   - Workaround: Cliente pode abrir múltiplas instâncias da app

2. **Apenas texto e imagens simples**
   - Áudio, vídeo, documentos não suportados nesta versão
   - Rationale: Escopo MVP focado em texto

3. **Sem agendamento de campanhas**
   - Campanha inicia imediatamente após "Start"
   - Futura feature: Agendar para data/hora específica

4. **Dependência de WhatsApp Web**
   - Se WhatsApp mudar DOM drasticamente, pode quebrar
   - Mitigação: Usar versão pinada de wwebjs, monitorar updates

5. **Windows-only**
   - Linux/macOS requerem ajustes em paths e build config
   - Rationale: Cliente usa apenas Windows

## 7. TROUBLESHOOTING

### Erro: "Nenhuma sessão WhatsApp disponível"
**Causa:** QR Code não foi escaneado ou sessão expirou
**Solução:**
1. Abrir aplicação
2. Aguardar QR Code aparecer
3. Escanear com WhatsApp > Aparelhos Conectados
4. Aguardar "Sessão conectada com sucesso"

### Erro: "Planilha inválida: coluna 'Telefone' não encontrada"
**Causa:** Planilha não segue formato do template
**Solução:**
1. Abrir `template.xlsx` fornecido
2. Verificar que primeira linha tem: Nome | Telefone | Variavel1 | ...
3. Copiar/colar dados para template correto

### Erro: "Limite de 50 msg/hora atingido"
**Causa:** Compliance Engine bloqueou por segurança
**Soluções:**
- Aguardar tempo indicado no log
- OU editar `config.json`: aumentar `maxMessagesPerHour`
- OU conectar mais chips para distribuir carga

### Erro: "Failed to launch chrome"
**Causa:** Falta de permissões ou antivírus bloqueando Puppeteer
**Solução:**
1. Executar como Administrador
2. Adicionar exceção no antivírus (pasta do app)
3. Verificar espaço em disco (mínimo 2GB livres)

### WhatsApp desconecta frequentemente
**Causas possíveis:**
- Internet instável
- WhatsApp Web fez logout no celular
- Muitas mensagens/hora (banimento temporário)

**Soluções:**
1. Verificar conexão de internet
2. Reescanear QR Code
3. Reduzir `maxMessagesPerHour` em config.json
4. Aumentar intervalo de delays (maxDelay: 120000)

### Aplicação não inicia (janela fecha imediatamente)
**Causa:** Erro fatal no código ou dependência faltando
**Solução:**
1. Executar via terminal: `DisparadorWhatsApp.exe > output.txt 2>&1`
2. Abrir `output.txt` para ver erro
3. Verificar logs em `data/logs/error-YYYY-MM-DD.log`

## 8. CÓDIGO-FONTE COMPLETO

### src/main/index.js
```javascript[INCLUIR CÓDIGO COMPLETO AQUI]

### src/main/modules/parser/excelParser.js
```javascript[INCLUIR CÓDIGO COMPLETO AQUI]

[... CONTINUAR PARA TODOS OS MÓDULOS ...]

---

## 9. CHECKLIST FINAL DE ENTREGA

Antes de entregar ao cliente, verificar:

- [ ] Código compila sem warnings
- [ ] Build gera .exe funcional
- [ ] .exe executa em máquina limpa (sem Node.js)
- [ ] QR Code é exibido corretamente
- [ ] Parser processa planilha de 100 linhas em < 5s
- [ ] Load Balancer alterna entre chips
- [ ] Delays são aleatórios e respeitam limites
- [ ] Spintax gera mensagens diferentes
- [ ] Logs são criados em data/logs/
- [ ] Manual de usuário está no .zip
- [ ] Template.xlsx está incluído
- [ ] Config.json tem valores seguros padrão
- [ ] Pasta pode ser copiada e funciona em novo local

## 10. PRÓXIMOS PASSOS (Pós-Entrega)

### Para o Cliente:
1. Descompactar pasta em local seguro
2. Executar DisparadorWhatsApp.exe
3. Conectar primeiro chip (escanear QR)
4. Testar com 3-5 contatos antes de campanha grande
5. Ler manual-usuario.pdf (especialmente seção "Boas Práticas")

### Para Manutenção Futura:
1. Monitorar updates de whatsapp-web.js (avisar cliente se mudar)
2. Coletar feedback sobre taxa de banimento (ajustar delays se necessário)
3. Se cliente solicitar features extras, revisar escopo e orçamento

### Features Sugeridas para V2 (Fora do Escopo Atual):
- Interface gráfica completa (Electron renderer)
- Agendamento de campanhas
- Suporte a imagens/vídeos
- Relatórios com gráficos (taxa de entrega, erros, etc.)
- Integração com CRMs (Pipedrive, RD Station)

---

**Assinatura Técnica:**
- Desenvolvedor: [Seu Nome]
- Data: [Data da Entrega]
- Versão: 1.0.0
- Status: ✅ PRONTO PARA PRODUÇÃO🎯 CRITÉRIOS DE QUALIDADE OBJETIVOSSeu código será avaliado pelos seguintes critérios mensuráveis:✅ Funcionalidade (40 pontos)

 10 pts: Parser processa Excel com 1000 linhas sem erros
 10 pts: Load Balancer distribui mensagens uniformemente entre 3 chips
 10 pts: Compliance Engine aplica delays aleatórios (verificar logs)
 10 pts: Sistema reconecta automaticamente após queda de sessão
✅ Confiabilidade (25 pontos)

 10 pts: Tratamento de erros em TODOS os pontos críticos (parser, envio, sessão)
 10 pts: Logs informativos (não apenas stack traces) em data/logs/
 5 pts: Sistema não perde mensagens pendentes em caso de crash
✅ Usabilidade (20 pontos)

 10 pts: Manual de usuário em linguagem não-técnica (< 8ª série)
 5 pts: Mensagens de erro compreensíveis (Ex: "Planilha inválida" não "TypeError")
 5 pts: Setup completo em < 5 minutos para usuário leigo
✅ Performance (10 pontos)

 5 pts: Parser: 1000 linhas em < 10s
 3 pts: Memória < 500MB com 3 sessões
 2 pts: Não trava durante envios longos
✅ Segurança Anti-Ban (5 pontos)

 2 pts: Delays com distribuição normal (não uniforme)
 2 pts: Spintax funcional (mensagens diferentes)
 1 pt: User-Agent randomizado
NOTA MÍNIMA PARA APROVAÇÃO: 85/100 pontos🧪 INSTRUÇÕES DE TESTE E VALIDAÇÃOTestes Unitários (Jest) - Cobertura Mínima 60%javascript// tests/unit/parser.test.js
const ExcelParser = require('../../src/main/modules/parser/excelParser');

describe('ExcelParser', () => {
  let parser;

  beforeEach(() => {
    parser = new ExcelParser();
  });

  test('deve validar telefones brasileiros corretamente', () => {
    expect(parser._validatePhone('5511999887766')).toBe(true);
    expect(parser._validatePhone('11999887766')).toBe(false); // sem código país
    expect(parser._validatePhone('abc')).toBe(false);
    expect(parser._validatePhone('')).toBe(false);
  });

  test('deve normalizar telefones sem código país', () => {
    expect(parser.normalizePhone('11999887766')).toBe('5511999887766');
    expect(parser.normalizePhone('5511999887766')).toBe('5511999887766');
  });

  test('deve rejeitar planilha sem coluna obrigatória', async () => {
    await expect(parser.parse('test/fixtures/invalid-columns.xlsx'))
      .rejects.toThrow('Colunas obrigatórias faltando');
  });

  test('deve processar planilha válida corretamente', async () => {
    const result = await parser.parse('test/fixtures/valid.xlsx');
    
    expect(result.contacts).toHaveLength(3);
    expect(result.errors).toHaveLength(1); // 1 telefone inválido
    expect(result.contacts[0]).toHaveProperty('name');
    expect(result.contacts[0]).toHaveProperty('phone');
  });
});

// tests/unit/messageBuilder.test.js
const MessageBuilder = require('../../src/main/modules/campaign/messageBuilder');

describe('MessageBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new MessageBuilder();
  });

  test('deve substituir variáveis corretamente', () => {
    const contact = {
      name: 'João',
      phone: '5511999887766',
      var1: 'valor1'
    };

    const template = 'Olá {nome}, seu código é {var1}';
    const result = builder.build(contact, template);

    expect(result).toBe('Olá João, seu código é valor1');
  });

  test('deve processar Spintax corretamente', () => {
    const contact = { name: 'Maria', phone: '5511888776655' };
    const template = '{Olá|Oi} {nome}!';
    
    const results = new Set();
    for (let i = 0; i < 50; i++) {
      results.add(builder.build(contact, template));
    }

    // Deve gerar pelo menos 2 variações diferentes em 50 tentativas
    expect(results.size).toBeGreaterThan(1);
    expect([...results].every(msg => 
      msg === 'Olá Maria!' || msg === 'Oi Maria!'
    )).toBe(true);
  });

  test('deve validar mensagens corretamente', () => {
    expect(builder.validate('Olá mundo').valid).toBe(true);
    expect(builder.validate('Oi').valid).toBe(false); // Muito curta
    expect(builder.validate('').valid).toBe(false);
    expect(builder.validate('a'.repeat(5000)).valid).toBe(false); // Muito longa
  });
});

// tests/unit/loadBalancer.test.js
const LoadBalancer = require('../../src/main/modules/whatsapp/loadBalancer');

describe('LoadBalancer', () => {
  let balancer;
  let mockSessions;

  beforeEach(() => {
    mockSessions = [
      { id: 'chip-1', client: { info: { wid: '123' } } },
      { id: 'chip-2', client: { info: { wid: '456' } } },
      { id: 'chip-3', client: { info: { wid: '789' } } }
    ];

    balancer = new LoadBalancer({ strategy: 'round-robin' });
    mockSessions.forEach(s => balancer.addSession(s));
  });

  test('deve distribuir com round-robin corretamente', () => {
    const session1 = balancer.getNextSession();
    const session2 = balancer.getNextSession();
    const session3 = balancer.getNextSession();
    const session4 = balancer.getNextSession();

    expect(session1.id).toBe('chip-1');
    expect(session2.id).toBe('chip-2');
    expect(session3.id).toBe('chip-3');
    expect(session4.id).toBe('chip-1'); // Volta para o primeiro
  });

  test('deve lançar erro se não houver sessões', () => {
    const emptyBalancer = new LoadBalancer();
    
    expect(() => emptyBalancer.getNextSession())
      .toThrow('Nenhuma sessão WhatsApp disponível');
  });

  test('deve registrar uso corretamente', () => {
    balancer.recordUsage('chip-1');
    balancer.recordUsage('chip-1');
    
    const stats = balancer.getStats();
    const chip1Stats = stats.find(s => s.id === 'chip-1');
    
    expect(chip1Stats.messageCount).toBe(2);
    expect(chip1Stats.lastUsed).toBeGreaterThan(0);
  });

  test('deve desativar sessão após 3 erros consecutivos', () => {
    balancer.recordUsage('chip-2', false);
    balancer.recordUsage('chip-2', false);
    balancer.recordUsage('chip-2', false);

    const stats = balancer.getStats();
    const chip2Stats = stats.find(s => s.id === 'chip-2');

    expect(chip2Stats.isActive).toBe(false);
  });
});

// tests/unit/complianceEngine.test.js
const ComplianceEngine = require('../../src/main/modules/campaign/complianceEngine');

describe('ComplianceEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new ComplianceEngine({
      minDelay: 1000, // 1s para testes rápidos
      maxDelay: 3000,
      maxMessagesPerHour: 5
    });
  });

  test('deve gerar delays dentro dos limites', () => {
    for (let i = 0; i < 100; i++) {
      const delay = engine._getRandomDelay();
      expect(delay).toBeGreaterThanOrEqual(1000);
      expect(delay).toBeLessThanOrEqual(3000);
    }
  });

  test('deve calcular tempo de digitação proporcional ao tamanho', () => {
    const shortMsg = 'Oi';
    const longMsg = 'Olá, tudo bem? Gostaria de falar sobre...';

    const shortTime = engine._calculateTypingTime(shortMsg);
    const longTime = engine._calculateTypingTime(longMsg);

    expect(longTime).toBeGreaterThan(shortTime);
  });

  test('deve retornar estatísticas corretas', () => {
    engine.messageHistory = [Date.now(), Date.now() - 1000, Date.now() - 2000];
    
    const stats = engine.getStats();
    
    expect(stats.messagesLastHour).toBe(3);
    expect(stats.limits.hourly).toBe(5);
  });

  test('deve limpar histórico antigo (> 1 hora)', () => {
    engine.messageHistory = [
      Date.now(),
      Date.now() - 3700000 // > 1 hora atrás
    ];

    engine._checkHourlyLimit();

    expect(engine.messageHistory.length).toBe(1);
  });
});Testes de Integração E2Emarkdown# tests/integration/full-campaign.test.md

## Teste E2E: Campanha Completa com 2 Chips

### Setup:
1. Preparar planilha `test/fixtures/campaign-10-contacts.xlsx`:
   - 10 contatos válidos
   - 1 contato com telefone inválido (para testar tratamento de erro)

2. Configurar 2 sessões WhatsApp de teste

### Execução:
```bashnpm run test:integration

### Validações:

**Fase 1: Conexão (2 min)**
- [x] Aplicação inicia sem erros
- [x] QR Code é exibido para Chip 1
- [x] Após scanear: "Sessão chip-1 conectada"
- [x] QR Code é exibido para Chip 2
- [x] Após scanear: "Sessão chip-2 conectada"
- [x] Console mostra: "2 sessões ativas"

**Fase 2: Parsing (10 sec)**
- [x] Selecionar planilha de teste
- [x] Console: "Parser: 10 contatos válidos, 1 erros"
- [x] Erro logado: "Linha 6: Telefone inválido (11999)"

**Fase 3: Campanha (5-10 min)**
- [x] Iniciar campanha
- [x] Observar alternância: 
      "Sessão selecionada: chip-1"
      "Aguardando 42s..."
      "Mensagem enviada para 5511999887766"
      "Sessão selecionada: chip-2"
      "Aguardando 67s..."
- [x] Verificar que delays são aleatórios (não fixos)
- [x] Verificar que Spintax gerou mensagens diferentes (logs)
- [x] Confirmar que 10 mensagens foram enviadas
- [x] Confirmar que 1 foi pulada (telefone inválido)

**Fase 4: Logs (30 sec)**
- [x] Verificar `data/logs/app-YYYY-MM-DD.log` foi criado
- [x] Verificar que contém:
      - Timestamps de cada envio
      - IDs das sessões usadas
      - Delays aplicados
      - Erros de validação

### Critérios de Sucesso:
- ✅ 100% das mensagens válidas entregues
- ✅ Load balancer alternando uniformemente
- ✅ Delays respeitando limites (min/max)
- ✅ Erros tratados gracefully (não crashou)
- ✅ Logs informativos e completos🛡️ TRATAMENTO DE EDGE CASES E RESILIÊNCIACenário 1: Sessão WhatsApp Desconecta Durante Enviojavascript// src/main/modules/whatsapp/whatsappClient.js
class WhatsAppClient {
  constructor(sessionId, sessionManager, loadBalancer) {
    this.sessionId = sessionId;
    this.sessionManager = sessionManager;
    this.loadBalancer = loadBalancer;
    this.maxRetries = 3;
  }

  /**
   * Enviar mensagem com retry automático
   */
  async sendMessage(contact, message, retryCount = 0) {
    try {
      // Verificar se sessão está conectada
      if (!this.client || !this.client.info) {
        logger.warn(`Sessão ${this.sessionId} desconectada. Tentando reconectar...`);
        
        await this.reconnect();
      }

      // Enviar mensagem
      const chatId = `${contact.phone}@c.us`;
      await this.client.sendMessage(chatId, message);

      logger.info(`Mensagem enviada para ${contact.phone} via ${this.sessionId}`);
      
      // Registrar sucesso no load balancer
      this.loadBalancer.recordUsage(this.sessionId, true);

      return { success: true, contact, sessionId: this.sessionId };

    } catch (error) {
      logger.error(`Erro ao enviar para ${contact.phone}: ${error.message}`);

      // Registrar falha no load balancer
      this.loadBalancer.recordUsage(this.sessionId, false);

      // Decisão: Retry ou usar outra sessão?
      if (error.message.includes('Session closed') || error.message.includes('disconnected')) {
        
        if (retryCount < this.maxRetries) {
          logger.info(`Tentando outra sessão (tentativa ${retryCount + 1}/${this.maxRetries})`);
          
          // Obter próxima sessão disponível
          const nextSession = this.loadBalancer.getNextSession();
          
          if (nextSession && nextSession.id !== this.sessionId) {
            // Delegar para outra sessão
            return await nextSession.client.sendMessage(contact, message, retryCount + 1);
          }
        }

        throw new Error(
          `Todas as sessões falharam após ${this.maxRetries} tentativas.\n` +
          `Contato: ${contact.phone}\n` +
          `Sugestão: Reconectar chips e tentar novamente.`
        );
      }

      // Outros erros: retornar falha mas não parar campanha
      return {
        success: false,
        contact,
        error: error.message,
        sessionId: this.sessionId
      };
    }
  }

  /**
   * Reconectar sessão
   */
  async reconnect() {
    try {
      logger.info(`Reconectando sessão ${this.sessionId}...`);
      
      // Destruir cliente antigo
      if (this.client) {
        await this.client.destroy();
      }

      // Criar novo cliente
      await this.sessionManager.createSession(this.sessionId);
      
      // Aguardar 5s para estabilizar
      await new Promise(resolve => setTimeout(resolve, 5000));

      if (this.client && this.client.info) {
        logger.info(`Sessão ${this.sessionId} reconectada com sucesso`);
        this.loadBalancer.setSessionStatus(this.sessionId, true);
      } else {
        throw new Error('Falha ao reconectar');
      }

    } catch (error) {
      logger.error(`Erro ao reconectar ${this.sessionId}: ${error.message}`);
      this.loadBalancer.setSessionStatus(this.sessionId, false);
      throw error;
    }
  }
}

module.exports = WhatsAppClient;Cenário 2: Planilha com Linhas Vazias ou Corrompidasjavascript// Já implementado no ExcelParser (Exemplo 1)
// Principais estratégias:

// 1. Ignorar linhas completamente vazias
worksheet.eachRow((row, rowNumber) => {
  if (rowNumber === 1) return; // Skip header
  
  // Verificar se linha está vazia
  if (row.actualCellCount === 0) {
    logger.debug(`Linha ${rowNumber}: vazia - ignorada`);
    return;
  }
  
  // ... processar normalmente
});

// 2. Validar cada campo individualmente
const contact = {
  name: row.getCell('Nome').value?.toString().trim() || '',
  phone: row.getCell('Telefone').value?.toString().replace(/\D/g, '') || ''
};

// 3. Coletar erros mas continuar processamento
if (!this._validatePhone(contact.phone)) {
  errors.push({
    line: rowNumber,
    field: 'Telefone',
    value: contact.phone,
    message: 'Formato inválido. Use: 5511999887766'
  });
  return; // Pula esta linha, mas continua para próxima
}

// 4. Retornar relatório completo ao final
return {
  contacts: validContacts,   // Array de contatos válidos
  errors: errors             // Array de erros para revisão
};Cenário 3: Limite de Mensagens/Hora Atingidojavascript// Já implementado no ComplianceEngine (Exemplo 3)
// Estratégia de pausa automática:

async _checkHourlyLimit() {
  const oneHourAgo = Date.now() - 3600000;
  this.messageHistory = this.messageHistory.filter(ts => ts > oneHourAgo);

  if (this.messageHistory.length >= this.maxMessagesPerHour) {
    const oldestMessage = Math.min(...this.messageHistory);
    const waitTime = oldestMessage + 3600000 - Date.now();
    
    const minutesRemaining = Math.round(waitTime / 60000);

    logger.warn(
      `⚠️ LIMITE DE ${this.maxMessagesPerHour} MSG/HORA ATINGIDO\n` +
      `Campanha pausada automaticamente por ${minutesRemaining} minutos.\n` +
      `Aguarde ou:\n` +
      `- Edite config.json: "maxMessagesPerHour": 100\n` +
      `- Conecte mais chips para distribuir carga`
    );

    // Exibir countdown a cada 5 minutos
    for (let i = minutesRemaining; i > 0; i -= 5) {
      if (i <= minutesRemaining) {
        logger.info(`⏳ Retomando em ${i} minutos...`);
        await this._sleep(Math.min(300000, waitTime)); // 5 min ou restante
      }
    }

    this.messageHistory = []; // Limpar após espera
  }
}Cenário 4: Disco Cheio (Logs Crescendo Indefinidamente)javascript// Mitigado com winston-daily-rotate-file:

new DailyRotateFile({
  filename: path.join(global.LOGS_DIR, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',        // Rotaciona ao atingir 10MB
  maxFiles: '7d',        // Mantém apenas últimos 7 dias
  level: 'info'
})

// Resultado: Máximo de 70MB de logs (7 dias × 10MB)