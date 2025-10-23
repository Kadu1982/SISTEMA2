import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Search, User, BedDouble, Stethoscope, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PacienteBusca from '@/components/agendamento/PacienteBusca';
import { Paciente } from '@/types/paciente/Paciente';

interface NovaInternacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Leito {
  id: number;
  numero: string;
  enfermaria: string;
  status: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENCAO' | 'RESERVADO';
  tipoAcomodacao: string;
}

interface Medico {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
}

export const NovaInternacaoModal: React.FC<NovaInternacaoModalProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();

  // Estados do formulário
  const [currentStep, setCurrentStep] = useState(1);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [formData, setFormData] = useState({
    pacienteId: '',
    leitoId: '',
    medicoResponsavelId: '',
    dataInternacao: new Date(),
    horaInternacao: '',
    dataPrevistaAlta: undefined as Date | undefined,
    tipoInternacao: '',
    regimeInternacao: '',
    cidPrincipal: '',
    diagnosticoInternacao: '',
    observacoes: '',
    convenioId: '',
    numeroCarteira: '',
    permiteAcompanhante: true
  });

  // Estados de busca
  const [searchLeito, setSearchLeito] = useState('');
  const [searchMedico, setSearchMedico] = useState('');

  // Estados de dados
  const [leitos, setLeitos] = useState<Leito[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(false);

  const mockLeitos: Leito[] = [
    {
      id: 1,
      numero: '101-A',
      enfermaria: 'Clínica Médica',
      status: 'DISPONIVEL',
      tipoAcomodacao: 'ENFERMARIA'
    },
    {
      id: 2,
      numero: '205-B',
      enfermaria: 'UTI',
      status: 'DISPONIVEL',
      tipoAcomodacao: 'UTI'
    },
    {
      id: 3,
      numero: '301-C',
      enfermaria: 'Cirurgia',
      status: 'DISPONIVEL',
      tipoAcomodacao: 'APARTAMENTO'
    }
  ];

  const mockMedicos: Medico[] = [
    {
      id: 1,
      nome: 'Dr. João Carvalho',
      crm: 'CRM/SP 123456',
      especialidade: 'Clínica Médica'
    },
    {
      id: 2,
      nome: 'Dra. Ana Paula Silva',
      crm: 'CRM/SP 654321',
      especialidade: 'UTI'
    },
    {
      id: 3,
      nome: 'Dr. Roberto Lima',
      crm: 'CRM/SP 789123',
      especialidade: 'Cirurgia'
    }
  ];

  useEffect(() => {
    if (open) {
      setLeitos(mockLeitos.filter(l => l.status === 'DISPONIVEL'));
      setMedicos(mockMedicos);
    }
  }, [open]);

  const handleClose = () => {
    setCurrentStep(1);
    setPacienteSelecionado(null);
    setFormData({
      pacienteId: '',
      leitoId: '',
      medicoResponsavelId: '',
      dataInternacao: new Date(),
      horaInternacao: '',
      dataPrevistaAlta: undefined,
      tipoInternacao: '',
      regimeInternacao: '',
      cidPrincipal: '',
      diagnosticoInternacao: '',
      observacoes: '',
      convenioId: '',
      numeroCarteira: '',
      permiteAcompanhante: true
    });
    onOpenChange(false);
  };

  const handlePacienteSelecionado = (paciente: Paciente | null) => {
    setPacienteSelecionado(paciente);
    if (paciente?.id) {
      setFormData(prev => ({ ...prev, pacienteId: paciente.id.toString() }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Aqui seria feita a chamada para a API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay

      toast({
        title: "Internação Registrada",
        description: "A internação foi registrada com sucesso.",
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar internação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedLeito = () => {
    return leitos.find(l => l.id.toString() === formData.leitoId);
  };

  const getSelectedMedico = () => {
    return medicos.find(m => m.id.toString() === formData.medicoResponsavelId);
  };

  const canProceedToStep2 = () => {
    return formData.pacienteId && formData.leitoId && formData.medicoResponsavelId;
  };

  const canSubmit = () => {
    return canProceedToStep2() &&
           formData.tipoInternacao &&
           formData.regimeInternacao &&
           formData.horaInternacao;
  };

  const filteredLeitos = leitos.filter(l =>
    l.numero.toLowerCase().includes(searchLeito.toLowerCase()) ||
    l.enfermaria.toLowerCase().includes(searchLeito.toLowerCase())
  );

  const filteredMedicos = medicos.filter(m =>
    m.nome.toLowerCase().includes(searchMedico.toLowerCase()) ||
    m.crm.toLowerCase().includes(searchMedico.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BedDouble className="h-6 w-6" />
            Nova Internação
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center space-x-4 mb-6">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="font-medium">Dados Básicos</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-200"></div>

          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="font-medium">Dados Clínicos</span>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Seleção de Paciente */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Selecionar Paciente</h3>
              </div>

              <div className="space-y-3">
                <PacienteBusca
                  onPacienteSelecionado={handlePacienteSelecionado}
                  placeholder="Digite o nome ou CPF do paciente..."
                  pacienteSelecionado={pacienteSelecionado}
                />

                {pacienteSelecionado && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">{pacienteSelecionado.nomeCompleto}</p>
                        <p className="text-sm text-blue-600">CPF: {pacienteSelecionado.cpf || 'Não informado'}</p>
                        {pacienteSelecionado.dataNascimento && (
                          <p className="text-sm text-blue-600">
                            Nascimento: {new Date(pacienteSelecionado.dataNascimento).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Selecionado</Badge>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Seleção de Leito */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BedDouble className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Selecionar Leito</h3>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar leito por número ou enfermaria..."
                    value={searchLeito}
                    onChange={(e) => setSearchLeito(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {getSelectedLeito() && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">Leito {getSelectedLeito()?.numero}</p>
                        <p className="text-sm text-green-600">{getSelectedLeito()?.enfermaria}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                    </div>
                  </div>
                )}

                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredLeitos.map((leito) => (
                    <div
                      key={leito.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        formData.leitoId === leito.id.toString()
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, leitoId: leito.id.toString() }))}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Leito {leito.numero}</p>
                          <p className="text-sm text-gray-600">{leito.enfermaria}</p>
                          <p className="text-sm text-gray-500">{leito.tipoAcomodacao}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Seleção de Médico */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Médico Responsável</h3>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar médico por nome ou CRM..."
                    value={searchMedico}
                    onChange={(e) => setSearchMedico(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {getSelectedMedico() && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-purple-900">{getSelectedMedico()?.nome}</p>
                        <p className="text-sm text-purple-600">{getSelectedMedico()?.crm} - {getSelectedMedico()?.especialidade}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Selecionado</Badge>
                    </div>
                  </div>
                )}

                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredMedicos.map((medico) => (
                    <div
                      key={medico.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        formData.medicoResponsavelId === medico.id.toString()
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, medicoResponsavelId: medico.id.toString() }))}
                    >
                      <p className="font-medium">{medico.nome}</p>
                      <p className="text-sm text-gray-600">{medico.crm}</p>
                      <p className="text-sm text-gray-500">{medico.especialidade}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Data e Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data da Internação *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dataInternacao ? format(formData.dataInternacao, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dataInternacao}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, dataInternacao: date }))}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Hora da Internação *</Label>
                <Input
                  type="time"
                  value={formData.horaInternacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, horaInternacao: e.target.value }))}
                />
              </div>
            </div>

            {/* Tipo e Regime */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Internação *</Label>
                <Select value={formData.tipoInternacao} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoInternacao: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELETIVA">Eletiva</SelectItem>
                    <SelectItem value="URGENCIA">Urgência</SelectItem>
                    <SelectItem value="OBSERVACAO">Observação</SelectItem>
                    <SelectItem value="HOSPITAL_DIA">Hospital Dia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Regime de Internação *</Label>
                <Select value={formData.regimeInternacao} onValueChange={(value) => setFormData(prev => ({ ...prev, regimeInternacao: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o regime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AMBULATORIAL">Ambulatorial</SelectItem>
                    <SelectItem value="HOSPITAL_DIA">Hospital Dia</SelectItem>
                    <SelectItem value="INTERNACAO_INTEGRAL">Internação Integral</SelectItem>
                    <SelectItem value="UTI">UTI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dados Clínicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CID Principal</Label>
                <Input
                  placeholder="Ex: A09.9"
                  value={formData.cidPrincipal}
                  onChange={(e) => setFormData(prev => ({ ...prev, cidPrincipal: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Prevista de Alta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dataPrevistaAlta ? format(formData.dataPrevistaAlta, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dataPrevistaAlta}
                      onSelect={(date) => setFormData(prev => ({ ...prev, dataPrevistaAlta: date }))}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Diagnóstico */}
            <div className="space-y-2">
              <Label>Diagnóstico de Internação</Label>
              <Textarea
                placeholder="Descreva o diagnóstico da internação..."
                value={formData.diagnosticoInternacao}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnosticoInternacao: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações gerais sobre a internação..."
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Convênio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Convênio</Label>
                <Select value={formData.convenioId} onValueChange={(value) => setFormData(prev => ({ ...prev, convenioId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o convênio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">SUS</SelectItem>
                    <SelectItem value="2">Unimed</SelectItem>
                    <SelectItem value="3">Bradesco Saúde</SelectItem>
                    <SelectItem value="4">Particular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Número da Carteira</Label>
                <Input
                  placeholder="Número da carteira do convênio"
                  value={formData.numeroCarteira}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroCarteira: e.target.value }))}
                />
              </div>
            </div>

            {/* Acompanhante */}
            <div className="flex items-center space-x-2">
              <Switch
                id="acompanhante"
                checked={formData.permiteAcompanhante}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permiteAcompanhante: checked }))}
              />
              <Label htmlFor="acompanhante">Permite acompanhante</Label>
            </div>
          </div>
        )}

        {/* Botões */}
        <Separator />
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>

          <div className="flex gap-2">
            {currentStep === 2 && (
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Voltar
              </Button>
            )}

            {currentStep === 1 ? (
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2()}
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit() || loading}
              >
                {loading ? 'Registrando...' : 'Registrar Internação'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};