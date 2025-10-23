// frontend/src/components/BotaoImprimirComprovante.tsx
// ------------------------------------------------------------------
// Botão reutilizável para abrir/baixar o Comprovante de Agendamento.
// Props permitem usar como "Imprimir" (abrir) ou "Baixar" (download).
// ------------------------------------------------------------------

import React, { useEffect } from "react";
import { abrirComprovante, baixarComprovante } from "@/lib/comprovante";

type Props = {
    agendamentoId: number;
    texto?: string;            // texto do botão (ex.: "Imprimir Comprovante")
    variant?: "primary" | "outline";
    disabled?: boolean;
    /** Se true, abre automaticamente ao montar (útil logo após o agendamento). */
    abrirAutomatico?: boolean;
    /** Se true, força download em vez de exibir no navegador. */
    download?: boolean;
    className?: string;        // para ajustar estilo se quiser
};

export default function BotaoImprimirComprovante({
                                                     agendamentoId,
                                                     texto = "Imprimir Comprovante",
                                                     variant = "primary",
                                                     disabled = false,
                                                     abrirAutomatico = false,
                                                     download = false,
                                                     className = "",
                                                 }: Props) {

    useEffect(() => {
        if (abrirAutomatico && agendamentoId) {
            // Abre automaticamente (sem bloquear fluxo). Útil logo após criar o agendamento.
            setTimeout(() => {
                download ? baixarComprovante(agendamentoId) : abrirComprovante(agendamentoId);
            }, 0);
        }
    }, [abrirAutomatico, agendamentoId, download]);

    const base =
        variant === "outline"
            ? "border border-blue-600 text-blue-700 hover:bg-blue-50"
            : "bg-blue-600 text-white hover:bg-blue-700";

    return (
        <button
            type="button"
            disabled={disabled || !agendamentoId}
            onClick={() =>
                download ? baixarComprovante(agendamentoId) : abrirComprovante(agendamentoId)
            }
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${base} ${className}`}
            title={download ? "Baixar Comprovante de Agendamento" : "Imprimir/Exibir Comprovante de Agendamento"}
        >
            {/* Ícone simples em SVG (sem dependência externa) */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 8H5c-1.657 0-3 1.343-3 3v5h4v4h12v-4h4v-5c0-1.657-1.343-3-3-3zm-3 10H8v-6h8v6zM17 2H7v4h10V2z"/>
            </svg>
            {texto}
        </button>
    );
}
