const assert = require('assert');
const fs = require('fs');
const path = require('path');
const SessionManager = require('../src/modules/whatsapp/sessionManager');
const pathHelper = require('../src/modules/utils/pathHelper');

const sessionsDir = pathHelper.getSessionsDir();
const sessionNames = ['session-alpha', 'session-beta'];

const setupDirs = () => {
  sessionNames.forEach((name) => {
    fs.mkdirSync(path.join(sessionsDir, name), { recursive: true });
  });
};

const cleanupDirs = () => {
  sessionNames.forEach((name) => {
    const dirPath = path.join(sessionsDir, name);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  });
};

(async () => {
  setupDirs();

  const manager = new SessionManager();
  const started = [];

  manager.startSession = async (id) => {
    started.push(id);
    manager.sessions.set(id, { id, isReady: () => false });
    return manager.sessions.get(id);
  };

  await manager.loadSessions();
  assert.deepStrictEqual(started.sort(), ['alpha', 'beta']);

  started.length = 0;
  await manager.loadSessions();
  assert.strictEqual(started.length, 0);

  console.log('Session restore test passed.');
  cleanupDirs();
})().catch((error) => {
  cleanupDirs();
  console.error(error);
  process.exit(1);
});
