const express = require('express');
const QRCode = require('qrcode');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const logger = require('../modules/utils/logger');
const CampaignManager = require('../modules/campaign/campaignManager');
const PathHelper = require('../modules/utils/pathHelper');
const { createCampaignId } = require('../modules/utils/correlation');
const templateManager = require('../modules/utils/templateManager');

// --- SINGLETONS ---
// In a real app, we might use dependency injection, but here we instantiate singletons.
// const sessionManager = new SessionManager(); // Removed unused instance
const campaignManager = new CampaignManager(); 
// Note: CampaignManager internally creates its own SessionManager. 

class ApiServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*", // Allow all for dev (localhost:3000)
        methods: ["GET", "POST"]
      }
    });

    this.upload = multer({ dest: PathHelper.getUploadsDir() });
    
    // Dynamic Port Handling: Allow Env Var, default to 3001
    // Handle explicitly undefined or empty string by fallback
    const envPort = process.env.PORT;
    this.port = envPort ? parseInt(envPort, 10) : 3001;

    // Frontend Path Resolution
    // Strategy: 
    // 1. If Packaged (pkg/exe): Adjacent 'frontend' folder
    // 2. If Dev (Node): '../../Frontend/out' relative to this file
    // Note: We use process.pkg to detect native wrap, or assume standard dev structure
    if (process.pkg) {
         this.frontendPath = path.join(path.dirname(process.execPath), 'frontend');
    } else {
         // Current: Backend/src/server/api.js -> ../../../Frontend/out
         this.frontendPath = path.resolve(__dirname, '..', '..', '..', 'Frontend', 'out');
    }

    this.logHistory = []; // Buffer for startup logs

    // Custom Emitter Adapter to capture logs before sending to socket
    const eventAdapter = {
        emit: (event, ...args) => {
            this.io.emit(event, ...args); // Pass through to real socket
            if (event === 'log') {
               // args[0] is the message
               this._addToLogHistory(args[0]);
            }
        }
    };
    campaignManager.setEventEmitter(eventAdapter);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocket();
    this.setupFrontend();

    // Auto-Resume Campaign if active
    campaignManager.initialize().then(async () => {
        const resumed = await campaignManager.resumeCampaign();
        if (resumed) {
            logger.info('System: Auto-resumed interrupted campaign.');
        } else {
            logger.info('System: No interrupted campaign to resume.');
        }
    }).catch(err => {
        logger.error(`System: Resume Check Failed: ${err.message}`);
    });
  }

  setupFrontend() {
      // Logic to serve static frontend
      if (this.frontendPath && fs.existsSync(this.frontendPath)) {
          logger.info(`Frontend: Serving static files from ${this.frontendPath}`);
          
          // Serve Static Assets
          this.app.use(express.static(this.frontendPath));
          
          // Fallback for SPA Routing (Catch-all except /api)
          // Regex: Does NOT start with /api
          this.app.get(/^\/(?!api).*/, (req, res) => {
              res.sendFile(path.join(this.frontendPath, 'index.html'));
          });
      } else {
          logger.warn(`Frontend: Static files not found at ${this.frontendPath}. Running API-only mode.`);
      }
  }

  _addToLogHistory(msg) {
      this.logHistory.push(msg);
      if (this.logHistory.length > 50) {
          this.logHistory.shift(); // Keep last 50
      }
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    // GET /health - Check availability for launcher
    this.app.get('/health', (req, res) => {
        res.json({ status: 'ok', pid: process.pid, port: this.server.address()?.port });
    });

    // GET /api/status - System Health & Stats
    this.app.get('/api/status', (req, res) => {
        // Read from Memory first (Real-time), fallback to Disk
        const state = campaignManager.currentState || campaignManager.loadState();
        const messageStatus = state.messageStatus || {};
        
        // NEW: Get Persistent Daily Stats with History
        const { today, history } = campaignManager.getDailyStats();

        const totalSent = today.totalSent || 0;
        const totalFailed = today.totalFailed || 0;
        const totalDelivered = today.totalDelivered || 0;
        const totalAttempts = totalSent + totalFailed;
        
        // Correct delivery rate: (delivered / attempts) * 100
        // FIX: Denominator is now Success + Failure. Result is number with 2 decimals.
        // We use Number() to convert string "88.89" back to number if needed, or keep as string/number.
        // Requested: Max 2 decimals, no rounding to integer.
        const rawRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
        const deliveryRate = Number(Math.min(100, rawRate).toFixed(2));

        // --- COMPARISONS (VS YESTERDAY) ---
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayKey = yesterdayDate.toISOString().split('T')[0];
        const yesterdayStats = history[yesterdayKey] || { totalSent: 0, totalDelivered: 0 };

        const calcDiff = (current, previous) => {
            if (previous === 0) return current === 0 ? 0 : 100; // 0 to 0 = 0%, 0 to 10 = 100%
            return Math.round(((current - previous) / previous) * 100);
        };

        const comparisons = {
            total_sent: calcDiff(totalSent, yesterdayStats.totalSent || 0),
            delivery_rate: calcDiff(deliveryRate, (yesterdayStats.totalDelivered > 0 ? 100 : 0)), // Dummy logic for now
            // For chips, we don't have historical connection count yet, so we assume 0 change or 100% if new
            connections: 0 
        };

        // Queue Calculation
        const totalRows = state.totalContacts || 0;
        const processedCount = state.processedRows ? state.processedRows.length : 0;
        
        // Stats Date for Day Reset Detection
        // todayKey is not defined in scope, we need to get it from CampaignManager or reconstruct it
        const todayKey = new Date().toISOString().split('T')[0];

        res.json({
            active_campaigns: campaignManager.hasActiveCampaign() ? 1 : 0,
            total_sent: totalSent,
            delivery_rate: deliveryRate,
            delivered_count: totalDelivered,
            failed_count: totalFailed,
            total_attempts: totalAttempts,
            queue_current: processedCount,  // "Já foram lidos"
            queue_total: totalRows,          // "Serão lidos"
            comparisons, // Pass to Frontend
            
            // ROBUST SYNC:
            stats_seq: today.stats_seq || 0,
            stats_date: todayKey,
            last_updated: today.last_updated || 0
        });
    });

    // GET /api/dashboard/hourly - Analytics
    this.app.get('/api/dashboard/hourly', (req, res) => {
        try {
            const dailyStats = campaignManager.getDailyStats();
            // FIX: Access 'today.hourly' instead of root 'hourly'
            const hourlyCounts = dailyStats.today?.hourly || {};
            
            const chartData = [];
            for (let i = 0; i < 24; i++) {
                const hourKey = `${String(i).padStart(2, '0')}:00`;
                chartData.push({
                    hour: hourKey,
                    sent: hourlyCounts[hourKey] || 0
                });
            }

            // Optional: expose sequence for debugging/sync (does not change response shape)
            res.set('X-Stats-Seq', String(dailyStats.today?.stats_seq || 0));
            res.set('X-Stats-Date', String(new Date().toISOString().split('T')[0]));
            res.json(chartData);
        } catch (e) {
            logger.error(`Dashboard Analytics Error: ${e.message}`);
            res.status(500).json([]);
        }
    });


    // GET /api/sessions - List Chips
    this.app.get('/api/sessions', async (req, res) => {
        const sessionsMap = campaignManager.sessionManager.sessions || new Map();
        const sortedSessions = Array.from(sessionsMap.values()).sort((a, b) => {
            const timeA = parseInt(String(a.id).split('_')[1] || 0, 10);
            const timeB = parseInt(String(b.id).split('_')[1] || 0, 10);
            return timeA - timeB;
        });

        const sessionList = await Promise.all(sortedSessions.map(async (s, index) => {
            let qrDataUrl = null;
            if (s.lastQr) {
                try {
                    qrDataUrl = await QRCode.toDataURL(s.lastQr);
                } catch (e) {
                    logger.debug(`QR toDataURL failed for ${s.id}: ${e.message}`);
                }
            }
            return {
                id: s.id,
                status: s.status,
                name: s.getDisplayName(),
                phone: s.getPhoneNumber(),
                battery: 100,
                displayOrder: index + 1, // Dynamic ordering
                qr: qrDataUrl,
                qrTimestamp: s.qrTimestamp || null
            };
        }));
        res.json(sessionList);
    });

    // Helper to attach Socket listeners to a client
    this.attachClientListeners = (waClient) => {
        if (!waClient) return;
        const id = waClient.id;
        const socketIo = this.io;
        campaignManager.registerSessionClient(waClient);
        
        // Helper to clear existing timeout
        const clearQrTimeout = () => {
            if (waClient.qrTimeout) {
                clearTimeout(waClient.qrTimeout);
                waClient.qrTimeout = null;
            }
        };

        // Check if already ready/authenticated (for restored sessions)
        if (waClient.status === 'READY') {
          clearQrTimeout();
          setTimeout(() => {
            socketIo.emit('session_change', { chipId: id, status: 'READY' });
          }, 500);
        } else if (waClient.status === 'AUTHENTICATING') {
          setTimeout(() => {
            socketIo.emit('session_change', { chipId: id, status: 'SYNCING' });
          }, 500);
        }

        const emitQr = async (qr) => {
            logger.info(`[Socket] Emitting QR for ${id}`);
            
            if (!waClient.qrTimeout) {
                if (!waClient.qrTimestamp) {
                    waClient.qrTimestamp = Date.now();
                }
                
                logger.info(`[${id}] Starting 60s Auto-Destroy Timer.`);
                waClient.qrTimeout = setTimeout(async () => {
                    logger.info(`[${id}] QR Timeout (60s) - Auto-destroying session.`);
                    try {
                        // removeSession handles shutdown and file deletion robustly now
                        await campaignManager.sessionManager.removeSession(id);
                        socketIo.emit('session_deleted', { chipId: id });
                        logger.info(`[${id}] Auto-destroyed successfully.`);
                    } catch (err) {
                        logger.error(`[${id}] Failed to auto-destroy: ${err.message}`);
                    }
                }, 60000);
            }

            try {
                const dataUrl = await QRCode.toDataURL(qr);
                socketIo.emit('qr_code', { 
                    chipId: id, 
                    qr: dataUrl,
                    qrTimestamp: waClient.qrTimestamp 
                });
            } catch (err) {
                logger.error(`QR Generation Error: ${err.message}`);
            }
        };

        waClient.on('qr', emitQr);

        // FIX: Check if QR was already emitted before we attached listeners (Race Condition)
        if (waClient.lastQr && (waClient.status === 'AUTHENTICATING' || waClient.status === 'INIT')) {
             logger.info(`[Socket] Catch-up: Emitting pre-existing QR for ${id}`);
             emitQr(waClient.lastQr);
        }

        waClient.on('status', ({ status }) => {
          logger.info(`[Socket] Emitting ${status} for ${id}`);
          
          // If status indicates connection success, clear the timeout
           if (["READY", "ONLINE", "AUTHENTICATING", "CONNECTED"].includes(status)) {
             clearQrTimeout();
             waClient.qrTimestamp = null;
          }
          
          socketIo.emit('session_change', { chipId: id, status });
        });
    };

    // POST /api/session/new - Create new Chip
    this.app.post('/api/session/new', async (req, res) => {
        try {
            const id = `chip_${Date.now()}`;
            const waClient = await campaignManager.sessionManager.startSession(id); 

            if (waClient) {
                this.attachClientListeners(waClient);
            }

            res.json({ success: true, id, status: 'LOADING' });
            this.io.emit('session_change', { chipId: id, status: 'LOADING' });

        } catch (e) {
            logger.error(`API Create Session Error: ${e.message}`);
            res.status(500).json({ error: e.message });
        }
    });

    // POST /api/session/:id/connect - Reconnect existing Chip
    this.app.post('/api/session/:id/connect', async (req, res) => {
        try {
            const { id } = req.params;
            const waClient = campaignManager.sessionManager.getSession(id);

            if (!waClient) {
                return res.status(404).json({ error: 'Session not found' });
            }

            // If already ready, just return success
            if (waClient.status === 'READY' || waClient.status === 'ONLINE') {
                 return res.json({ success: true, status: waClient.status });
            }

            // If broken (ERROR/DISCONNECTED), clear auth data to force fresh QR
            if (waClient.status === 'ERROR' || waClient.status === 'DISCONNECTED') {
                logger.info(`API: Clearing auth data for broken session ${id}`);
                try {
                    // We need to stop the socket first to release file locks
                    await waClient.shutdown(); 
                    
                    // Wait 3s for Windows to release file locks
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    // Prefer provider method if available
                    if (waClient.provider && typeof waClient.provider.clearState === 'function') {
                        await waClient.provider.clearState();
                    } else {
                        // Manual fallback with CORRECT path
                        const pathHelper = require('../modules/utils/pathHelper');
                        const fs = require('fs');
                        
                        // Correctly resolve: ROOT/data/sessions/session-{id}
                        const targetDir = pathHelper.resolve('data', 'sessions', `session-${id}`);
                        
                        logger.info(`API: Manual clearing target: ${targetDir}`);
                        
                        if (fs.existsSync(targetDir)) {
                             fs.rmSync(targetDir, { recursive: true, force: true });
                             logger.info(`API: Manually deleted ${targetDir}`);
                        }
                    }
                } catch (cleanupErr) {
                    logger.warn(`Failed to clear auth data: ${cleanupErr.message}`);
                }
            }

            // Force re-initialization
            logger.info(`API: Reconnecting session ${id}`);
            await waClient.initialize();
            
            // Ensure listeners are attached (idempotent-ish)
            this.attachClientListeners(waClient);

            res.json({ success: true, status: 'CONNECTING' });

        } catch (e) {
            logger.error(`API Reconnect Session Error: ${e.message}`);
            res.status(500).json({ error: e.message });
        }
    });

    // DELETE /api/session/:id - Delete Chip
    this.app.delete('/api/session/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const waClient = campaignManager.sessionManager.getSession(id);

            // waClient shutdown is handled inside removeSession
            // if (waClient) { await waClient.shutdown(); }
            
            // Remove from manager
            const deleted = await campaignManager.sessionManager.removeSession(id);
            if (!deleted) {
                 return res.status(404).json({ error: 'Session not found or could not be removed' });
            }

            logger.info(`API: Deleted session ${id}`);
            res.json({ success: true });

        } catch (e) {
            logger.error(`API Delete Session Error: ${e.message}`);
            res.status(500).json({ error: e.message });
        }
    });

    // POST /api/campaign/start - Start Dispatch
    this.app.post('/api/campaign/start', this.upload.single('file'), async (req, res) => {
        try {
            const { message, delayMin, delayMax } = req.body;
            const file = req.file;

            if (!file) throw new Error('No file uploaded');

            // NEW: Restrict to one campaign at a time
            if (campaignManager.hasActiveCampaign()) {
                throw new Error('Já existe uma campanha em andamento. Aguarde o término ou limpe a campanha atual.');
            }

            // Move file to permanent location if needed, or parse directly
            logger.info(`API: Starting campaign with ${file.originalname}`);
            const campaignId = createCampaignId();
            const delayMinMs = Number.isFinite(Number(delayMin)) ? Number(delayMin) * 1000 : undefined;
            const delayMaxMs = Number.isFinite(Number(delayMax)) ? Number(delayMax) * 1000 : undefined;

            // Async start (Fire and Forget)
            campaignManager.initialize().then(() => {
                return campaignManager.startCampaign(file.path, message, file.originalname, {
                  campaignId,
                  delayMin: delayMinMs,
                  delayMax: delayMaxMs
                });
            }).catch(err => {
                logger.error(`Campaign Background Error: ${err.message}`);
                this.io.emit('log', `[ERROR] Campaign Failed: ${err.message}`);
            });

            res.json({ success: true, message: 'Campaign started in background', campaignId });

        } catch (e) {
            if (res.headersSent) return;
            res.status(500).json({ error: e.message });
        }
    });

    // --- TEMPLATES ---
    this.app.get('/api/templates', (req, res) => {
        try {
            res.set('Cache-Control', 'no-store');
            const templates = templateManager.getAll();
            res.json(templates);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    this.app.post('/api/templates', (req, res) => {
        try {
            const template = req.body;
            if (!template.id || !template.label || !template.text) {
                throw new Error("Invalid template data");
            }
            // Ensure isCustom is true for API saved templates
            template.isCustom = true; 
            const saved = templateManager.saveTemplate(template);
            res.json({ success: true, template: saved });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    this.app.delete('/api/templates/:id', (req, res) => {
        try {
            const { id } = req.params;
            templateManager.deleteTemplate(id);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
  }

  setupSocket() {
    this.io.on('connection', (socket) => {
        logger.info(`Frontend connected: ${socket.id}`);
        
        // Flush Log History so user sees startup messages
        this.logHistory.forEach(msg => socket.emit('log', msg));
        
        // Initial State Push (if empty history, show generic)
        if (this.logHistory.length === 0) {
             socket.emit('log', 'Sistema Funcionando');
        }

        socket.on('disconnect', () => {
            logger.info(`Frontend disconnected: ${socket.id}`);
        });
    });
  }

  start() {
    this.server.listen(this.port, '127.0.0.1', async () => {
        const actualPort = this.server.address().port;
        logger.info(`API Server running on http://127.0.0.1:${actualPort} (PID: ${process.pid})`);
        
        // Load saved sessions after server starts
        await campaignManager.sessionManager.loadSessions();
        
        // Attach listeners to restored sessions
        const restoredSessions = campaignManager.sessionManager.getAllSessions();
        if (restoredSessions.length > 0) {
            logger.info(`Attaching listeners to ${restoredSessions.length} restored sessions.`);
            restoredSessions.forEach(client => {
                this.attachClientListeners(client);
            });
        }
    });

    // Global Error Handlers to prevent crash loops
    process.on('uncaughtException', (err) => {
        logger.error(`UNCAUGHT EXCEPTION: ${err.message}`);
        // In production, we should exit, but for dev we might log and keep alive if minor
        // process.exit(1); 
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.error(`UNHANDLED REJECTION: ${reason}`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal) => {
        logger.info(`${signal} received. Starting graceful shutdown...`);
        try {
            await campaignManager.sessionManager.stopAllSessions();
            logger.info('Graceful shutdown completed. Exiting.');
            process.exit(0);
        } catch (err) {
            logger.error(`Error during graceful shutdown: ${err.message}`);
            process.exit(1);
        }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  }
}

// Start Server if run directly
if (require.main === module) {
    const api = new ApiServer();
    api.start();
}

module.exports = ApiServer;
