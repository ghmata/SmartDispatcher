const ExcelParser = require('./Backend/src/modules/parser/excelParser');
const path = require('path');

async function testarParsers() {
  const parser = new ExcelParser();
  
  console.log('╔══════════════════════════════════════════════════════════════');
  console.log('║ TESTE: CSV com Delimitadores Diferentes');
  console.log('╚══════════════════════════════════════════════════════════════\n');
  
  // Teste 1: CSV com vírgula (Google Sheets)
  console.log('📄 Teste 1: CSV com VÍRGULA (formato Google Sheets)');
  console.log('   Arquivo: _quarantine/backend_tests/tests/fixtures/contacts.csv\n');
  
  const csvComma = path.resolve(__dirname, '_quarantine/backend_tests/tests/fixtures/contacts.csv');
  const result1 = await parser.parse(csvComma, 'contacts.csv');
  
  console.log(`   ✅ Contatos válidos: ${result1.contacts.length}`);
  console.log(`   ⚠️  Erros: ${result1.errors.length}`);
  result1.contacts.forEach((contact, i) => {
    console.log(`      ${i + 1}. ${contact.name} - ${contact.phone}`);
  });
  console.log('');
  
  // Teste 2: CSV com ponto-e-vírgula (Excel)
  console.log('📄 Teste 2: CSV com PONTO-E-VÍRGULA (formato Excel)');
  console.log('   Arquivo: exemplo_csv_excel.csv\n');
  
  const csvSemicolon = path.resolve(__dirname, 'exemplo_csv_excel.csv');
  const result2 = await parser.parse(csvSemicolon, 'exemplo_csv_excel.csv');
  
  console.log(`   ✅ Contatos válidos: ${result2.contacts.length}`);
  console.log(`   ⚠️  Erros: ${result2.errors.length}`);
  result2.contacts.forEach((contact, i) => {
    console.log(`      ${i + 1}. ${contact.name} - ${contact.phone}`);
  });
  console.log('');
  
  console.log('╔══════════════════════════════════════════════════════════════');
  console.log('║ ✅ SUCESSO! Ambos os formatos foram lidos corretamente!');
  console.log('╚══════════════════════════════════════════════════════════════');
}

testarParsers().catch(error => {
  console.error('❌ Erro durante o teste:', error.message);
  process.exit(1);
});
