// src/components/ciap/CiapFields.tsx
// UI para selecionar códigos da CIAP-2 por componente:
// - RFE (01–29) → 0..1 (recomendado 1 código)
// - Diagnósticos (70–99) → 0..5
// - Processos/Procedimentos (30–69) → 0..5 (opcional)
//
// Mantém o padrão visual do projeto (shadcn/ui + Tailwind).

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchCiap } from "@/services/ciapService";
import { getFaixa, CiapItem } from "@/types/ciap";
import { X } from "lucide-react";

export type CiapFieldsValue = {
    ciapRfe: string[];           // 0..1 (usaremos no payload como string única)
    ciapDiagnosticos: string[];  // 0..5
    ciapProcedimentos: string[]; // 0..5
};

type Props = {
    value: CiapFieldsValue;
    onChange: (v: CiapFieldsValue) => void;
    disabled?: boolean;
    maxDiag?: number;   // default 5
    maxProc?: number;   // default 5
};

function addUnique(list: string[], code: string, limit?: number) {
    const c = code.toUpperCase().trim();
    if (!c) return list;
    if (list.includes(c)) return list;
    const novo = [...list, c];
    return typeof limit === "number" ? novo.slice(0, limit) : novo;
}

function removeFrom(list: string[], code: string) {
    const c = code.toUpperCase().trim();
    return list.filter(x => x !== c);
}

export default function CiapFields({
                                       value,
                                       onChange,
                                       disabled = false,
                                       maxDiag = 5,
                                       maxProc = 5
                                   }: Props) {
    const [qRfe, setQRfe] = useState("");
    const [qDiag, setQDiag] = useState("");
    const [qProc, setQProc] = useState("");

    // Resultados filtrados por faixa de componente
    const resRfe = useMemo(() => searchCiap(qRfe).filter(i => getFaixa(i.codigo) === "RFE"), [qRfe]);
    const resDiag = useMemo(() => searchCiap(qDiag).filter(i => getFaixa(i.codigo) === "DIAGNOSTICO"), [qDiag]);
    const resProc = useMemo(() => searchCiap(qProc).filter(i => getFaixa(i.codigo) === "PROCESSO"), [qProc]);

    const addRfe = (it: CiapItem) => {
        if (disabled) return;
        onChange({
            ...value,
            ciapRfe: [it.codigo], // mantém apenas 1
        });
    };

    const addDiag = (it: CiapItem) => {
        if (disabled) return;
        onChange({
            ...value,
            ciapDiagnosticos: addUnique(value.ciapDiagnosticos, it.codigo, maxDiag),
        });
    };

    const addProc = (it: CiapItem) => {
        if (disabled) return;
        onChange({
            ...value,
            ciapProcedimentos: addUnique(value.ciapProcedimentos, it.codigo, maxProc),
        });
    };

    const remRfe = (code: string) => onChange({ ...value, ciapRfe: [] });
    const remDiag = (code: string) => onChange({ ...value, ciapDiagnosticos: removeFrom(value.ciapDiagnosticos, code) });
    const remProc = (code: string) => onChange({ ...value, ciapProcedimentos: removeFrom(value.ciapProcedimentos, code) });

    const Chip = ({ code, onRemove }: { code: string; onRemove: (c: string) => void }) => (
        <Badge className="flex items-center gap-2 text-xs">
            <span>{code}</span>
            {!disabled && (
                <button type="button" onClick={() => onRemove(code)} className="ml-1 opacity-80 hover:opacity-100">
                    <X className="w-3 h-3" />
                </button>
            )}
        </Badge>
    );

    const List = ({ items, onPick }: { items: CiapItem[]; onPick: (it: CiapItem) => void }) => (
        <ul className="border rounded-md max-h-48 overflow-auto text-sm divide-y">
            {items.length === 0 && <li className="p-2 text-gray-500">Sem resultados…</li>}
            {items.map((i) => (
                <li key={i.codigo}>
                    <button
                        type="button"
                        onClick={() => onPick(i)}
                        disabled={disabled}
                        className="w-full text-left p-2 hover:bg-gray-50"
                        title={`${i.codigo} — ${i.titulo}`}
                    >
                        <span className="font-medium mr-2">{i.codigo}</span>
                        <span className="text-gray-600">{i.titulo}</span>
                    </button>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="space-y-6">
            {/* RFE */}
            <div>
                <div className="text-sm font-semibold mb-1">RFE — Motivo do Encontro (01–29)</div>
                {/* Chips selecionados */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {value.ciapRfe.length > 0 ? (
                        <Chip code={value.ciapRfe[0]} onRemove={remRfe} />
                    ) : (
                        <span className="text-xs text-gray-500">Nenhum RFE selecionado</span>
                    )}
                </div>
                <Input
                    value={qRfe}
                    onChange={(e) => setQRfe(e.target.value)}
                    placeholder="Buscar por código (ex.: A01) ou termo…"
                    disabled={disabled}
                    className="mb-2"
                />
                {qRfe && <List items={resRfe} onPick={addRfe} />}
            </div>

            {/* Diagnósticos */}
            <div>
                <div className="text-sm font-semibold mb-1">Diagnósticos (70–99) — até 5</div>
                <div className="flex flex-wrap gap-2 mb-2">
                    {value.ciapDiagnosticos.length === 0 && (
                        <span className="text-xs text-gray-500">Nenhum diagnóstico selecionado</span>
                    )}
                    {value.ciapDiagnosticos.map(c => <Chip key={c} code={c} onRemove={remDiag} />)}
                </div>
                <Input
                    value={qDiag}
                    onChange={(e) => setQDiag(e.target.value)}
                    placeholder="Buscar por código (ex.: K86) ou termo…"
                    disabled={disabled}
                    className="mb-2"
                />
                {qDiag && <List items={resDiag} onPick={addDiag} />}
            </div>

            {/* Processos / Procedimentos */}
            <div>
                <div className="text-sm font-semibold mb-1">Processos/Procedimentos (30–69) — opcional (até 5)</div>
                <div className="flex flex-wrap gap-2 mb-2">
                    {value.ciapProcedimentos.length === 0 && (
                        <span className="text-xs text-gray-500">Nenhum procedimento selecionado</span>
                    )}
                    {value.ciapProcedimentos.map(c => <Chip key={c} code={c} onRemove={remProc} />)}
                </div>
                <Input
                    value={qProc}
                    onChange={(e) => setQProc(e.target.value)}
                    placeholder="Buscar por código (ex.: A32) ou termo…"
                    disabled={disabled}
                    className="mb-2"
                />
                {qProc && <List items={resProc} onPick={addProc} />}
            </div>
        </div>
    );
}
