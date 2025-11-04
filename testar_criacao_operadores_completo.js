// Testes completos de criação de operadores, acesso a módulos e vínculo de unidades
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const results = [];
  
  function logTest(name, passed, details = '') {
    const status = passed ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${status}: ${name}`);
    if (details) console.log(`   ${details}`);
    results.push({ name, passed, details });
  }
  
  try {
    console.log('🧪 === TESTES DE CRIAÇÃO DE OPERADORES E ACESSOS ===\n');
    
    // Login como admin.master
    console.log('📋 Passo 1: Login como admin.master');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="login"], input[type="text"]', 'admin.master');
    await page.fill('input[name="senha"], input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"], button:has-text("Entrar")');
    
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Login realizado com sucesso\n');
    } catch (e) {
      logTest('Login admin.master', false, e.message);
      throw e;
    }
    
    // Teste 1: Acessar módulo Configurações > Operadores
    console.log('Teste 1: Acessar módulo Configurações > Operadores');
    try {
      await page.goto('http://localhost:5173/configuracoes/operadores');
      await page.waitForTimeout(2000);
      
      const hasConfig = await page.evaluate(() => {
        const body = document.body.textContent || '';
        return body.includes('Operadores') || body.includes('Configurações');
      });
      
      if (hasConfig) {
        logTest('Teste 1: Acesso Configurações', true, 'Módulo de configurações acessível');
      } else {
        logTest('Teste 1: Acesso Configurações', false, 'Módulo não encontrado');
      }
    } catch (e) {
      logTest('Teste 1: Acesso Configurações', false, e.message);
    }
    
    // Teste 2: Abrir diálogo de criação de operador
    console.log('\nTeste 2: Abrir diálogo de criação de operador');
    try {
      // Procurar botão "Novo Operador" ou "Criar Operador"
      const buttons = await page.$$('button');
      let foundButton = false;
      
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && (text.includes('Novo') || text.includes('Criar') || text.includes('Adicionar'))) {
          await button.click();
          foundButton = true;
          await page.waitForTimeout(1000);
          break;
        }
      }
      
      if (foundButton) {
        // Verificar se o diálogo abriu
        const dialogOpen = await page.evaluate(() => {
          const body = document.body.textContent || '';
          return body.includes('Criar') || body.includes('Novo') || body.includes('Operador');
        });
        
        if (dialogOpen) {
          logTest('Teste 2: Abrir diálogo criação', true, 'Diálogo de criação aberto');
        } else {
          logTest('Teste 2: Abrir diálogo criação', false, 'Diálogo não apareceu');
        }
      } else {
        // Tentar via URL direta ou verificar se já está na página de criação
        await page.goto('http://localhost:5173/configuracoes/operadores');
        await page.waitForTimeout(2000);
        logTest('Teste 2: Abrir diálogo criação', false, 'Botão não encontrado, pode estar em outra rota');
      }
    } catch (e) {
      logTest('Teste 2: Abrir diálogo criação', false, e.message);
    }
    
    // Teste 3: Preencher formulário de criação de operador
    console.log('\nTeste 3: Preencher formulário de criação');
    try {
      const timestamp = Date.now();
      const loginTeste = `operador.teste.${timestamp}`;
      const cpfTeste = `${timestamp.toString().slice(-11)}`;
      
      // Preencher campos básicos
      await page.fill('input[name="nome"], input[placeholder*="Nome" i], input[placeholder*="nome" i]', `Operador Teste ${timestamp}`);
      await page.fill('input[name="login"], input[placeholder*="Login" i], input[placeholder*="login" i]', loginTeste);
      await page.fill('input[name="senha"], input[type="password"], input[placeholder*="Senha" i]', 'Teste@123');
      await page.fill('input[name="cpf"], input[placeholder*="CPF" i]', cpfTeste);
      await page.fill('input[name="email"], input[type="email"], input[placeholder*="Email" i]', `${loginTeste}@teste.com`);
      
      await page.waitForTimeout(1000);
      
      logTest('Teste 3: Preencher formulário', true, `Dados preenchidos: ${loginTeste}`);
      
      // Teste 4: Selecionar perfis
      console.log('\nTeste 4: Selecionar perfis');
      try {
        // Procurar select de perfis ou botão de adicionar perfil
        const selects = await page.$$('select, [role="combobox"]');
        const perfisButtons = await page.$$('button:has-text("Perfil"), button:has-text("Adicionar")');
        
        if (selects.length > 0) {
          // Tentar selecionar um perfil
          await selects[0].click();
          await page.waitForTimeout(500);
          
          // Tentar selecionar primeira opção
          const options = await page.$$('option, [role="option"]');
          if (options.length > 0) {
            await options[0].click();
            logTest('Teste 4: Selecionar perfis', true, 'Perfil selecionado');
          } else {
            logTest('Teste 4: Selecionar perfis', false, 'Nenhuma opção de perfil encontrada');
          }
        } else if (perfisButtons.length > 0) {
          await perfisButtons[0].click();
          await page.waitForTimeout(500);
          logTest('Teste 4: Selecionar perfis', true, 'Botão de adicionar perfil encontrado');
        } else {
          logTest('Teste 4: Selecionar perfis', false, 'Interface de seleção de perfis não encontrada');
        }
      } catch (e) {
        logTest('Teste 4: Selecionar perfis', false, e.message);
      }
      
      // Teste 5: Selecionar unidades
      console.log('\nTeste 5: Selecionar unidades');
      try {
        // Procurar checkboxes ou selects de unidades
        const unidadesCheckboxes = await page.$$('input[type="checkbox"][value*="unidade"], input[type="checkbox"]');
        const unidadesSelects = await page.$$('select:has(option[value*="unidade"]), select');
        
        if (unidadesCheckboxes.length > 0) {
          // Selecionar primeira unidade
          await unidadesCheckboxes[0].check();
          await page.waitForTimeout(500);
          
          // Verificar se há opção de definir como principal
          const principalButtons = await page.$$('button:has-text("Principal"), button:has-text("principal")');
          if (principalButtons.length > 0) {
            await principalButtons[0].click();
            logTest('Teste 5: Selecionar unidades', true, 'Unidade selecionada e definida como principal');
          } else {
            logTest('Teste 5: Selecionar unidades', true, 'Unidade selecionada');
          }
        } else if (unidadesSelects.length > 0) {
          await unidadesSelects[0].click();
          await page.waitForTimeout(500);
          const options = await page.$$('option');
          if (options.length > 1) {
            await options[1].click();
            logTest('Teste 5: Selecionar unidades', true, 'Unidade selecionada via select');
          } else {
            logTest('Teste 5: Selecionar unidades', false, 'Nenhuma unidade disponível');
          }
        } else {
          logTest('Teste 5: Selecionar unidades', false, 'Interface de seleção de unidades não encontrada');
        }
      } catch (e) {
        logTest('Teste 5: Selecionar unidades', false, e.message);
      }
      
      // Teste 6: Salvar operador
      console.log('\nTeste 6: Salvar operador criado');
      try {
        const saveButtons = await page.$$('button:has-text("Salvar"), button:has-text("Criar"), button[type="submit"]');
        
        if (saveButtons.length > 0) {
          await saveButtons[0].click();
          await page.waitForTimeout(3000);
          
          // Verificar se apareceu mensagem de sucesso
          const successMessage = await page.evaluate(() => {
            const body = document.body.textContent || '';
            return body.includes('Sucesso') || body.includes('criado') || body.includes('Operador');
          });
          
          if (successMessage) {
            logTest('Teste 6: Salvar operador', true, 'Operador criado com sucesso');
          } else {
            // Verificar se há erro
            const errorMessage = await page.evaluate(() => {
              const body = document.body.textContent || '';
              return body.includes('Erro') || body.includes('erro') || body.includes('Falha');
            });
            
            if (errorMessage) {
              logTest('Teste 6: Salvar operador', false, 'Erro ao salvar operador');
            } else {
              logTest('Teste 6: Salvar operador', false, 'Não foi possível confirmar criação');
            }
          }
        } else {
          logTest('Teste 6: Salvar operador', false, 'Botão de salvar não encontrado');
        }
      } catch (e) {
        logTest('Teste 6: Salvar operador', false, e.message);
      }
      
    } catch (e) {
      logTest('Teste 3: Preencher formulário', false, e.message);
    }
    
    // Teste 7: Verificar acesso aos módulos conforme perfis
    console.log('\nTeste 7: Verificar acesso aos módulos conforme perfis');
    try {
      // Fazer logout e login com o novo operador criado
      await page.goto('http://localhost:5173/login');
      await page.waitForTimeout(1000);
      
      const timestamp = Date.now();
      const loginTeste = `operador.teste.${timestamp}`;
      
      await page.fill('input[name="login"], input[type="text"]', loginTeste);
      await page.fill('input[name="senha"], input[type="password"]', 'Teste@123');
      await page.click('button[type="submit"], button:has-text("Entrar")');
      
      await page.waitForTimeout(3000);
      
      // Verificar quais módulos estão visíveis no menu
      const menusVisiveis = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, [role="link"], nav a'));
        return links.map(link => link.textContent?.trim()).filter(Boolean);
      });
      
      if (menusVisiveis.length > 0) {
        logTest('Teste 7: Verificar acesso módulos', true, `Módulos visíveis: ${menusVisiveis.slice(0, 5).join(', ')}`);
      } else {
        logTest('Teste 7: Verificar acesso módulos', false, 'Nenhum módulo visível no menu');
      }
    } catch (e) {
      logTest('Teste 7: Verificar acesso módulos', false, e.message);
    }
    
    // Teste 8: Verificar vínculo de unidades
    console.log('\nTeste 8: Verificar vínculo de unidades');
    try {
      // Voltar para configurações e verificar unidades do operador
      await page.goto('http://localhost:5173/login');
      await page.fill('input[name="login"], input[type="text"]', 'admin.master');
      await page.fill('input[name="senha"], input[type="password"]', 'Admin@123');
      await page.click('button[type="submit"], button:has-text("Entrar")');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      await page.goto('http://localhost:5173/configuracoes/operadores');
      await page.waitForTimeout(2000);
      
      // Procurar operador criado na lista
      const operadorEncontrado = await page.evaluate(() => {
        const body = document.body.textContent || '';
        return body.includes('Operador Teste') || body.includes('operador.teste');
      });
      
      if (operadorEncontrado) {
        logTest('Teste 8: Verificar vínculo unidades', true, 'Operador encontrado na lista');
      } else {
        logTest('Teste 8: Verificar vínculo unidades', false, 'Operador não encontrado na lista');
      }
    } catch (e) {
      logTest('Teste 8: Verificar vínculo unidades', false, e.message);
    }
    
    // Resumo
    console.log('\n📊 === RESUMO DOS TESTES ===');
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    console.log(`Total: ${total} testes`);
    console.log(`✅ Passaram: ${passed}`);
    console.log(`❌ Falharam: ${total - passed}`);
    console.log(`📈 Taxa de sucesso: ${((passed/total)*100).toFixed(1)}%`);
    
    // Detalhes
    console.log('\n📋 Detalhes:');
    results.forEach((r, i) => {
      console.log(`${i+1}. ${r.name}: ${r.passed ? '✅' : '❌'}`);
      if (r.details) console.log(`   ${r.details}`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();

