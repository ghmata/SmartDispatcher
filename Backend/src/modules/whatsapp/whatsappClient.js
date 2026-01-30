const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const EventEmitter = require('events');
const logger = require('../utils/logger');
const pathHelper = require('../utils/pathHelper');

class WhatsAppClient extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.status = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, AUTHENTICATED, READY, SENDING, ERROR
    this.lastStatusChangeAt = Date.now();
    
    // Ensure portable session path
    const sessionPath = pathHelper.getSessionsDir();

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: id,
        dataPath: sessionPath
      }),
      // Reverted: v1.26.0 should work natively. Forcing old version might be the issue.
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      },
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this._bindEvents();
  }

  _setStatus(status) {
    if (this.status === status) return;
    this.status = status;
    this.lastStatusChangeAt = Date.now();
    this.emit('status', { id: this.id, status });
  }

  _bindEvents() {
    this.client.on('qr', (qr) => {
      this._setStatus('QR');
      this.lastQr = qr; // Persist QR for API retrieval
      logger.info(`[${this.id}] QR Code received. Please scan.`);
      qrcode.generate(qr, { small: true });
    });

    this.client.on('loading_screen', (percent, message) => {
      this._setStatus('LOADING');
      logger.info(`[${this.id}] Loading WhatsApp Web: ${percent}% - ${message}`);
    });

    this.client.on('ready', () => {
      this._setStatus('READY');
      this.lastQr = null;
      logger.info(`[${this.id}] Client is ready!`);
    });

    this.client.on('authenticated', () => {
      this._setStatus('AUTHENTICATED');
      logger.info(`[${this.id}] Client authenticated.`);
      
      // Fallback: If READY doesn't fire in 30s, check if we can actually use the client
      // WARNING: Forcing READY without the event caused crashes (sendSeen undefined).
      // We will only log the delay, not force state.
      setTimeout(async () => {
          if (this.status === 'AUTHENTICATED') {
              logger.warn(`[${this.id}] WAITING FOR READY... (Client stalled at AUTHENTICATED). This usually means the session is corrupt or WWebJS needs an update.`);
          }
      }, 30000);
    });

    this.client.on('auth_failure', (msg) => {
      this._setStatus('ERROR');
      logger.error(`[${this.id}] Authentication failure: ${msg}`);
    });

    this.client.on('change_state', (state) => {
      logger.info(`[${this.id}] Connection state changed: ${state}`);
      // If phone disconnects, state might go to TIMEOUT or unknown
    });

    this.client.on('disconnected', (reason) => {
      this._setStatus('DISCONNECTED');
      logger.warn(`[${this.id}] Client disconnected: ${reason}`);
    });
  }

  async initialize() {
    logger.info(`[${this.id}] Initializing...`);
    this._setStatus('CONNECTING');
    try {
      await this.client.initialize();
    } catch (error) {
      logger.error(`[${this.id}] Init error: ${error.message}`);
      this._setStatus('ERROR');
    }
  }

  waitUntilReady({ timeoutMs = 60000 } = {}) {
    if (this.status === 'READY') {
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeListener('status', handleStatus);
        reject(new Error(`Client ${this.id} did not reach READY within ${timeoutMs}ms`));
      }, timeoutMs);

      const handleStatus = ({ status }) => {
        if (status === 'READY') {
          clearTimeout(timeoutId);
          this.removeListener('status', handleStatus);
          resolve(true);
        }
      };

      this.on('status', handleStatus);
    });
  }

  async sendMessage(to, message) {
    if (this.status !== 'READY') {
      throw new Error(`Client ${this.id} is not ready (Status: ${this.status})`);
    }

    this._setStatus('SENDING');
    
    // Resolve ID to avoid "No LID" error
    let chatId = to;
    
    // If it looks like a phone number (digits only or digits+@c.us)
    const cleanNumber = to.replace('@c.us', '');
    if (/^\d+$/.test(cleanNumber)) {
        try {
            const registered = await this.client.getNumberId(cleanNumber);
            if (registered) {
                chatId = registered._serialized;
            } else {
                logger.warn(`[${this.id}] Number ${cleanNumber} not registered on WhatsApp. Attempting to send anyway...`);
                chatId = `${cleanNumber}@c.us`;
            }
        } catch (e) {
            logger.warn(`[${this.id}] ID Resolution failed for ${cleanNumber}: ${e.message}`);
             // If resolution fails, fallback to standard format
             chatId = `${cleanNumber}@c.us`;
        }
    }

    try {
      const result = await this.client.sendMessage(chatId, message);
      this._setStatus('READY');
      return result;
    } catch (error) {
      this._setStatus('ERROR');
      throw error;
    }
  }

  isReady() {
    return this.status === 'READY';
  }

  getPhoneNumber() {
      if (this.client && this.client.info && this.client.info.wid) {
          return this.client.info.wid.user;
      }
      return null;
  }

  getDisplayName() {
      if (this.client && this.client.info && this.client.info.pushname) {
          return this.client.info.pushname;
      }
      return null;
  }
}

module.exports = WhatsAppClient;
