import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, Stethoscope, Building2, Plus, Trash2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import agendamentoExameService, { 
  NovoAgendamentoExameRequest,
  ExameRequest 
} from '@/services/agendamento/agendamentoExameService';
import pacienteService from '@/services/pacienteService';
import horarioExameService, { HorarioExameDTO } from '@/services/agendamento/horarioExameService';

// Schema de validação
const exameSchema = z.object({
  exameCodigo: z.string().min(1, 'Código do exame obrigatório'),
  exameNome: z.string().min(1, 'Nome do exame obrigatório'),
  categoria: z.string().optional(),
  duracaoEstimada: z.number().optional(),
  requerPreparo: z.boolean().optional(),
  descricaoPreparo: z.string().optional(),
  observacoesEspecificas: z.string().optional(),
  materialColeta: z.string().optional(),
  quantidadeMaterial: z.string().optional()
});

const agendamentoSchema = z.object({
  pacienteId: z.number({
    required_error: "Selecione um paciente",
  }),
  dataHoraExame: z.string().min(1, 'Data e hora obrigatórias'),
  horarioExameId: z.number().optional(),
  profissionalId: z.number().optional(),
  salaId: z.number().optional(),
  unidadeId: z.number({
    required_error: "Selecione a unidade",
  }),
  tipoAgendamento: z.enum(['INTERNO', 'EXTERNO', 'AMBOS']),
  origemSolicitacao: z.string().optional(),
  solicitanteNome: z.string().optional(),
  autorizacaoConvenio: z.string().optional(),
  guiaConvenio: z.string().optional(),
  exames: z.array(exameSchema).min(1, 'Adicione pelo menos um exame'),
  observacoes: z.string().optional(),
  preparacaoPaciente: z.string().optional(),
  contatoPaciente: z.string().optional(),
  emailPaciente: z.string().email().optional().or(z.literal('')),
  encaixe: z.boolean().optional(),
  prioridade: z.boolean().optional()
});

type FormData = z.infer<typeof agendamentoSchema>;

interface FormularioAgendamentoExameProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  pacienteId?: number;
  unidadeId?: number;
}

