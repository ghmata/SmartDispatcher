const { detectDelimiter, parseCsv } = require('./Backend/src/modules/parser/csvParser');

console.log('=== TESTE DE DETECÇÃO AUTOMÁTICA DE DELIMITADOR CSV ===\n');

// Teste 1: CSV com vírgula (Google Sheets)
const csvComma = `nome,telefone,empresa
João Silva,5511987654321,Empresa A
Maria Santos,5511987654322,Empresa B`;

console.log('📄 Teste 1: CSV com VÍRGULA (Google Sheets)');
console.log('Conteúdo:', csvComma.split('\n')[0]);
const delimiter1 = detectDelimiter(csvComma);
console.log('✅ Delimitador detectado:', delimiter1);
console.log('Dados parseados:', parseCsv(csvComma));
console.log('');

// Teste 2: CSV com ponto-e-vírgula (Excel)
const csvSemicolon = `nome;telefone;empresa
João Silva;5511987654321;Empresa A
Maria Santos;5511987654322;Empresa B`;

console.log('📄 Teste 2: CSV com PONTO-E-VÍRGULA (Excel)');
console.log('Conteúdo:', csvSemicolon.split('\n')[0]);
const delimiter2 = detectDelimiter(csvSemicolon);
console.log('✅ Delimitador detectado:', delimiter2);
console.log('Dados parseados:', parseCsv(csvSemicolon));
console.log('');

// Teste 3: CSV com tabulação
const csvTab = `nome\ttelefone\tempresa
João Silva\t5511987654321\tEmpresa A
Maria Santos\t5511987654322\tEmpresa B`;

console.log('📄 Teste 3: CSV com TABULAÇÃO');
console.log('Conteúdo:', csvTab.split('\n')[0].replace(/\t/g, '\\t'));
const delimiter3 = detectDelimiter(csvTab);
console.log('✅ Delimitador detectado:', delimiter3 === '\t' ? '\\t (tab)' : delimiter3);
console.log('Dados parseados:', parseCsv(csvTab));
console.log('');

// Teste 4: CSV com pipe
const csvPipe = `nome|telefone|empresa
João Silva|5511987654321|Empresa A
Maria Santos|5511987654322|Empresa B`;

console.log('📄 Teste 4: CSV com PIPE');
console.log('Conteúdo:', csvPipe.split('\n')[0]);
const delimiter4 = detectDelimiter(csvPipe);
console.log('✅ Delimitador detectado:', delimiter4);
console.log('Dados parseados:', parseCsv(csvPipe));
console.log('');

// Teste 5: CSV com aspas e vírgulas dentro dos campos
const csvQuoted = `nome,telefone,empresa
"Silva, João",5511987654321,"Empresa A, B e C"
"Santos, Maria",5511987654322,"Empresa D"`;

console.log('📄 Teste 5: CSV com ASPAS e vírgulas dentro dos campos');
console.log('Conteúdo:', csvQuoted.split('\n')[0]);
const delimiter5 = detectDelimiter(csvQuoted);
console.log('✅ Delimitador detectado:', delimiter5);
console.log('Dados parseados:', parseCsv(csvQuoted));
console.log('');

console.log('=== TODOS OS TESTES CONCLUÍDOS ===');
