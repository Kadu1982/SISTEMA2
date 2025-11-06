#!/usr/bin/env node
/**
 * Script para parsear texto dos medicamentos REMUME (copiado do PDF)
 * Uso: node tools/parse-remume-text.js < arquivo.txt
 * Ou: node tools/parse-remume-text.js texto-dos-medicamentos.txt
 */

const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'remume-medicamentos.json');

function parseMedicamentosFromText(text) {
    const medicamentos = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let id = 1;
    const seen = new Set();
    
    for (const line of lines) {
        // Ignora linhas muito curtas ou que parecem cabeçalhos
        if (line.length < 3) continue;
        if (line.match(/^(Página|Page|\d+)$/i)) continue;
        if (line.match(/^(REMUME|Relação|Municipal|Medicamentos|Essenciais)$/i)) continue;
        
        // Padrões para identificar medicamentos
        // Busca por concentrações: 500mg, 750mg, 25mg, etc.
        const concentracaoMatch = line.match(/\b(\d+(?:[,.]\d+)?)\s*(mg|ml|g|mcg|UI|%)\b/i);
        
        if (concentracaoMatch) {
            // Parece um medicamento
            const concentracao = concentracaoMatch[0];
            const nome = line.split(concentracao)[0].trim();
            
            if (nome && nome.length > 2 && !seen.has(nome.toLowerCase())) {
                seen.add(nome.toLowerCase());
                
                // Tenta identificar forma farmacêutica
                const formas = {
                    'comprimido': 'Comprimido',
                    'compr.': 'Comprimido',
                    'cápsula': 'Cápsula',
                    'capsula': 'Cápsula',
                    'caps.': 'Cápsula',
                    'solução': 'Solução',
                    'sol.': 'Solução',
                    'suspensão': 'Suspensão',
                    'suspensao': 'Suspensão',
                    'susp.': 'Suspensão',
                    'xarope': 'Xarope',
                    'creme': 'Creme',
                    'pomada': 'Pomada',
                    'gel': 'Gel',
                    'drágea': 'Drágea',
                    'dragea': 'Drágea',
                    'gotas': 'Gotas',
                    'ampola': 'Ampola',
                    'frasco': 'Frasco'
                };
                
                let forma = 'Comprimido'; // padrão
                const lineLower = line.toLowerCase();
                for (const [key, value] of Object.entries(formas)) {
                    if (lineLower.includes(key)) {
                        forma = value;
                        break;
                    }
                }
                
                // Extrai princípio ativo (primeira palavra ou nome completo)
                const principioAtivo = nome.split(/\s+/)[0];
                
                // Tenta extrair apresentação completa
                const partes = line.split(concentracao);
                let apresentacao = concentracao;
                if (partes.length > 1 && partes[1].trim()) {
                    const resto = partes[1].trim().split(/\s+/)[0];
                    if (resto && resto.length < 30) {
                        apresentacao = `${concentracao} ${resto}`;
                    }
                }
                
                medicamentos.push({
                    id: id++,
                    nome: nome,
                    apresentacao: apresentacao.trim(),
                    concentracao: concentracao,
                    formaFarmaceutica: forma,
                    principioAtivo: principioAtivo,
                    ativo: true
                });
            }
        } else {
            // Tenta identificar mesmo sem concentração explícita
            // Se a linha tem formato de medicamento (palavras comuns)
            const palavrasMedicamento = ['comprimido', 'capsula', 'solucao', 'xarope', 'creme', 'pomada'];
            const temPalavraMedicamento = palavrasMedicamento.some(p => line.toLowerCase().includes(p));
            
            if (temPalavraMedicamento && line.length > 5 && line.length < 100) {
                const nome = line.split(new RegExp(palavrasMedicamento.join('|'), 'i'))[0].trim();
                if (nome && nome.length > 2 && !seen.has(nome.toLowerCase())) {
                    seen.add(nome.toLowerCase());
                    
                    let forma = 'Comprimido';
                    const lineLower = line.toLowerCase();
                    if (lineLower.includes('capsula') || lineLower.includes('caps.')) forma = 'Cápsula';
                    else if (lineLower.includes('solucao') || lineLower.includes('sol.')) forma = 'Solução';
                    else if (lineLower.includes('xarope')) forma = 'Xarope';
                    else if (lineLower.includes('creme')) forma = 'Creme';
                    else if (lineLower.includes('pomada')) forma = 'Pomada';
                    
                    medicamentos.push({
                        id: id++,
                        nome: nome,
                        apresentacao: '',
                        concentracao: '',
                        formaFarmaceutica: forma,
                        principioAtivo: nome.split(/\s+/)[0],
                        ativo: true
                    });
                }
            }
        }
    }
    
    return medicamentos;
}

// Lê entrada
let texto = '';

if (process.argv[2]) {
    // Arquivo fornecido como argumento
    const filePath = path.isAbsolute(process.argv[2]) 
        ? process.argv[2] 
        : path.join(__dirname, '..', process.argv[2]);
    
    if (fs.existsSync(filePath)) {
        texto = fs.readFileSync(filePath, 'utf-8');
    } else {
        console.error(`Arquivo não encontrado: ${filePath}`);
        process.exit(1);
    }
} else {
    // Lê de stdin
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
        texto += chunk;
    });
    
    process.stdin.on('end', () => {
        processarTexto(texto);
    });
    
    return; // Não continua
}

// Se temos texto direto, processa
if (texto) {
    processarTexto(texto);
}

function processarTexto(texto) {
    console.log('Processando texto dos medicamentos...');
    console.log(`Tamanho do texto: ${texto.length} caracteres`);
    
    const medicamentos = parseMedicamentosFromText(texto);
    
    // Remove duplicatas
    const unique = [];
    const seen = new Set();
    for (const med of medicamentos) {
        const key = med.nome.toLowerCase().trim();
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(med);
        }
    }
    
    // Reatribui IDs
    unique.forEach((med, idx) => {
        med.id = idx + 1;
    });
    
    // Salva JSON
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2), 'utf-8');
    
    console.log(`\n✅ Extraídos ${unique.length} medicamentos únicos`);
    console.log(`JSON salvo em: ${outputPath}`);
    console.log('\nPrimeiros 10 medicamentos:');
    unique.slice(0, 10).forEach(med => {
        console.log(`  ${med.id}. ${med.nome} ${med.apresentacao} (${med.formaFarmaceutica})`);
    });
}

