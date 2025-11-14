// src/components/odontologico/ProcedimentosSUS.tsx
// -----------------------------------------------------------------------------
// UI para selecionar procedimentos SIA/SUS no atendimento odontológico
// - Pesquisa com debounce + cache em memória.
// - Adição/edição de quantidade, dente e faces (quando aplicável).
// - Botão "Salvar" (opcional) que chama o serviço se vier atendimentoId.
// - Mantém a identidade visual do seu front (shadcn/tailwind).
// -----------------------------------------------------------------------------

import React from "react";
import { useForm, useFieldArray, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, PlusCircle, Trash2, Loader2, Save } from "lucide-react";

import {
    salvarProcedimentosAtendimento,
    buscarProcedimentos,
} from "@/services/odontologiaService";
import type {
    ProcedimentoSUS,
    ProcedimentoSelecionado,
    Face,
} from "@/types/odontologia";

// ----------------------------- Tipagem do formulário ------------------------
const selecionadoSchema = z.object({
    procedimento: z.object({
        codigo: z.string(),
        descricao: z.string(),
        valor: z.number().optional(),
        exigeDente: z.boolean().optional(),
        exigeFace: z.boolean().optional(),
    }),
    quantidade: z.coerce.number().min(1).default(1),
    dente: z.coerce.number().optional(),
    faces: z.array(z.enum(["M", "D", "O", "V", "P", "L"] as const)).optional(),
    observacao: z.string().optional(),
});

