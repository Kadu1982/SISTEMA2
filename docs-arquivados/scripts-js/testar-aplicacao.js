const { chromium } = require('playwright');

async function testarAplicacao() {
    console.log('🧪 Testando aplicação local...\n');
    
    const browser = await chromium.launch({ 
        headless: false, // Mostrar navegador
        slowMo: 1000 // Delay entre ações
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Teste 1: Aplicação local
        console.log('1️⃣ Testando aplicação local (localhost:5173)...');
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');
        
        const title = await page.title();
        console.log(`📄 Título da página: ${title}`);
        
        // Verificar se carregou sem erros 403
        const errors = [];
        page.on('response', response => {
            if (response.status() === 403) {
                errors.push(`${response.url()}: 403 Forbidden`);
            }
        });
        
        await page.waitForTimeout(3000);
        
        if (errors.length > 0) {
            console.log('⚠️ Erros 403 encontrados:');
            errors.forEach(error => console.log(`   ${error}`));
        } else {
            console.log('✅ Nenhum erro 403 encontrado');
        }
        
        // Teste 2: Verificar se a página carregou corretamente
        const bodyText = await page.textContent('body');
        if (bodyText.includes('root') || bodyText.includes('React') || bodyText.length > 100) {
            console.log('✅ Frontend carregando corretamente');
        } else {
            console.log('⚠️ Frontend pode não estar carregando corretamente');
        }
        
        console.log('\n🎉 Teste local concluído!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Verifique se o Cloudflare Tunnel está rodando');
        console.log('2. Copie a URL do tunnel (ex: https://abc-123.trycloudflare.com)');
        console.log('3. Teste a URL no navegador');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    } finally {
        await browser.close();
    }
}

// Executar teste
testarAplicacao().catch(console.error);

