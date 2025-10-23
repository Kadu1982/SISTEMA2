// src/components/atendimento/CidBusca.tsx
// -----------------------------------------------------------------------------
// Busca de CID-10 com:
// - debounce estável
// - cache em memória por termo
// - heurística para código (A00, B24.1, etc.) x descrição
// - normalização de múltiplos formatos de resposta
// - navegação por teclado (↑/↓/Enter) + ESC para fechar
// - clique fora para fechar
// - sem alterar identidade visual do seu componente (Input/Card/Badge/etc.)
// -----------------------------------------------------------------------------

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Loader2 } from "lucide-react";
import { Cid } from "@/types/Cid";
import apiService from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

interface CidBuscaProps {
    onCidSelecionado: (cid: Cid | null) => void;
    cidSelecionado: Cid | null;
    placeholder?: string;
    disabled?: boolean;
    /** caracteres mínimos para iniciar a busca (padrão: 2) */
    minChars?: number;
}

const CidBusca: React.FC<CidBuscaProps> = ({
                                               onCidSelecionado,
                                               cidSelecionado,
                                               placeholder = "Digite o código ou descrição do CID...",
                                               disabled = false,
                                               minChars = 2,
                                           }) => {
    const [busca, setBusca] = useState("");
    const [resultados, setResultados] = useState<Cid[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResultados, setShowResultados] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1); // item destacado na lista

    // refs
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastRequestId = useRef(0); // para ignorar respostas antigas
    const cacheRef = useRef<Map<string, Cid[]>>(new Map()); // cache por termo normalizado

    const { toast } = useToast();

    // ----------------------------- efeitos -----------------------------------

    // Mostra o texto do CID selecionado quando vier por prop
    useEffect(() => {
        if (cidSelecionado) {
            setBusca(`${cidSelecionado.codigo} - ${cidSelecionado.descricao}`);
            setShowResultados(false);
            setActiveIndex(-1);
        }
    }, [cidSelecionado]);

    // Clique fora fecha a lista
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowResultados(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Debounce de busca
    useEffect(() => {
        // limpa último timer
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const termo = busca.trim();
        if (termo.length >= minChars) {
            debounceRef.current = setTimeout(() => {
                void buscarCids(termo);
            }, 450);
        } else {
            setResultados([]);
            setShowResultados(false);
            setActiveIndex(-1);
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busca, minChars]);

    // --------------------------- utilidades -----------------------------------

    const isCodigoCid = (t: string) => /^[A-Z]\d{2}(\.\d)?$/i.test(t.trim());

    /** Normaliza diversos formatos de resposta para `Cid[]` */
    const normalizeResponse = (data: any): Cid[] => {
        let arr: any[] = [];
        if (Array.isArray(data)) arr = data;
        else if (Array.isArray(data?.resultados)) arr = data.resultados;
        else if (Array.isArray(data?.items)) arr = data.items;
        else if (Array.isArray(data?.itens)) arr = data.itens;
        else if (Array.isArray(data?.content)) arr = data.content;

        return (arr || []).map((cid: any, idx: number) => ({
            id: cid.id ?? idx + 1,
            codigo: cid.codigo ?? cid.code ?? cid.cid ?? "",
            descricao: cid.descricao ?? cid.description ?? cid.nome ?? "",
            categoria: cid.categoria ?? cid.category ?? undefined,
        })) as Cid[];
    };

    // ------------------------------ busca -------------------------------------

    const buscarCids = async (termo: string) => {
        const tnorm = termo.toLowerCase();

        // cache
        if (cacheRef.current.has(tnorm)) {
            setResultados(cacheRef.current.get(tnorm) || []);
            setShowResultados(true);
            setActiveIndex(-1);
            return;
        }

        setIsLoading(true);
        const myReq = ++lastRequestId.current;

        try {
            const params: Record<string, string | number> = { limite: 10 };
            if (isCodigoCid(termo)) params.codigo = termo.toUpperCase();
            else params.descricao = termo;

            // endpoint único conforme seu arquivo anterior
            const { data } = await apiService.get("/cid10/buscar", { params });

            // ignora resposta antiga
            if (myReq !== lastRequestId.current) return;

            const cids = normalizeResponse(data).slice(0, 10);
            cacheRef.current.set(tnorm, cids);
            setResultados(cids);
            setShowResultados(true);
            setActiveIndex(cids.length ? 0 : -1);
        } catch (error: any) {
            // tenta fallback com 'termo'
            try {
                const { data } = await apiService.get("/cid10/buscar", { params: { termo, limite: 10 } });
                if (myReq !== lastRequestId.current) return;
                const cids = normalizeResponse(data).slice(0, 10);
                cacheRef.current.set(tnorm, cids);
                setResultados(cids);
                setShowResultados(true);
                setActiveIndex(cids.length ? 0 : -1);
            } catch {
                if (myReq !== lastRequestId.current) return;
                setResultados([]);
                setShowResultados(false);
                setActiveIndex(-1);
                if (termo.length >= 3) {
                    toast({
                        title: "CID não encontrado",
                        description: `Não foi possível encontrar CIDs para "${termo}".`,
                        variant: "destructive",
                    });
                }
            }
        } finally {
            if (myReq === lastRequestId.current) setIsLoading(false);
        }
    };

    // --------------------------- handlers UI ----------------------------------

    const handleSelecionarCid = (cid: Cid) => {
        onCidSelecionado(cid);
        setBusca(`${cid.codigo} - ${cid.descricao}`);
        setShowResultados(false);
        setResultados([]);
        setActiveIndex(-1);
    };

    const handleLimpar = () => {
        setBusca("");
        setResultados([]);
        setShowResultados(false);
        setActiveIndex(-1);
        onCidSelecionado(null);
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setBusca(valor);
        if (!valor.trim()) onCidSelecionado(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showResultados || resultados.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i < resultados.length - 1 ? i + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i > 0 ? i - 1 : resultados.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < resultados.length) {
                handleSelecionarCid(resultados[activeIndex]);
            }
        } else if (e.key === "Escape") {
            setShowResultados(false);
            setActiveIndex(-1);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* INPUT */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={busca}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pl-10 pr-10"
                    onFocus={() => {
                        if (resultados.length > 0) setShowResultados(true);
                    }}
                />

                {/* LOADING */}
                {isLoading && (
                    <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}

                {/* LIMPAR */}
                {busca && !isLoading && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={handleLimpar}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* RESULTADOS */}
            {showResultados && resultados.length > 0 && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto shadow-lg">
                    <CardContent className="p-0">
                        {resultados.map((cid, idx) => {
                            const active = idx === activeIndex;
                            return (
                                <div
                                    key={cid.id ?? cid.codigo}
                                    className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                                        active ? "bg-blue-50" : "hover:bg-gray-50"
                                    }`}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    onClick={() => handleSelecionarCid(cid)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {cid.codigo}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium line-clamp-2">{cid.descricao}</p>
                                            {cid.categoria && (
                                                <p className="text-xs text-gray-500 mt-1">Categoria: {cid.categoria}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {/* NADA ENCONTRADO */}
            {showResultados && resultados.length === 0 && !isLoading && busca.trim().length >= minChars && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
                    <CardContent className="p-4 text-center text-gray-500">
                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">
                            Nenhum CID encontrado para "<span className="font-medium">{busca}</span>"
                        </p>
                        <p className="text-xs mt-1">Tente usar código (ex.: A00, B24.1) ou descrição.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CidBusca;
