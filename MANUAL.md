# Manual do Usuário - Smart WhatsApp Dispatcher

Este software é um disparador de mensagens em massa para WhatsApp com foco em segurança (Anti-Ban) e inteligência.

## 🚀 Como Rodar o Sistema

### 1. Iniciar o Backend (Cérebro)
Este passo inicia o servidor que controla o WhatsApp.
1. Abra um terminal na pasta `Backend`.
2. Execute:
   ```bash
   npm start
   ```
3. Aguarde aparecer: `[INFO] API Server running on http://localhost:3001`

   > **Nota:** Se quiser usar apenas via linha de comando (sem site), use `npm run cli`.

### 2. Iniciar o Frontend (Interface)
Este passo abre o site para você usar.
1. Abra um novo terminal na pasta `Frontend`.
2. Instale as dependências (se for a primeira vez):
   ```bash
   npm install
   ```
3. Execute:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000` no seu navegador.

---

## 📱 Funcionalidades

### Gestão de Chips (Conexões)
- Vá na aba **Conexões**.
- Seus chips (instâncias) aparecerão como cartões.
- Se pedir QR Code, leia com seu celular.
- **Status:**
  - 🔴 **Desconectado:** Clique para iniciar.
  - 🟡 **Carregando/QR:** Aguardando leitura.
  - 🟢 **Online:** Pronto para uso.

### Criar Nova Campanha
1. Prepare um arquivo Excel (`.xlsx`) com colunas: `Nome`, `Telefone` (obrigatórias). Outras colunas como `Link` ou `Divida` podem ser usadas.
2. No painel **Nova Campanha**:
   - Faça upload do arquivo.
   - Escreva a mensagem usando variaveis:
     - `Olá {Nome}, seu link é {Link}`.
   - Use **Spintax** para segurança: `{Olá|Oi|Ei}`.
3. Configure os delays (Recomendado: 30s a 90s).
4. Clique em **Iniciar**.

### Monitoramento
- No **Dashboard**, você verá em tempo real:
  - Log de cada mensagem enviada.
  - Gráficos de desempenho.
  - Status da fila.

---

## 🛡️ Segurança (Anti-Ban)
O sistema opera com:
- **Delay Variável (Curva de Sino):** Nunca envia em tempos exatos (ex: varia entre 32s e 89s).
- **Digitação Humana:** Simula o tempo de digitação antes de enviar.
- **Rotação de Chips:** Se você conectar 2 ou mais números, ele alterna entre eles automaticamente.

---

## 🆘 Suporte Técnico
Se algo travar:
1. Feche todos os terminais (`Ctrl + C`).
2. Digite: `taskkill /F /IM node.exe /T` (Windows) para limpar tudo.
3. Reinicie o Passo 1 e 2.
