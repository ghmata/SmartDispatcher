# Notas de Segurança - Dia 1

## 1. Manipulação de Arquivos
- **Risco:** O Parser de Excel pode travar a aplicação se receber arquivos binários maliciosos ou corrompidos.
- **Mitigação:** Implementado `try-catch` robusto em nível de linha e nível de arquivo. O parser falha graciosamente sem derrubar o processo principal.

## 2. Dados Sensíveis em Logs
- **Risco:** Logar números de telefone e nomes de clientes viola princípios de privacidade (LGPD, embora simplificado neste escopo).
- **Mitigação Atual:** O logger registra metadados ("Parsing complete", "Invalid Phone Format").
- **Ação Futura:** No Dia 4, implementar "masking" para garantir que números de telefone nos logs de sucesso sejam parciais (ex: `55119****8888`), se o cliente solicitar maior privacidade.

## 3. Permissões de Escrita
- **Nota:** Como a aplicação é portátil e escreve na própria pasta (`data/`), ela não deve ser instalada em diretórios protegidos do Windows (`C:\Program Files`) sem privilégios de Administrador. O Manual do Usuário (Dia 5) deve recomendar uso em `Documents` ou unidade secundária `D:\`.

## 4. Sessões WhatsApp (Dia 2)
- **Risco:** As pastas em `data/sessions` contêm tokens de autenticação que dão acesso total à conta do WhatsApp.
- **Mitigação:** O software roda localmente. O usuário deve ser instruído a **nunca compartilhar a pasta `data`** com terceiros. A estrutura separa `src` (código) de `data` (sensível) para facilitar backups seguros (apenas código).
- **Nota:** Logs não devem registrar o conteúdo do QR Code (string base64 gigante), apenas avisar que foi gerado.

## 5. Padrões de Envio (Dia 3)
- **Risco:** Envio em massa com tempos exatos (ex: exatamente a cada 30s) é o principal gatilho de banimento.
- **Mitigação:** Implementado `Box-Muller Transform` para gerar delays com "curva de sino" (distribuição normal). Isso garante que os tempos de espera pareçam orgânicos (ex: média de 45s, mas variando naturalmente).
- **Risco:** Mensagens idênticas marcadas como SPAM.
- **Mitigação:** Uso obrigatório de `Spintax` ({Olá|Oi}). O `Dispatcher` deve falhar se detectar mensagem estática repetida muitas vezes (roadmap futuro).

## 6. Logs e PII (Dia 4)
- **Risco:** Vazamento de números de clientes em arquivos de log.
- **Mitigação:** Implementada sanitização automática no `Winston Logger`. Números formados como 55+11+9... são substituídos por `55119****8888`.
- **Risco:** Perda de progresso em crash.
- **Mitigação:** `CampaignManager` salva estado em `campaign_state.json` a cada envio.


