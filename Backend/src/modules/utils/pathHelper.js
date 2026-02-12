const path = require('path');
const fs = require('fs');

/**
 * Helper to ensure paths are portable and relative to the executable/script location.
 * Crucial for the "Portable App" requirement.
 */
class PathHelper {
  constructor() {
    this.root = this.getAppRoot();
  }

  /**
   * Determines the application root directory for data persistence.
   * Priority:
   * 1. Next to the Executable (Portable Mode) - if packaged/compiled.
   * 2. Project Root (Development Mode) - relative to this file.
   */
  getAppRoot() {
    // 1. Check if running inside a packaged environment (pkg/nexe)
    if (process.pkg) {
      return path.dirname(process.execPath);
    }

    // 2. Check if running as Electron Production (Packaged)
    // process.defaultApp is true in 'electron .' (Dev), and undefined/false in packaged apps.
    if (process.versions && process.versions.electron && !process.defaultApp) {
      return path.dirname(process.execPath);
    }

    // 3. Development Mode (Node script or Electron Dev)
    // Current file: /Backend/src/modules/utils/pathHelper.js
    // Project Root: /Backend (3 levels up)
    return path.resolve(__dirname, '..', '..', '..');
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

  getUploadsDir() {
    return this.ensureDir(this.resolve('data', 'uploads'));
  }
}

module.exports = new PathHelper();
