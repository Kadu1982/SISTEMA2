import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, X } from "lucide-react";

interface Props {
    pdfBase64: string;
    onClose: () => void;
}

const ReceituarioPreview: React.FC<Props> = ({ pdfBase64, onClose }) => {
    const [url, setUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        try {
            const bytes = atob(pdfBase64);
            const arr = new Uint8Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
            const blob = new Blob([arr], { type: "application/pdf" });
            const objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } catch {
            setUrl(null);
        }
    }, [pdfBase64]);

    const download = () => {
        if (!url) return;
        const a = document.createElement("a");
        a.href = url;
        a.download = "Receituario.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const print = () => {
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

    if (!url) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Gerando Receituário…</CardTitle>
                </CardHeader>
                <CardContent>Preparando preview…</CardContent>
            </Card>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Receituário</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={download}>
                            <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={print}>
                            <Printer className="mr-2 h-4 w-4" /> Imprimir
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden p-2">
                    <iframe title="Receituário PDF" src={url} className="w-full h-full border rounded" />
                </div>
            </div>
        </div>
    );
};

export default ReceituarioPreview;
