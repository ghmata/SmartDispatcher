# Guia Mestre de Validação (Dias 1 a 4)

Este guia serve para verificar se "o motor" do sistema está funcionando perfeitamente enquanto aguardamos o frontend.

---

## 🏗️ Passo 1: Validação de Entrada (Dia 1)
**O que testa:** Se o sistema consegue ler arquivos Excel e limpar números de telefone.
**Comando:**
```bash
node tests/test-parser.js
```
**Resultado Esperado:**
- Deve criar um arquivo `tests/template.xlsx`.
- Deve mostrar `✅ Valid Rows: 1`.
- Deve mostrar que o telefone foi formatado para `55...`.

---

## 🧠 Passo 2: Validação de Inteligência (Dia 3)
**O que testa:** Se o "Cérebro" sabe variar textos (Spintax) e calcular pausas humanas (Delay).
**Comando:**
```bash
node tests/test-compliance.js
```
**Resultado Esperado:**
- **Spintax:** Uma contagem variada de `{Olá|Oi|Ei}` (ex: 30/30/40).
- **Delays:** Lista de tempos em MS que não se repetem (ex: `54000, 61000...`).
- **Status:** `✅ CHECKPOINT PASSED`.

---

## 🔌 Passo 3: Conectividade Real (Dia 2) - **CRÍTICO**
**O que testa:** Se o sistema abre o Chrome, conecta no WhatsApp e mantém a sessão.
**Atenção:** Se já tiver sessões salvas, ele deve conectar direto. Se não, pedirá QR Code.
**Comando:**
```bash
node tests/test-multisession.js
```
**Ação Necessária:**
1.  Deixe rodar.
2.  Se pedir QR Code, leia com seu celular (WhatsApp > Aparelhos Conectados).
3.  **Sucesso:** Quando aparecer `STATUS: READY` para os chips.
4.  Para sair, digite `Ctrl + C` no terminal.

---

## 🎻 Passo 4: Orquestração (Dia 4)
**O que testa:** Se o Gerente de Campanha consegue controlar tudo (usando dados simulados para não enviar spam real durante o teste).
**Comando:**
```bash
node tests/test-campaign.js
```
**Resultado Esperado:**
- Cria um Excel falso (`mock_campaign.xlsx`).
- Simula o envio linha por linha.
- Cria/Atualiza o arquivo de estado (`data/campaign_state.json`).
- **Status:** `✅ CHECKPOINT PASSED`.

---

## ✅ Conclusão
Se os 4 passos passarem, o Backend está 100% pronto para receber o Frontend do v0.
