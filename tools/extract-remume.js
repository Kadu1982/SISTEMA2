#!/usr/bin/env node
/**
 * Script para extrair medicamentos do PDF remume.pdf e gerar JSON
 */

const fs = require('fs');
const path = require('path');

// Caminhos
const pdfPath = path.join(__dirname, '..', 'docs', 'remume.pdf');
const outputPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'remume-medicamentos.json');

// Tenta usar pdf-parse se disponível, senão usa método manual
async function extractMedicamentos() {
    let pdfParseModule;
    
    // Tenta várias localizações do pdf-parse
    const pathsToTry = [
        path.join(__dirname, '..', 'frontend', 'node_modules', 'pdf-parse'),
        'pdf-parse',
        path.join(__dirname, 'node_modules', 'pdf-parse')
    ];
    
    for (const tryPath of pathsToTry) {
        try {
            pdfParseModule = require(tryPath);
            break;
        } catch (e) {
            // Continua tentando
        }
    }
    
    if (!pdfParseModule) {
        console.log('pdf-parse não encontrado. Tentando instalar...');
        const { execSync } = require('child_process');
        try {
            const frontendDir = path.join(__dirname, '..', 'frontend');
            execSync('npm install pdf-parse --save-dev', { 
                cwd: frontendDir,
                stdio: 'inherit' 
            });
            
            // Tenta novamente após instalação
            pdfParseModule = require(path.join(frontendDir, 'node_modules', 'pdf-parse'));
        } catch (installError) {
            console.error('Não foi possível instalar pdf-parse automaticamente');
            console.log('Por favor, execute manualmente:');
            console.log('  cd frontend');
            console.log('  npm install pdf-parse --save-dev');
            return [];
        }
    }
    
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        
        // pdf-parse versão 1.1.1 é uma função direta
        // Versões mais novas exportam objeto
        let pdfParseFunction = pdfParseModule;
        
        if (typeof pdfParseModule === 'function') {
            pdfParseFunction = pdfParseModule;
        } else if (pdfParseModule.default && typeof pdfParseModule.default === 'function') {
            pdfParseFunction = pdfParseModule.default;
        } else if (pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse === 'function') {
            // Versão muito nova - tenta usar como função wrapper
            pdfParseFunction = (buffer) => {
                const parser = new pdfParseModule.PDFParse(buffer);
                return parser;
            };
        }
        
        // Tenta chamar como função
        if (typeof pdfParseFunction === 'function') {
            const data = await pdfParseFunction(dataBuffer);
            const text = data.text || (typeof data === 'string' ? data : '');
            return parseMedicamentosFromText(text);
        } else if (pdfParseModule.PDFParse) {
            // Nova versão - usa PDFParse
            // PDFParse precisa ser chamado de forma diferente
            // Vamos tentar criar uma promise wrapper
            return new Promise((resolve, reject) => {
                try {
                    const PDFParse = pdfParseModule.PDFParse;
                    const parser = new PDFParse(dataBuffer, {
                        // Opções opcionais
                    });
                    
                    // Tenta usar diretamente ou através de propriedades
                    if (parser.then) {
                        parser.then(result => {
                            resolve(parseMedicamentosFromText(result.text || result));
                        }).catch(reject);
                    } else if (parser.text) {
                        resolve(parseMedicamentosFromText(parser.text));
                    } else {
                        // Tenta acessar propriedades
                        const text = parser._text || parser.text || '';
                        resolve(parseMedicamentosFromText(text));
                    }
                } catch (err) {
                    reject(err);
                }
            });
        } else {
            throw new Error('Formato desconhecido do módulo pdf-parse');
        }
    } catch (error) {
        console.error('Erro ao processar PDF:', error.message);
        console.error('Tentando método alternativo...');
        
        // Método alternativo: usa um wrapper simples
        try {
            // Como último recurso, vamos pedir ao usuário para fornecer um texto
            console.log('\n⚠️  Não foi possível extrair automaticamente do PDF.');
            console.log('Por favor, abra o PDF remume.pdf e copie o texto dos medicamentos.');
            console.log('Ou tente usar uma ferramenta online de conversão PDF para texto.');
            return [];
        } catch (e) {
            return [];
        }
    }
}

function parseMedicamentosFromText(text) {
    const medicamentos = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let id = 1;
    const seen = new Set();
    
    for (const line of lines) {
        // Padrões para identificar medicamentos
        // Busca por concentrações: 500mg, 750mg, 25mg, etc.
        const concentracaoMatch = line.match(/\b(\d+)\s*(mg|ml|g|mcg|UI)\b/i);
        
        if (concentracaoMatch) {
            // Parece um medicamento
            const concentracao = concentracaoMatch[0];
            const nome = line.split(concentracao)[0].trim();
            
            if (nome && nome.length > 2 && !seen.has(nome.toLowerCase())) {
                seen.add(nome.toLowerCase());
                
                // Tenta identificar forma farmacêutica
                const formas = {
                    'comprimido': 'Comprimido',
                    'cápsula': 'Cápsula',
                    'capsula': 'Cápsula',
                    'solução': 'Solução',
                    'suspensão': 'Suspensão',
                    'suspensao': 'Suspensão',
                    'xarope': 'Xarope',
                    'creme': 'Creme',
                    'pomada': 'Pomada',
                    'gel': 'Gel',
                    'drágea': 'Drágea',
                    'dragea': 'Drágea'
                };
                
                let forma = 'Comprimido'; // padrão
                for (const [key, value] of Object.entries(formas)) {
                    if (line.toLowerCase().includes(key)) {
                        forma = value;
                        break;
                    }
                }
                
                // Extrai princípio ativo (primeira palavra ou nome completo)
                const principioAtivo = nome.split(/\s+/)[0];
                
                medicamentos.push({
                    id: id++,
                    nome: nome,
                    apresentacao: concentracao,
                    concentracao: concentracao,
                    formaFarmaceutica: forma,
                    principioAtivo: principioAtivo,
                    ativo: true
                });
            }
        }
    }
    
    return medicamentos;
}

// Executa
if (require.main === module) {
    (async () => {
        console.log('Extraindo medicamentos do PDF remume.pdf...');
        console.log(`PDF: ${pdfPath}`);
        
        if (!fs.existsSync(pdfPath)) {
            console.error(`Erro: Arquivo não encontrado: ${pdfPath}`);
            process.exit(1);
        }
        
        try {
            const medicamentos = await extractMedicamentos();
            if (medicamentos.length === 0) {
                console.log('\n⚠️  Nenhum medicamento extraído.');
                console.log('Para extrair do PDF, instale: npm install pdf-parse');
                console.log('E execute: node tools/extract-remume.js');
                process.exit(0);
            }
            
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
            console.log('\nPrimeiros 5 medicamentos:');
            unique.slice(0, 5).forEach(med => {
                console.log(`  - ${med.nome} ${med.apresentacao}`);
            });
        } catch (error) {
            console.error('Erro:', error);
            process.exit(1);
        }
    })();
}

