const fs = require('fs');
const logger = require('../utils/logger');

/**
 * Detecta automaticamente o delimitador do CSV analisando a primeira linha
 * @param {string} content - Conteúdo do arquivo CSV
 * @returns {string} - O delimitador detectado
 */
function detectDelimiter(content) {
  // Delimitadores comuns: vírgula (Google Sheets), ponto-e-vírgula (Excel), tab, pipe
  const delimiters = [',', ';', '\t', '|'];
  
  // Pega a primeira linha (até o primeiro \n ou \r)
  let firstLine = '';
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    if (char === '\n' || char === '\r') {
      break;
    }
    firstLine += char;
  }

  // Conta as ocorrências de cada delimitador
  const counts = {};
  delimiters.forEach(delimiter => {
    counts[delimiter] = 0;
  });

  let inQuotes = false;
  for (let i = 0; i < firstLine.length; i += 1) {
    const char = firstLine[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    }
    
    // Só conta delimitadores fora de aspas
    if (!inQuotes && delimiters.includes(char)) {
      counts[char] += 1;
    }
  }

  // Retorna o delimitador com mais ocorrências
  let maxCount = 0;
  let detectedDelimiter = ','; // Default: vírgula
  
  delimiters.forEach(delimiter => {
    if (counts[delimiter] > maxCount) {
      maxCount = counts[delimiter];
      detectedDelimiter = delimiter;
    }
  });

  return detectedDelimiter;
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  // Detecta o delimitador automaticamente
  const delimiter = detectDelimiter(content);

  const pushField = () => {
    row.push(field);
    field = '';
  };

  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  const length = content.length;
  for (let i = 0; i < length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    // Usa o delimitador detectado automaticamente
    if (char === delimiter) {
      pushField();
      continue;
    }

    if (char === '\n') {
      pushField();
      pushRow();
      continue;
    }

    if (char === '\r') {
      if (next === '\n') {
        i += 1;
      }
      pushField();
      pushRow();
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  return rows;
}

function readCsvFile(filePath) {
  const raw = fs.readFileSync(filePath);
  let content = raw.toString('utf8');
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  
  // Detecta o delimitador para logging
  const delimiter = detectDelimiter(content);
  const delimiterName = {
    ',': 'vírgula (,)',
    ';': 'ponto-e-vírgula (;)',
    '\t': 'tabulação (\\t)',
    '|': 'pipe (|)'
  }[delimiter] || delimiter;
  
  logger.info(`CSV Parser: Delimitador detectado - ${delimiterName}`);
  
  return parseCsv(content);
}

module.exports = {
  detectDelimiter,
  parseCsv,
  readCsvFile
};
