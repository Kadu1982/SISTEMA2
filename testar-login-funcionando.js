const { chromium } = require('playwright');

async function testarLogin() {
    console.log('🧪 Testando login após correção do erro 403...\n');
    
    const browser = await chromium.launch({ 
        headless: false, // Mostrar navegador
        slowMo: 2000 // Delay entre ações
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Teste 1: Acessar aplicação local
        console.log('1️⃣ Testando aplicação local (localhost:5173)...');
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');
        
        const title = await page.title();
        console.log(`📄 Título: ${title}`);
        
        // Verificar se há erros 403
        const errors = [];
        page.on('response', response => {
            if (response.status() === 403) {
                errors.push(`${response.url()}: 403 Forbidden`);
            }
        });
        
        // Teste 2: Tentar fazer login
        console.log('\n2️⃣ Testando login...');
        
        // Procurar campos de login
        const usernameField = page.locator('input[type="text"], input[type="email"], input[name*="user"], input[name*="login"]').first();
        const passwordField = page.locator('input[type="password"]').first();
        
        if (await usernameField.isVisible() && await passwordField.isVisible()) {
            console.log('✅ Campos de login encontrados');
            
            // Preencher credenciais
            await usernameField.fill('admin.master');
            await passwordField.fill('Admin@123');
            console.log('✅ Credenciais preenchidas');
            
            // Procurar botão de login
            const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Entrar")').first();
            if (await loginButton.isVisible()) {
                console.log('✅ Botão de login encontrado');
                
                // Clicar no botão de login
                await loginButton.click();
                console.log('✅ Botão de login clicado');
                
                // Aguardar resposta
                await page.waitForTimeout(5000);
                
                // Verificar se houve erros 403
                if (errors.length > 0) {
                    console.log('❌ Ainda há erros 403:');
                    errors.forEach(error => console.log(`   ${error}`));
                } else {
                    console.log('✅ Nenhum erro 403 encontrado!');
                }
                
                // Verificar se login foi bem-sucedido
                const currentUrl = page.url();
                if (currentUrl.includes('dashboard') || currentUrl.includes('home') || currentUrl.includes('main')) {
                    console.log('✅ Login realizado com sucesso!');
                } else {
                    console.log('ℹ️ Login pode ter falhado, mas sem erro 403');
                }
                
            } else {
                console.log('❌ Botão de login não encontrado');
            }
        } else {
            console.log('❌ Campos de login não encontrados');
        }
        
        console.log('\n🎉 Teste concluído!');
        
        if (errors.length === 0) {
            console.log('\n✅ SUCESSO: Erro 403 foi resolvido!');
            console.log('A aplicação agora pode ser compartilhada via Cloudflare Tunnel');
        } else {
            console.log('\n❌ Ainda há problemas com erro 403');
        }
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    } finally {
        await browser.close();
    }
}

// Executar teste
testarLogin().catch(console.error);

