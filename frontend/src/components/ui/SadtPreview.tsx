import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Printer, X } from "lucide-react";

/**
 * PdfPreview
 * -----------------------------------------------------------------------------
 * Preview genérico de PDF com Download e Imprimir.
 * Aceita fonte como base64, Blob/Uint8Array ou URL já pronta.
 * Cria um ObjectURL seguro e usa <iframe> oculto para acionar a impressão.
 *
 * Props:
 *  - title: título do modal (ex.: "Atestado", "Receituário", "SADT #123")
 *  - fileName: nome sugerido no download (ex.: "Atestado.pdf")
 *  - pdfBase64?: string (sem "data:"; apenas o base64 do PDF)
 *  - pdfBytes?: Uint8Array | ArrayBuffer | Blob
 *  - pdfUrl?: string (URL pública ou ObjectURL já criado externamente)
 *  - onClose: fecha o preview
 *  - actionsRight?: ReactNode (botões extras à direita, opcionais)
 */
type BytesLike = Uint8Array | ArrayBuffer | Blob;

interface PdfPreviewProps {
    title: string;
    fileName?: string;
    pdfBase64?: string;
    pdfBytes?: BytesLike;
    pdfUrl?: string;
    onClose: () => void;
    actionsRight?: React.ReactNode;
}

function ensureBlobFromBytes(bytes: BytesLike): Blob {
    if (bytes instanceof Blob) return bytes;
    if (bytes instanceof ArrayBuffer) return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    return new Blob([bytes], { type: "application/pdf" });
}

function base64ToBlob(b64: string): Blob {
    const bin = atob(b64);
    const len = bin.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: "application/pdf" });
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
                                                   title,
                                                   fileName = "documento.pdf",
                                                   pdfBase64,
                                                   pdfBytes,
                                                   pdfUrl,
                                                   onClose,
                                                   actionsRight
                                               }) => {
    const [url, setUrl] = React.useState<string | null>(null);

    // Cria ObjectURL a partir de qualquer fonte disponível
    React.useEffect(() => {
        let blob: Blob | null = null;

        try {
            if (pdfUrl) {
                setUrl(pdfUrl);
                return () => { /* caso venha url externa, não revogamos */ };
            }

            if (pdfBytes) {
                blob = ensureBlobFromBytes(pdfBytes);
            } else if (pdfBase64) {
                blob = base64ToBlob(pdfBase64);
            }

            if (blob) {
                const objectUrl = URL.createObjectURL(blob);
                setUrl(objectUrl);
                return () => URL.revokeObjectURL(objectUrl);
            }

            setUrl(null);
            return () => {};
        } catch {
            setUrl(null);
            return () => {};
        }
    }, [pdfBase64, pdfBytes, pdfUrl]);

    const handleDownload = () => {
        if (!url) return;
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handlePrint = () => {
        if (!url) return;
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.src = url;
        document.body.appendChild(iframe);
        iframe.onload = () => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } finally {
                setTimeout(() => document.body.removeChild(iframe), 500);
            }
        };
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-lg">{title}</h2>
                    <div className="flex items-center gap-2">
                        {actionsRight}
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Imprimir
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Corpo */}
                <div className="flex-1 overflow-hidden p-2">
                    {url ? (
                        <iframe title={title} src={url} className="w-full h-full border rounded" />
                    ) : (
                        <Card className="w-full h-full grid place-items-center">
                            <div className="text-sm text-muted-foreground">Preparando preview…</div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PdfPreview;
