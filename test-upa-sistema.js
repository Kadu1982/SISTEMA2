/**
 * Script de teste para análise do sistema UPA
 * Execute com: node test-upa-sistema.js
 * Requer: npm install playwright
 */

const { chromium } = require('playwright');

(async () => {
    console.log('🚀 Iniciando análise do sistema UPA...');

    const browser = await chromium.launch({
        headless: false,  // Mostra o navegador
        slowMo: 500      // Desacelera para visualizar
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        locale: 'pt-BR'
    });

    const page = await context.newPage();

    try {
        // 1. Navegar para a página de login
        console.log('📍 Navegando para o sistema...');
        await page.goto('https://rioclaro-saude2.ids.inf.br/#/app?module=UPA');
        await page.waitForLoadState('networkidle');

        // Tirar screenshot da tela inicial
        await page.screenshot({ path: 'test-screenshots/01-tela-inicial.png', fullPage: true });
        console.log('📸 Screenshot 1: Tela inicial');

        // 2. Fazer login
        console.log('🔐 Tentando fazer login...');

        // Procurar campos de login (adaptar seletores conforme necessário)
        const loginInput = page.locator('input[name="login"], input[type="text"], input[placeholder*="login" i]').first();
        const senhaInput = page.locator('input[name="senha"], input[type="password"], input[placeholder*="senha" i]').first();
        const loginButton = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();

        if (await loginInput.isVisible()) {
            await loginInput.fill('lucas.alcantara');
            await senhaInput.fill('saude@123');
            await page.screenshot({ path: 'test-screenshots/02-login-preenchido.png', fullPage: true });
            console.log('📸 Screenshot 2: Login preenchido');

            await loginButton.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            await page.screenshot({ path: 'test-screenshots/03-apos-login.png', fullPage: true });
            console.log('📸 Screenshot 3: Após login');
        }

        // 3. Analisar módulo UPA
        console.log('🏥 Analisando módulo UPA...');

        // Procurar pela aba/módulo UPA
        const upaLink = page.locator('a:has-text("UPA"), button:has-text("UPA"), [href*="upa" i]').first();
        if (await upaLink.isVisible()) {
            await upaLink.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
        }

        await page.screenshot({ path: 'test-screenshots/04-modulo-upa.png', fullPage: true });
        console.log('📸 Screenshot 4: Módulo UPA');

        // 4. Analisar elementos da página
        console.log('\n📊 ANÁLISE DOS ELEMENTOS DA PÁGINA:');
        console.log('=' .repeat(60));

        // Título da página
        const title = await page.title();
        console.log(`\n📌 Título da página: ${title}`);

        // Verificar abas
        const tabs = await page.locator('[role="tab"], .tabs button, .tab-trigger').allTextContents();
        if (tabs.length > 0) {
            console.log(`\n🗂️  Abas encontradas (${tabs.length}):`);
            tabs.forEach((tab, i) => console.log(`   ${i + 1}. ${tab.trim()}`));
        }

        // Verificar botões principais
        const buttons = await page.locator('button:visible').allTextContents();
        if (buttons.length > 0) {
            console.log(`\n🔘 Botões visíveis (${Math.min(buttons.length, 10)} primeiros):`);
            buttons.slice(0, 10).forEach((btn, i) => {
                const text = btn.trim();
                if (text) console.log(`   ${i + 1}. ${text}`);
            });
        }

        // Verificar tabelas/cards
        const cards = await page.locator('.card, [class*="card"]').count();
        console.log(`\n📇 Cards/Tabelas encontrados: ${cards}`);

        // Verificar formulários
        const forms = await page.locator('form').count();
        console.log(`📝 Formulários encontrados: ${forms}`);

        // Verificar inputs
        const inputs = await page.locator('input:visible').count();
        console.log(`📥 Campos de input visíveis: ${inputs}`);

        // 5. Clicar em "Nova Ficha" se existir
        const novaFichaBtn = page.locator('button:has-text("Nova Ficha"), button:has-text("Novo Atendimento"), button:has-text("Nova Ocorrência")').first();
        if (await novaFichaBtn.isVisible()) {
            console.log('\n✅ Botão "Nova Ficha" encontrado, clicando...');
            await novaFichaBtn.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'test-screenshots/05-nova-ficha.png', fullPage: true });
            console.log('📸 Screenshot 5: Modal/Formulário de nova ficha');

            // Analisar campos do formulário
            const formInputs = await page.locator('input:visible, select:visible, textarea:visible').allTextContents();
            const labels = await page.locator('label:visible').allTextContents();

            console.log(`\n📋 Campos do formulário (${labels.length}):`);
            labels.slice(0, 10).forEach((label, i) => {
                const text = label.trim();
                if (text) console.log(`   ${i + 1}. ${text}`);
            });
        }

        // 6. Ver estrutura HTML resumida
        console.log('\n🔍 Estrutura HTML da página UPA:');
        console.log('=' .repeat(60));
        const mainContent = await page.locator('main, [role="main"], .content, #content').first().innerHTML().catch(() => '');
        if (mainContent) {
            // Extrair apenas tags principais
            const tags = mainContent.match(/<(\w+)[^>]*>/g) || [];
            const tagCounts = {};
            tags.forEach(tag => {
                const tagName = tag.match(/<(\w+)/)[1].toLowerCase();
                tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
            });

            console.log('\nTags HTML principais:');
            Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15)
                .forEach(([tag, count]) => console.log(`   ${tag}: ${count}`));
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Análise concluída!');
        console.log(`📁 Screenshots salvos em: test-screenshots/`);

    } catch (error) {
        console.error('❌ Erro durante análise:', error.message);
        await page.screenshot({ path: 'test-screenshots/error.png', fullPage: true });
        console.log('📸 Screenshot do erro salvo');
    } finally {
        console.log('\n⏸️  Aguardando 5 segundos antes de fechar...');
        await page.waitForTimeout(5000);
        await browser.close();
        console.log('👋 Navegador fechado');
    }
})();
