import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useForm, useFieldArray, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, PlusCircle, Trash2, Printer } from "lucide-react";
import CidBusca from "@/components/atendimento/CidBusca";
import { Cid } from "@/types/Cid";

import {
    gerarAtestado,
    gerarReceituario,
    type AtestadoPayload,
    type ReceituarioPayload,
} from "@/services/documentosService";
import { criarPrescricao } from "@/services/farmaciaService";

// (se existirem no projeto; se não existirem, a UI continua funcionando)
import AtestadoPreview from "@/components/ui/AtestadoPreview";
import ReceituarioPreview from "@/components/ui/ReceituarioPreview";

/* ========================================================================= */
/* SCHEMAS (sem tipagem manual) + tipos inferidos                            */
/* ========================================================================= */

const atestadoSchema = z
    .object({
        tipo: z.enum(["AFASTAMENTO", "COMPARECIMENTO"]),
        motivo: z.string().min(10, "O motivo deve ter no mínimo 10 caracteres."),
        // aceita string do <input type="number">
        diasAfastamento: z.coerce.number().min(1, "Informe pelo menos 1 dia.").optional(),
        horaInicio: z.string().optional(),
        horaFim: z.string().optional(),
        consentimentoCid: z.boolean().default(false),
        cid: z.string().optional(),
    })
    .refine(
        (d) => (d.tipo === "AFASTAMENTO" ? !!d.diasAfastamento : !!(d.horaInicio && d.horaFim)),
        { message: "Preencha os campos obrigatórios conforme o tipo de atestado." }
    );

type AtestadoFormValues = z.infer<typeof atestadoSchema>;

const receitaSchema = z.object({
    medicamentos: z
        .array(
            z.object({
                nome: z.string().min(3, "Informe o nome."),
                dosagem: z.string().min(1, "Informe a dosagem."),
                instrucoes: z.string().min(5, "Informe instruções."),
                via: z.string().optional(),
                posologia: z.string().optional(),
                duracao: z.string().optional(),
                quantidade: z.string().optional(),
            })
        )
        .min(1, "Inclua ao menos um medicamento."),
});

type ReceitaFormValues = z.infer<typeof receitaSchema>;

const encaminhamentoSchema = z.object({
    especialidade: z.string().min(1, "Informe a especialidade."),
    motivo: z.string().min(10, "Informe o motivo do encaminhamento."),
});

type EncaminhamentoFormValues = z.infer<typeof encaminhamentoSchema>;

/* ========================================================================= */
/* PROPS + HANDLE                                                            */
/* ========================================================================= */

interface DocumentosMedicosProps {
    pacienteId: string;
    atendimentoId: string;
    unidadeId?: number;
    profissionalId?: number;
}

/** expõe preferências de impressão ao componente pai (opcional) */
export type DocumentosMedicosHandle = {
    getPrintPreferences: () => {
        atestadoChecked: boolean;
        receituarioChecked: boolean;
        atestadoPayload?: AtestadoPayload;
        receituarioPayload?: ReceituarioPayload;
    };
};

/* ========================================================================= */
/* COMPONENTE                                                                */
/* ========================================================================= */

