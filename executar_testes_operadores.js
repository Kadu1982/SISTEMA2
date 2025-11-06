// Script para executar testes de login de operadores
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🧪 Teste 1: Login com Operador Master (admin.master)');
    await page.goto('http://localhost:5173/login');
    
    // Preencher login
    await page.fill('input[name="login"], input[type="text"]', 'admin.master');
    await page.fill('input[name="senha"], input[type="password"]', 'Admin@123');
    
    // Clicar em entrar
    await page.click('button[type="submit"], button:has-text("Entrar")');
    
    // Aguardar redirecionamento
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verificar token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    
    if (token) {
      console.log('✅ Teste 1 PASSOU: Login bem-sucedido, token gerado');
    } else {
      console.log('❌ Teste 1 FALHOU: Token não encontrado');
    }
    
    // Verificar dados do operador
    const operadorData = await page.evaluate(() => localStorage.getItem('operadorData'));
    if (operadorData) {
      const operador = JSON.parse(operadorData);
      console.log(`✅ Operador logado: ${operador.nome || operador.login}`);
      console.log(`✅ Perfis: ${operador.perfis?.join(', ') || 'N/A'}`);
    }
    
    console.log('\n🧪 Teste 2: Login com credenciais inválidas');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="login"], input[type="text"]', 'operador.inexistente');
    await page.fill('input[name="senha"], input[type="password"]', 'senha_qualquer');
    await page.click('button[type="submit"], button:has-text("Entrar")');
    
    // Aguardar mensagem de erro
    await page.waitForTimeout(2000);
    const errorMessage = await page.textContent('body');
    
    if (errorMessage && (errorMessage.includes('inválid') || errorMessage.includes('erro') || errorMessage.includes('não encontrado'))) {
      console.log('✅ Teste 2 PASSOU: Login bloqueado corretamente');
    } else {
      console.log('⚠️ Teste 2: Verificar se mensagem de erro apareceu');
    }
    
    console.log('\n✅ Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  } finally {
    await browser.close();
  }
})();

