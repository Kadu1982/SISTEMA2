// frontend/src/components/agendamento/MenuReimpressao.tsx
// ------------------------------------------------------------------
// Menu de reimpressão genérico:
//  • Botão único que imprime o documento correto baseado na regra de negócio:
//    - SADT para exames laboratoriais/imagem
//    - Comprovante para consultas
// O backend decide automaticamente qual documento retornar.
// ------------------------------------------------------------------

import React from 'react';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Printer, Ban, Download, Link as LinkIcon } from 'lucide-react';

// Funções utilitárias de comprovante (reutilizadas para o endpoint unificado):
import {
    abrirComprovante,
    baixarComprovante,
    copiarLinkComprovante,
} from '@/lib/comprovante';

// Tipagem simplificada para o agendamento
interface MenuReimpressaoProps {
    agendamento: {
        id?: number;
        [k: string]: any;
    };
}

const MenuReimpressao: React.FC<MenuReimpressaoProps> = ({ agendamento }) => {
    const id = Number(agendamento?.id ?? 0);
    
    // Só precisa de um ID válido para mostrar a opção de impressão
    const temDocumentoDisponivel = id > 0;

    // ---------------- Handlers genéricos ----------------
    const handleImprimirDocumento = () => {
        if (!id) return;
        // O backend decide automaticamente se retorna SADT ou Comprovante
        abrirComprovante(id); // abre /api/agendamentos/{id}/comprovante
    };

    const handleBaixarDocumento = () => {
        if (!id) return;
        // O backend decide automaticamente se retorna SADT ou Comprovante
        baixarComprovante(id);
    };

    const handleCopiarLinkDocumento = async () => {
        if (!id) return;
        const ok = await copiarLinkComprovante(id);
        if (!ok) {
            // eslint-disable-next-line no-console
            console.warn('Não foi possível copiar o link do documento.');
        }
    };

    // ---------------- Render ----------------
    if (!temDocumentoDisponivel) {
        return (
            <DropdownMenuItem disabled className="opacity-50">
                <Ban className="mr-2 h-4 w-4" />
                Nenhum documento disponível
            </DropdownMenuItem>
        );
    }

    return (
        <>
            <DropdownMenuSeparator />

            {/* Botão genérico que imprime o documento correto baseado na regra de negócio */}
            <DropdownMenuItem
                onClick={handleImprimirDocumento}
                className="cursor-pointer"
            >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Documento
            </DropdownMenuItem>

            <DropdownMenuItem
                onClick={handleBaixarDocumento}
                className="cursor-pointer"
            >
                <Download className="mr-2 h-4 w-4" />
                Baixar Documento (PDF)
            </DropdownMenuItem>

            <DropdownMenuItem
                onClick={handleCopiarLinkDocumento}
                className="cursor-pointer"
            >
                <LinkIcon className="mr-2 h-4 w-4" />
                Copiar Link do Documento
            </DropdownMenuItem>
        </>
    );
};

export default MenuReimpressao;
