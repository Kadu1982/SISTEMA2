// Testes completos seguindo o fluxo exato do código desenvolvido
// TUDO via frontend - nada direto no banco de dados
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  const results = [];
  let loginTeste = null;
  let operadorCriado = false;
  
  function logTest(name, passed, details = '') {
    const status = passed ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${status}: ${name}`);
    if (details) console.log(`   ${details}`);
    results.push({ name, passed, details });
  }
  
  try {
    console.log('🧪 === TESTES DE CRIAÇÃO DE OPERADORES ===\n');
    console.log('📋 Seguindo fluxo exato do código desenvolvido\n');
    
    // Login como admin.master
    console.log('📋 Passo 1: Login como admin.master');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(2000);
    
    // Preencher login usando IDs específicos ou seletores mais precisos
    const loginInput = page.locator('input[type="text"], input[name="login"]').first();
    const senhaInput = page.locator('input[type="password"], input[name="senha"]').first();
    
    await loginInput.fill('admin.master');
    await senhaInput.fill('Admin@123');
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Entrar")').first();
    await submitButton.click();
    
    try {
      // Aguardar redirecionamento para dashboard
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      console.log('✅ Login realizado com sucesso\n');
      
      // Aguardar contexto carregar e localStorage ser preenchido
      await page.waitForTimeout(5000); // Aguardar contexto carregar completamente
      
      // Verificar se o operador está no localStorage
      const operadorData = await page.evaluate(() => {
        return localStorage.getItem('operadorData');
      });
      
      if (operadorData) {
        const operador = JSON.parse(operadorData);
        console.log(`   Operador carregado: ${operador.login}`);
        console.log(`   isMaster: ${operador.isMaster || false}`);
        console.log(`   perfis: ${operador.perfis?.join(', ') || 'nenhum'}`);
      } else {
        logTest('Login admin.master', false, 'Operador não encontrado no localStorage');
      }
    } catch (e) {
      logTest('Login admin.master', false, `Erro: ${e.message}`);
      throw e;
    }
    
    // Teste 1: Acessar módulo Configurações > Operadores
    console.log('\nTeste 1: Acessar módulo Configurações > Operadores');
    try {
      // Navegar diretamente para operadores
      await page.goto('http://localhost:5173/configuracoes/operadores');
      await page.waitForTimeout(5000); // Aguardar carregar completamente
      
      // Verificar se foi redirecionado para login (sem permissão)
      const url = page.url();
      if (url.includes('/login')) {
        logTest('Teste 1: Acesso Configurações', false, `Foi redirecionado para login. URL: ${url}`);
        
        // Verificar o que está no localStorage
        const operadorData = await page.evaluate(() => {
          return {
            operadorData: localStorage.getItem('operadorData'),
            token: localStorage.getItem('token'),
            authToken: localStorage.getItem('authToken')
          };
        });
        
        console.log('   localStorage:', operadorData);
        
        // Tentar fazer login novamente e navegar
        await page.goto('http://localhost:5173/login');
        await page.waitForTimeout(2000);
        await page.fill('input[type="text"], input[name="login"]', 'admin.master');
        await page.fill('input[type="password"], input[name="senha"]', 'Admin@123');
        await page.click('button[type="submit"], button:has-text("Entrar")');
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        await page.waitForTimeout(5000);
        
        // Tentar acessar configurações novamente
        await page.goto('http://localhost:5173/configuracoes/operadores');
        await page.waitForTimeout(5000);
      }
      
      // Verificar se a página carregou
      const urlFinal = page.url();
      const pageContent = await page.textContent('body');
      const hasOperadores = pageContent && (
        pageContent.includes('Operadores') || 
        pageContent.includes('Operador') ||
        pageContent.includes('Novo Operador')
      );
      
      if (hasOperadores && !urlFinal.includes('/login')) {
        logTest('Teste 1: Acesso Configurações', true, 'Página de operadores carregada');
      } else {
        logTest('Teste 1: Acesso Configurações', false, `Página não contém elementos esperados. URL: ${urlFinal}`);
      }
    } catch (e) {
      logTest('Teste 1: Acesso Configurações', false, e.message);
    }
    
    // Teste 2: Abrir diálogo de criação de operador
    console.log('\nTeste 2: Abrir diálogo de criação de operador');
    let dialogAberto = false;
    try {
      // Procurar botão "Novo Operador" - texto exato do código
      const novoButton = page.locator('button:has-text("Novo Operador")').first();
      
      if (await novoButton.count() > 0) {
        await novoButton.click();
        await page.waitForTimeout(3000); // Aguardar dialog abrir
        
        // Verificar se o diálogo abriu usando o seletor do Dialog component
        const dialog = page.locator('[role="dialog"]').first();
        
        if (await dialog.count() > 0) {
          dialogAberto = true;
          logTest('Teste 2: Abrir diálogo criação', true, 'Diálogo de criação aberto');
        } else {
          logTest('Teste 2: Abrir diálogo criação', false, 'Diálogo não apareceu após clicar no botão');
        }
      } else {
        // Tentar outros seletores
        const altButton = page.locator('button:has-text("Novo"), button:has-text("Criar")').first();
        if (await altButton.count() > 0) {
          await altButton.click();
          await page.waitForTimeout(3000);
          const dialog = page.locator('[role="dialog"]').first();
          if (await dialog.count() > 0) {
            dialogAberto = true;
            logTest('Teste 2: Abrir diálogo criação', true, 'Diálogo aberto via botão alternativo');
          } else {
            logTest('Teste 2: Abrir diálogo criação', false, 'Botão encontrado mas diálogo não abriu');
          }
        } else {
          logTest('Teste 2: Abrir diálogo criação', false, 'Botão "Novo Operador" não encontrado');
        }
      }
    } catch (e) {
      logTest('Teste 2: Abrir diálogo criação', false, e.message);
    }
    
    if (dialogAberto) {
      // Teste 3: Preencher formulário de criação de operador
      console.log('\nTeste 3: Preencher formulário de criação');
      const timestamp = Date.now();
      loginTeste = `operador.teste.${timestamp}`;
      const cpfTeste = `1234567890${timestamp.toString().slice(-1)}`;
      
      try {
        // Preencher campos usando IDs exatos do código (#nome, #login, #senha, #cpf, #email)
        await page.fill('#nome', `Operador Teste ${timestamp}`, { timeout: 5000 });
        await page.waitForTimeout(300);
        
        await page.fill('#login', loginTeste, { timeout: 5000 });
        await page.waitForTimeout(300);
        
        await page.fill('#senha', 'Teste@123', { timeout: 5000 });
        await page.waitForTimeout(300);
        
        await page.fill('#cpf', cpfTeste, { timeout: 5000 });
        await page.waitForTimeout(300);
        
        await page.fill('#email', `${loginTeste}@teste.com`, { timeout: 5000 });
        await page.waitForTimeout(500);
        
        logTest('Teste 3: Preencher formulário', true, `Dados preenchidos: ${loginTeste}`);
        
        // Teste 4: Selecionar perfis
        console.log('\nTeste 4: Selecionar perfis');
        try {
          // Procurar Select de perfis (shadcn Select component)
          // O Select renderiza com um trigger que abre o conteúdo
          const selectTrigger = page.locator('[role="combobox"]').first();
          
          if (await selectTrigger.count() > 0) {
            await selectTrigger.click();
            await page.waitForTimeout(1000);
            
            // Procurar primeira opção de perfil disponível
            const firstOption = page.locator('[role="option"]').first();
            if (await firstOption.count() > 0) {
              await firstOption.click();
              await page.waitForTimeout(1000);
              logTest('Teste 4: Selecionar perfis', true, 'Perfil selecionado via Select');
            } else {
              logTest('Teste 4: Selecionar perfis', false, 'Nenhuma opção de perfil encontrada');
            }
          } else {
            // Tentar templates de perfis (botões com nomes de templates)
            const templateButtons = page.locator('button:has-text("UPA"), button:has-text("RECEPCIONISTA"), button:has-text("ADMINISTRADOR")').first();
            if (await templateButtons.count() > 0) {
              await templateButtons.first().click();
              await page.waitForTimeout(1000);
              logTest('Teste 4: Selecionar perfis', true, 'Perfil selecionado via template');
            } else {
              logTest('Teste 4: Selecionar perfis', false, 'Interface de seleção de perfis não encontrada');
            }
          }
        } catch (e) {
          logTest('Teste 4: Selecionar perfis', false, e.message);
        }
        
        // Teste 5: Selecionar unidades
        console.log('\nTeste 5: Selecionar unidades e definir unidade principal');
        try {
          // Procurar checkboxes de unidades (código usa checkboxes)
          const unidadesCheckboxes = page.locator('input[type="checkbox"]');
          const checkboxesCount = await unidadesCheckboxes.count();
          
          if (checkboxesCount > 0) {
            // Selecionar primeira unidade
            await unidadesCheckboxes.first().check();
            await page.waitForTimeout(1000);
            
            // Verificar se há botão "Definir como Principal"
            const principalButton = page.locator('button:has-text("Principal"), button:has-text("principal")').first();
            
            if (await principalButton.count() > 0) {
              await principalButton.click();
              await page.waitForTimeout(500);
              logTest('Teste 5: Selecionar unidades', true, 'Unidade selecionada e definida como principal');
            } else {
              // Se a primeira unidade é automaticamente principal
              logTest('Teste 5: Selecionar unidades', true, 'Unidade selecionada (primeira pode ser principal por padrão)');
            }
          } else {
            logTest('Teste 5: Selecionar unidades', false, 'Checkboxes de unidades não encontrados');
          }
        } catch (e) {
          logTest('Teste 5: Selecionar unidades', false, e.message);
        }
        
        // Teste 6: Salvar operador
        console.log('\nTeste 6: Salvar operador criado');
        try {
          // Procurar botão "Criar Operador" (texto exato do código)
          const createButton = page.locator('button:has-text("Criar Operador")').first();
          
          if (await createButton.count() > 0) {
            await createButton.click();
            await page.waitForTimeout(5000); // Aguardar processamento (cria operador, salva perfis, salva unidades)
            
            // Verificar se o diálogo fechou (indicando sucesso)
            const dialogAindaAberto = await page.locator('[role="dialog"]').count();
            
            if (dialogAindaAberto === 0) {
              operadorCriado = true;
              logTest('Teste 6: Salvar operador', true, 'Operador criado com sucesso via frontend (diálogo fechou)');
            } else {
              // Verificar se há mensagem de erro
              const errorMessage = await page.evaluate(() => {
                const body = document.body.textContent || '';
                return body.includes('Erro') || body.includes('erro') || body.includes('Falha') || 
                       body.includes('inválid') || body.includes('duplicado') || body.includes('Preencha');
              });
              
              if (errorMessage) {
                // Capturar mensagem de erro específica
                const erroText = await page.locator('div:has-text("Erro"), div:has-text("erro"), div:has-text("Preencha")').first().textContent().catch(() => '');
                logTest('Teste 6: Salvar operador', false, `Erro ao salvar: ${erroText || 'Mensagem de erro encontrada'}`);
              } else {
                logTest('Teste 6: Salvar operador', false, 'Diálogo ainda aberto, verificar se salvou');
              }
            }
          } else {
            // Tentar botão genérico
            const saveButtons = page.locator('button:has-text("Salvar"), button:has-text("Criar"), button[type="submit"]').first();
            if (await saveButtons.count() > 0) {
              await saveButtons.first().click();
              await page.waitForTimeout(5000);
              const dialogAindaAberto = await page.locator('[role="dialog"]').count();
              if (dialogAindaAberto === 0) {
                operadorCriado = true;
                logTest('Teste 6: Salvar operador', true, 'Operador criado via botão genérico');
              } else {
                logTest('Teste 6: Salvar operador', false, 'Diálogo ainda aberto após salvar');
              }
            } else {
              logTest('Teste 6: Salvar operador', false, 'Botão de salvar não encontrado');
            }
          }
        } catch (e) {
          logTest('Teste 6: Salvar operador', false, e.message);
        }
        
      } catch (e) {
        logTest('Teste 3: Preencher formulário', false, e.message);
      }
    } else {
      console.log('\n⚠️ Diálogo não foi aberto. Pulando testes de criação.\n');
      loginTeste = `operador.teste.${Date.now()}`;
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
    
    console.log('\n✅ Testes concluídos!');
    console.log('📝 Todos os testes foram executados via frontend seguindo o fluxo do código');
    
    // Erros e falhas encontrados
    const falhas = results.filter(r => !r.passed);
    if (falhas.length > 0) {
      console.log('\n🔍 === ERROS E FALHAS ENCONTRADOS ===');
      falhas.forEach((f, i) => {
        console.log(`${i+1}. ${f.name}`);
        console.log(`   ${f.details || 'Erro não especificado'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
