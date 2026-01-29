const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');
const pathHelper = require('../utils/pathHelper');
const path = require('path');

class WhatsAppClient {
  constructor(id) {
    this.id = id;
    this.status = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, READY
    
    // Ensure portable session path
    const sessionPath = pathHelper.getSessionsDir();

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: id,
        dataPath: sessionPath
      }),
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

  _bindEvents() {
    this.client.on('qr', (qr) => {
      this.status = 'WAITING_QR';
      logger.info(`[${this.id}] QR Code received. Please scan.`);
      qrcode.generate(qr, { small: true });
    });

    this.client.on('loading_screen', (percent, message) => {
      logger.info(`[${this.id}] Loading: ${percent}% - ${message}`);
    });

    this.client.on('ready', () => {
      this.status = 'READY';
      logger.info(`[${this.id}] Client is ready!`);
    });

    this.client.on('authenticated', () => {
      this.status = 'AUTHENTICATED';
      logger.info(`[${this.id}] Client authenticated.`);
      
      // Fallback: If READY doesn't fire in 30s, check if we can actually use the client
      setTimeout(async () => {
          if (this.status === 'AUTHENTICATED') {
              logger.warn(`[${this.id}] READY event timeout. Checking validity...`);
              try {
                  // Try to get state or internal WWebJS ready status
                  const state = await this.client.getState();
                  logger.info(`[${this.id}] Forced check state: ${state}`);
                  if (state === 'CONNECTED') {
                      this.status = 'READY';
                      this.client.emit('ready'); // Emit manually to trigger listeners
                      logger.info(`[${this.id}] Manually set to READY via fallback.`);
                  }
              } catch (e) {
                  logger.error(`[${this.id}] Fallback check failed: ${e.message}`);
              }
          }
      }, 30000);
    });

    this.client.on('auth_failure', (msg) => {
      this.status = 'AUTH_FAILURE';
      logger.error(`[${this.id}] Authentication failure: ${msg}`);
    });

    this.client.on('change_state', (state) => {
      logger.info(`[${this.id}] Connection state changed: ${state}`);
      // If phone disconnects, state might go to TIMEOUT or unknown
    });

    this.client.on('disconnected', (reason) => {
      this.status = 'DISCONNECTED';
      logger.warn(`[${this.id}] Client disconnected: ${reason}`);
    });
  }

  async initialize() {
    logger.info(`[${this.id}] Initializing...`);
    this.status = 'CONNECTING';
    try {
      await this.client.initialize();
    } catch (error) {
      logger.error(`[${this.id}] Init error: ${error.message}`);
      this.status = 'ERROR';
    }
  }

  async sendMessage(to, message) {
    if (this.status !== 'READY') {
      throw new Error(`Client ${this.id} is not ready (Status: ${this.status})`);
    }
    return this.client.sendMessage(to, message);
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
}

module.exports = WhatsAppClient;
