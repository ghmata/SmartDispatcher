const SessionManager = require('../src/modules/whatsapp/sessionManager');
const LoadBalancer = require('../src/modules/whatsapp/loadBalancer');
const logger = require('../src/modules/utils/logger');

async function runDay2Validation() {
  console.log('--- DAY 2 CONNECTIVITY VALIDATION ---');
  console.log('NOTE: This test requires interaction. Use a real phone to scan QR codes if they appear.');
  console.log('Press Ctrl+C to exit at any time.\n');

  const sessionManager = new SessionManager();
  const balancer = new LoadBalancer(sessionManager);

  // Initialize 2 Sessions
  console.log('Initializing Session: chip_1...');
  await sessionManager.startSession('chip_1');

  console.log('Initializing Session: chip_2...');
  await sessionManager.startSession('chip_2');

  // Interactive Loop
  setInterval(() => {
    const active = sessionManager.getActiveSessions().length;
    const total = sessionManager.getAllSessions().length;
    
    console.log(`\n[STATUS CHECK] Total Sessions: ${total} | Ready: ${active}`);
    
    if (active > 0) {
      const client = balancer.getNextClient();
      if (client) {
         console.log(`>> LoadBalancer Test: Selected [${client.id}] for potential dispatch.`);
      }
    } else {
      console.log('>> Waiting for sessions to become ready (Scan QR codes)...');
    }

    // Checking individual status
    sessionManager.getAllSessions().forEach(s => {
      console.log(`   - ${s.id}: ${s.status}`);
    });

  }, 5000); // Check every 5 seconds
}

runDay2Validation();
