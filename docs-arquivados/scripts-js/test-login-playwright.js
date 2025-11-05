const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testLogin() {
  const report = {
    timestamp: new Date().toISOString(),
    url: 'https://spencer-rom-modified-butterfly.trycloudflare.com/login',
    steps: [],
    consoleLogs: [],
    networkRequests: [],
    errors: [],
    loginRequest: null,
    finalUrl: null,
    screenshots: []
  };

  let browser;
  let page;

  try {
    console.log('🚀 Iniciando teste de login...\n');

    // Criar pasta para screenshots
    const screenshotDir = path.join(__dirname, 'test-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }

    // Iniciar browser
    browser = await chromium.launch({
      headless: false,
      slowMo: 500 // Desacelerar para ver o que está acontecendo
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    page = await context.newPage();

    // Capturar todos os logs do console
    page.on('console', msg => {
      const log = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      report.consoleLogs.push(log);
      console.log(`📋 Console [${msg.type()}]:`, msg.text());
    });

    // Capturar erros de página
    page.on('pageerror', error => {
      const errorInfo = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      report.errors.push(errorInfo);
      console.error('❌ Page Error:', error.message);
    });

    // Monitorar todas as requisições de rede
    page.on('request', request => {
      const requestInfo = {
        type: 'request',
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      };

      // Se for a requisição de login, marcar especialmente
      if (request.url().includes('/api/auth/login')) {
        console.log('🔐 Requisição de LOGIN detectada!');
        console.log('   URL:', request.url());
        console.log('   Method:', request.method());
        console.log('   Headers:', JSON.stringify(request.headers(), null, 2));
        console.log('   Body:', request.postData());
      }

      report.networkRequests.push(requestInfo);
    });

    // Monitorar respostas de rede
    page.on('response', async response => {
      const responseInfo = {
        type: 'response',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        timestamp: new Date().toISOString()
      };

      // Capturar corpo da resposta para requisições importantes
      if (response.url().includes('/api/auth/login')) {
        try {
          const body = await response.text();
          responseInfo.body = body;

          report.loginRequest = {
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            headers: response.headers(),
            body: body,
            timestamp: new Date().toISOString()
          };

          console.log('\n✅ Resposta do LOGIN recebida!');
          console.log('   Status:', response.status(), response.statusText());
          console.log('   Headers:', JSON.stringify(response.headers(), null, 2));
          console.log('   Body:', body);
          console.log('');
        } catch (e) {
          console.error('   ⚠️  Erro ao capturar corpo da resposta:', e.message);
        }
      }

      report.networkRequests.push(responseInfo);

      // Detectar erros CORS
      if (response.status() === 0 || response.statusText().toLowerCase().includes('cors')) {
        console.error('🚨 ERRO CORS detectado:', response.url());
        report.errors.push({
          type: 'CORS',
          url: response.url(),
          status: response.status(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // PASSO 1: Navegar até a URL
    console.log('📍 Passo 1: Navegando para a URL...');
    report.steps.push({ step: 1, action: 'Navegando para URL', timestamp: new Date().toISOString() });

    await page.goto(report.url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✓ Página carregada\n');

    // Aguardar um pouco para garantir que tudo carregou
    await page.waitForTimeout(2000);

    // PASSO 2: Capturar screenshot inicial
    console.log('📸 Passo 2: Capturando screenshot da página inicial...');
    const screenshotInicial = path.join(screenshotDir, '01-pagina-inicial.png');
    await page.screenshot({ path: screenshotInicial, fullPage: true });
    report.screenshots.push(screenshotInicial);
    report.steps.push({ step: 2, action: 'Screenshot inicial capturado', file: screenshotInicial, timestamp: new Date().toISOString() });
    console.log('✓ Screenshot salvo:', screenshotInicial, '\n');

    // Verificar se a página carregou corretamente
    const pageTitle = await page.title();
    console.log('📄 Título da página:', pageTitle);
    report.pageTitle = pageTitle;

    // PASSO 3: Preencher campo de Login
    console.log('📝 Passo 3: Preenchendo campo de Login...');
    report.steps.push({ step: 3, action: 'Preenchendo campo Login', timestamp: new Date().toISOString() });

    // Tentar diferentes seletores para o campo de login
    let loginSelector = null;
    const possibleLoginSelectors = [
      'input[name="login"]',
      'input[name="username"]',
      'input[type="text"]',
      'input[placeholder*="Login"]',
      'input[placeholder*="login"]',
      'input[placeholder*="Usuário"]',
      'input[placeholder*="usuário"]',
      '#login',
      '#username'
    ];

    for (const selector of possibleLoginSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          loginSelector = selector;
          console.log('   ✓ Campo de login encontrado:', selector);
          break;
        }
      } catch (e) {
        // Continuar tentando
      }
    }

    if (!loginSelector) {
      throw new Error('Campo de login não encontrado! Seletores tentados: ' + possibleLoginSelectors.join(', '));
    }

    await page.fill(loginSelector, 'admin.master', { timeout: 30000 });
    console.log('✓ Campo Login preenchido com: admin.master\n');

    // PASSO 4: Preencher campo de Senha
    console.log('🔑 Passo 4: Preenchendo campo de Senha...');
    report.steps.push({ step: 4, action: 'Preenchendo campo Senha', timestamp: new Date().toISOString() });

    let senhaSelector = null;
    const possibleSenhaSelectors = [
      'input[name="password"]',
      'input[name="senha"]',
      'input[type="password"]',
      '#password',
      '#senha'
    ];

    for (const selector of possibleSenhaSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          senhaSelector = selector;
          console.log('   ✓ Campo de senha encontrado:', selector);
          break;
        }
      } catch (e) {
        // Continuar tentando
      }
    }

    if (!senhaSelector) {
      throw new Error('Campo de senha não encontrado! Seletores tentados: ' + possibleSenhaSelectors.join(', '));
    }

    await page.fill(senhaSelector, 'Admin@123', { timeout: 30000 });
    console.log('✓ Campo Senha preenchido\n');

    // Screenshot antes de clicar
    const screenshotAntes = path.join(screenshotDir, '02-antes-de-entrar.png');
    await page.screenshot({ path: screenshotAntes, fullPage: true });
    report.screenshots.push(screenshotAntes);
    console.log('📸 Screenshot antes de clicar: salvo\n');

    // PASSO 5: Clicar no botão Entrar
    console.log('🖱️  Passo 5: Clicando no botão "Entrar"...');
    report.steps.push({ step: 5, action: 'Clicando em Entrar', timestamp: new Date().toISOString() });

    let buttonSelector = null;
    const possibleButtonSelectors = [
      'button[type="submit"]',
      'button:has-text("Entrar")',
      'button:has-text("ENTRAR")',
      'button:has-text("Login")',
      'input[type="submit"]',
      'button.login-button',
      'button.btn-login'
    ];

    for (const selector of possibleButtonSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          buttonSelector = selector;
          console.log('   ✓ Botão Entrar encontrado:', selector);
          break;
        }
      } catch (e) {
        // Continuar tentando
      }
    }

    if (!buttonSelector) {
      throw new Error('Botão Entrar não encontrado! Seletores tentados: ' + possibleButtonSelectors.join(', '));
    }

    // Clicar e aguardar resposta
    await Promise.race([
      page.click(buttonSelector),
      page.waitForTimeout(1000)
    ]);

    console.log('✓ Botão clicado! Aguardando resposta...\n');

    // Aguardar pela navegação OU pela resposta da API
    await Promise.race([
      page.waitForNavigation({ timeout: 30000 }).catch(() => console.log('   (Sem navegação detectada)')),
      page.waitForResponse(response => response.url().includes('/api/auth/login'), { timeout: 30000 }).catch(() => console.log('   (Timeout na resposta da API)')),
      page.waitForTimeout(5000)
    ]);

    // Aguardar mais um pouco para processar
    await page.waitForTimeout(3000);

    // PASSO 6-9: Capturar estado final
    report.finalUrl = page.url();
    console.log('🎯 URL Final:', report.finalUrl);

    // Screenshot final
    const screenshotFinal = path.join(screenshotDir, '03-resultado-final.png');
    await page.screenshot({ path: screenshotFinal, fullPage: true });
    report.screenshots.push(screenshotFinal);
    console.log('📸 Screenshot final salvo:', screenshotFinal, '\n');

    // Verificar se houve redirecionamento
    if (report.finalUrl !== report.url) {
      console.log('✅ REDIRECIONAMENTO DETECTADO!');
      console.log('   De:', report.url);
      console.log('   Para:', report.finalUrl);
      report.steps.push({
        step: 9,
        action: 'Redirecionamento bem-sucedido',
        from: report.url,
        to: report.finalUrl,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('⚠️  Permaneceu na mesma página (pode indicar erro)');
      report.steps.push({
        step: 9,
        action: 'Sem redirecionamento - permaneceu na página de login',
        timestamp: new Date().toISOString()
      });
    }

    // Verificar se há mensagens de erro na página
    const errorSelectors = [
      '.error', '.alert-error', '.alert-danger',
      '[role="alert"]', '.error-message', '.validation-error'
    ];

    for (const selector of errorSelectors) {
      try {
        const errorElement = await page.$(selector);
        if (errorElement) {
          const errorText = await errorElement.textContent();
          if (errorText && errorText.trim()) {
            console.log('⚠️  Mensagem de erro na página:', errorText.trim());
            report.errors.push({
              type: 'UI Error',
              message: errorText.trim(),
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (e) {
        // Continuar verificando
      }
    }

    console.log('\n✅ Teste concluído!\n');

  } catch (error) {
    console.error('\n❌ ERRO durante o teste:', error.message);
    console.error(error.stack);
    report.errors.push({
      type: 'Test Error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Screenshot do erro se possível
    if (page) {
      try {
        const screenshotDir = path.join(__dirname, 'test-screenshots');
        const screenshotErro = path.join(screenshotDir, '99-erro.png');
        await page.screenshot({ path: screenshotErro, fullPage: true });
        report.screenshots.push(screenshotErro);
        console.log('📸 Screenshot do erro salvo:', screenshotErro);
      } catch (e) {
        console.error('Não foi possível capturar screenshot do erro:', e.message);
      }
    }
  } finally {
    // Salvar relatório
    const reportPath = path.join(__dirname, 'test-screenshots', 'relatorio-completo.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('\n📄 Relatório completo salvo em:', reportPath);

    // Aguardar um pouco antes de fechar para visualizar
    if (page) {
      console.log('\n⏳ Aguardando 5 segundos antes de fechar o browser...');
      await page.waitForTimeout(5000);
    }

    if (browser) {
      await browser.close();
    }
  }

  return report;
}

// Executar teste
testLogin().then(report => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMO DO TESTE');
  console.log('='.repeat(80));
  console.log('URL testada:', report.url);
  console.log('URL final:', report.finalUrl);
  console.log('Screenshots capturados:', report.screenshots.length);
  console.log('Logs de console:', report.consoleLogs.length);
  console.log('Requisições de rede:', report.networkRequests.length);
  console.log('Erros encontrados:', report.errors.length);

  if (report.loginRequest) {
    console.log('\n🔐 INFORMAÇÕES DA REQUISIÇÃO DE LOGIN:');
    console.log('   URL:', report.loginRequest.url);
    console.log('   Status:', report.loginRequest.status, report.loginRequest.statusText);
    console.log('   Resposta:', report.loginRequest.body);
  } else {
    console.log('\n⚠️  Requisição de login NÃO foi detectada!');
  }

  if (report.errors.length > 0) {
    console.log('\n❌ ERROS:');
    report.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. [${err.type}] ${err.message}`);
    });
  }

  console.log('='.repeat(80) + '\n');

  process.exit(0);
}).catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
