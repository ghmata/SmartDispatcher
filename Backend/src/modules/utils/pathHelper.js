const path = require('path');
const fs = require('fs');

/**
 * Helper to ensure paths are portable and relative to the executable/script location.
 * Crucial for the "Portable App" requirement.
 */
class PathHelper {
  constructor() {
    // In packaged app, process.cwd() might be different, but for portable .exe
    // usually process.cwd() or path.dirname(process.execPath) is the anchor.
    // We stick to process.cwd() as the project root for development and simple portable usage.
    this.root = process.cwd();
  }

  resolve(...segments) {
    return path.join(this.root, ...segments);
  }

  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  }

  getLogsDir() {
    return this.ensureDir(this.resolve('data', 'logs'));
  }

  getSessionsDir() {
    return this.ensureDir(this.resolve('data', 'sessions'));
  }
}

module.exports = new PathHelper();
