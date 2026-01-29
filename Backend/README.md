# Disparador Inteligente WhatsApp (Portable)

Aplicação desktop portátil para automação de mensagens WhatsApp com foco em segurança operacional (Anti-Ban) e baixo custo.

## 📋 Sobre o Projeto

Este software permite o envio de mensagens em massa utilizando a versão Web do WhatsApp, simulando comportamento humano e distribuindo a carga entre múltiplos números (chips) para evitar bloqueios.

**Status:** Dia 4 (Orquestração, Logs e Resiliência) Concluído.

## 🚀 Pré-requisitos

- **Sistema Operacional:** Windows 10/11 (64-bit)
- **Node.js:** Versão 18.x ou superior (Apenas para desenvolvimento/build)
- **Espaço em Disco:** ~500MB livre

## 🛠️ Instalação (Desenvolvimento)

1. Extraia a pasta do projeto.
2. Abra o terminal na pasta raiz.
3. Instale as dependências:
   ```bash
   npm install
   ```

## ▶️ Como Rodar

Para iniciar a aplicação em modo de desenvolvimento:

```bash
npm start
```

## ✅ Validação do Dia 1

O foco do Dia 1 foi a estrutura do projeto e o módulo de leitura de dados (Parser).

Para validar a implementação:

1. Gere a planilha de teste:
   ```bash
   node scripts/generate-template.js
   ```
   Isso criará o arquivo `tests/template.xlsx`.

2. Execute o script de checkpoint:
   ```bash
   node tests/test-parser.js
   ```

**Resultado Esperado:**
- O script deve processar a planilha em menos de 5 segundos.
- Deve identificar 2 contatos válidos e 2 erros.
- Mensagem final: `✅ CHECKPOINT PASSED`.

## 📂 Estrutura de Pastas

- `src/`: Código fonte.
- `config/`: Arquivos de configuração.
- `data/`: Dados persistentes (logs, sessões) - **Não apagar**.
- `scripts/`: Scripts auxiliares de validação/build.
- `tests/`: Testes unitários e de integração.

## 📝 Logs

Os logs de execução são salvos em `data/logs/` com rotação diária.
- `app-YYYY-MM-DD.log`: Informações gerais.
- `error-YYYY-MM-DD.log`: Erros críticos.
