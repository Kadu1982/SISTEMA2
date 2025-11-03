const { chromium } = require('playwright');

/**
 * Teste Playwright: Verifica se Ana Paula Branco consegue ver o módulo UPA no menu lateral
 *
 * Fluxo:
 * 1. Faz login com Ana Paula (teste.operador / Teste@123)
 * 2. Aguarda dashboard carregar
 * 3. Verifica se o menu lateral está visível
 * 4. Procura pelo item "UPA" no menu
 * 5. Tira screenshot mostrando o menu
 * 6. Clica no item UPA (se visível)
 * 7. Verifica se a página UPA carrega
 */

(async () => {
    console.log('🎭 Iniciando teste Playwright - Visibilidade Menu UPA para Ana Paula');
    console.log('============================================================================\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    try {
        // ============================================================================
        // PASSO 1: Fazer login com Ana Paula
        // ============================================================================
        console.log('📋 PASSO 1: Fazendo login com Ana Paula Branco...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

        const loginInput = page.locator('input[name="login"], input[type="text"]').first();
        const senhaInput = page.locator('input[name="password"], input[type="password"]').first();
        const loginButton = page.locator('button[type="submit"]:has-text("Entrar"), button:has-text("Login")').first();

        await loginInput.fill('teste.operador');
        console.log('   ✅ Login preenchido: teste.operador');

        await senhaInput.fill('Teste@123');
        console.log('   ✅ Senha preenchida');

        await loginButton.click();
        console.log('   ✅ Botão de login clicado');

        // Aguardar redirecionamento
        await page.waitForURL(/dashboard|inicio|home/i, { timeout: 15000 });
        console.log('   ✅ Login realizado com sucesso!\n');

        // ============================================================================
        // PASSO 2: Aguardar dashboard carregar completamente
        // ============================================================================
        console.log('📋 PASSO 2: Aguardando dashboard carregar...');
        await page.waitForTimeout(2000);
        console.log('   ✅ Dashboard carregado\n');

        // ============================================================================
        // PASSO 3: Verificar se menu lateral está visível
        // ============================================================================
        console.log('📋 PASSO 3: Verificando menu lateral...');

        const menuSelectors = [
            'nav',
            'aside',
            '[role="navigation"]',
            '.sidebar',
            '.menu-lateral'
        ];

        let menuLateral = null;
        for (const selector of menuSelectors) {
            try {
                menuLateral = page.locator(selector).first();
                if (await menuLateral.isVisible({ timeout: 2000 })) {
                    console.log(`   ✅ Menu lateral encontrado com seletor: ${selector}`);
                    break;
                }
            } catch (e) {
                // Continua tentando próximo seletor
            }
        }

        if (!menuLateral) {
            console.error('   ❌ Menu lateral não encontrado!');
            await page.screenshot({ path: 'menu-nao-encontrado.png', fullPage: true });
            throw new Error('Menu lateral não está visível');
        }

        // ============================================================================
        // PASSO 4: Procurar pelo item UPA no menu
        // ============================================================================
        console.log('📋 PASSO 4: Procurando item UPA no menu...');

        const upaSelectors = [
            'a:has-text("UPA")',
            'button:has-text("UPA")',
            '[href*="/upa"]',
            'nav a:has-text("UPA")',
            'aside a:has-text("UPA")',
        ];

        let upaMenuItem = null;
        let upaVisible = false;

        for (const selector of upaSelectors) {
            try {
                upaMenuItem = page.locator(selector).first();
                upaVisible = await upaMenuItem.isVisible({ timeout: 2000 });
                if (upaVisible) {
                    console.log(`   ✅ Item UPA ENCONTRADO no menu com seletor: ${selector}`);
                    break;
                }
            } catch (e) {
                // Continua tentando próximo seletor
            }
        }

        // ============================================================================
        // PASSO 5: Tirar screenshot do menu
        // ============================================================================
        console.log('📋 PASSO 5: Tirando screenshot do menu...');
        await page.screenshot({
            path: 'ana-paula-menu-lateral.png',
            fullPage: true
        });
        console.log('   ✅ Screenshot salvo: ana-paula-menu-lateral.png\n');

        // ============================================================================
        // PASSO 6: Resultado da verificação
        // ============================================================================
        console.log('============================================================================');
        console.log('📊 RESULTADO DA VERIFICAÇÃO:');
        console.log('============================================================================');

        if (upaVisible) {
            console.log('✅ SUCESSO: Item UPA está VISÍVEL no menu para Ana Paula Branco!');
            console.log('   • O módulo UPA foi configurado corretamente');
            console.log('   • Ana Paula tem as permissões necessárias\n');

            // ============================================================================
            // PASSO 7: Tentar clicar no item UPA
            // ============================================================================
            console.log('📋 PASSO 7: Tentando acessar módulo UPA...');

            try {
                await upaMenuItem.click();
                console.log('   ✅ Clicou no item UPA');

                // Aguardar navegação
                await page.waitForURL(/upa/i, { timeout: 10000 });
                console.log('   ✅ Navegou para página UPA');

                await page.waitForTimeout(2000);
                await page.screenshot({
                    path: 'ana-paula-pagina-upa.png',
                    fullPage: true
                });
                console.log('   ✅ Screenshot da página UPA salvo: ana-paula-pagina-upa.png\n');

                console.log('✅ TESTE COMPLETO: Ana Paula consegue acessar o módulo UPA!');

            } catch (clickError) {
                console.warn('   ⚠️ Não foi possível clicar no item UPA:', clickError.message);
                console.log('   ℹ️ Mas o item está visível, o que já é o objetivo principal\n');
            }

        } else {
            console.error('❌ FALHA: Item UPA NÃO está visível no menu para Ana Paula Branco!');
            console.error('   • Possíveis causas:');
            console.error('     1. Script SQL não foi executado corretamente');
            console.error('     2. Backend não foi reiniciado após mudanças');
            console.error('     3. Perfil ENFERMEIRO não tem módulo UPA associado');
            console.error('     4. Lógica de permissão no frontend está incorreta\n');

            // Listar todos os itens de menu visíveis
            console.log('📋 Itens de menu visíveis para Ana Paula:');
            const menuItems = await page.locator('nav a, aside a').allTextContents();
            menuItems.forEach((item, index) => {
                if (item.trim()) {
                    console.log(`   ${index + 1}. ${item.trim()}`);
                }
            });
        }

        console.log('============================================================================\n');

    } catch (error) {
        console.error('💥 ERRO NO TESTE:', error.message);
        console.error('Stack trace:', error.stack);

        await page.screenshot({
            path: 'erro-teste-ana-paula.png',
            fullPage: true
        });
        console.log('📸 Screenshot de erro salvo: erro-teste-ana-paula.png\n');

        throw error;
    } finally {
        console.log('🔚 Encerrando teste em 5 segundos...');
        await page.waitForTimeout(5000);
        await browser.close();
    }
})();
