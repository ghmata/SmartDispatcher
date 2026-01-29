const ExcelJS = require('exceljs');
const path = require('path');

async function generateTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Contatos');

  worksheet.columns = [
    { header: 'Nome', key: 'name', width: 30 },
    { header: 'Telefone', key: 'phone', width: 20 },
    { header: 'Link', key: 'link', width: 40 }
  ];

  // Add Valid Rows
  worksheet.addRow({ name: 'Alice Silva', phone: '5511999887766', link: 'https://exemplo.com/fatura/123' });
  worksheet.addRow({ name: 'Bob Santos', phone: '11988776655', link: 'https://exemplo.com/promo' }); // Should auto-fix to 55

  // Add Invalid Rows
  worksheet.addRow({ name: 'Charlie Error', phone: '123', link: '' });
  worksheet.addRow({ name: '', phone: '5511999887766', link: 'https://google.com' });

  const outputPath = path.join(__dirname, '../tests/template.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Template generated at: ${outputPath}`);
}

generateTemplate();
