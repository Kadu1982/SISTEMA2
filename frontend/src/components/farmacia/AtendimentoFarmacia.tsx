// AULA: O código foi mantido em sua maior parte, pois a lógica de UI está correta.
// A correção crucial foi feita na função `handleBuscarPrescricoes` para mapear
// os dados da API para o formato que o formulário espera, e no `useEffect` para
// usar os nomes de campo corretos.

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { buscarPrescricoesPendentes, dispensarPrescricao, criarDispensacaoAvulsa } from '@/services/farmaciaService';
// AULA: Agora importamos `Prescricao` e `MedicamentoItem` do nosso arquivo de tipos corrigido.
import { Prescricao } from '@/types/Prescricao';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Search, Loader2, PlusCircle, Trash2, Pill, FilePlus2, XCircle } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { format } from "date-fns";
import PacienteBusca from '@/components/agendamento/PacienteBusca';
import { Paciente } from '@/types/paciente/Paciente';

const dispensacaoSchema = z.object({
  medicamentos: z.array(
      z.object({
        // AULA: Os nomes aqui (nome, dosagem, instrucoes) devem ser os mesmos da interface `MedicamentoItem`
        nome: z.string().min(1, "Nome é obrigatório."),
        dosagem: z.string().min(1, "Dosagem é obrigatória."),
        instrucoes: z.string().min(1, "Instruções são obrigatórias."),
      })
  ).min(1, "A dispensação deve ter pelo menos um item."),
});

type DispensacaoFormData = z.infer<typeof dispensacaoSchema>;

