const logger = require('../utils/logger');

class LoadBalancer {
  constructor(sessionManager) {
    this.sessionManager = sessionManager || null;
    this.currentIndex = 0;
    this.clients = [];
  }

  /**
   * Backward-compatible method for manually registering clients.
   * This avoids runtime failures when older code expects addClient().
   * @param {WhatsAppClient} client
   */
  addClient(client) {
    if (!client) return;
    if (this.clients.find((existing) => existing.id === client.id)) {
      logger.debug(`LoadBalancer: Client [${client.id}] already registered.`);
      return;
    }
    this.clients.push(client);
    logger.info(`LoadBalancer: Registered client [${client.id}].`);
  }

  _getActiveClients() {
    if (this.sessionManager && this.sessionManager.getActiveSessions) {
      return this.sessionManager.getActiveSessions();
    }
    return this.clients.filter((client) => client.isReady && client.isReady());
  }

  /**
   * Retrieves the next available client using Round-Robin strategy.
   * Skips disconnected or unready clients.
   * @returns {WhatsAppClient} The selected client or null if none available.
   */
  getNextClient() {
    const activeClients = this._getActiveClients();
    const total = activeClients.length;

    if (total === 0) {
      logger.warn('LoadBalancer: No active sessions available.');
      return null;
    }

    // Round-Robin Logic
    // If index out of bounds (sessions changed), reset or wrap
    if (this.currentIndex >= total) {
      this.currentIndex = 0;
    }

    const client = activeClients[this.currentIndex];
    
    // Move to next for next call
    this.currentIndex = (this.currentIndex + 1) % total;

    logger.debug(`LoadBalancer: Selected client [${client.id}] (Round-Robin)`);
    return client;
  }
}

module.exports = LoadBalancer;
