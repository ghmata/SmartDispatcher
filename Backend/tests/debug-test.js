const path = require('path');

console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

try {
  console.log('[1/5] Loading PathHelper...');
  require('../src/modules/utils/pathHelper');
  
  console.log('[2/5] Loading Logger...');
  require('../src/modules/utils/logger');
  
  console.log('[3/5] Loading ExcelParser...');
  require('../src/modules/parser/excelParser');

  console.log('[4/5] Loading Dispatcher...');
  require('../src/modules/dispatch/dispatcher');

  console.log('[5/5] Loading CampaignManager...');
  require('../src/modules/campaign/campaignManager');

  console.log('✅ ALL MODULES LOADED');
} catch (e) {
  console.error('❌ LOAD ERROR:', e.message);
  console.error(e.stack);
}
