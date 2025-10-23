# Webhook Playwright: Copiar e Preencher Cadastro de Paciente

## Objetivo
Automatizar a cópia de dados de um paciente do sistema externo (https://rioclaro-saude.ids.inf.br/) e preencher automaticamente o cadastro de novo paciente no sistema local (http://localhost:5173), sem salvar o cadastro, usando um webhook HTTP.

---

## Pré-requisitos
- Node.js instalado
- Playwright instalado (`npm install -D playwright`)
- Express instalado (`npm install express`)

---

## Passo a Passo

### 1. Instale as dependências
```bash
npm init -y
npm install express playwright
```

### 2. Crie o arquivo `webhookPreencherPaciente.js` com o seguinte conteúdo:

```javascript
const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = 3001; // Você pode mudar a porta se quiser

app.post('/copiar-e-preencher-paciente', async (req, res) => {
  const browser = await chromium.launch({ headless: false }); // true para rodar sem interface
  const page = await browser.newPage();

  try {
    // 1. Login no sistema externo
    await page.goto('https://rioclaro-saude.ids.inf.br/');
    await page.fill('input[placeholder="Operador"]', 'lucas.alcantara');
    await page.fill('input[placeholder="Senha"]', 'saude@123');
    await page.click('button:has-text("Acessar")');
    await page.click('button:has-text("Confirmar")');

    // 2. Navegar até "Usuários" > "Pesquisa"
    await page.click('text=Usuários');
    await page.click('text=Pesquisa');
    await page.click('text=Campos:');
    await page.fill('input[placeholder="Campos:"]', 'CPF');
    await page.click('text=C.P.F.');
    await page.fill('input[placeholder="Filtro:"]', '28546516855');
    await page.click('button:has-text("")'); // Ícone da bandeirinha
    await page.click('button:has-text("Incluir")');

    // 3. Copiar dados da aba "Usuário"
    await page.click('text=Usuário');
    const dadosUsuario = {
      nome: await page.inputValue('input[placeholder="Nome:"]'),
      sexo: await page.inputValue('input[placeholder="Sexo:"]'),
      cpf: await page.inputValue('input[placeholder="C.P.F.:"]'),
      cns: await page.inputValue('input[placeholder="C.N.S.:"]'),
      dataNascimento: await page.inputValue('input[placeholder="Data de Nascimento:"]'),
      nomeMae: await page.inputValue('input[placeholder="Nome da Mãe:"]'),
      nomePai: await page.inputValue('input[placeholder="Nome do Pai:"]'),
      // Adicione outros campos conforme necessário
    };

    // 4. Copiar dados da aba "Endereço"
    await page.click('text=Endereço');
    const dadosEndereco = {
      municipio: await page.inputValue('input[placeholder="Município de Endereço:"]'),
      cep: await page.inputValue('input[placeholder="CEP:"]'),
      logradouro: await page.inputValue('input[placeholder="Logradouro:"]'),
      numero: await page.inputValue('input[placeholder="Número de Endereço:"]'),
      bairro: await page.inputValue('input[placeholder="Bairro ou Distrito:"]'),
      telefone: await page.inputValue('input[placeholder="Telefone:"]'),
      // Adicione outros campos conforme necessário
    };

    // 5. Acessar sistema local e preencher cadastro
    await page.goto('http://localhost:5173');
    await page.click('text=Recepção');
    await page.click('button:has-text("Novo Paciente")');

    await page.fill('input[placeholder="Nome"]', dadosUsuario.nome);
    await page.fill('input[placeholder="CPF"]', dadosUsuario.cpf);
    await page.fill('input[placeholder="Data de Nascimento"]', dadosUsuario.dataNascimento);
    await page.fill('input[placeholder="Nome da Mãe"]', dadosUsuario.nomeMae);
    await page.fill('input[placeholder="Nome do Pai"]', dadosUsuario.nomePai);
    await page.fill('input[placeholder="CEP"]', dadosEndereco.cep);
    await page.fill('input[placeholder="Logradouro"]', dadosEndereco.logradouro);
    await page.fill('input[placeholder="Número"]', dadosEndereco.numero);
    await page.fill('input[placeholder="Bairro"]', dadosEndereco.bairro);
    await page.fill('input[placeholder="Telefone"]', dadosEndereco.telefone);
    // Preencha outros campos conforme necessário

    // 6. Não salva, apenas preenche e fecha o navegador
    await browser.close();

    res.json({
      status: 'ok',
      mensagem: 'Dados copiados e formulário preenchido com sucesso!',
      usuario: dadosUsuario,
      endereco: dadosEndereco
    });
  } catch (err) {
    await browser.close();
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Webhook rodando em http://localhost:${PORT}`);
});
```

---

### 3. Execute o webhook
```bash
node webhookPreencherPaciente.js
```

---

### 4. Chame o endpoint para executar a automação
```bash
curl -X POST http://localhost:3001/copiar-e-preencher-paciente
```
Ou use Postman/Insomnia/etc.

---

## Observações
- Ajuste os seletores (`input[placeholder="..."]`, `text=...`) conforme o HTML real dos sistemas.
- O navegador será fechado automaticamente ao final, sem salvar nada.
- O webhook retorna os dados copiados no JSON de resposta.
- Adapte para outros campos ou fluxos conforme sua necessidade.
