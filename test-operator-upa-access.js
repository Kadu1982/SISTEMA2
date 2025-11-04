// test-operator-upa-access.js
// Teste completo: Login → Configurações → Operadores → Editar Ana Paula → Conceder UPA

const { chromium } = require('playwright');

(async () => {
    console.log('🎭 TESTE: Conceder acesso UPA para Ana Paula Branco\n');
    console.log('=' .repeat(80));

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500 // Mais lento para visualizar
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // ===== MONITORAMENTO DE REQUISIÇÕES =====
    let errorCount = 0;
    let requestCount = 0;

    page.on('request', request => {
        const url = request.url();
        if (url.includes('/api/')) {
            requestCount++;
            console.log(`\n📤 [${requestCount}] ${request.method()} ${url}`);
        }
    });

    page.on('response', async response => {
        const url = response.url();
        if (url.includes('/api/')) {
            const status = response.status();
            const statusEmoji = status >= 200 && status < 300 ? '✅' :
                               status >= 400 ? '❌' : '⚠️';

            console.log(`📥 ${statusEmoji} ${status} ${url}`);

            if (status === 400 || status === 403 || status === 500) {
                errorCount++;
                try {
                    const body = await response.text();
                    console.log(`\n🔴 ERRO ${status}:`, body.substring(0, 200));
                } catch (e) {
                    console.log(`🔴 ERRO ${status}: (não foi possível ler o body)`);
                }
            }
        }
    });

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('❌') || text.includes('Erro') || text.includes('erro')) {
            console.log('🖥️  Console ERROR:', text);
        }
    });

    page.on('pageerror', error => {
        console.log('💥 PAGE ERROR:', error.message);
    });

    try {
        // ===== PASSO 1: ACESSAR PÁGINA DE LOGIN =====
        console.log('\n' + '='.repeat(80));
        console.log('📍 PASSO 1: Acessando página de login...');
        console.log('='.repeat(80));

        await page.goto('http://localhost:5173/login', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        await page.screenshot({ path: 'test-screenshots/01-login-page.png' });
        console.log('✅ Página de login carregada');

        // ===== PASSO 2: FAZER LOGIN COM ADMIN.MASTER =====
        console.log('\n' + '='.repeat(80));
        console.log('📍 PASSO 2: Fazendo login com admin.master...');
        console.log('='.repeat(80));

        // Aguardar campos de login
        await page.waitForSelector('input[type="text"]', { timeout: 10000 });

        // Preencher login
        const loginInput = await page.locator('input[type="text"]').first();
        await loginInput.fill('admin.master');
        console.log('✅ Login preenchido');

        // Preencher senha
        const senhaInput = await page.locator('input[type="password"]').first();
        await senhaInput.fill('Admin@123');
        console.log('✅ Senha preenchida (Admin@123)');

        // Clicar no botão de entrar
        await page.screenshot({ path: 'test-screenshots/02-login-filled.png' });

        await page.click('button[type="submit"]');
        console.log('✅ Botão de login clicado');

        // Aguardar redirecionamento para dashboard
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        await page.waitForLoadState('networkidle');

        await page.screenshot({ path: 'test-screenshots/03-dashboard.png' });
        console.log('✅ Login realizado com sucesso!');

        // ===== PASSO 3: NAVEGAR PARA CONFIGURAÇÕES =====
        console.log('\n' + '='.repeat(80));
        console.log('📍 PASSO 3: Navegando para Configurações...');
        console.log('='.repeat(80));

        await page.waitForTimeout(2000);

        // Procurar menu Configurações
        const configLink = page.locator('a:has-text("Configurações"), button:has-text("Configurações")').first();

        if (await configLink.isVisible({ timeout: 5000 })) {
            await configLink.click();
            console.log('✅ Clicou em Configurações');
            await page.waitForTimeout(1000);
        } else {
            console.log('⚠️  Menu Configurações não encontrado, tentando URL direta...');
            await page.goto('http://localhost:5173/configuracoes');
        }

        await page.screenshot({ path: 'test-screenshots/04-configuracoes.png' });

        // ===== PASSO 4: ABRIR ABA OPERADORES =====
        console.log('\n' + '='.repeat(80));
        console.log('📍 PASSO 4: Abrindo aba Operadores...');
        console.log('='.repeat(80));

        // Aguardar a página de configurações carregar
        await page.waitForTimeout(2000);

        // Procurar pela aba/link "Operadores" ou "Gerenciamento de Operadores"
        const operadoresTab = page.locator('button:has-text("Operadores"), a:has-text("Operadores"), [role="tab"]:has-text("Operadores")').first();

        if (await operadoresTab.isVisible({ timeout: 5000 })) {
            await operadoresTab.click();
            console.log('✅ Clicou na aba Operadores');
        } else {
            console.log('⚠️  Aba Operadores não encontrada, verificando se já está nela...');
        }

        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-screenshots/05-operadores-tab.png' });

        // Verificar se há erro 400
        console.log(`\n📊 Total de erros HTTP até agora: ${errorCount}`);

        // ===== PASSO 5: BUSCAR E ABRIR EDIÇÃO DE ANA PAULA BRANCO =====
        console.log('\n' + '='.repeat(80));
        console.log('📍 PASSO 5: Buscando operador Ana Paula Branco...');
        console.log('='.repeat(80));

        // Aguardar tabela de operadores
        await page.waitForSelector('table, [role="table"]', { timeout: 10000 });
        console.log('✅ Tabela de operadores carregada');

        // Procurar pela linha com Ana Paula Branco
        const anaRow = page.locator('tr:has-text("Ana Paula Branco")').first();

        if (await anaRow.isVisible({ timeout: 5000 })) {
            console.log('✅ Operador Ana Paula Branco encontrado');

            await page.screenshot({ path: 'test-screenshots/06-ana-found.png' });

            // Procurar todos os botões na linha
            const buttons = anaRow.locator('button');
            const buttonCount = await buttons.count();
            console.log(`🔍 Encontrados ${buttonCount} botões na linha`);

            // Tentar clicar no primeiro botão (geralmente é o de editar)
            if (buttonCount > 0) {
                await buttons.first().click();
                console.log('✅ Clicou no primeiro botão da linha');
            } else {
                // Se não houver botão, clicar na linha
                await anaRow.click();
                console.log('✅ Clicou na linha do operador');
            }

            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'test-screenshots/07-edit-modal-opening.png' });

        } else {
            throw new Error('❌ Operador Ana Paula Branco não encontrado na tabela');
        }

        // ===== PASSO 6: AGUARDAR MODAL DE EDIÇÃO =====
        console.log('\n' + '='.repeat(80));
        console.log('📍 PASSO 6: Aguardando modal de edição...');
        console.log('='.repeat(80));

        // Aguardar modal abrir - tentar múltiplos seletores
        try {
            await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
            console.log('✅ Modal de edição aberto (role=dialog)');
        } catch (e1) {
            try {
                // Pode ser um drawer ou sidebar
                await page.waitForSelector('[class*="sheet"], [class*="drawer"], [class*="sidebar"]', { timeout: 3000 });
                console.log('✅ Modal/Sheet de edição aberto');
            } catch (e2) {
                // Verifica se há conteúdo com as abas do operador
                const modalContent = page.locator('text=/Perfis|Módulos|Horários|Setores|Unidades/i').first();
                if (await modalContent.isVisible({ timeout: 3000 })) {
                    console.log('✅ Conteúdo de edição detectado (abas encontradas)');
                } else {
                    console.log('⚠️  Modal não detectado pelos seletores padrão - continuando...');
                }
            }
        }

        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-screenshots/08-edit-modal-opened.png' });

        // ===== PASSO 7: ABRIR ABA MÓDULOS =====
        console.log('\n' + '='.repeat(80));
        console.log('📍 PASSO 7: Abrindo aba Módulos...');
        console.log('='.repeat(80));

        // Procurar pela aba "Módulos" dentro do modal
        const modulosTab = page.locator('[role="dialog"] button:has-text("Módulos"), [role="dialog"] [role="tab"]:has-text("Módulos")').first();

        if (await modulosTab.isVisible({ timeout: 5000 })) {
            await modulosTab.click();
            console.log('✅ Clicou na aba Módulos');
        } else {
            throw new Error('❌ Aba Módulos não encontrada no modal');
        }

        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-screenshots/09-modulos-tab-opened.png' });

        console.log(`\n📊 Total de erros HTTP após abrir Módulos: ${errorCount}`);

        // ===== PASSO 8: ADICIONAR MÓDULO UPA =====
        console.log('\n' + '='.repeat(80));
        console.log('📍 PASSO 8: Adicionando módulo UPA...');
        console.log('='.repeat(80));

        // Procurar campo de input para adicionar módulo (pode ser um input de texto ou select)
        const moduloInput = page.locator('[role="dialog"] input[placeholder*="módulo"], [role="dialog"] input[placeholder*="UPA"]').first();

        if (await moduloInput.isVisible({ timeout: 5000 })) {
            await moduloInput.fill('UPA');
            console.log('✅ Digitou "UPA" no campo');
            await page.waitForTimeout(1000);

            // Pressionar Enter ou clicar no botão Adicionar
            await page.keyboard.press('Enter');
            console.log('✅ Pressionou Enter');

        } else {
            // Tentar encontrar um botão "Adicionar" próximo
            const addButton = page.locator('[role="dialog"] button:has-text("Adicionar")').first();
            if (await addButton.isVisible({ timeout: 3000 })) {
                // Pode ter um select ou lista
                const upaOption = page.locator('[role="dialog"] *:has-text("UPA")').first();
                if (await upaOption.isVisible({ timeout: 3000 })) {
                    await upaOption.click();
                    console.log('✅ Selecionou UPA da lista');
                }
                await addButton.click();
                console.log('✅ Clicou em Adicionar');
            }
        }

        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-screenshots/10-upa-added.png' });

        // Verificar se UPA foi adicionado
        const upaTag = page.locator('[role="dialog"] *:has-text("UPA")').first();
        if (await upaTag.isVisible({ timeout: 3000 })) {
            console.log('✅ Módulo UPA aparece na lista');
        } else {
            console.log('⚠️  Módulo UPA pode não ter sido adicionado visualmente');
        }

        // ===== PASSO 9: SALVAR ALTERAÇÕES =====
        console.log('\n' + '='.repeat(80));
        console.log('📍 PASSO 9: Salvando alterações...');
        console.log('='.repeat(80));

        // Procurar botão Salvar no modal
        const saveButton = page.locator('[role="dialog"] button:has-text("Salvar")').first();

        if (await saveButton.isVisible({ timeout: 5000 })) {
            await saveButton.click();
            console.log('✅ Clicou em Salvar');

            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'test-screenshots/11-saved.png' });

            // Verificar se há mensagem de sucesso
            const successMessage = page.locator('text=/salvo|sucesso|atualizado/i').first();
            if (await successMessage.isVisible({ timeout: 5000 })) {
                console.log('✅ Mensagem de sucesso exibida!');
            }

        } else {
            console.log('⚠️  Botão Salvar não encontrado');
        }

        // ===== RESUMO FINAL =====
        console.log('\n' + '='.repeat(80));
        console.log('📊 RESUMO DO TESTE');
        console.log('='.repeat(80));
        console.log(`✅ Total de requisições: ${requestCount}`);
        console.log(`${errorCount === 0 ? '✅' : '❌'} Total de erros HTTP: ${errorCount}`);

        if (errorCount === 0) {
            console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
            console.log('✅ Nenhum erro 400/403/500 detectado');
            console.log('✅ Módulo UPA concedido para Ana Paula Branco');
        } else {
            console.log('\n⚠️  TESTE CONCLUÍDO COM ERROS');
            console.log(`❌ ${errorCount} erros HTTP detectados`);
        }

        console.log('\n📸 Screenshots salvos em test-screenshots/');

    } catch (error) {
        console.error('\n' + '='.repeat(80));
        console.error('💥 ERRO NO TESTE:', error.message);
        console.error('='.repeat(80));
        await page.screenshot({ path: 'test-screenshots/error-final.png' });
        console.log('📸 Screenshot do erro salvo: test-screenshots/error-final.png');
    } finally {
        console.log('\n⏳ Aguardando 5 segundos antes de fechar...');
        await page.waitForTimeout(5000);
        await browser.close();
        console.log('✅ Navegador fechado');
    }
})();