export default function FormularioAgendamentoExame({
  open,
  onOpenChange,
  onSuccess,
  pacienteId: pacienteIdProp,
  unidadeId: unidadeIdProp = 1
}: FormularioAgendamentoExameProps) {
  const [loading, setLoading] = useState(false);
  const [searchingPaciente, setSearchingPaciente] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<HorarioExameDTO[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      pacienteId: pacienteIdProp,
      unidadeId: unidadeIdProp,
      tipoAgendamento: 'INTERNO',
      exames: [],
      encaixe: false,
      prioridade: false
    }
  });

  const examesAgendados = form.watch('exames');

  useEffect(() => {
    if (pacienteIdProp) {
      form.setValue('pacienteId', pacienteIdProp);
    }
  }, [pacienteIdProp, form]);

  // Busca horários disponíveis quando a data é selecionada
  const handleDataChange = async (dataHora: string) => {
    if (!dataHora) return;
    
    try {
      const data = dataHora.split('T')[0];
      const response = await horarioExameService.listarPorData(unidadeIdProp, data);
      setHorarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
    }
  };

  // Busca pacientes
  const buscarPacientes = async (termo: string) => {
    if (termo.length < 3) return;
    
    setSearchingPaciente(true);
    try {
      const response = await pacienteService.buscarPorNomeOuCpf(termo);
      setPacientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast.error('Erro ao buscar pacientes');
    } finally {
      setSearchingPaciente(false);
    }
  };

  // Adiciona exame
  const adicionarExame = () => {
    const novosExames = [...examesAgendados, {
      exameCodigo: '',
      exameNome: '',
      categoria: '',
      duracaoEstimada: 30,
      requerPreparo: false,
      descricaoPreparo: '',
      observacoesEspecificas: '',
      materialColeta: '',
      quantidadeMaterial: ''
    }];
    form.setValue('exames', novosExames);
  };

  // Remove exame
  const removerExame = (index: number) => {
    const novosExames = examesAgendados.filter((_, i) => i !== index);
    form.setValue('exames', novosExames);
  };

  // Atualiza exame
  const atualizarExame = (index: number, campo: keyof ExameRequest, valor: any) => {
    const novosExames = [...examesAgendados];
    novosExames[index] = { ...novosExames[index], [campo]: valor };
    form.setValue('exames', novosExames);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      const request: NovoAgendamentoExameRequest = {
        ...data,
        emailPaciente: data.emailPaciente || undefined
      };
      
      const response = await agendamentoExameService.criar(request);
      
      toast.success(`Agendamento criado com sucesso! Protocolo: ${response.data.protocolo}`);
      
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento de Exame</DialogTitle>
          <DialogDescription>
            Preencha os dados para agendar exames do paciente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção: Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-4 h-4" />
                  Dados do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="pacienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite nome ou CPF do paciente"
                          onChange={(e) => buscarPacientes(e.target.value)}
                          disabled={!!pacienteIdProp}
                        />
                      </FormControl>
                      {pacientes.length > 0 && !pacienteIdProp && (
                        <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                          {pacientes.map((paciente) => (
                            <div
                              key={paciente.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                field.onChange(paciente.id);
                                form.setValue('contatoPaciente', paciente.telefone || '');
                                setPacientes([]);
                              }}
                            >
                              <div className="font-medium">{paciente.nomeCompleto}</div>
                              <div className="text-sm text-gray-600">
                                CPF: {paciente.cpf} | Nascimento: {format(new Date(paciente.dataNascimento), 'dd/MM/yyyy')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contatoPaciente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone de Contato</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(00) 00000-0000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emailPaciente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="paciente@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção: Agendamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-4 h-4" />
                  Dados do Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dataHoraExame"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data e Hora do Exame</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            onChange={(e) => {
                              field.onChange(e);
                              handleDataChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipoAgendamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Agendamento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INTERNO">Interno</SelectItem>
                            <SelectItem value="EXTERNO">Externo</SelectItem>
                            <SelectItem value="AMBOS">Ambos</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="origemSolicitacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origem da Solicitação</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Ambulatório, Internação" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="solicitanteNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Médico Solicitante</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do médico" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="autorizacaoConvenio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Autorização do Convênio</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Número da autorização" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guiaConvenio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guia do Convênio</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Número da guia" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="encaixe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Encaixe
                          </FormLabel>
                          <FormDescription>
                            Marque se for um agendamento de encaixe
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prioridade"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Prioridade
                          </FormLabel>
                          <FormDescription>
                            Marque para agendamento prioritário
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção: Exames */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="w-4 h-4" />
                  Exames a Realizar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examesAgendados.map((exame, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-2 gap-4 flex-1">
                            <div>
                              <label className="text-sm font-medium">Código do Exame</label>
                              <Input
                                value={exame.exameCodigo}
                                onChange={(e) => atualizarExame(index, 'exameCodigo', e.target.value)}
                                placeholder="Código"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Nome do Exame</label>
                              <Input
                                value={exame.exameNome}
                                onChange={(e) => atualizarExame(index, 'exameNome', e.target.value)}
                                placeholder="Nome completo do exame"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerExame(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">Categoria</label>
                            <Input
                              value={exame.categoria}
                              onChange={(e) => atualizarExame(index, 'categoria', e.target.value)}
                              placeholder="Ex: Hematologia"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Duração (min)</label>
                            <Input
                              type="number"
                              value={exame.duracaoEstimada}
                              onChange={(e) => atualizarExame(index, 'duracaoEstimada', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Checkbox
                              checked={exame.requerPreparo}
                              onCheckedChange={(checked) => atualizarExame(index, 'requerPreparo', checked)}
                            />
                            <label className="text-sm font-medium">Requer Preparo</label>
                          </div>
                        </div>

                        {exame.requerPreparo && (
                          <div>
                            <label className="text-sm font-medium">Descrição do Preparo</label>
                            <Textarea
                              value={exame.descricaoPreparo}
                              onChange={(e) => atualizarExame(index, 'descricaoPreparo', e.target.value)}
                              placeholder="Descreva o preparo necessário"
                              rows={2}
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium">Observações Específicas</label>
                          <Textarea
                            value={exame.observacoesEspecificas}
                            onChange={(e) => atualizarExame(index, 'observacoesEspecificas', e.target.value)}
                            placeholder="Observações sobre o exame"
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={adicionarExame}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Exame
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="exames"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Seção: Observações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações e Preparo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="preparacaoPaciente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preparação do Paciente</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva a preparação necessária para o paciente"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações Gerais</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Observações adicionais sobre o agendamento"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Agendando...' : 'Agendar Exames'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}