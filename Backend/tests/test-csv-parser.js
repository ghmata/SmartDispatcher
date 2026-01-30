const path = require('path');
const ExcelParser = require('../src/modules/parser/excelParser');

async function runCsvTest() {
  console.log('--- CSV PARSER TEST ---');
  const parser = new ExcelParser();
  const csvPath = path.resolve(__dirname, 'fixtures', 'contacts.csv');

  const result = await parser.parse(csvPath, 'contacts.csv');

  if (result.contacts.length !== 2) {
    console.error(`FAIL: Expected 2 valid contacts, got ${result.contacts.length}`);
    process.exit(1);
  }

  if (result.errors.length !== 1) {
    console.error(`FAIL: Expected 1 error, got ${result.errors.length}`);
    process.exit(1);
  }

  const [first] = result.contacts;
  if (!first.name.includes('Maria') || first.phone !== '5511999998888') {
    console.error('FAIL: CSV parsing did not normalize values correctly.');
    process.exit(1);
  }

  console.log('✅ CSV parser ok.');
}

runCsvTest().catch((error) => {
  console.error('CSV parser test failed:', error);
  process.exit(1);
});
