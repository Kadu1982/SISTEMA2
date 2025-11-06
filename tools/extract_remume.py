#!/usr/bin/env python3
"""
Script para extrair medicamentos do PDF remume.pdf e gerar JSON
"""
import json
import sys
import re
from pathlib import Path

try:
    import PyPDF2
except ImportError:
    print("Instalando PyPDF2...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
    import PyPDF2

def extract_text_from_pdf(pdf_path):
    """Extrai texto do PDF"""
    medicamentos = []
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                
                # Processa cada linha do texto
                lines = text.split('\n')
                
                for line in lines:
                    line = line.strip()
                    if not line or len(line) < 3:
                        continue
                    
                    # Tenta identificar medicamentos (padrões comuns)
                    # Exemplos: "Dipirona 500mg", "Paracetamol 750mg comprimido", etc.
                    if re.search(r'\d+\s*(mg|ml|g|mcg|UI)', line, re.IGNORECASE):
                        # Parece um medicamento
                        medicamentos.append(line)
                    
    except Exception as e:
        print(f"Erro ao processar PDF: {e}")
        return []
    
    return medicamentos

def parse_medicamentos(text_lines):
    """Parseia as linhas de texto em objetos de medicamentos estruturados"""
    medicamentos = []
    
    for idx, line in enumerate(text_lines):
        if not line.strip():
            continue
            
        # Tenta extrair nome, concentração, forma farmacêutica
        # Padrões comuns: "Nome Medicamento 500mg comprimido"
        
        # Remove caracteres especiais ruins
        line = re.sub(r'[^\w\s\d.,-]', '', line)
        
        # Busca padrão de concentração
        concentracao_match = re.search(r'(\d+)\s*(mg|ml|g|mcg|UI)', line, re.IGNORECASE)
        concentracao = concentracao_match.group(0) if concentracao_match else ""
        
        # Nome do medicamento (tudo antes da concentração)
        nome = line.split(concentracao)[0].strip() if concentracao else line.strip()
        
        # Forma farmacêutica comum
        formas = ['comprimido', 'cápsula', 'solução', 'suspensão', 'xarope', 'creme', 'pomada', 'gel']
        forma = ""
        for f in formas:
            if f in line.lower():
                forma = f.title()
                break
        
        if nome:
            med = {
                "id": idx + 1,
                "nome": nome,
                "apresentacao": concentracao,
                "concentracao": concentracao,
                "formaFarmaceutica": forma if forma else "Comprimido",
                "principioAtivo": nome.split()[0] if nome.split() else nome,  # Aproximação
                "ativo": True
            }
            medicamentos.append(med)
    
    return medicamentos

def main():
    # Caminho do PDF
    pdf_path = Path(__file__).parent.parent / "docs" / "remume.pdf"
    
    if not pdf_path.exists():
        print(f"Erro: Arquivo não encontrado: {pdf_path}")
        sys.exit(1)
    
    print(f"Extraindo medicamentos de {pdf_path}...")
    
    # Extrai texto do PDF
    text_lines = extract_text_from_pdf(pdf_path)
    
    if not text_lines:
        print("Nenhum texto extraído do PDF. Tentando método alternativo...")
        # Tenta extrair de forma mais simples
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                all_text = ""
                for page in pdf_reader.pages:
                    all_text += page.extract_text() + "\n"
                text_lines = [line.strip() for line in all_text.split('\n') if line.strip()]
        except Exception as e:
            print(f"Erro no método alternativo: {e}")
            sys.exit(1)
    
    print(f"Encontradas {len(text_lines)} linhas de texto")
    
    # Parseia medicamentos
    medicamentos = parse_medicamentos(text_lines)
    
    # Remove duplicatas baseado no nome
    seen = set()
    unique_meds = []
    for med in medicamentos:
        nome_key = med['nome'].lower().strip()
        if nome_key and nome_key not in seen:
            seen.add(nome_key)
            unique_meds.append(med)
    
    # Atualiza IDs
    for idx, med in enumerate(unique_meds):
        med['id'] = idx + 1
    
    print(f"Extraídos {len(unique_meds)} medicamentos únicos")
    
    # Salva JSON
    output_path = Path(__file__).parent.parent / "frontend" / "src" / "data" / "remume-medicamentos.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(unique_meds, f, ensure_ascii=False, indent=2)
    
    print(f"JSON salvo em: {output_path}")
    print(f"Total de medicamentos: {len(unique_meds)}")
    
    # Mostra alguns exemplos
    print("\nPrimeiros 5 medicamentos:")
    for med in unique_meds[:5]:
        print(f"  - {med['nome']} {med['apresentacao']}")

if __name__ == "__main__":
    main()

