const fs = require("fs");
const path = require("path");

const currentDateTime = new Date().toLocaleString("pt-BR");
const formattedDate = new Date().toISOString().split("T")[0];

const newConversation = `
## Sessão de ${currentDateTime}

### Tópicos Discutidos
- Sistema de salvamento automático de conversas
- Processo de documentação sob demanda
- Comandos para solicitar salvamento

### Detalhes da Conversa

#### Principais Pontos
1. Confirmação do funcionamento do sistema de salvamento
2. Discussão sobre como solicitar salvamentos futuros
3. Comandos úteis para solicitar documentação:
   - "Pode salvar nossa conversa?"
   - "Vamos documentar essa conversa"
   - "Preciso salvar isso que discutimos"
   - "Gerar documentação dessa conversa"

### Decisões Tomadas
- Estabelecido processo de salvamento sob demanda
- Definido formato padrão de documentação
- Acordo para retornar ao desenvolvimento do projeto principal

### Próximos Passos
1. Retornar ao desenvolvimento do projeto principal
2. Utilizar o sistema de documentação conforme necessário
3. Manter registro das decisões importantes

---
`;

try {
  const docsPath = path.join(__dirname, "docs");
  const conversationsPath = path.join(docsPath, "conversas");

  // Criar diretório docs se não existir
  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath);
    console.log("✅ Diretório docs criado");
  }

  // Criar diretório de conversas se não existir
  if (!fs.existsSync(conversationsPath)) {
    fs.mkdirSync(conversationsPath);
    console.log("✅ Diretório conversas criado");
  }

  // Criar novo arquivo de conversa com timestamp
  const conversationFileName = `conversa_${formattedDate}_${Date.now()}.md`;
  const conversationPath = path.join(conversationsPath, conversationFileName);

  fs.writeFileSync(conversationPath, newConversation);
  console.log(`✅ Conversa salva em: ${conversationFileName}`);

  // Atualizar índice de conversas
  const indexPath = path.join(conversationsPath, "_indice.md");
  const indexEntry = `- [Conversa ${currentDateTime}](${conversationFileName}) - Tópico: Sistema de Documentação Automatizada\n`;

  if (fs.existsSync(indexPath)) {
    fs.appendFileSync(indexPath, indexEntry);
  } else {
    fs.writeFileSync(indexPath, `# Índice de Conversas\n\n${indexEntry}`);
  }
  console.log("✅ Índice de conversas atualizado");

  console.log("\n✨ Processo concluído com sucesso!");
} catch (err) {
  console.error("❌ Erro:", err);
}
