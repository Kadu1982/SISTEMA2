// frontend/src/components/prescricao/PrescricaoMedicamentoForm.tsx
// Componente completo para prescrição detalhada de medicamentos

import React, { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Pill } from "lucide-react";

import RemumeBusca from "@/components/atendimento/RemumeBusca";
import { MedicamentoRemume } from "@/types/Remume";
import { PrescricaoMedicamento, TipoPrescricao, UNIDADES_MEDIDA, VIAS_ADMINISTRACAO, APRAZAMENTOS } from "@/types/Prescricao";

// Schema de validação para uma prescrição
const prescricaoSchema = z.object({
    tipoPrescricao: z.enum(['INTERNO', 'EXTERNO']),
    medicamentoCodigo: z.string().optional(),
    medicamentoNome: z.string().min(1, "Medicamento é obrigatório"),
    principioAtivoId: z.number().optional(),
    principioAtivo: z.string().min(1, "Princípio ativo é obrigatório"),
    numeroReceita: z.number().optional(),
    medicamentoControlado: z.boolean().default(false),
    quantidade: z.number().min(0).optional(),
    unidade: z.string().optional(),
    viaAdministracao: z.string().optional(),
    dataHoraInicial: z.string().optional(),
    dataHoraFinal: z.string().optional(),
    duracaoDias: z.number().min(1).optional(),
    aprazamento: z.string().optional(),
    instrucaoDosagem: z.string().optional(),
    observacoes: z.string().optional(),
});

// Schema para múltiplas prescrições
const prescricoesSchema = z.object({
    prescricoes: z.array(prescricaoSchema).min(0),
});

type PrescricoesFormData = z.infer<typeof prescricoesSchema>;

interface PrescricaoMedicamentoFormProps {
    value?: PrescricaoMedicamento[];
    onChange?: (prescricoes: PrescricaoMedicamento[]) => void;
    disabled?: boolean;
    atendimentoId?: number;
}

