import React, { useMemo, useState } from 'react';
import { searchCiap } from '@/services/ciapService';
import { getFaixa, isCiapCode, CiapComponente, CiapItem } from '@/types/ciap';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Props = {
    label: string;
    placeholder?: string;
    componentePermitido: CiapComponente; // 'RFE' | 'PROCESSO' | 'DIAGNOSTICO'
    multiple?: boolean;
    value: string[];                // lista de códigos selecionados (ex.: ["K86"])
    onChange(value: string[]): void;
    max?: number;                   // limite de itens (ex.: 5)
    required?: boolean;
};

export default function CiapSelector({
                                         label,
                                         placeholder = 'Buscar por código ou termo...',
                                         componentePermitido,
                                         multiple = true,
                                         value,
                                         onChange,
                                         max = 5,
                                         required = false
                                     }: Props) {
    const [q, setQ] = useState('');
    const [results, setResults] = useState<CiapItem[]>([]);

    const restante = max - value.length;

    const doSearch = (term: string) => {
        setQ(term);
        if (term.trim().length < 2) return setResults([]);
        const found = searchCiap(term).filter(i => getFaixa(i.codigo) === componentePermitido);
        setResults(found);
    };

    const add = (code: string) => {
        if (!isCiapCode(code)) return;
        if (getFaixa(code) !== componentePermitido) return;
        if (value.includes(code)) return;
        if (!multiple && value.length >= 1) return;
        if (multiple && value.length >= max) return;
        onChange([...value, code]);
        setQ('');
        setResults([]);
    };

    const remove = (code: string) => onChange(value.filter(c => c !== code));

    const bloqueado = restante <= 0;

    const hint = useMemo(() => {
        if (componentePermitido === 'RFE') return 'Somente códigos 01–29';
        if (componentePermitido === 'PROCESSO') return 'Somente códigos 30–69';
        return 'Somente códigos 70–99';
    }, [componentePermitido]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</label>
                <span className="text-xs text-muted-foreground">{hint}</span>
            </div>

            {/* Selecionados */}
            <div className="flex flex-wrap gap-2">
                {value.map(code => (
                    <Badge key={code} variant="secondary" className="cursor-pointer" onClick={() => remove(code)}>
                        {code} ✕
                    </Badge>
                ))}
                {!value.length && <span className="text-xs text-muted-foreground">Nenhum selecionado</span>}
            </div>

            {/* Busca */}
            <div className="flex gap-2">
                <Input
                    placeholder={placeholder}
                    value={q}
                    onChange={(e) => doSearch(e.target.value)}
                    disabled={bloqueado}
                />
                <Button type="button" onClick={() => add(q.toUpperCase())} disabled={bloqueado || !isCiapCode(q.toUpperCase())}>
                    Adicionar
                </Button>
            </div>

            {!!results.length && (
                <div className="border rounded-md divide-y max-h-56 overflow-auto">
                    {results.map(r => (
                        <button
                            key={r.codigo}
                            type="button"
                            className="w-full text-left p-2 hover:bg-gray-50"
                            onClick={() => add(r.codigo)}
                        >
                            <div className="font-medium">{r.codigo}</div>
                            <div className="text-xs text-muted-foreground">{r.titulo}</div>
                        </button>
                    ))}
                </div>
            )}

            {bloqueado && <p className="text-xs text-muted-foreground">Limite de {max} atingido.</p>}
        </div>
    );
}
