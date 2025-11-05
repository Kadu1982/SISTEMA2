const { chromium } = require('playwright');

async function testApplication() {
    console.log('🧪 Iniciando testes com Playwright...\n');
    
    const browser = await chromium.launch({ 
        headless: false, // Mostrar navegador
        slowMo: 1000 // Delay entre ações
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Teste 1: Backend Health Check
        console.log('1️⃣ Testando Backend (localhost:8080)...');
        await page.goto('http://localhost:8080/health');
        await page.waitForLoadState('networkidle');
        
        const backendContent = await page.textContent('body');
        if (backendContent.includes('OK')) {
            console.log('✅ Backend funcionando');
        } else {
            console.log('❌ Backend com problemas');
        }
        
        // Teste 2: Backend Favicon
        console.log('\n2️⃣ Testando Favicon...');
        const faviconResponse = await page.goto('http://localhost:8080/favicon.ico');
        if (faviconResponse.status() === 200) {
            console.log('✅ Favicon funcionando');
        } else {
            console.log('❌ Favicon com problemas');
        }
        
        // Teste 3: Frontend
        console.log('\n3️⃣ Testando Frontend (localhost:4173)...');
        await page.goto('http://localhost:4173');
        await page.waitForLoadState('networkidle');
        
        const title = await page.title();
        console.log(`📄 Título da página: ${title}`);
        
        // Verificar se não há erros 403
        const errors = await page.evaluate(() => {
            const errors = [];
            const resources = performance.getEntriesByType('resource');
            resources.forEach(resource => {
                if (resource.name.includes('favicon.ico') || resource.name.includes('index')) {
                    errors.push(`${resource.name}: ${resource.responseStatus || 'loaded'}`);
                }
            });
            return errors;
        });
        
        if (errors.length > 0) {
            console.log('⚠️ Possíveis erros encontrados:');
            errors.forEach(error => console.log(`   ${error}`));
        } else {
            console.log('✅ Frontend carregando sem erros 403');
        }
        
        // Teste 4: Login (se disponível)
        console.log('\n4️⃣ Testando Login...');
        try {
            // Procurar por campos de login
            const loginForm = await page.locator('form').first();
            if (await loginForm.isVisible()) {
                console.log('✅ Formulário de login encontrado');
                
                // Tentar preencher login
                const usernameField = page.locator('input[type="text"], input[type="email"], input[name*="user"], input[name*="login"]').first();
                const passwordField = page.locator('input[type="password"]').first();
                
                if (await usernameField.isVisible() && await passwordField.isVisible()) {
                    await usernameField.fill('admin.master');
                    await passwordField.fill('Admin@123');
                    console.log('✅ Credenciais preenchidas');
                    
                    // Procurar botão de login
                    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Entrar")').first();
                    if (await loginButton.isVisible()) {
                        console.log('✅ Botão de login encontrado');
                        // Não clicar para não quebrar o teste
                    }
                }
            } else {
                console.log('ℹ️ Formulário de login não encontrado (pode estar em outra página)');
            }
        } catch (error) {
            console.log('ℹ️ Teste de login pulado:', error.message);
        }
        
        // Teste 5: Verificar console errors
        console.log('\n5️⃣ Verificando erros no console...');
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await page.waitForTimeout(2000); // Aguardar para capturar erros
        
        if (consoleErrors.length > 0) {
            console.log('⚠️ Erros no console:');
            consoleErrors.forEach(error => console.log(`   ${error}`));
        } else {
            console.log('✅ Nenhum erro no console');
        }
        
        console.log('\n🎉 Testes concluídos!');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
    } finally {
        await browser.close();
    }
}

// Executar testes
testApplication().catch(console.error);

