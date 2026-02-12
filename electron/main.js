const { app, BrowserWindow, dialog } = require('electron'); // Import dialog
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let backendProcess;
let backendPort = null;
let isQuitting = false;

// Crash Loop Protection
const RETRY_LIMIT = 5;
const RETRY_WINDOW = 60000; // 1 minute
let retryCount = 0;
let firstRetryTime = 0;

// Determine paths based on environment (Dev vs Prod/Packed)
const isDev = !app.isPackaged;
const appRoot = isDev ? __dirname : path.dirname(process.execPath); // In dev: electron/, in prod: resources/ or root

// Path to Backend Entry Point
// In Dev: ../Backend/src/server/api.js relative to electron/
// In Prod: resources/app/Backend/src/server/api.js (Assuming standard electron-builder asar structure)
// Adjust 'backendPath' to match your packaging structure later
const backendPath = isDev 
    ? path.join(__dirname, '..', 'Backend', 'src', 'server', 'api.js')
    : path.join(process.resourcesPath, 'app', 'Backend', 'src', 'server', 'api.js');

function startBackend() {
    console.log('Launcher: Starting Backend from:', backendPath);
    
    // Spawn Backend with PORT=0 (Dynamic)
    // silent: true to pipe stdout/stderr so we can read the port
    backendProcess = fork(backendPath, [], {
        env: { ...process.env, PORT: '0' },
        cwd: isDev ? path.join(__dirname, '..') : path.dirname(backendPath),
        silent: true 
    });

    backendProcess.stdout.on('data', (data) => {
        const msg = data.toString();
        try {
            process.stdout.write(`[BACKEND] ${msg}`); // Pipe to main console
        } catch (e) {
            // Serve apenas para evitar crash se o pipe estiver quebrado (terminal fechado)
            if (e.code !== 'EPIPE') console.error(e);
        }

        // Detect Port
        // Expected log: "API Server running on http://127.0.0.1:12345"
        const match = msg.match(/http:\/\/127\.0\.0\.1:(\d+)/);
        if (match && match[1]) {
            backendPort = match[1];
            console.log(`Launcher: Backend detected on port ${backendPort}`);
            createWindow();
        }
    });

    backendProcess.stderr.on('data', (data) => {
        try {
            process.stderr.write(`[BACKEND ERROR] ${data.toString()}`);
        } catch (e) {
            if (e.code !== 'EPIPE') console.error(e);
        }
    });

    backendProcess.on('exit', (code) => {
        console.log(`Launcher: Backend exited with code ${code}`);
        if (code !== 0 && !isQuitting) {
            // Crash Loop Logic
            const now = Date.now();
            if (now - firstRetryTime > RETRY_WINDOW) {
                // Reset if outside window
                retryCount = 0;
                firstRetryTime = now;
            }

            retryCount++;

            if (retryCount > RETRY_LIMIT) {
                console.error(`Launcher: Backend crashed too frequently (${retryCount} times in 1min). Giving up.`);
                dialog.showErrorBox(
                    'Erro Crítico no Sistema',
                    `O serviço de backend falhou ${retryCount} vezes consecutivas. O aplicativo será encerrado para proteção.\n\nPor favor, contate o suporte.`
                );
                app.quit();
                return;
            }

            console.log(`Launcher: Backend crashed. Restart attempt ${retryCount}/${RETRY_LIMIT} in 1s...`);
            setTimeout(startBackend, 1000);
        } else {
            app.quit();
        }
    });
}

function createWindow() {
    if (mainWindow) return; // Prevent duplicates

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false, // Don't show until ready
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') // Optional, good practice
        },
        autoHideMenuBar: true
    });

    const url = `http://127.0.0.1:${backendPort}`;
    console.log(`Launcher: Loading URL ${url}`);
    mainWindow.loadURL(url);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    startBackend();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0 && backendPort) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    isQuitting = true;
    if (backendProcess) {
        console.log('Launcher: Killing Backend...');
        backendProcess.kill();
    }
});
