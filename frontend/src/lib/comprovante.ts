// frontend/src/lib/comprovante.ts
// -----------------------------------------------------------
// Utilitário central para abrir/baixar/copiar link do Comprovante
// de Agendamento. Não altera a identidade visual do app.
// -----------------------------------------------------------

/** Obtém a raiz do backend com base na VITE_API_BASE_URL (ex.: http://localhost:5011/api → http://localhost:5011). */
export function getApiRoot(): string {
    // Em dev, usa proxy do Vite (porta 5173 redireciona /api para backend:8080)
    // Em prod, VITE_API_BASE_URL terá a URL completa
    const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
    if (envBase && envBase.trim()) {
        // Se tem /api no final, remove para ter apenas a raiz
        return envBase.replace(/\/api\/?$/i, '');
    }
    // Fallback para desenvolvimento local (usa URL atual do browser)
    return window.location.origin;
}

/** URL que exibe (inline) o PDF do comprovante. */
export function urlComprovante(agendamentoId: number): string {
    const root = getApiRoot();
    return `${root}/api/agendamentos/${agendamentoId}/comprovante`;
}

/** URL que força o download do PDF do comprovante. */
export function urlComprovanteDownload(agendamentoId: number): string {
    const root = getApiRoot();
    return `${root}/api/agendamentos/${agendamentoId}/comprovante/download`;
}

/** Abre o comprovante em nova aba (navegador exibe; usuário imprime com Ctrl+P). */
export async function abrirComprovante(agendamentoId: number) {
    try {
        // Busca o token do localStorage
        const token = localStorage.getItem('token');

        const response = await fetch(urlComprovante(agendamentoId), {
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        if (!response.ok) {
            console.error('Erro ao buscar documento:', response.status);
            alert('Erro ao abrir documento. Verifique se você está autenticado.');
            return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');

        // Libera memória após 1 minuto
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
        console.error('Erro ao abrir documento:', error);
        alert('Erro ao abrir documento.');
    }
}

/** Abre o download do comprovante em nova aba. */
export async function baixarComprovante(agendamentoId: number) {
    try {
        // Busca o token do localStorage
        const token = localStorage.getItem('token');

        const response = await fetch(urlComprovanteDownload(agendamentoId), {
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        if (!response.ok) {
            console.error('Erro ao baixar documento:', response.status);
            alert('Erro ao baixar documento. Verifique se você está autenticado.');
            return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Documento-Agendamento-${agendamentoId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro ao baixar documento:', error);
        alert('Erro ao baixar documento.');
    }
}

/** Copia para a área de transferência o link do comprovante (exibir). */
export async function copiarLinkComprovante(agendamentoId: number): Promise<boolean> {
    const link = urlComprovante(agendamentoId);
    try {
        await navigator.clipboard.writeText(link);
        return true;
    } catch {
        // Fallback em navegadores antigos
        const ta = document.createElement('textarea');
        ta.value = link;
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    }
}
