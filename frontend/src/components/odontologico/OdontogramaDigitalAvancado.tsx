import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Heart,
    RotateCcw,
    Save,
    History,
    Edit,
    X,
    Calendar,
    User,
    FileText,
} from "lucide-react";
import type { Dente, TipoTratamento, Face, TratamentoHistorico } from "@/types/odontologia";
import {
    CORES_TRATAMENTO,
    LABELS_TRATAMENTO,
    FACES_LIST,
    gerarDentesPermanentes,
} from "@/types/odontologia";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DenteSVG from "./DenteSVG";

interface OdontogramaDigitalAvancadoProps {
    value?: Dente[];
    onChange?: (dentes: Dente[]) => void;
    onSalvar?: (dentes: Dente[]) => Promise<void> | void;
    readOnly?: boolean;
}

// Componente de dente individual com visualização SVG realista
const ComponenteDenteAvancado: React.FC<{
    dente: Dente;
    readOnly?: boolean;
    onEstadoChange: (numero: number, estado: TipoTratamento, faces?: Face[]) => void;
    onHistoricoClick: (dente: Dente) => void;
    onEditarClick: (dente: Dente) => void;
}> = ({ dente, onEstadoChange, onHistoricoClick, onEditarClick, readOnly }) => {
    const [showMenu, setShowMenu] = useState(false);
    const label = LABELS_TRATAMENTO[dente.estado];

    const handleDenteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!readOnly) {
            setShowMenu((v) => !v);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="relative group">
            {/* Dente SVG Realista */}
            <div
                className={`relative cursor-pointer transition-all ${
                    readOnly ? "" : "hover:scale-110 hover:z-10"
                }`}
                onClick={handleDenteClick}
                title={`Dente ${dente.numero} - ${label}${dente.faces?.length ? ` (Faces: ${dente.faces.join(", ")})` : ""}`}
            >
                <DenteSVG
                    dente={dente}
                    size={45}
                    className="drop-shadow-sm pointer-events-auto"
                />
            </div>

            {/* Overlay para fechar menu ao clicar fora - deve vir ANTES do menu para não bloquear */}
            {!readOnly && showMenu && (
                <div
                    className="fixed inset-0 z-[100]"
                    onClick={handleOverlayClick}
                />
            )}

            {/* Menu de ações */}
            {!readOnly && showMenu && (
                <div 
                    className="absolute top-14 left-0 z-[200] bg-white border-2 border-gray-300 rounded-lg shadow-xl p-3 min-w-48"
                    onClick={handleMenuClick}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">Dente {dente.numero}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Estados rápidos */}
                    <div className="space-y-1 mb-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Estado Rápido:</div>
                        {(["sadio", "carie", "obturado", "perdido"] as TipoTratamento[]).map((tipo) => (
                            <button
                                key={tipo}
                                type="button"
                                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-sm flex items-center gap-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEstadoChange(dente.numero, tipo);
                                    setShowMenu(false);
                                }}
                            >
                                <div
                                    className="w-4 h-4 rounded border"
                                    style={{ backgroundColor: CORES_TRATAMENTO[tipo] }}
                                />
                                <span>{LABELS_TRATAMENTO[tipo]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Ações */}
                    <div className="border-t pt-2 space-y-1">
                        <button
                            type="button"
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-sm flex items-center gap-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditarClick(dente);
                                setShowMenu(false);
                            }}
                        >
                            <Edit className="h-4 w-4" />
                            Editar Detalhes
                        </button>
                        <button
                            type="button"
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-sm flex items-center gap-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                onHistoricoClick(dente);
                                setShowMenu(false);
                            }}
                        >
                            <History className="h-4 w-4" />
                            Ver Histórico
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Dialog para editar dente
const DialogEditarDente: React.FC<{
    dente: Dente | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (dente: Dente) => void;
}> = ({ dente, open, onOpenChange, onSave }) => {
    const [estado, setEstado] = useState<TipoTratamento>("sadio");
    const [faces, setFaces] = useState<Face[]>([]);
    const [observacoes, setObservacoes] = useState("");

    useEffect(() => {
        if (dente) {
            setEstado(dente.estado);
            setFaces(dente.faces || []);
            setObservacoes(dente.observacoes || "");
        }
    }, [dente]);

    const handleToggleFace = (face: Face) => {
        setFaces((prev) => (prev.includes(face) ? prev.filter((f) => f !== face) : [...prev, face]));
    };

    const handleSave = () => {
        if (dente) {
            onSave({
                ...dente,
                estado,
                faces: faces.length > 0 ? faces : undefined,
                observacoes: observacoes || undefined,
                dataUltimoTratamento: new Date().toISOString(),
            });
            onOpenChange(false);
        }
    };

    if (!dente) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Dente {dente.numero}</DialogTitle>
                    <DialogDescription>
                        Configure o estado, faces afetadas e observações do dente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Estado */}
                    <div>
                        <Label>Estado do Dente</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {(Object.keys(CORES_TRATAMENTO) as TipoTratamento[]).map((tipo) => (
                                <button
                                    key={tipo}
                                    type="button"
                                    className={`p-2 rounded border-2 transition-all ${
                                        estado === tipo
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    onClick={() => setEstado(tipo)}
                                >
                                    <div
                                        className="w-full h-6 rounded mb-1"
                                        style={{ backgroundColor: CORES_TRATAMENTO[tipo] }}
                                    />
                                    <span className="text-xs">{LABELS_TRATAMENTO[tipo]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Faces */}
                    <div>
                        <Label>Faces Afetadas</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {FACES_LIST.map(({ key, label }) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`face-${key}`}
                                        checked={faces.includes(key)}
                                        onCheckedChange={() => handleToggleFace(key)}
                                    />
                                    <Label
                                        htmlFor={`face-${key}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {key} - {label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Observações */}
                    <div>
                        <Label>Observações</Label>
                        <Textarea
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            placeholder="Anotações sobre o dente..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Dialog para histórico
const DialogHistorico: React.FC<{
    dente: Dente | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}> = ({ dente, open, onOpenChange }) => {
    if (!dente) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Histórico - Dente {dente.numero}</DialogTitle>
                    <DialogDescription>
                        Histórico completo de tratamentos realizados neste dente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {dente.historico && dente.historico.length > 0 ? (
                        dente.historico
                            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                            .map((tratamento, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 border rounded-lg bg-gray-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                style={{
                                                    backgroundColor: CORES_TRATAMENTO[tratamento.tipo],
                                                }}
                                            >
                                                {LABELS_TRATAMENTO[tratamento.tipo]}
                                            </Badge>
                                            {tratamento.faces && tratamento.faces.length > 0 && (
                                                <Badge variant="outline">
                                                    Faces: {tratamento.faces.join(", ")}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(tratamento.data), "dd/MM/yyyy", { locale: ptBR })}
                                        </div>
                                    </div>
                                    {tratamento.profissional && (
                                        <div className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                                            <User className="h-3 w-3" />
                                            {tratamento.profissional}
                                        </div>
                                    )}
                                    {tratamento.observacoes && (
                                        <div className="text-sm text-gray-700 mt-2">
                                            <FileText className="h-3 w-3 inline mr-1" />
                                            {tratamento.observacoes}
                                        </div>
                                    )}
                                </div>
                            ))
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            Nenhum histórico registrado para este dente.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const OdontogramaDigitalAvancado: React.FC<OdontogramaDigitalAvancadoProps> = ({
    value,
    onChange,
    onSalvar,
    readOnly = false,
}) => {
    const { toast } = useToast();
    const [dentes, setDentes] = useState<Dente[]>(() => gerarDentesPermanentes());
    const [denteEditando, setDenteEditando] = useState<Dente | null>(null);
    const [denteHistorico, setDenteHistorico] = useState<Dente | null>(null);
    const [dialogEditarOpen, setDialogEditarOpen] = useState(false);
    const [dialogHistoricoOpen, setDialogHistoricoOpen] = useState(false);

    useEffect(() => {
        if (value && value.length > 0) {
            setDentes(value);
        }
    }, [value]);

    const update = useCallback(
        (next: Dente[]) => {
            setDentes(next);
            onChange?.(next);
        },
        [onChange]
    );

    const handleEstadoChange = useCallback(
        (numero: number, novoEstado: TipoTratamento, faces?: Face[]) => {
            update(
                dentes.map((d) =>
                    d.numero === numero
                        ? {
                              ...d,
                              estado: novoEstado,
                              faces: faces || d.faces,
                              dataUltimoTratamento: new Date().toISOString(),
                          }
                        : d
                )
            );
        },
        [dentes, update]
    );

    const handleEditarDente = useCallback((dente: Dente) => {
        setDenteEditando(dente);
        setDialogEditarOpen(true);
    }, []);

    const handleSalvarEdicao = useCallback(
        (denteEditado: Dente) => {
            const historico: TratamentoHistorico = {
                data: new Date().toISOString(),
                tipo: denteEditado.estado,
                faces: denteEditado.faces,
                observacoes: denteEditado.observacoes,
            };

            update(
                dentes.map((d) =>
                    d.numero === denteEditado.numero
                        ? {
                              ...denteEditado,
                              historico: [...(d.historico || []), historico],
                          }
                        : d
                )
            );

            toast({
                title: "Dente atualizado",
                description: `Dente ${denteEditado.numero} foi atualizado com sucesso.`,
            });
        },
        [dentes, update, toast]
    );

    const handleHistoricoClick = useCallback((dente: Dente) => {
        setDenteHistorico(dente);
        setDialogHistoricoOpen(true);
    }, []);

    const resetarOdontograma = () => {
        update(dentes.map((d) => ({ ...d, estado: "sadio" as TipoTratamento, faces: undefined })));
        toast({
            title: "Odontograma resetado",
            description: "Todos os dentes foram marcados como sãos.",
        });
    };

    const salvarOdontograma = async () => {
        try {
            if (onSalvar) {
                await onSalvar(dentes);
                toast({
                    title: "Odontograma salvo",
                    description: "O odontograma foi salvo com sucesso.",
                });
            } else {
                console.log("💾 Salvando odontograma:", dentes);
                toast({
                    title: "Odontograma atualizado",
                    description: "As alterações foram mantidas no estado da página.",
                });
            }
        } catch (e) {
            console.error("Erro ao salvar odontograma", e);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível salvar o odontograma.",
                variant: "destructive",
            });
        }
    };

    // Ordenar dentes na mesma ordem do Simples Dental: 18-11, 21-28, 48-41, 31-38
    // A função gerarDentesPermanentes já gera na ordem correta, então apenas filtramos e mantemos a ordem
    const ordemDentes = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
    const dentesOrdenados = ordemDentes.map(num => dentes.find(d => d.numero === num)).filter((d): d is Dente => d !== undefined);

    // Estatísticas
    const estatisticas = {
        sadio: dentes.filter((d) => d.estado === "sadio").length,
        carie: dentes.filter((d) => d.estado === "carie").length,
        obturado: dentes.filter((d) => d.estado === "obturado").length,
        perdido: dentes.filter((d) => d.estado === "perdido" || d.estado === "ausente").length,
        tratado: dentes.filter((d) => d.estado !== "sadio" && d.estado !== "perdido" && d.estado !== "ausente").length,
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            Odontograma Digital Avançado
                        </CardTitle>
                        {!readOnly && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetarOdontograma}
                                    className="flex items-center gap-2"
                                >
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
                    {/* Legenda com exemplos visuais */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                            {(Object.entries(CORES_TRATAMENTO) as Array<[TipoTratamento, string]>)
                                .slice(0, 8)
                                .map(([tipo, cor]) => {
                                    const denteExemplo: Dente = {
                                        numero: 11,
                                        estado: tipo,
                                        faces: tipo === "carie" ? ["M", "O"] : undefined,
                                    };
                                    return (
                                        <div key={tipo} className="flex flex-col items-center gap-2 p-2 bg-white rounded border">
                                            <DenteSVG dente={denteExemplo} size={40} />
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded border" style={{ backgroundColor: cor }} />
                                                <span className="text-xs font-medium capitalize">{LABELS_TRATAMENTO[tipo]}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                            <strong>Dica:</strong> Clique em um dente para ver opções de tratamento e editar detalhes
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-5 gap-2 p-3 bg-blue-50 rounded-lg">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{estatisticas.sadio}</div>
                            <div className="text-xs text-gray-600">Sãos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{estatisticas.carie}</div>
                            <div className="text-xs text-gray-600">Cáries</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{estatisticas.obturado}</div>
                            <div className="text-xs text-gray-600">Obturados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{estatisticas.perdido}</div>
                            <div className="text-xs text-gray-600">Perdidos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{estatisticas.tratado}</div>
                            <div className="text-xs text-gray-600">Tratados</div>
                        </div>
                    </div>

                    {/* Odontograma - Estrutura igual ao Simples Dental com separação de arcadas */}
                    <div className="sd-tratamentos-odontograma__dentes" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px' }}>
                        {/* Arcada Superior */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', borderBottom: '2px dashed #e5e7eb', paddingBottom: '16px' }}>
                            <div style={{ width: '100%', textAlign: 'center', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                                Arcada Superior
                            </div>
                            {dentesOrdenados.filter(d => d.numero >= 11 && d.numero <= 28).map((d) => (
                                <ComponenteDenteAvancado
                                    key={d.numero}
                                    dente={d}
                                    readOnly={readOnly}
                                    onEstadoChange={handleEstadoChange}
                                    onHistoricoClick={handleHistoricoClick}
                                    onEditarClick={handleEditarDente}
                                />
                            ))}
                        </div>

                        {/* Arcada Inferior */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                            <div style={{ width: '100%', textAlign: 'center', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                                Arcada Inferior
                            </div>
                            {dentesOrdenados.filter(d => d.numero >= 31 && d.numero <= 48).map((d) => (
                                <ComponenteDenteAvancado
                                    key={d.numero}
                                    dente={d}
                                    readOnly={readOnly}
                                    onEstadoChange={handleEstadoChange}
                                    onHistoricoClick={handleHistoricoClick}
                                    onEditarClick={handleEditarDente}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <DialogEditarDente
                dente={denteEditando}
                open={dialogEditarOpen}
                onOpenChange={setDialogEditarOpen}
                onSave={handleSalvarEdicao}
            />

            <DialogHistorico
                dente={denteHistorico}
                open={dialogHistoricoOpen}
                onOpenChange={setDialogHistoricoOpen}
            />
        </>
    );
};

export default OdontogramaDigitalAvancado;
export type { Dente };