export function AtendimentoFarmacia() {
  const { toast } = useToast();
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prescricaoAtiva, setPrescricaoAtiva] = useState<Prescricao | null>(null);
  const [isModoAvulso, setIsModoAvulso] = useState(false);

  const form = useForm<DispensacaoFormData>({
    resolver: zodResolver(dispensacaoSchema),
    defaultValues: { medicamentos: [] }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "medicamentos"
  });

  useEffect(() => {
    if (prescricaoAtiva) {
      // AULA: O `replace` agora funciona, pois `prescricaoAtiva.medicamentos`
      // tem o formato exato que o formulário (`useFieldArray`) espera.
      replace(prescricaoAtiva.medicamentos);
      setIsModoAvulso(false);
    }
  }, [prescricaoAtiva, replace]);

  const resetState = (keepPaciente: boolean = false) => {
    setPrescricaoAtiva(null);
    setIsModoAvulso(false);
    if (!keepPaciente) {
      setPacienteSelecionado(null);
    }
    form.reset({ medicamentos: [] });
  };

  const handleBuscarPrescricoes = async (paciente: Paciente) => {
    if (!paciente?.id) {
      toast({ variant: 'destructive', title: 'Atenção', description: 'Por favor, selecione um paciente.' });
      return;
    }

    const idParaBusca = String(paciente.id);
    setIsLoading(true);
    setPrescricaoAtiva(null);
    setIsModoAvulso(false);
    form.reset({ medicamentos: [] });

    try {
      // A API pode retornar um DTO com nomes de campos diferentes (ex: `posologia`).
      // Precisamos mapeá-los para os nomes que nosso formulário espera (`instrucoes`).
      const prescricoesFromApi = await buscarPrescricoesPendentes(idParaBusca);

      if (prescricoesFromApi.length > 0) {
        const prescricaoOriginal = prescricoesFromApi[0];

        // AULA: PONTO CRÍTICO DA CORREÇÃO!
        // Mapeamos os dados da API para o formato que o nosso formulário e estado esperam.
        // Isso cria uma camada de proteção: se a API mudar, só precisamos ajustar aqui.
        const prescricaoFormatada: Prescricao = {
          ...prescricaoOriginal,
          medicamentos: prescricaoOriginal.medicamentos.map(item => ({
            // Assumindo que a API retorna 'nome', 'dosagem', 'instrucoes'.
            // Se a API retornasse 'medicamentoNome', 'quantidade', 'posologia', o mapeamento seria:
            // nome: item.medicamentoNome,
            // dosagem: item.quantidade.toString(),
            // instrucoes: item.posologia,
            ...item // Se os nomes já baterem, podemos simplificar com o spread operator.
          }))
        };

        setPrescricaoAtiva(prescricaoFormatada);
        toast({ title: 'Prescrição Encontrada', description: `Prescrição pendente carregada para o paciente ${paciente.nomeCompleto}.` });
      } else {
        toast({ title: 'Nenhuma Prescrição Pendente', description: `Nenhuma prescrição pendente para ${paciente.nomeCompleto}. Você pode iniciar uma dispensação avulsa.` });
      }
    } catch (error) {
      console.error("Erro ao buscar prescrições:", error);
      toast({ variant: 'destructive', title: 'Erro na Busca', description: 'Não foi possível buscar as prescrições.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIniciarAvulsa = () => {
    setPrescricaoAtiva(null);
    setIsModoAvulso(true);
    replace([{ nome: '', dosagem: '', instrucoes: '' }]);
    form.reset({ medicamentos: [{ nome: '', dosagem: '', instrucoes: '' }] });
  };

  const handleCancelar = () => {
    resetState();
    toast({ title: 'Ação Cancelada' });
  };

  const onDispensar = async (data: DispensacaoFormData) => {
    setIsLoading(true);
    try {
      if (isModoAvulso) {
        if (!pacienteSelecionado?.id) {
          toast({ variant: 'destructive', title: 'Erro', description: 'Paciente não selecionado para dispensação avulsa.' });
          setIsLoading(false);
          return;
        }
        await criarDispensacaoAvulsa({ pacienteId: String(pacienteSelecionado.id), medicamentos: data.medicamentos });
        toast({ title: 'Dispensação Avulsa Registrada', description: 'A baixa de itens foi registrada com sucesso.' });
      } else if (prescricaoAtiva) {
        await dispensarPrescricao(prescricaoAtiva.id, data.medicamentos);
        toast({ title: 'Prescrição Dispensada', description: 'A baixa da prescrição foi registrada com sucesso.' });
      }
      resetState();
    } catch (error) {
      console.error("Erro ao dispensar:", error);
      toast({ variant: 'destructive', title: 'Erro na Dispensação', description: 'Não foi possível registrar a operação.' });
    } finally {
      setIsLoading(false);
    }
  };

  const modoDispensacaoAtivo = !!prescricaoAtiva || isModoAvulso;

  return (
      <div className="space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Atendimento da Farmácia</CardTitle>
            <CardDescription>Busque o paciente para ver prescrições ou iniciar uma dispensação avulsa.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <PacienteBusca
                onPacienteSelecionado={(paciente) => {
                  setPacienteSelecionado(paciente);
                  if (paciente) {
                    handleBuscarPrescricoes(paciente);
                  }
                }}
                placeholder="Digite o nome ou CPF do paciente..."
                pacienteSelecionado={pacienteSelecionado}
              />
            </div>
          </CardContent>
        </Card>

        {!modoDispensacaoAtivo && pacienteSelecionado && !isLoading && !prescricaoAtiva && (
            <Card>
              <CardHeader>
                <CardTitle>Paciente: {pacienteSelecionado.nomeCompleto}</CardTitle>
                <CardDescription>Nenhuma prescrição pendente encontrada para este paciente.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleIniciarAvulsa}><FilePlus2 className="mr-2 h-4 w-4" /> Iniciar Dispensação Avulsa</Button>
                <Button variant="outline" onClick={() => resetState()}><Search className="mr-2 h-4 w-4" /> Buscar Outro Paciente</Button>
              </CardContent>
            </Card>
        )}

        {modoDispensacaoAtivo && (
            <Card>
              <CardHeader>
                <CardTitle>{isModoAvulso ? 'Dispensação Avulsa' : `Dispensar Prescrição`}</CardTitle>
                <CardDescription>
                  {isModoAvulso
                      ? `Para o paciente: ${pacienteSelecionado?.nomeCompleto}. Adicione os medicamentos/insumos.`
                      : `Prescrição de ${prescricaoAtiva?.nomeMedico} em ${format(new Date(prescricaoAtiva!.data), "dd/MM/yyyy 'às' HH:mm")}. Verifique os itens.`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onDispensar)} className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="rounded-lg border p-4 space-y-4 relative bg-slate-50 dark:bg-slate-800">
                          {isModoAvulso && fields.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                              </Button>
                          )}
                          <FormField control={form.control} name={`medicamentos.${index}.nome`} render={({ field }) => (<FormItem><FormLabel>Medicamento/Insumo</FormLabel><FormControl><Input placeholder="Ex: Amoxicilina 500mg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name={`medicamentos.${index}.dosagem`} render={({ field }) => (<FormItem><FormLabel>Dosagem/Quantidade</FormLabel><FormControl><Input placeholder="Ex: 1 comprimido / 10 unidades" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name={`medicamentos.${index}.instrucoes`} render={({ field }) => (<FormItem><FormLabel>Instruções/Observações</FormLabel><FormControl><Textarea placeholder="Ex: Tomar 1 a cada 8 horas por 7 dias" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    ))}
                    {form.formState.errors.medicamentos && !form.formState.errors.medicamentos.root && ( <FormMessage>{form.formState.errors.medicamentos.message}</FormMessage>)}
                    {form.formState.errors.medicamentos?.root?.message && ( <p className="text-sm font-medium text-destructive">{form.formState.errors.medicamentos.root.message}</p>)}

                    <div className="flex justify-between items-center pt-4 flex-wrap gap-4">
                      {isModoAvulso && <Button type="button" variant="outline" size="sm" onClick={() => append({ nome: "", dosagem: "", instrucoes: "" })} disabled={isLoading}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item</Button>}
                      {/* Placeholder para alinhar o botão à direita quando o botão de adicionar some */}
                      {!isModoAvulso && <div/>}
                      <div className="flex gap-2 sm:gap-4">
                        <Button type="button" variant="ghost" onClick={handleCancelar} disabled={isLoading}><XCircle className="mr-2 h-4 w-4"/>Cancelar</Button>
                        <Button type="submit" disabled={isLoading || !form.formState.isDirty || !form.formState.isValid}>
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pill className="mr-2 h-4 w-4" />}
                          Confirmar Dispensação
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
        )}

        {!pacienteSelecionado && !isLoading && !modoDispensacaoAtivo && (
            <Alert className="mt-6"><Pill className="h-4 w-4" /><AlertTitle>Aguardando Paciente</AlertTitle><AlertDescription>Busque um paciente pelo nome ou CPF no campo acima para carregar prescrições ou iniciar uma dispensação avulsa.</AlertDescription></Alert>
        )}
      </div>
  );
}