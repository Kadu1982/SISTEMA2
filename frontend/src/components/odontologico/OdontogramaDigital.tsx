import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, RotateCcw, Save } from "lucide-react";
import type { Dente, TipoTratamento } from "@/types/odontologia";
import { CORES_TRATAMENTO } from "@/types/odontologia";

interface OdontogramaDigitalProps {
    value?: Dente[];
    onChange?: (dentes: Dente[]) => void;
    onSalvar?: (dentes: Dente[]) => Promise<void> | void;
    readOnly?: boolean;
}

const ComponenteDente: React.FC<{
    dente: Dente;
    readOnly?: boolean;
    onEstadoChange: (numero: number, estado: TipoTratamento) => void;
}> = ({ dente, onEstadoChange, readOnly }) => {
    const [showMenu, setShowMenu] = useState(false);
    return (
        <div className="relative">
            <div
                className={`w-8 h-10 rounded cursor-pointer border-2 border-gray-300 flex items-center justify-center text-xs font-medium transition-all ${
                    readOnly ? "" : "hover:scale-110"
                }`}
                style={{ backgroundColor: CORES_TRATAMENTO[dente.estado] }}
                onClick={() => !readOnly && setShowMenu((v) => !v)}
                title={`Dente ${dente.numero} - ${dente.estado}`}
            >
                {dente.numero}
            </div>
            {!readOnly && showMenu && (
                <div className="absolute top-12 left-0 z-10 bg-white border rounded shadow-lg p-2 min-w-32">
                    {(Object.keys(CORES_TRATAMENTO) as Array<TipoTratamento>).map((tipo) => (
                        <button
                            key={tipo}
                            className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm capitalize"
                            onClick={() => {
                                onEstadoChange(dente.numero, tipo);
                                setShowMenu(false);
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: CORES_TRATAMENTO[tipo] }} />
                                {tipo}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const OdontogramaDigital: React.FC<OdontogramaDigitalProps> = ({
                                                                   value,
                                                                   onChange,
                                                                   onSalvar,
                                                                   readOnly = false,
                                                               }) => {
    const [dentes, setDentes] = useState<Dente[]>(() => {
        const out: Dente[] = [];
        for (let i = 18; i >= 11; i--) out.push({ numero: i, estado: "sadio" });
        for (let i = 21; i <= 28; i++) out.push({ numero: i, estado: "sadio" });
        for (let i = 48; i >= 41; i--) out.push({ numero: i, estado: "sadio" });
        for (let i = 31; i <= 38; i++) out.push({ numero: i, estado: "sadio" });
        return out;
    });

    useEffect(() => { if (value && value.length) setDentes(value); }, [value]);

    const update = (next: Dente[]) => { setDentes(next); onChange?.(next); };

    const handleEstadoChange = (numero: number, novoEstado: TipoTratamento) => {
        update(dentes.map((d) => (d.numero === numero ? { ...d, estado: novoEstado } : d)));
    };

    const resetarOdontograma = () => { update(dentes.map((d) => ({ ...d, estado: "sadio" as TipoTratamento }))); };

    const salvarOdontograma = async () => {
        try { if (onSalvar) await onSalvar(dentes); else console.log("💾 Salvando odontograma:", dentes); }
        catch (e) { console.error("Erro ao salvar odontograma", e); }
    };

    const superiores = dentes.slice(0, 16);
    const inferiores = dentes.slice(16, 32);

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Odontograma Digital
                    </CardTitle>
                    {!readOnly && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={resetarOdontograma} className="flex items-center gap-2">
                                <RotateCcw className="h-4 w-4" /> Resetar
                            </Button>
                            <Button size="sm" onClick={salvarOdontograma} className="flex items-center gap-2">
                                <Save className="h-4 w-4" /> Salvar
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded">
                    {(Object.entries(CORES_TRATAMENTO) as Array<[TipoTratamento, string]>).map(([tipo, cor]) => (
                        <div key={tipo} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: cor }} />
                            <span className="text-sm capitalize">{tipo}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-8">
                    <div className="text-center">
                        <h3 className="text-sm font-medium mb-3">Arcada Superior</h3>
                        <div className="flex justify-center gap-1">
                            {superiores.map((d) => (
                                <ComponenteDente key={d.numero} dente={d} readOnly={readOnly} onEstadoChange={handleEstadoChange} />
                            ))}
                        </div>
                    </div>

                    <div className="border-t-2 border-gray-300 mx-8" />

                    <div className="text-center">
                        <h3 className="text-sm font-medium mb-3">Arcada Inferior</h3>
                        <div className="flex justify-center gap-1">
                            {inferiores.map((d) => (
                                <ComponenteDente key={d.numero} dente={d} readOnly={readOnly} onEstadoChange={handleEstadoChange} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-3 bg-blue-50 rounded">
                    <h4 className="font-medium text-sm mb-2">Resumo dos Tratamentos:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {(Object.keys(CORES_TRATAMENTO) as Array<TipoTratamento>).map((tipo) => {
                            const q = dentes.filter((d) => d.estado === tipo).length;
                            return (
                                <div key={tipo} className="flex justify-between">
                                    <span className="capitalize">{tipo}:</span>
                                    <span className="font-medium">{q}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OdontogramaDigital;
