const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando backend tunnel...\n');

// Verificar se backend está rodando
exec('curl -s http://localhost:8080/health', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Backend não está rodando em localhost:8080');
        console.log('Inicie o backend primeiro!');
        return;
    }
    
    console.log('✅ Backend funcionando');
    
    // Verificar se frontend está rodando
    exec('curl -s http://localhost:5173', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ Frontend não está rodando em localhost:5173');
            console.log('Inicie o frontend primeiro!');
            return;
        }
        
        console.log('✅ Frontend funcionando');
        
        // Parar tunnels antigos
        console.log('\n🛑 Parando tunnels antigos...');
        exec('taskkill /F /IM cloudflared.exe', (error, stdout, stderr) => {
            // Aguardar um pouco
            setTimeout(() => {
                console.log('🚀 Criando tunnel para backend...');
                
                // Criar tunnel para backend
                const tunnelProcess = exec('cloudflared tunnel --url http://localhost:8080', (error, stdout, stderr) => {
                    if (error) {
                        console.log('❌ Erro ao criar tunnel:', error.message);
                        return;
                    }
                });
                
                // Capturar output do tunnel
                let tunnelOutput = '';
                tunnelProcess.stdout.on('data', (data) => {
                    tunnelOutput += data;
                    
                    // Procurar por URL do tunnel
                    const urlMatch = tunnelOutput.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
                    if (urlMatch) {
                        const backendUrl = urlMatch[0];
                        console.log(`\n✅ Tunnel do backend criado: ${backendUrl}`);
                        
                        // Configurar frontend
                        const envContent = `VITE_API_URL=${backendUrl}/api\n`;
                        const envPath = path.join(__dirname, 'frontend', '.env.local');
                        
                        fs.writeFileSync(envPath, envContent);
                        console.log(`✅ Frontend configurado para usar: ${backendUrl}/api`);
                        
                        console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
                        console.log('\n📋 URLs:');
                        console.log(`Frontend: https://nano-experimental-fishing-benz.trycloudflare.com`);
                        console.log(`Backend:  ${backendUrl}`);
                        console.log('\n🔐 Credenciais:');
                        console.log('Login: admin.master');
                        console.log('Senha: Admin@123');
                        console.log('\n✨ Agora o login deve funcionar sem erro 403!');
                        
                        // Manter o processo rodando
                        console.log('\n⚠️  IMPORTANTE: Mantenha esta janela aberta!');
                    }
                });
                
                tunnelProcess.stderr.on('data', (data) => {
                    // Logs do cloudflared
                    if (data.includes('trycloudflare.com')) {
                        console.log('📡 Tunnel iniciando...');
                    }
                });
                
            }, 2000);
        });
    });
});

