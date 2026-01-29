# Validação - Dia 1

**Objetivo:** Garantir que a Base do Projeto e o Parser de Excel funcionam conforme especificado.

## Passo 1: Verificar Estrutura
1. Abra a pasta do projeto.
2. Confirme a existência das pastas:
   - `src/modules/parser`
   - `src/modules/utils`
   - `data/logs`
   - `data/sessions`
   - `tests`

## Passo 2: Executar Teste Automatizado
No terminal, execute:
```bash
npm install
node scripts/generate-template.js
node tests/test-parser.js
```

## Passo 3: Critérios de Aceite (Checklist)

- [ ] O comando `generate-template.js` criou o arquivo `tests/template.xlsx`?
- [ ] O comando `test-parser.js` finalizou com "✅ CHECKPOINT PASSED"?
- [ ] Verifique a pasta `data/logs`:
  - Existe um arquivo `app-YYYY-MM-DD.log`?
  - Abra o arquivo e verifique se há entradas como `[INFO]: Starting parser for...`

## Passo 4: Solução de Problemas Comuns

**Erro: "Cannot find module 'exceljs'"**
- Execute `npm install` novamente.

**Erro: "Permission denied" ao criar logs**
- Verifique se a pasta não está em "Somente Leitura" ou em local protegido.
