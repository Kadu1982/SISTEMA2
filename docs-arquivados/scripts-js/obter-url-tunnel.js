const { exec } = require('child_process');

function obterUrlTunnel() {
    console.log('🔍 Verificando Cloudflare Tunnel...\n');
    
    // Verificar se cloudflared está rodando
    exec('tasklist | findstr cloudflared', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ Cloudflare Tunnel não está rodando');
            console.log('Execute: cloudflared tunnel --url http://localhost:5173');
            return;
        }
        
        if (stdout.includes('cloudflared.exe')) {
            console.log('✅ Cloudflare Tunnel está rodando');
            console.log('\n📋 Para obter a URL do tunnel:');
            console.log('1. Abra a janela "Cloudflare Tunnel"');
            console.log('2. Procure por uma linha como:');
            console.log('   "https://abc-123.trycloudflare.com"');
            console.log('3. Copie essa URL e cole no navegador');
            console.log('\n💡 Dica: A URL geralmente aparece após alguns segundos');
        } else {
            console.log('❌ Cloudflare Tunnel não encontrado');
        }
    });
}

obterUrlTunnel();

