// test-operator-management.js
// Teste para diagnosticar problema de 400 na tela de Gerenciamento de Operadores

const { chromium } = require('playwright');

(async () => {
    console.log('🎭 Iniciando teste do Gerenciamento de Operadores...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Interceptar requisições para analisar
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            console.log(`➡️  ${request.method()} ${request.url()}`);
        }
    });

    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            const status = response.status();
            const url = response.url();
            console.log(`⬅️  ${status} ${url}`);

            if (status === 400 || status === 403) {
                try {
                    const body = await response.text();
                    console.log(`❌ ERRO ${status}:`, body);
                } catch (e) {
                    console.log(`❌ ERRO ${status}: (não foi possível ler o body)`);
                }
            }
        }
    });

    page.on('console', msg => {
        if (msg.text().includes('❌') || msg.text().includes('Erro')) {
            console.log('🖥️  Console:', msg.text());
        }
    });

    try {
        // 1. Navegar para o login
        console.log('\n📍 Passo 1: Acessando página de login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
        await page.screenshot({ path: 'test-screenshots/01-login-page.png' });

        // 2. Fazer login
        console.log('\n📍 Passo 2: Fazendo login com admin...');
        await page.fill('input[name="login"]', 'admin');
        await page.fill('input[name="senha"]', '123456');
        await page.click('button[type="submit"]');

        await page.waitForURL('**/dashboard', { timeout: 10000 });
        console.log('✅ Login realizado com sucesso!');
        await page.screenshot({ path: 'test-screenshots/02-dashboard.png' });

        // 3. Aguardar um pouco
        await page.waitForTimeout(2000);

        // 4. Navegar para Configurações > Gerenciamento de Operadores
        console.log('\n📍 Passo 3: Navegando para Gerenciamento de Operadores...');

        // Tentar encontrar o menu de configurações
        const configMenu = await page.locator('text=Configurações').first();
        if (await configMenu.isVisible()) {
            await configMenu.click();
            await page.waitForTimeout(1000);
        }

        // Clicar em Gerenciamento de Operadores
        await page.click('text=Gerenciamento de Operadores');
        await page.waitForTimeout(3000);

        console.log('✅ Página de Gerenciamento de Operadores carregada!');
        await page.screenshot({ path: 'test-screenshots/03-operator-management.png' });

        // 5. Tentar clicar em um operador para editar
        console.log('\n📍 Passo 4: Tentando editar operador Ana Paula Branco...');

        // Aguardar a tabela carregar
        await page.waitForSelector('table', { timeout: 10000 });

        // Procurar pela linha do operador Ana Paula Branco
        const operadorRow = await page.locator('tr:has-text("Ana Paula Branco")').first();

        if (await operadorRow.isVisible()) {
            console.log('✅ Operador encontrado na tabela');

            // Clicar no botão de editar
            await operadorRow.locator('button').first().click();
            await page.waitForTimeout(3000);

            console.log('✅ Modal de edição aberto!');
            await page.screenshot({ path: 'test-screenshots/04-edit-modal.png' });

            // 6. Clicar na aba "Módulos"
            console.log('\n📍 Passo 5: Abrindo aba Módulos...');
            await page.click('text=Módulos');
            await page.waitForTimeout(2000);

            console.log('✅ Aba Módulos aberta!');
            await page.screenshot({ path: 'test-screenshots/05-modulos-tab.png' });

            // Aguardar para ver se há erros
            await page.waitForTimeout(5000);

        } else {
            console.log('❌ Operador não encontrado na tabela');
        }

        console.log('\n✅ TESTE CONCLUÍDO! Verifique os screenshots em test-screenshots/');

    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        await page.screenshot({ path: 'test-screenshots/error.png' });
    } finally {
        await page.waitForTimeout(3000);
        await browser.close();
    }
})();
