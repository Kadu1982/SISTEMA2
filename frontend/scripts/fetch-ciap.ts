// frontend/scripts/fetch-ciap.ts
// -----------------------------------------------------------------------------
// Gera "src/assets/ciap/ciap.json" com TODOS os códigos da CIAP-2 (ICPC-2 em PT).
// - Compatível com TS sem esModuleInterop e sem import.meta.url
// - Usa fetch nativo do Node 18+ (não precisa node-fetch)
// - Usa cheerio (import nomeado) e tipa elementos com AnyNode (domhandler)
// - Retry exponencial + timeout para redes instáveis
// Uso (pasta frontend):
//   npm run build:ciap
// -----------------------------------------------------------------------------

import * as fs from "node:fs";
import * as path from "node:path";
import { load } from "cheerio";
import type { AnyNode } from "domhandler"; // ✅ corrige TS2305

// Letras usadas pela CIAP-2
const CHAPTERS = ["A","B","D","F","H","K","L","N","P","R","S","T","U","W","X","Y","Z"];
// Componentes 1..7 (1:RFE; 2..6:Processos; 7:Diagnóstico)
const COMPONENTS = [1,2,3,4,5,6,7];

// Fonte navegável (permite override por variável de ambiente)
const BASE = process.env.CIAP_BASE || "https://icpc2.danielpinto.net";

// Robustez
const TIMEOUT_MS = Number(process.env.CIAP_TIMEOUT_MS || 12_000);
const MAX_RETRIES = Number(process.env.CIAP_MAX_RETRIES || 5);
const INITIAL_BACKOFF_MS = Number(process.env.CIAP_INITIAL_BACKOFF_MS || 300);

type CiapItem = { codigo: string; titulo: string; capitulo: string };

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

/** Fetch com timeout e retry exponencial (Node 18+ tem fetch global) */
async function fetchWithRetry(urlStr: string, tries = MAX_RETRIES): Promise<string> {
    let attempt = 0;
    let backoff = INITIAL_BACKOFF_MS;

    while (true) {
        attempt++;
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);

        try {
            const res = await fetch(urlStr, { signal: ac.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.text();
        } catch (err: any) {
            clearTimeout(timer);
            const last = attempt >= tries;
            console.warn(`[WARN] Falha ao buscar ${urlStr} (tentativa ${attempt}/${tries}): ${err?.message || err}`);
            if (last) throw err;
            await sleep(backoff);
            backoff *= 2;
        }
    }
}

/** Extrai itens de uma página {capítulo}/{componente} */
function parseChapterComponentHTML(html: string, ch: string): CiapItem[] {
    const $ = load(html);
    const items: CiapItem[] = [];

    // Links no formato "A01 - Título"
    $("a").each((_: number, a: AnyNode) => {
        const txt = $(a as any).text().trim();
        const m = txt.match(/^([A-Z]\d{2})\s*-\s*(.+)$/);
        if (m) {
            const codigo = m[1].toUpperCase();
            const titulo = m[2].trim();
            items.push({ codigo, titulo, capitulo: ch });
        }
    });

    return items;
}

async function fetchChapterComponent(ch: string, comp: number): Promise<CiapItem[]> {
    const url = `${BASE}/${ch}/${comp}/`;
    const html = await fetchWithRetry(url);
    return parseChapterComponentHTML(html, ch);
}

async function main() {
    console.log(`🔎 Gerando CIAP a partir de ${BASE}`);
    const agreg: Record<string, CiapItem> = {};

    for (const ch of CHAPTERS) {
        for (const comp of COMPONENTS) {
            try {
                const rows = await fetchChapterComponent(ch, comp);
                for (const r of rows) agreg[r.codigo] = r; // evita duplicados
                console.log(`  ✓ ${ch}/${comp} → ${rows.length} itens`);
                await sleep(80);
            } catch (e: any) {
                console.warn(`  ⚠️  Falha em ${ch}/${comp}: ${e?.message || e}`);
            }
        }
    }

    const list = Object.values(agreg).sort((a, b) => a.codigo.localeCompare(b.codigo));
    if (list.length < 100) {
        console.warn(`⚠️ Atenção: somente ${list.length} códigos coletados. Verifique rede/fonte.`);
    }

    // Grava relativo ao CWD (pasta do frontend)
    const outDir = path.resolve(process.cwd(), "src", "assets", "ciap");
    fs.mkdirSync(outDir, { recursive: true });

    const outFile = path.join(outDir, "ciap.json");
    fs.writeFileSync(outFile, JSON.stringify(list, null, 2), "utf8");

    console.log(`✅ Gerado: ${path.relative(process.cwd(), outFile)} (${list.length} códigos)`);
}

main().catch(err => {
    console.error("❌ Erro fatal:", err?.message || err);
    process.exit(1);
});