export const PrescricaoMedicamentoForm: React.FC<PrescricaoMedicamentoFormProps> = ({
    value = [],
    onChange,
    disabled = false,
    atendimentoId,
}) => {
    const form = useForm<PrescricoesFormData>({
        resolver: zodResolver(prescricoesSchema),
        defaultValues: {
            prescricoes: value.length > 0 ? value : [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "prescricoes",
    });

    // Refs para evitar loops infinitos
    const previousValueRef = useRef<string>(JSON.stringify(value));
    const onChangeRef = useRef(onChange);
    const previousPrescricoesRef = useRef<string>('');
    const isInitialMount = useRef(true);
    const isResettingRef = useRef(false);
    
    // Estado para medicamentos selecionados por índice (para ocultar mensagens de busca)
    const [medicamentosSelecionados, setMedicamentosSelecionados] = useState<Map<number, MedicamentoRemume | null>>(new Map());
    
    // Atualiza ref quando onChange muda
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Sincroniza valor externo apenas quando realmente mudar
    useEffect(() => {
        const currentValueStr = JSON.stringify(value || []);
        if (currentValueStr !== previousValueRef.current) {
            previousValueRef.current = currentValueStr;
            isResettingRef.current = true; // Flag para evitar notificação durante reset
            if (value && value.length > 0) {
                form.reset({ prescricoes: value });
            } else {
                form.reset({ prescricoes: [] });
            }
            // Reset da flag após um pequeno delay para permitir que o watch atualize
            setTimeout(() => {
                isResettingRef.current = false;
                previousPrescricoesRef.current = JSON.stringify(form.getValues("prescricoes"));
            }, 0);
        }
    }, [value]); // Removido 'form' das dependências - form.reset é estável

    // Notifica mudanças usando watch com comparação para evitar loops
    const prescricoes = form.watch("prescricoes");
    
    useEffect(() => {
        // Ignora durante reset ou primeiro render
        if (isResettingRef.current) {
            return;
        }
        
        // Ignora o primeiro render para evitar chamada inicial desnecessária
        if (isInitialMount.current) {
            isInitialMount.current = false;
            previousPrescricoesRef.current = JSON.stringify(prescricoes);
            return;
        }
        
        const currentPrescricoesStr = JSON.stringify(prescricoes);
        if (currentPrescricoesStr !== previousPrescricoesRef.current) {
            previousPrescricoesRef.current = currentPrescricoesStr;
            // Usa ref para evitar dependência de onChange
            onChangeRef.current?.(prescricoes);
        }
    }, [prescricoes]); // Removido 'onChange' das dependências

    // Adiciona nova prescrição
    const handleAdicionarPrescricao = () => {
        append({
            tipoPrescricao: 'EXTERNO',
            medicamentoNome: '',
            principioAtivo: '',
            medicamentoControlado: false,
            quantidade: undefined,
            unidade: undefined,
            viaAdministracao: undefined,
            aprazamento: undefined,
            duracaoDias: undefined,
        });
    };

    // Gera instrução de dosagem automaticamente
    const gerarInstrucaoDosagem = (index: number) => {
        const prescricao = form.getValues(`prescricoes.${index}`);
        if (!prescricao.quantidade || !prescricao.unidade || !prescricao.viaAdministracao || !prescricao.duracaoDias) {
            return;
        }

        const qtd = prescricao.quantidade;
        const unidade = prescricao.unidade;
        const via = prescricao.viaAdministracao;
        const dias = prescricao.duracaoDias;

        // Usa aprazamento se disponível, senão calcula intervalo baseado na duração
        let intervalo = '';
        if (prescricao.aprazamento) {
            // Converte valor do aprazamento para texto legível
            const aprazamentoOption = APRAZAMENTOS.find(a => a.value === prescricao.aprazamento);
            if (aprazamentoOption) {
                // Formata para uso na instrução (ex: "DE 8/8 H" ou "1X AO DIA")
                const label = aprazamentoOption.label;
                if (label.includes('Hora') || label.includes('Horas')) {
                    intervalo = `DE ${label.replace(' ', ' ').toUpperCase()}`;
                } else {
                    intervalo = label.toUpperCase();
                }
            } else {
                // Fallback: converte formato interno para legível
                intervalo = prescricao.aprazamento
                    .replace(/_/g, '/')
                    .replace('HORA', 'H')
                    .replace('HORAS', 'H')
                    .replace('X_AO_DIA', 'X AO DIA');
                if (!intervalo.startsWith('DE ') && !intervalo.includes('AO DIA')) {
                    intervalo = `DE ${intervalo}`;
                }
            }
        } else {
            // Calcula intervalo baseado na duração (fallback)
            if (dias === 1) {
                intervalo = '1X AO DIA';
            } else if (dias === 2) {
                intervalo = 'DE 12/12 H';
            } else if (dias >= 3) {
                // Assume 3x ao dia para tratamentos de 3+ dias
                intervalo = 'DE 8/8 H';
            }
        }

        const instrucao = `${qtd} ${unidade} ${via} ${intervalo} POR ${dias} ${dias === 1 ? 'DIA' : 'DIAS'}`;
        form.setValue(`prescricoes.${index}.instrucaoDosagem`, instrucao);
    };

    return (
        <Form {...form}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Pill className="h-5 w-5" />
                            Prescrição de Medicamentos
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Adicione medicamentos com posologia detalhada
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={handleAdicionarPrescricao}
                    disabled={disabled}
                    size="sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Medicamento
                </Button>
            </div>

            {fields.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                        <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma prescrição adicionada</p>
                        <p className="text-sm mt-1">Clique em "Adicionar Medicamento" para começar</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <Card key={field.id} className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        Medicamento {index + 1}
                                    </CardTitle>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            remove(index);
                                            // Remove o medicamento selecionado quando a prescrição é removida
                                            setMedicamentosSelecionados(prev => {
                                                const newMap = new Map(prev);
                                                newMap.delete(index);
                                                // Reindexa os medicamentos após a remoção
                                                const reindexed = new Map<number, MedicamentoRemume | null>();
                                                Array.from(newMap.entries()).forEach(([key, value]) => {
                                                    if (key < index) {
                                                        reindexed.set(key, value);
                                                    } else if (key > index) {
                                                        reindexed.set(key - 1, value);
                                                    }
                                                });
                                                return reindexed;
                                            });
                                        }}
                                        disabled={disabled}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Tipo de Prescrição */}
                                <FormField
                                    control={form.control}
                                    name={`prescricoes.${index}.tipoPrescricao`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Prescrição *</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex gap-6"
                                                    disabled={disabled}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="INTERNO" id={`interno-${index}`} />
                                                        <Label htmlFor={`interno-${index}`} className="cursor-pointer">
                                                            Interno (na unidade)
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="EXTERNO" id={`externo-${index}`} />
                                                        <Label htmlFor={`externo-${index}`} className="cursor-pointer">
                                                            Externo (para casa)
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                {/* Busca de Medicamento */}
                                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
                                    <Label className="text-sm font-semibold text-blue-900 mb-2 block">
                                        Medicamento *
                                    </Label>
                                    <RemumeBusca
                                        onMedicamentoSelecionado={(medicamento: MedicamentoRemume | null) => {
                                            if (medicamento) {
                                                form.setValue(`prescricoes.${index}.medicamentoNome`, 
                                                    `${medicamento.codigo || ''} - ${medicamento.nome} ${medicamento.apresentacao || ''} - ${medicamento.formaFarmaceutica || ''}`);
                                                form.setValue(`prescricoes.${index}.medicamentoCodigo`, medicamento.codigo || '');
                                                form.setValue(`prescricoes.${index}.principioAtivo`, medicamento.principioAtivo || '');
                                                form.setValue(`prescricoes.${index}.principioAtivoId`, medicamento.id);
                                                // Armazena o medicamento selecionado para ocultar mensagens
                                                setMedicamentosSelecionados(prev => {
                                                    const newMap = new Map(prev);
                                                    newMap.set(index, medicamento);
                                                    return newMap;
                                                });
                                            } else {
                                                setMedicamentosSelecionados(prev => {
                                                    const newMap = new Map(prev);
                                                    newMap.delete(index);
                                                    return newMap;
                                                });
                                            }
                                        }}
                                        medicamentoSelecionado={medicamentosSelecionados.get(index) || null}
                                        placeholder="Digite o nome do medicamento ou princípio ativo..."
                                        disabled={disabled}
                                    />
                                </div>

                                {/* Receita e Controlado */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`prescricoes.${index}.numeroReceita`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Receita</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        value={field.value || ''}
                                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        placeholder="Número da receita"
                                                        disabled={disabled}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`prescricoes.${index}.medicamentoControlado`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={disabled}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="cursor-pointer">
                                                        Medicamento controlado
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Princípio Ativo */}
                                <FormField
                                    control={form.control}
                                    name={`prescricoes.${index}.principioAtivo`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Princípio Ativo *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Princípio ativo do medicamento"
                                                    disabled={disabled}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                {/* Posologia */}
                                <div>
                                    <Label className="text-sm font-semibold mb-3 block">Posologia</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Quantidade */}
                                        <FormField
                                            control={form.control}
                                            name={`prescricoes.${index}.quantidade`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Qtd.</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            step="0.01"
                                                            value={field.value || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value ? parseFloat(e.target.value) : undefined;
                                                                field.onChange(val);
                                                                if (val) gerarInstrucaoDosagem(index);
                                                            }}
                                                            placeholder="0,00"
                                                            disabled={disabled}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Unidade */}
                                        <FormField
                                            control={form.control}
                                            name={`prescricoes.${index}.unidade`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unidade</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            gerarInstrucaoDosagem(index);
                                                        }}
                                                        value={field.value || ''}
                                                        disabled={disabled}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {UNIDADES_MEDIDA.map((unidade) => (
                                                                <SelectItem key={unidade.value} value={unidade.value}>
                                                                    {unidade.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Via */}
                                        <FormField
                                            control={form.control}
                                            name={`prescricoes.${index}.viaAdministracao`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Via</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            gerarInstrucaoDosagem(index);
                                                        }}
                                                        value={field.value || ''}
                                                        disabled={disabled}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {VIAS_ADMINISTRACAO.map((via) => (
                                                                <SelectItem key={via.value} value={via.value}>
                                                                    {via.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Data/Hora Inicial e Final */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <FormField
                                            control={form.control}
                                            name={`prescricoes.${index}.dataHoraInicial`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Hora Inicial</FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="date"
                                                                value={field.value ? field.value.split('T')[0] : ''}
                                                                onChange={(e) => {
                                                                    const date = e.target.value;
                                                                    const time = field.value?.split('T')[1] || '07:00';
                                                                    field.onChange(date ? `${date}T${time}` : undefined);
                                                                }}
                                                                disabled={disabled}
                                                                className="flex-1"
                                                            />
                                                            <Input
                                                                type="time"
                                                                value={field.value?.split('T')[1] || '07:00'}
                                                                onChange={(e) => {
                                                                    const time = e.target.value;
                                                                    const date = field.value?.split('T')[0] || new Date().toISOString().split('T')[0];
                                                                    field.onChange(`${date}T${time}`);
                                                                }}
                                                                disabled={disabled}
                                                                className="w-32"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`prescricoes.${index}.dataHoraFinal`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Hora Final</FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="date"
                                                                value={field.value ? field.value.split('T')[0] : ''}
                                                                onChange={(e) => {
                                                                    const date = e.target.value;
                                                                    const time = field.value?.split('T')[1] || '07:00';
                                                                    field.onChange(date ? `${date}T${time}` : undefined);
                                                                }}
                                                                disabled={disabled}
                                                                className="flex-1"
                                                            />
                                                            <Input
                                                                type="time"
                                                                value={field.value?.split('T')[1] || '07:00'}
                                                                onChange={(e) => {
                                                                    const time = e.target.value;
                                                                    const date = field.value?.split('T')[0] || new Date().toISOString().split('T')[0];
                                                                    field.onChange(`${date}T${time}`);
                                                                }}
                                                                disabled={disabled}
                                                                className="w-32"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Aprazamento e Durante */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <FormField
                                            control={form.control}
                                            name={`prescricoes.${index}.aprazamento`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Aprazamento</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            gerarInstrucaoDosagem(index);
                                                        }}
                                                        value={field.value || ''}
                                                        disabled={disabled}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione o aprazamento..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {APRAZAMENTOS.map((aprazamento) => (
                                                                <SelectItem key={aprazamento.value} value={aprazamento.value}>
                                                                    {aprazamento.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`prescricoes.${index}.duracaoDias`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Durante</FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                value={field.value || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value ? parseInt(e.target.value) : undefined;
                                                                    field.onChange(val);
                                                                    if (val) gerarInstrucaoDosagem(index);
                                                                }}
                                                                placeholder="Dias"
                                                                min="1"
                                                                disabled={disabled}
                                                                className="flex-1"
                                                            />
                                                            <Select value="DIAS" disabled>
                                                                <SelectTrigger className="w-32">
                                                                    <SelectValue>Dias</SelectValue>
                                                                </SelectTrigger>
                                                            </Select>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Instrução de Dosagem Gerada */}
                                    <FormField
                                        control={form.control}
                                        name={`prescricoes.${index}.instrucaoDosagem`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Instrução de Dosagem</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Ex: 1 CP VO DE 8/8 H POR 7 DIAS"
                                                        rows={2}
                                                        disabled={disabled}
                                                        className="font-mono text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Observações */}
                                <FormField
                                    control={form.control}
                                    name={`prescricoes.${index}.observacoes`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Observações</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Observações adicionais sobre a prescrição..."
                                                    rows={2}
                                                    disabled={disabled}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            </div>
        </Form>
    );
};

export default PrescricaoMedicamentoForm;

