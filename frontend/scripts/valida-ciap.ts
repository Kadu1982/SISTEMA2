// frontend/scripts/valida-ciap.ts
// -----------------------------------------------------------------------------
// Valida o arquivo "src/assets/ciap/ciap.json" gerado pelo fetch-ciap.ts.
// Checa: JSON válido, unicidade dos códigos, capítulos válidos e faixas 01–99.
// Compatível com TS SEM esModuleInterop e SEM import.meta.url.
// Uso (na pasta frontend):
//   npm run validate:ciap
//   # ou: npx tsx scripts/valida-ciap.ts
// -----------------------------------------------------------------------------

import * as fs from "node:fs";
import * as path from "node:path";

type CiapItem = { codigo: string; titulo: string; capitulo: string };

// Caminho do arquivo a validar (relativo ao CWD = pasta "frontend")
const FILE = path.resolve(process.cwd(), "src", "assets", "ciap", "ciap.json");

function fail(msg: string, code = 1): never {
    console.error(msg);
    process.exit(code);
}

(function main() {
    if (!fs.existsSync(FILE)) {
        fail(`❌ Arquivo não encontrado: ${FILE}`);
    }

    const raw = fs.readFileSync(FILE, "utf8");
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch (e: any) {
        fail(`❌ JSON inválido: ${e?.message || e}`);
    }

    if (!Array.isArray(data) || data.length < 10) {
        fail("❌ Conteúdo inesperado: deveria ser um array com centenas de itens.");
    }

    const CAPITULOS = new Set([
        "A","B","D","F","H","K","L","N","P","R","S","T","U","W","X","Y","Z"
    ]);
    const reCode = /^[A-Z][0-9]{2}$/;

    let ok = true;
    const seen = new Set<string>();
    const byCap: Record<string, number> = {};

    function faixa(c: string) {
        const n = parseInt(c.slice(1), 10);
        if (n >= 1 && n <= 29) return "RFE";
        if (n >= 30 && n <= 69) return "PROCESSO";
        if (n >= 70 && n <= 99) return "DIAGNOSTICO";
        return "INVALIDA";
    }

    for (const it of data as CiapItem[]) {
        const codigo = (it.codigo ?? "").toString().toUpperCase().trim();
        const titulo = (it.titulo ?? "").toString().trim();
        const cap = (it.capitulo ?? "").toString().toUpperCase().trim();

        if (!reCode.test(codigo)) {
            console.error("❌ Código inválido:", it);
            ok = false;
        }

        if (seen.has(codigo)) {
            console.error("❌ Código duplicado:", codigo);
            ok = false;
        } else {
            seen.add(codigo);
        }

        if (!titulo) {
            console.error("❌ Título ausente/ inválido:", codigo);
            ok = false;
        }

        if (!CAPITULOS.has(cap)) {
            console.error("❌ Capítulo inválido:", codigo, "->", it.capitulo);
            ok = false;
        }

        byCap[cap] = (byCap[cap] ?? 0) + 1;

        if (faixa(codigo) === "INVALIDA") {
            console.error("❌ Faixa numérica inválida (fora 01–99):", codigo);
            ok = false;
        }
    }

    console.log("Capítulos encontrados e contagem:");
    for (const cap of Array.from(CAPITULOS)) {
        console.log(`  ${cap}: ${byCap[cap] ?? 0}`);
    }

    if (ok) {
        console.log(`✅ Validação OK! Total de códigos: ${(data as CiapItem[]).length}`);
        process.exit(0);
    } else {
        fail("❌ Falhas encontradas. Veja os erros acima.", 2);
    }
})();