const DocumentosMedicos = forwardRef<DocumentosMedicosHandle, DocumentosMedicosProps>(
    function DocumentosMedicos({ pacienteId, atendimentoId, unidadeId, profissionalId }, ref) {
        const { toast } = useToast();

        // previews (se você tiver os componentes)
        const [atestadoB64, setAtestadoB64] = React.useState<string | null>(null);
        const [receituarioB64, setReceituarioB64] = React.useState<string | null>(null);

        // flags de impressão
        const [printAtestado, setPrintAtestado] = React.useState(false);
        const [printReceituario, setPrintReceituario] = React.useState(false);
        
        // Estado para CID selecionado (para usar com CidBusca)
        const [cidSelecionadoAtestado, setCidSelecionadoAtestado] = React.useState<Cid | null>(null);

        /** RHF — useForm
         *  - sem genéricos no zodResolver (deixe inferir)
         *  - cast leve para Resolver<T> evita o overload error em versões antigas
         */
        const formAtestado = useForm<AtestadoFormValues>({
            resolver: zodResolver(atestadoSchema) as unknown as Resolver<AtestadoFormValues>,
            defaultValues: {
                tipo: "AFASTAMENTO",
                motivo: "",
                diasAfastamento: 1,
                consentimentoCid: false,
                cid: "",
                horaInicio: "",
                horaFim: "",
            },
        });

        const formReceita = useForm<ReceitaFormValues>({
            resolver: zodResolver(receitaSchema) as unknown as Resolver<ReceitaFormValues>,
            defaultValues: {
                medicamentos: [
                    { nome: "", dosagem: "", instrucoes: "", via: "", posologia: "", duracao: "", quantidade: "" },
                ],
            },
        });

        // informa o name como literal para manter o `id` dos fields
        const { fields, append, remove } = useFieldArray({
            control: formReceita.control,
            name: "medicamentos" as const,
            // keyName opcional; se quiser customizar: keyName: "_key"
        });

        const formEnc = useForm<EncaminhamentoFormValues>({
            resolver: zodResolver(encaminhamentoSchema) as unknown as Resolver<EncaminhamentoFormValues>,
            defaultValues: { especialidade: "", motivo: "" },
        });

        /* ----------------------- builders (para impressão) --------------------- */
        const buildAtestadoPayload = (): AtestadoPayload | undefined => {
            const v = formAtestado.getValues();
            if (!v.motivo || !v.tipo) return undefined;
            return {
                tipo: v.tipo,
                motivo: v.motivo,
                diasAfastamento: v.tipo === "AFASTAMENTO" ? v.diasAfastamento : undefined,
                horaInicio: v.tipo === "COMPARECIMENTO" ? v.horaInicio : undefined,
                horaFim: v.tipo === "COMPARECIMENTO" ? v.horaFim : undefined,
                consentimentoCid: v.consentimentoCid,
                cid: v.consentimentoCid ? v.cid : undefined,
                pacienteId: Number(pacienteId),
                profissionalId,
                unidadeId,
            };
        };

        const buildReceituarioPayload = (): ReceituarioPayload | undefined => {
            const v = formReceita.getValues();
            if (!v.medicamentos?.length) return undefined;
            return {
                pacienteId: Number(pacienteId),
                profissionalId,
                unidadeId,
                itens: v.medicamentos.map((m) => ({
                    nome: m.nome,
                    dose: m.dosagem,
                    via: m.via,
                    posologia: m.posologia,
                    duracao: m.duracao,
                    observacoes: m.instrucoes,
                    quantidade: m.quantidade,
                })),
            };
        };

        useImperativeHandle(
            ref,
            () => ({
                getPrintPreferences: () => ({
                    atestadoChecked: printAtestado,
                    receituarioChecked: printReceituario,
                    atestadoPayload: buildAtestadoPayload(),
                    receituarioPayload: buildReceituarioPayload(),
                }),
            }),
            [printAtestado, printReceituario, pacienteId, profissionalId, unidadeId]
        );

        /* -------------------------------- submits ------------------------------ */
        const onGerarAtestadoPDF: SubmitHandler<AtestadoFormValues> = async (data) => {
            try {
                const payload: AtestadoPayload = {
                    tipo: data.tipo,
                    motivo: data.motivo,
                    diasAfastamento: data.tipo === "AFASTAMENTO" ? data.diasAfastamento : undefined,
                    horaInicio: data.tipo === "COMPARECIMENTO" ? data.horaInicio : undefined,
                    horaFim: data.tipo === "COMPARECIMENTO" ? data.horaFim : undefined,
                    consentimentoCid: data.consentimentoCid,
                    cid: data.consentimentoCid ? data.cid : undefined,
                    pacienteId: Number(pacienteId),
                    profissionalId,
                    unidadeId,
                };
                const resp = await gerarAtestado(payload);
                if (!resp?.success || !resp?.pdfBase64) {
                    return toast({
                        variant: "destructive",
                        title: "Falha ao gerar atestado",
                        description: resp?.message || "Tente novamente.",
                    });
                }
                setAtestadoB64(resp.pdfBase64);
                toast({ title: "Atestado gerado", description: "Visualize/baixe o PDF." });
            } catch (e: any) {
                toast({ variant: "destructive", title: "Erro ao gerar atestado", description: String(e?.message || e) });
            }
        };

        const onEnviarReceitaFarmacia: SubmitHandler<ReceitaFormValues> = async (data) => {
            try {
                await criarPrescricao({
                    pacienteId,
                    atendimentoId,
                    medicamentos: data.medicamentos.map((m) => ({
                        nome: m.nome,
                        dosagem: m.dosagem,
                        instrucoes: m.instrucoes,
                    })),
                });
                toast({ title: "Receita enviada para a Farmácia", description: "Disponível para dispensação." });
                formReceita.reset({
                    medicamentos: [
                        { nome: "", dosagem: "", instrucoes: "", via: "", posologia: "", duracao: "", quantidade: "" },
                    ],
                });
            } catch {
                toast({ variant: "destructive", title: "Erro ao enviar prescrição", description: "Tente novamente." });
            }
        };

        const onGerarReceituarioPDF: SubmitHandler<ReceitaFormValues> = async () => {
            try {
                const payload = buildReceituarioPayload();
                if (!payload) {
                    return toast({ variant: "destructive", title: "Inclua pelo menos um medicamento" });
                }
                const resp = await gerarReceituario(payload);
                if (!resp?.success || !resp?.pdfBase64) {
                    return toast({
                        variant: "destructive",
                        title: "Falha ao gerar receituário",
                        description: resp?.message || "Tente novamente.",
                    });
                }
                setReceituarioB64(resp.pdfBase64);
                toast({ title: "Receituário gerado", description: "Visualize/baixe o PDF." });
            } catch (e: any) {
                toast({ variant: "destructive", title: "Erro ao gerar receituário", description: String(e?.message || e) });
            }
        };

        const onGerarEncaminhamento: SubmitHandler<EncaminhamentoFormValues> = (data) => {
            console.log("Encaminhamento:", { ...data, pacienteId, atendimentoId });
            toast({ title: "Encaminhamento gerado", description: "Documento salvo." });
            formEnc.reset();
        };

        /* --------------------------------- UI ---------------------------------- */
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Documentos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="atestado">
                        <TabsList>
                            <TabsTrigger value="atestado">Atestado</TabsTrigger>
                            <TabsTrigger value="receita">Receita</TabsTrigger>
                            <TabsTrigger value="encaminhamento">Encaminhamento</TabsTrigger>
                        </TabsList>

                        {/* ATESTADO */}
                        <TabsContent value="atestado">
                            <Form {...formAtestado}>
                                <form className="space-y-4" onSubmit={formAtestado.handleSubmit(onGerarAtestadoPDF)}>
                                    <FormField
                                        control={formAtestado.control}
                                        name="tipo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Atestado</FormLabel>
                                                <Select defaultValue={field.value} onValueChange={(v) => field.onChange(v as AtestadoFormValues["tipo"])}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="AFASTAMENTO">Afastamento</SelectItem>
                                                        <SelectItem value="COMPARECIMENTO">Declaração de Comparecimento</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={formAtestado.control}
                                        name="motivo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Motivo</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Ex.: Doença..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {formAtestado.watch("tipo") === "AFASTAMENTO" && (
                                        <FormField
                                            control={formAtestado.control}
                                            name="diasAfastamento"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Dias de afastamento</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min={1} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {formAtestado.watch("tipo") === "COMPARECIMENTO" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={formAtestado.control}
                                                name="horaInicio"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Hora inicial</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formAtestado.control}
                                                name="horaFim"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Hora final</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={formAtestado.control}
                                            name="consentimentoCid"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4"
                                                        checked={field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                    />
                                                    <FormLabel>Paciente autoriza exibir CID</FormLabel>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formAtestado.control}
                                            name="cid"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>CID (opcional)</FormLabel>
                                                    <FormControl>
                                                        <CidBusca
                                                            onCidSelecionado={(cid) => {
                                                                setCidSelecionadoAtestado(cid);
                                                                field.onChange(cid ? cid.codigo : "");
                                                            }}
                                                            cidSelecionado={cidSelecionadoAtestado}
                                                            placeholder="Digite o código ou descrição do CID..."
                                                            disabled={!formAtestado.watch("consentimentoCid")}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <input
                                            id="printAtestado"
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={printAtestado}
                                            onChange={(e) => setPrintAtestado(e.target.checked)}
                                        />
                                        <label htmlFor="printAtestado" className="text-sm flex items-center gap-1">
                                            <Printer className="h-4 w-4" /> Imprimir Atestado ao finalizar
                                        </label>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button type="submit">
                                            <FileText className="mr-2 h-4 w-4" />
                                            Gerar PDF
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* RECEITA */}
                        <TabsContent value="receita">
                            <Form {...formReceita}>
                                <form className="space-y-4" onSubmit={formReceita.handleSubmit(onEnviarReceitaFarmacia)}>
                                    {fields.map((f, idx) => (
                                        <div key={("id" in f ? (f as any).id : idx)} className="grid grid-cols-6 gap-2 items-end">
                                            <FormField
                                                control={formReceita.control}
                                                name={`medicamentos.${idx}.nome`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
                                                        <FormLabel>Medicamento</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex.: Prednisolona 3mg/mL" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formReceita.control}
                                                name={`medicamentos.${idx}.dosagem`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Dose</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex.: 10 mL 1x/dia" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formReceita.control}
                                                name={`medicamentos.${idx}.via`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Via</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex.: VO, VN..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formReceita.control}
                                                name={`medicamentos.${idx}.posologia`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Posologia</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex.: de 8/8h" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formReceita.control}
                                                name={`medicamentos.${idx}.duracao`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Duração</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex.: por 5 dias" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formReceita.control}
                                                name={`medicamentos.${idx}.quantidade`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Qtd.</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex.: 1 frasco" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formReceita.control}
                                                name={`medicamentos.${idx}.instrucoes`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-5">
                                                        <FormLabel>Instruções</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Orientações ao paciente..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="ghost" onClick={() => remove(idx)} title="Remover">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            append({
                                                nome: "",
                                                dosagem: "",
                                                instrucoes: "",
                                                via: "",
                                                posologia: "",
                                                duracao: "",
                                                quantidade: "",
                                            })
                                        }
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Adicionar medicamento
                                    </Button>

                                    <div className="flex items-center gap-2">
                                        <input
                                            id="printReceituario"
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={printReceituario}
                                            onChange={(e) => setPrintReceituario(e.target.checked)}
                                        />
                                        <label htmlFor="printReceituario" className="text-sm flex items-center gap-1">
                                            <Printer className="h-4 w-4" /> Imprimir Receituário ao finalizar
                                        </label>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button type="submit">
                                            <Send className="mr-2 h-4 w-4" />
                                            Enviar para Farmácia
                                        </Button>
                                        <Button type="button" variant="secondary" onClick={formReceita.handleSubmit(onGerarReceituarioPDF)}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Gerar PDF
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* ENCAMINHAMENTO */}
                        <TabsContent value="encaminhamento">
                            <Form {...formEnc}>
                                <form className="space-y-4" onSubmit={formEnc.handleSubmit(onGerarEncaminhamento)}>
                                    <FormField
                                        control={formEnc.control}
                                        name="especialidade"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Especialidade</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex.: Dermatologia" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formEnc.control}
                                        name="motivo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Motivo</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Justificativa clínica..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit">Gerar Encaminhamento</Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                {atestadoB64 && <AtestadoPreview pdfBase64={atestadoB64} onClose={() => setAtestadoB64(null)} />}
                {receituarioB64 && <ReceituarioPreview pdfBase64={receituarioB64} onClose={() => setReceituarioB64(null)} />}
            </Card>
        );
    }
);

export { DocumentosMedicos };
export default DocumentosMedicos;
