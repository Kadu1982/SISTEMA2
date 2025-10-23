/**
 * src/lib/pdf.ts
 * Helpers padronizados para abrir PDFs em nova aba (viewer nativo do browser).
 * Não força download para preservar seu fluxo/identidade.
 */
export function openPdfBlob(pdf: Blob, filename = "documento.pdf") {
    try {
        const url = URL.createObjectURL(pdf);
        window.open(url, "_blank", "noopener,noreferrer");
        // Se quiser forçar download:
        // const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
        // setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
        console.error("Falha ao abrir Blob PDF:", e);
    }
}

export function openPdfBase64(b64: string, filename = "documento.pdf") {
    try {
        const raw = atob(b64);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        openPdfBlob(new Blob([bytes], { type: "application/pdf" }), filename);
    } catch (e) {
        console.error("Falha ao abrir Base64 PDF:", e);
    }
}