const formSchema = z.object({
    itens: z.array(selecionadoSchema),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
    /** Se informado, o botão "Salvar" persiste no backend */
    atendimentoId?: string | number;
    /** Estado controlado (opcional) */
    value?: ProcedimentoSelecionado[];
    onChange?: (itens: ProcedimentoSelecionado[]) => void;
    readOnly?: boolean;
};

const ProcedimentosSUS: React.FC<Props> = ({ atendimentoId, value, onChange, readOnly = false }) => {
    const { toast } = useToast();

    // ------------------- form + fieldArray para itens selecionados ------------
    const form = useForm<FormValues>({
        // fix RHF: forçar tipo do resolver para a versão do projeto
        resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
        defaultValues: { itens: value ?? [] },
    });

    const { control, watch, setValue, handleSubmit, reset } = form;
    const { fields, append, remove } = useFieldArray({ control, name: "itens" });

    // espelha VALUE externo se mudar
    React.useEffect(() => {
        if (value) reset({ itens: value });
    }, [value, reset]);

    // propaga mudanças para o pai
    const itens = watch("itens");
    React.useEffect(() => {
        onChange?.(itens as ProcedimentoSelecionado[]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(itens)]);

    // ----------------------------- busca com debounce --------------------------
    const [termo, setTermo] = React.useState("");
    const [carregando, setCarregando] = React.useState(false);
    const [resultados, setResultados] = React.useState<ProcedimentoSUS[]>([]);
    const cacheRef = React.useRef<Map<string, ProcedimentoSUS[]>>(new Map());
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastReqRef = React.useRef(0);

    const buscar = async (t: string) => {
        const key = t.trim().toLowerCase();
        if (!key) {
            setResultados([]);
            return;
        }
        if (cacheRef.current.has(key)) {
            setResultados(cacheRef.current.get(key)!);
            return;
        }
        setCarregando(true);
        const myId = ++lastReqRef.current;
        try {
            const data = await buscarProcedimentos(t, 20);
            if (myId !== lastReqRef.current) return; // ignora resposta antiga
            cacheRef.current.set(key, data);
            setResultados(data); // <<<<<< CORRIGIDO (antes havia um espaço acidental: setResultad os)
        } finally {
            if (myId === lastReqRef.current) setCarregando(false);
        }
    };

    React.useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!termo || termo.trim().length < 2) {
            setResultados([]);
            return;
        }
        timerRef.current = setTimeout(() => {
            void buscar(termo);
        }, 400);

        // cleanup sempre retorna void
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [termo]);

    // ------------------------------- handlers ---------------------------------
    const adicionar = (p: ProcedimentoSUS) => {
        if (readOnly) return;
        append({
            procedimento: p,
            quantidade: 1,
            dente: p.exigeDente ? (11 as number) : undefined,
            faces: p.exigeFace ? ([] as Face[]) : undefined,
            observacao: "",
        });
        toast({ title: "Adicionado", description: `${p.codigo} — ${p.descricao}` });
    };

    const onSalvarSubmit: SubmitHandler<FormValues> = async (data) => {
        if (!atendimentoId) {
            toast({
                title: "Lista atualizada",
                description: "Os procedimentos foram mantidos no estado da página.",
            });
            return;
        }
        const resp = await salvarProcedimentosAtendimento(
            atendimentoId,
            data.itens as ProcedimentoSelecionado[]
        );
        if (resp.success) {
            toast({ title: "Procedimentos salvos", description: "Registro enviado ao backend." });
        } else {
            toast({
                title: "Falha ao salvar",
                description: resp.message ?? "Tente novamente.",
                variant: "destructive",
            });
        }
    };

    // ------------------------------- render -----------------------------------
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Procedimentos SIA/SUS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Busca */}
                <div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={termo}
                            onChange={(e) => setTermo(e.target.value)}
                            placeholder="Código ou descrição do procedimento…"
                            className="pl-10"
                            disabled={readOnly}
                        />
                        {carregando && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                        )}
                    </div>

                    {/* Resultados */}
                    {resultados.length > 0 && (
                        <div className="mt-2 border rounded-lg divide-y">
                            {resultados.map((p) => (
                                <div key={p.codigo} className="p-3 flex items-center gap-3">
                                    <Badge className="font-mono">{p.codigo}</Badge>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{p.descricao}</p>
                                        {(p.exigeDente || p.exigeFace) && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {p.exigeDente ? "Exige dente" : ""} {p.exigeDente && p.exigeFace ? "•" : ""} {p.exigeFace ? "Exige face" : ""}
                                            </p>
                                        )}
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => adicionar(p)} disabled={readOnly}>
                                        <PlusCircle className="h-4 w-4 mr-1" /> Adicionar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selecionados */}
                <div className="space-y-3">
                    <div className="font-medium text-sm">Selecionados ({fields.length})</div>
                    {fields.length === 0 ? (
                        <div className="text-xs text-gray-500">Nenhum procedimento adicionado.</div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                            <div className="divide-y">
                                {fields.map((f, idx) => {
                                    const exigeDente = itens[idx]?.procedimento?.exigeDente;
                                    const exigeFace = itens[idx]?.procedimento?.exigeFace;

                                    return (
                                        <div key={f.id} className="p-3">
                                            <div className="grid grid-cols-12 gap-3 items-start">
                                                {/* Código e Descrição */}
                                                <div className="col-span-12 md:col-span-4">
                                                    <Badge className="font-mono text-xs mb-1">{itens[idx]?.procedimento?.codigo}</Badge>
                                                    <p className="text-sm font-medium mt-1">{itens[idx]?.procedimento?.descricao}</p>
                                                </div>

                                                {/* Quantidade e Dente */}
                                                <div className="col-span-6 md:col-span-2">
                                                    <Label className="text-xs mb-1 block">Quantidade</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        className="h-9 text-sm"
                                                        value={itens[idx].quantidade ?? 1}
                                                        onChange={(e) =>
                                                            setValue(`itens.${idx}.quantidade`, Number(e.target.value) || 1)
                                                        }
                                                    />
                                                </div>

                                                <div className="col-span-6 md:col-span-2">
                                                    <Label className="text-xs mb-1 block">Dente</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="11..48"
                                                        className="h-9 text-sm"
                                                        disabled={!exigeDente || readOnly}
                                                        value={itens[idx].dente ?? ""}
                                                        onChange={(e) =>
                                                            setValue(
                                                                `itens.${idx}.dente`,
                                                                e.target.value ? Number(e.target.value) : undefined
                                                            )
                                                        }
                                                    />
                                                </div>

                                                {/* Faces */}
                                                {exigeFace && (
                                                    <div className="col-span-12 md:col-span-3">
                                                        <Label className="text-xs mb-1 block">Faces</Label>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(["M", "D", "O", "V", "P", "L"] as Face[]).map((face) => {
                                                                const atual = new Set(itens[idx].faces ?? []);
                                                                const checked = atual.has(face);
                                                                return (
                                                                    <label key={face} className="flex items-center gap-1 text-xs select-none">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="h-3 w-3"
                                                                            disabled={readOnly}
                                                                            checked={checked}
                                                                            onChange={(e) => {
                                                                                const next = new Set(itens[idx].faces ?? []);
                                                                                if (e.target.checked) next.add(face);
                                                                                else next.delete(face);
                                                                                setValue(`itens.${idx}.faces`, Array.from(next) as Face[]);
                                                                            }}
                                                                        />
                                                                        {face}
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Ações */}
                                                <div className="col-span-12 md:col-span-1 flex justify-end md:justify-start">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-9 w-9"
                                                        onClick={() => remove(idx)}
                                                        disabled={readOnly}
                                                        title="Remover"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Observação - linha inteira */}
                                                <div className="col-span-12">
                                                    <Label className="text-xs mb-1 block">Observações</Label>
                                                    <Textarea
                                                        placeholder="Observações (opcional)…"
                                                        className="text-sm h-20"
                                                        value={itens[idx].observacao ?? ""}
                                                        onChange={(e) => setValue(`itens.${idx}.observacao`, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    {fields.length > 0 && (
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleSubmit(onSalvarSubmit)} disabled={readOnly}>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Procedimentos
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProcedimentosSUS;
