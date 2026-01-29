const logger = require('../utils/logger');

class LoadBalancer {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.currentIndex = 0;
  }

  /**
   * Retrieves the next available client using Round-Robin strategy.
   * Skips disconnected or unready clients.
   * @returns {WhatsAppClient} The selected client or null if none available.
   */
  getNextClient() {
    const activeClients = this.sessionManager.getActiveSessions();
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
