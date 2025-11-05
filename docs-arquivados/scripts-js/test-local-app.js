const { chromium } = require('playwright');

async function testLocalApplication() {
    console.log('🧪 Testando aplicação local (sem Docker)...\n');
    
    const browser = await chromium.launch({ 
        headless: false, // Mostrar navegador
        slowMo: 1000 // Delay entre ações
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Teste 1: Backend Health Check
        console.log('1️⃣ Testando Backend (localhost:8080)...');
        try {
            await page.goto('http://localhost:8080/health', { timeout: 10000 });
            await page.waitForLoadState('networkidle');
            
            const backendContent = await page.textContent('body');
            if (backendContent.includes('OK')) {
                console.log('✅ Backend funcionando');
            } else {
                console.log('⚠️ Backend respondeu mas conteúdo inesperado:', backendContent);
            }
        } catch (error) {
            console.log('❌ Backend não está respondendo:', error.message);
            console.log('   Certifique-se de que o Spring Boot está rodando na porta 8080');
            return;
        }
        
        // Teste 2: Backend Favicon
        console.log('\n2️⃣ Testando Favicon...');
        try {
            const faviconResponse = await page.goto('http://localhost:8080/favicon.ico', { timeout: 5000 });
            if (faviconResponse.status() === 200) {
                console.log('✅ Favicon funcionando');
            } else {
                console.log('⚠️ Favicon retornou status:', faviconResponse.status());
            }
        } catch (error) {
            console.log('❌ Erro ao acessar favicon:', error.message);
        }
        
        // Teste 3: Backend API Auth
        console.log('\n3️⃣ Testando API de Autenticação...');
        try {
            await page.goto('http://localhost:8080/api/auth/login', { timeout: 5000 });
            const authContent = await page.textContent('body');
            if (authContent.includes('error') || authContent.includes('Unauthorized')) {
                console.log('✅ API de auth respondendo (erro esperado sem credenciais)');
            } else {
                console.log('ℹ️ API de auth respondeu:', authContent.substring(0, 100));
            }
        } catch (error) {
            console.log('❌ Erro ao acessar API de auth:', error.message);
        }
        
        // Teste 4: Frontend
        console.log('\n4️⃣ Testando Frontend (localhost:4173)...');
        try {
            await page.goto('http://localhost:4173', { timeout: 10000 });
            await page.waitForLoadState('networkidle');
            
            const title = await page.title();
            console.log(`📄 Título da página: ${title}`);
            
            // Verificar se a página carregou corretamente
            const bodyText = await page.textContent('body');
            if (bodyText.includes('root') || bodyText.includes('React') || bodyText.length > 100) {
                console.log('✅ Frontend carregando corretamente');
            } else {
                console.log('⚠️ Frontend pode não estar carregando corretamente');
            }
            
        } catch (error) {
            console.log('❌ Frontend não está respondendo:', error.message);
            console.log('   Inicie o frontend com: cd frontend && npm run dev -- --port 4173');
            return;
        }
        
        // Teste 5: Verificar erros 403
        console.log('\n5️⃣ Verificando erros 403...');
        const errors = [];
        page.on('response', response => {
            if (response.status() === 403) {
                errors.push(`${response.url()}: 403 Forbidden`);
            }
        });
        
        await page.waitForTimeout(3000); // Aguardar para capturar erros
        
        if (errors.length > 0) {
            console.log('⚠️ Erros 403 encontrados:');
            errors.forEach(error => console.log(`   ${error}`));
        } else {
            console.log('✅ Nenhum erro 403 encontrado');
        }
        
        // Teste 6: Verificar console errors
        console.log('\n6️⃣ Verificando erros no console...');
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await page.waitForTimeout(2000);
        
        if (consoleErrors.length > 0) {
            console.log('⚠️ Erros no console:');
            consoleErrors.forEach(error => console.log(`   ${error}`));
        } else {
            console.log('✅ Nenhum erro no console');
        }
        
        // Teste 7: Testar login se possível
        console.log('\n7️⃣ Testando funcionalidade de login...');
        try {
            // Procurar por campos de login
            const loginForm = await page.locator('form').first();
            if (await loginForm.isVisible()) {
                console.log('✅ Formulário de login encontrado');
                
                const usernameField = page.locator('input[type="text"], input[type="email"], input[name*="user"], input[name*="login"]').first();
                const passwordField = page.locator('input[type="password"]').first();
                
                if (await usernameField.isVisible() && await passwordField.isVisible()) {
                    await usernameField.fill('admin.master');
                    await passwordField.fill('Admin@123');
                    console.log('✅ Credenciais preenchidas');
                    
                    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Entrar")').first();
                    if (await loginButton.isVisible()) {
                        console.log('✅ Botão de login encontrado');
                        console.log('ℹ️ Login não executado para não quebrar o teste');
                    }
                }
            } else {
                console.log('ℹ️ Formulário de login não encontrado na página atual');
            }
        } catch (error) {
            console.log('ℹ️ Teste de login pulado:', error.message);
        }
        
        console.log('\n🎉 Testes concluídos!');
        console.log('\n📋 Resumo:');
        console.log('   - Backend: Verificado');
        console.log('   - Frontend: Verificado');
        console.log('   - Erros 403: Verificados');
        console.log('   - Console: Verificado');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
    } finally {
        await browser.close();
    }
}

// Executar testes
testLocalApplication().catch(console.error);

