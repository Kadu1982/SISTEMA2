const { chromium } = require('playwright');
const fs = require('fs');

async function testarCriacaoOperadores() {
    const resultados = {
        timestamp: new Date().toISOString(),
        testes: [],
        screenshots: []
    };

    let browser;
    let page;

    try {
        console.log('🚀 Iniciando testes do fluxo de criação de operadores...\n');

        // Iniciar navegador
        browser = await chromium.launch({ headless: false, slowMo: 500 });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        page = await context.newPage();

        // Teste 1: Acessar página de login
        console.log('✅ Teste 1: Acessando página de login...');
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'test-screenshots/01-pagina-login.png', fullPage: true });
        resultados.screenshots.push('01-pagina-login.png');
        resultados.testes.push({ teste: 'Acesso à página de login', status: 'SUCESSO' });
        console.log('   ✓ Página de login carregada\n');

        // Teste 2: Fazer login
        console.log('✅ Teste 2: Realizando login...');
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'admin123');
        await page.screenshot({ path: 'test-screenshots/02-formulario-login-preenchido.png', fullPage: true });
        resultados.screenshots.push('02-formulario-login-preenchido.png');

        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        await page.screenshot({ path: 'test-screenshots/03-dashboard-apos-login.png', fullPage: true });
        resultados.screenshots.push('03-dashboard-apos-login.png');
        resultados.testes.push({ teste: 'Login realizado com sucesso', status: 'SUCESSO' });
        console.log('   ✓ Login realizado com sucesso\n');

        // Teste 3: Navegar para Configurações
        console.log('✅ Teste 3: Navegando para Configurações...');
        await page.click('text=Configurações');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-screenshots/04-pagina-configuracoes.png', fullPage: true });
        resultados.screenshots.push('04-pagina-configuracoes.png');
        resultados.testes.push({ teste: 'Navegação para Configurações', status: 'SUCESSO' });
        console.log('   ✓ Página de configurações carregada\n');

        // Teste 4: Clicar na aba Operadores
        console.log('✅ Teste 4: Acessando aba Operadores...');
        await page.click('button:has-text("Operadores")');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-screenshots/05-aba-operadores.png', fullPage: true });
        resultados.screenshots.push('05-aba-operadores.png');
        resultados.testes.push({ teste: 'Acesso à aba Operadores', status: 'SUCESSO' });
        console.log('   ✓ Aba Operadores carregada\n');

        // Teste 5: Abrir dialog de criação
        console.log('✅ Teste 5: Abrindo dialog de criação de operador...');
        await page.click('button:has-text("Novo Operador")');
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'test-screenshots/06-dialog-criar-operador.png', fullPage: true });
        resultados.screenshots.push('06-dialog-criar-operador.png');
        resultados.testes.push({ teste: 'Abertura do dialog de criação', status: 'SUCESSO' });
        console.log('   ✓ Dialog aberto\n');

        // Teste 6: Verificar carregamento de perfis
        console.log('✅ Teste 6: Verificando carregamento de perfis...');
        await page.click('button:has-text("Selecione um perfil")');
        await page.waitForTimeout(1000);

        const perfisDisponiveis = await page.locator('[role="option"]').count();
        console.log(`   📋 Perfis encontrados: ${perfisDisponiveis}`);

        if (perfisDisponiveis > 0) {
            await page.screenshot({ path: 'test-screenshots/07-perfis-disponiveis.png', fullPage: true });
            resultados.screenshots.push('07-perfis-disponiveis.png');
            resultados.testes.push({
                teste: 'Carregamento de perfis',
                status: 'SUCESSO',
                detalhes: `${perfisDisponiveis} perfis disponíveis`
            });
            console.log('   ✓ Perfis carregados com sucesso\n');
        } else {
            resultados.testes.push({
                teste: 'Carregamento de perfis',
                status: 'AVISO',
                detalhes: 'Nenhum perfil disponível'
            });
            console.log('   ⚠️  Nenhum perfil encontrado\n');
        }

        // Selecionar primeiro perfil se houver
        if (perfisDisponiveis > 0) {
            await page.click('[role="option"]:first-child');
            await page.waitForTimeout(500);
        }

        // Teste 7: Verificar carregamento de unidades
        console.log('✅ Teste 7: Verificando carregamento de unidades...');
        await page.click('button:has-text("Selecione uma unidade")');
        await page.waitForTimeout(1000);

        const unidadesDisponiveis = await page.locator('[role="option"]').count();
        console.log(`   🏥 Unidades encontradas: ${unidadesDisponiveis}`);

        if (unidadesDisponiveis > 0) {
            await page.screenshot({ path: 'test-screenshots/08-unidades-disponiveis.png', fullPage: true });
            resultados.screenshots.push('08-unidades-disponiveis.png');
            resultados.testes.push({
                teste: 'Carregamento de unidades',
                status: 'SUCESSO',
                detalhes: `${unidadesDisponiveis} unidades disponíveis`
            });
            console.log('   ✓ Unidades carregadas com sucesso\n');
        } else {
            await page.screenshot({ path: 'test-screenshots/08-sem-unidades.png', fullPage: true });
            resultados.screenshots.push('08-sem-unidades.png');
            resultados.testes.push({
                teste: 'Carregamento de unidades',
                status: 'ERRO',
                detalhes: 'Nenhuma unidade disponível - mensagem de erro deve estar visível'
            });
            console.log('   ⚠️  Nenhuma unidade encontrada\n');
        }

        // Teste 8: Preencher formulário completo (se houver dados)
        if (perfisDisponiveis > 0 && unidadesDisponiveis > 0) {
            console.log('✅ Teste 8: Preenchendo formulário completo...');

            // Selecionar unidade
            await page.click('[role="option"]:first-child');
            await page.waitForTimeout(500);

            // Preencher campos
            await page.fill('input[placeholder*="Nome"]', 'Operador Teste');
            await page.fill('input[placeholder*="E-mail"]', 'teste@exemplo.com');
            await page.fill('input[placeholder*="CPF"]', '12345678901');
            await page.fill('input[placeholder*="Usuário"]', 'operador.teste');
            await page.fill('input[placeholder*="Senha"]', 'Senha123!');

            await page.screenshot({ path: 'test-screenshots/09-formulario-preenchido.png', fullPage: true });
            resultados.screenshots.push('09-formulario-preenchido.png');
            resultados.testes.push({ teste: 'Preenchimento do formulário', status: 'SUCESSO' });
            console.log('   ✓ Formulário preenchido\n');

            // Teste 9: Tentar salvar
            console.log('✅ Teste 9: Salvando operador...');
            await page.click('button:has-text("Criar Operador")');
            await page.waitForTimeout(3000);

            // Verificar mensagens
            const mensagemSucesso = await page.locator('text=Operador criado com sucesso').isVisible().catch(() => false);
            const mensagemErro = await page.locator('[role="alert"], .text-destructive').isVisible().catch(() => false);

            await page.screenshot({ path: 'test-screenshots/10-resultado-criacao.png', fullPage: true });
            resultados.screenshots.push('10-resultado-criacao.png');

            if (mensagemSucesso) {
                resultados.testes.push({ teste: 'Criação do operador', status: 'SUCESSO' });
                console.log('   ✓ Operador criado com sucesso\n');
            } else if (mensagemErro) {
                resultados.testes.push({ teste: 'Criação do operador', status: 'ERRO', detalhes: 'Erro ao criar operador' });
                console.log('   ❌ Erro ao criar operador\n');
            } else {
                resultados.testes.push({ teste: 'Criação do operador', status: 'PENDENTE', detalhes: 'Aguardando resposta do servidor' });
                console.log('   ⏳ Aguardando resposta do servidor\n');
            }
        } else {
            console.log('⚠️  Teste 8 e 9: Pulado - dados insuficientes (perfis ou unidades faltando)\n');
            resultados.testes.push({
                teste: 'Preenchimento e criação',
                status: 'PULADO',
                detalhes: 'Perfis ou unidades não disponíveis'
            });
        }

        // Resumo
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMO DOS TESTES');
        console.log('='.repeat(60));

        const sucessos = resultados.testes.filter(t => t.status === 'SUCESSO').length;
        const erros = resultados.testes.filter(t => t.status === 'ERRO').length;
        const avisos = resultados.testes.filter(t => t.status === 'AVISO' || t.status === 'PULADO').length;

        console.log(`✅ Sucessos: ${sucessos}`);
        console.log(`❌ Erros: ${erros}`);
        console.log(`⚠️  Avisos: ${avisos}`);
        console.log(`\n📸 Screenshots salvos em: test-screenshots/`);
        console.log('='.repeat(60) + '\n');

        // Salvar resultados
        fs.writeFileSync(
            'test-screenshots/relatorio-teste-corrigido.json',
            JSON.stringify(resultados, null, 2)
        );

        console.log('✅ Relatório salvo em: test-screenshots/relatorio-teste-corrigido.json\n');

    } catch (erro) {
        console.error('\n❌ ERRO DURANTE OS TESTES:', erro.message);
        resultados.testes.push({
            teste: 'Execução geral',
            status: 'ERRO',
            detalhes: erro.message
        });

        if (page) {
            await page.screenshot({ path: 'test-screenshots/erro-final.png', fullPage: true });
            console.log('📸 Screenshot do erro salvo em: test-screenshots/erro-final.png\n');
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return resultados;
}

// Executar testes
testarCriacaoOperadores()
    .then(() => {
        console.log('🎉 Testes finalizados!');
        process.exit(0);
    })
    .catch((erro) => {
        console.error('💥 Falha crítica:', erro);
        process.exit(1);
    });
