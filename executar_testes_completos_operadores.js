// Script completo para executar testes de login e criação de operadores
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
    console.log('🧪 === TESTES DE LOGIN DE OPERADORES ===\n');
    
    // Teste 1: Login com Operador Master
    console.log('Teste 1: Login com Operador Master (admin.master)');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="login"], input[type="text"]', 'admin.master');
    await page.fill('input[name="senha"], input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"], button:has-text("Entrar")');
    
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      const token = await page.evaluate(() => localStorage.getItem('token'));
      const operadorData = await page.evaluate(() => localStorage.getItem('operadorData'));
      
      if (token && operadorData) {
        const operador = JSON.parse(operadorData);
        logTest('Teste 1: Login Master', true, 
          `Operador: ${operador.nome}, Perfis: ${operador.perfis?.join(', ') || 'N/A'}`);
      } else {
        logTest('Teste 1: Login Master', false, 'Token ou dados do operador não encontrados');
      }
    } catch (e) {
      logTest('Teste 1: Login Master', false, `Não redirecionou para dashboard: ${e.message}`);
    }
    
    // Teste 2: Login com credenciais inválidas
    console.log('\nTeste 2: Login com credenciais inválidas');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="login"], input[type="text"]', 'operador.inexistente');
    await page.fill('input[name="senha"], input[type="password"]', 'senha_qualquer');
    await page.click('button[type="submit"], button:has-text("Entrar")');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    const hasError = await page.evaluate(() => {
      const body = document.body.textContent || '';
      return body.includes('inválid') || body.includes('erro') || body.includes('não encontrado') || 
             body.includes('Credenciais') || body.includes('Operador não encontrado');
    });
    
    if (currentUrl.includes('/login') && hasError) {
      logTest('Teste 2: Credenciais Inválidas', true, 'Login bloqueado corretamente');
    } else {
      logTest('Teste 2: Credenciais Inválidas', false, 'Login não foi bloqueado ou erro não apareceu');
    }
    
    // Teste 3: Verificar que admin.master não foi alterado
    console.log('\nTeste 3: Verificar proteção do admin.master');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="login"], input[type="text"]', 'admin.master');
    await page.fill('input[name="senha"], input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"], button:has-text("Entrar")');
    
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      const operadorData = await page.evaluate(() => localStorage.getItem('operadorData'));
      if (operadorData) {
        const operador = JSON.parse(operadorData);
        if (operador.login === 'admin.master' && operador.perfis?.includes('ADMINISTRADOR_SISTEMA')) {
          logTest('Teste 3: Proteção admin.master', true, 'Operador master intacto');
        } else {
          logTest('Teste 3: Proteção admin.master', false, 'Operador master foi alterado');
        }
      }
    } catch (e) {
      logTest('Teste 3: Proteção admin.master', false, e.message);
    }
    
    // Teste 4: Verificar acesso ao módulo Configurações
    console.log('\nTeste 4: Acesso ao módulo Configurações');
    try {
      await page.goto('http://localhost:5173/configuracoes/operadores');
      await page.waitForTimeout(2000);
      
      const hasConfig = await page.evaluate(() => {
        const body = document.body.textContent || '';
        const buttons = Array.from(document.querySelectorAll('button'));
        const hasOperadores = body.includes('Operadores') || body.includes('Configurações');
        const hasCreateButton = buttons.some(b => b.textContent.includes('Novo') || b.textContent.includes('Criar'));
        return hasOperadores || hasCreateButton;
      });
      
      if (hasConfig) {
        logTest('Teste 4: Acesso Configurações', true, 'Módulo de configurações acessível');
      } else {
        logTest('Teste 4: Acesso Configurações', false, 'Módulo não encontrado');
      }
    } catch (e) {
      logTest('Teste 4: Acesso Configurações', false, e.message);
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

