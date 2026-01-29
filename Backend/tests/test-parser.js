const ExcelParser = require('../src/modules/parser/excelParser');
const pathHelper = require('../src/modules/utils/pathHelper');
const path = require('path');

async function runCheckpoint() {
  console.log('--- STARTING DAY 1 CHECKPOINT ---');
  
  const parser = new ExcelParser();
  const templatePath = path.resolve(__dirname, 'template.xlsx');

  try {
    const start = Date.now();
    const result = await parser.parse(templatePath);
    const duration = Date.now() - start;

    console.log(`Processing Time: ${duration}ms`);
    console.log('--- VALID CONTACTS ---');
    console.log(JSON.stringify(result.contacts, null, 2));
    
    console.log('--- ERRORS ---');
    console.log(JSON.stringify(result.errors, null, 2));

    // Validations
    let passed = true;
    
    // Check performance (< 5000ms is the goal, but for small file should be < 100ms)
    if (duration > 5000) {
      console.error('FAIL: Processing took too long.');
      passed = false;
    }

    // Expecting 2 valid contacts (Alice and Bob)
    if (result.contacts.length !== 2) {
      console.error(`FAIL: Expected 2 valid contacts, got ${result.contacts.length}`);
      passed = false;
    }

    // Expecting 2 errors (Charlie and No Name)
    if (result.errors.length !== 2) {
      console.error(`FAIL: Expected 2 errors, got ${result.errors.length}`);
      passed = false;
    }

    if (passed) {
      console.log('\n✅ CHECKPOINT PASSED: Parser functional and validated.');
      process.exit(0);
    } else {
      console.error('\n❌ CHECKPOINT FAILED');
      process.exit(1);
    }

  } catch (error) {
    console.error('Checkpoing crashed:', error);
    process.exit(1);
  }
}

runCheckpoint();
