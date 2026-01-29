# 📄 Relatório de Definição do Projeto: Disparador Inteligente WhatsApp

### 1. Resumo Executivo
O projeto iniciou-se como uma automação de cobrança para o Asaas. Durante a negociação, foi identificada a necessidade crítica de **envio de mensagens via WhatsApp** com foco em redução de custos (sem taxas por mensagem) e segurança operacional (evitar banimento de chips).
**O escopo final foca 100% no Disparo e Gestão de Comunicados**, eliminando a integração com Asaas neste primeiro momento.

### 2. O Que Foi Acordado (Escopo Técnico)

**A Solução:**
Desenvolvimento de um software Desktop (Windows) que atua como um "Disparador Humanizado" de mensagens de WhatsApp.

**Arquitetura:**
*   **Tipo:** Aplicação Local (roda na máquina do cliente).
*   **Formato:** Executável (`.exe`) portátil. Não requer instalação complexa.
*   **Infraestrutura:** Utiliza a conexão de internet e os chips do próprio cliente (Custo zero de servidor).

### 3. Funcionalidades Chave

1.  **Multi-Empresa (Isolamento por Pasta):**
    *   O software será "portável". Para gerenciar a Empresa A e a Empresa B separadamente, o cliente apenas duplica a pasta do programa no Windows.
    *   Cada pasta mantém sua própria base de dados, sessões de WhatsApp e planilhas, sem misturar as operações.

2.  **Multi-Chip com Rotação (Load Balancer):**
    *   O sistema permitirá conectar mais de um número de WhatsApp simultaneamente na mesma instância.
    *   **Lógica:** O robô fará o rodízio automático de envios (Ex: Envia msg 1 pelo Chip A, msg 2 pelo Chip B, msg 3 pelo Chip A...), dividindo a carga e reduzindo drasticamente o padrão de spam.

3.  **Sistema Anti-Banimento (Humanização):**
    *   **Delay Variável:** Intervalos aleatórios entre os envios (ex: espera entre 30s e 90s) para simular comportamento humano.
    *   **Variação de Texto (Spintax):** Capacidade de alternar sinônimos na mensagem (ex: "Olá" / "Oi" / "Bom dia") para evitar hashs de mensagens idênticas.

4.  **Entrada de Dados:**
    *   Leitura direta de arquivo Excel/CSV fornecido pelo cliente (Modelo: Nome, Telefone, Link/Mensagem, ou apenas variáveis para Template).

### 4. Acordo Comercial

*   **Valor:** **R$ 350,00** (Mantido o valor inicial da proposta, absorvendo a complexidade extra técnica como investimento na reputação do perfil).
*   **Prazo:** Ajustado de 3 para **5 dias úteis** (Devido à implementação da lógica de rotação de chips e testes de segurança anti-ban).
*   **Custos Recorrentes:** **R$ 0,00**. O cliente não pagará mensalidades de software nem taxas por envio.

### 5. Entregáveis

Ao final dos 5 dias úteis, o cliente receberá:

1.  📦 **Arquivo .ZIP contendo:**
    *   O executável do Robô (`Disparador.exe`).
    *   O arquivo de configuração (`config.json` ou interface visual simples).
    *   A Planilha Modelo (`template.xlsx`) para ele preencher os dados.
2.  📄 **Mini-Manual de Instruções:** Explicando como ler o QR Code, como duplicar a pasta para a segunda empresa e boas práticas para evitar banimento.

---

### Próximos Passos Imediatos:
1.  **Aguardar:** Cliente enviar o modelo da planilha (Columns structure).
2.  **Executar:** Iniciar o desenvolvimento focando primeiro na conexão Multi-Device.
3.  **Revisar:** Revisar a planilha modelo do cliente para confirmar a estrutura.
