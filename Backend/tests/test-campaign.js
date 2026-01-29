const CampaignManager = require('../src/modules/campaign/campaignManager');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

async function createMockExcel(filepath) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Contacts');
  sheet.columns = [
    { header: 'Nome', key: 'name' },
    { header: 'Telefone', key: 'phone' },
    { header: 'Link', key: 'link' }
  ];
  sheet.addRow({ name: 'Test User', phone: '5511999999999', link: 'http://test.com' });
  await workbook.xlsx.writeFile(filepath);
}

async function runDay4Validation() {
  console.log('--- DAY 4 INTEGRATION TEST (ROBUST) ---');

  const mockExcelPath = path.join(__dirname, 'mock_campaign.xlsx');
  const mockTemplate = '{Olá|Oi} {nome}, link: {link}';

  try {
    // 1. Create Mock Excel
    console.log('[1/5] Creating Mock Excel...');
    await createMockExcel(mockExcelPath);
    console.log('File created:', mockExcelPath);

    // 2. Init Manager
    console.log('[2/5] nitializing Manager...');
    const manager = new CampaignManager();
    
    // 3. Mock Internals
    console.log('[3/5] Mocking Dependencies...');
    manager.loadBalancer = {
        addClient: () => {},
        getNextClient: () => ({ id: 'mock_chip_1' })
    };
    manager.sessionManager = {
        loadSessions: async () => {},
        getActiveSessions: () => [{ id: 'mock_chip_1' }]
    };
    manager.dispatcher = {
        dispatch: async (phone, msg) => {
            console.log(`   -> [MOCK DISPATCH] Sending to ${phone}: ${msg}`);
            return { status: 'SENT' };
        }
    };

    // 4. Run Campaign
    console.log('[4/5] Starting Campaign...');
    // Clear previous state if any
    if (fs.existsSync(manager.stateFile)) fs.unlinkSync(manager.stateFile);
    
    await manager.startCampaign(mockExcelPath, mockTemplate);
    
    // 5. Verify
    console.log('[5/5] Verifying State...');
    if (fs.existsSync(manager.stateFile)) {
        const state = JSON.parse(fs.readFileSync(manager.stateFile, 'utf8'));
        console.log('   -> Final State:', JSON.stringify(state));
        if (state.processedRows && state.processedRows.length > 0) {
            console.log('✅ CHECKPOINT PASSED: Campaign ran successfully.');
        } else {
            console.error('❌ CHECKPOINT FAILED: No rows processed in state file.');
            process.exit(1);
        }
    } else {
        console.error('❌ CHECKPOINT FAILED: State file missing.');
        process.exit(1);
    }

  } catch (err) {
      console.error('❌CRITICAL TEST FAILURE:', err);
      fs.writeFileSync(path.join(__dirname, 'test_error.log'), err.stack || err.toString());
      process.exit(1);
  }
}

runDay4Validation();
