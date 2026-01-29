const logger = require('../modules/utils/logger');
const CampaignManager = require('../modules/campaign/campaignManager');
const path = require('path');

// GLOBAL ERROR HANDLERS
process.on('uncaughtException', (error) => {
  logger.error(`UNCAUGHT EXCEPTION: ${error.message}`, { stack: error.stack });
  // In production, we might want to exit, but for this bot, we try to keep alive or exit gracefully
  // process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION:', reason);
});

async function main() {
  logger.info('--- SMART WHATSAPP DISPATCHER STARTING ---');
  
  const campaignManager = new CampaignManager();

  // Argument Parsing (Basic)
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'start-campaign') {
        // node src/main/index.js start-campaign <path-to-excel> <message-template>
        const excelFile = args[1];
        const template = args[2] || '{Olá|Oi} {nome}, tudo bem?';
        
        if (!excelFile) {
            console.log('Usage: node src/main/index.js start-campaign <excel-file> [template]');
            return;
        }

        await campaignManager.initialize();
        await campaignManager.startCampaign(excelFile, template);

    } else {
        console.log('Available commands: start-campaign');
        // Just init to text connection
        // await campaignManager.initialize();
    }
  } catch (error) {
    logger.error(`Main Process Error: ${error.message}`);
  }
}

// Check if running directly
if (require.main === module) {
    main();
}

module.exports = main;
