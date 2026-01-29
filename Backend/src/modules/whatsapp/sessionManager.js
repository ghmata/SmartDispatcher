const WhatsAppClient = require('./whatsappClient');
const logger = require('../utils/logger');

class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  async startSession(id) {
    if (this.sessions.has(id)) {
      logger.warn(`Session ${id} already exists.`);
      return this.sessions.get(id);
    }

    logger.info(`Starting session: ${id}`);
    const client = new WhatsAppClient(id);
    this.sessions.set(id, client);

    // Initialize async (don't block)
    client.initialize().catch(err => {
      logger.error(`Failed to start session ${id}: ${err.message}`);
    });

    return client;
  }

  getSession(id) {
    return this.sessions.get(id);
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  getActiveSessions() {
    return this.getAllSessions().filter(client => client.isReady());
  }
  
  async stopSession(id) {
     const client = this.sessions.get(id);
     if (client) {
         await client.client.destroy();
         this.sessions.delete(id);
         logger.info(`Session ${id} stopped.`);
     }
  }

  async loadSessions() {
    try {
        const fs = require('fs');
        const path = require('path');
        const pathHelper = require('../utils/pathHelper');

        const sessionsDir = pathHelper.getSessionsDir();
        if (!fs.existsSync(sessionsDir)) return;

        const entries = fs.readdirSync(sessionsDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory() && entry.name.startsWith('session-')) {
                const id = entry.name.replace('session-', '');
                logger.info(`Found saved session: ${id}, restoring...`);
                await this.startSession(id);
            }
        }
    } catch (error) {
        logger.error(`Error loading saved sessions: ${error.message}`);
    }
  }
}

module.exports = SessionManager;
