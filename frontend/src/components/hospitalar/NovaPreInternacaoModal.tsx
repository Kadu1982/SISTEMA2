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
import { CalendarIcon, Search, User, Stethoscope, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PacienteBusca from '@/components/agendamento/PacienteBusca';
import { Paciente } from '@/types/paciente/Paciente';

interface NovaPreInternacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Medico {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
}

export const NovaPreInternacaoModal: React.FC<NovaPreInternacaoModalProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();

  // Estados do formulário
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [formData, setFormData] = useState({
    pacienteId: '',
    medicoResponsavelId: '',
    dataPrevisaoInternacao: new Date(),
    horaPrevisaoInternacao: '',
    tipoInternacao: '',
    regimeInternacao: '',
    caraterInternacao: '',
    origem: '',
    cidPrincipal: '',
    diagnostico: '',
    observacoes: '',
    convenioId: '',
    servicoId: '',
    enfermariaPreferida: '',
    tipoAcomodacao: '',
    precisaIsolamento: false,
    permiteAcompanhante: true,
    solicitouReservaLeito: false,
    temPendencias: false,
    pendencias: ''
  });

  // Estados de busca
  const [searchMedico, setSearchMedico] = useState('');

  // Estados de dados
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(false);

  const mockMedicos: Medico[] = [
    {
      id: 1,
      nome: 'Dr. Fernando Costa',
      crm: 'CRM/SP 111111',
      especialidade: 'Cirurgia Geral'
    },
    {
      id: 2,
      nome: 'Dra. Patricia Lima',
      crm: 'CRM/SP 222222',
      especialidade: 'Clínica Médica'
    },
    {
      id: 3,
      nome: 'Dr. Marcos Oliveira',
      crm: 'CRM/SP 333333',
      especialidade: 'Cardiologia'
    }
  ];

  useEffect(() => {
    if (open) {
      setMedicos(mockMedicos);
    }
  }, [open]);

  const handleClose = () => {
    setPacienteSelecionado(null);
    setFormData({
      pacienteId: '',
      medicoResponsavelId: '',
      dataPrevisaoInternacao: new Date(),
      horaPrevisaoInternacao: '',
      tipoInternacao: '',
      regimeInternacao: '',
      caraterInternacao: '',
      origem: '',
      cidPrincipal: '',
      diagnostico: '',
      observacoes: '',
      convenioId: '',
      servicoId: '',
      enfermariaPreferida: '',
      tipoAcomodacao: '',
      precisaIsolamento: false,
      permiteAcompanhante: true,
      solicitouReservaLeito: false,
      temPendencias: false,
      pendencias: ''
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
        title: "Pré-Internação Criada",
        description: "A pré-internação foi criada com sucesso.",
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar pré-internação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMedico = () => {
    return medicos.find(m => m.id.toString() === formData.medicoResponsavelId);
  };

  const canSubmit = () => {
    return formData.pacienteId &&
           formData.medicoResponsavelId &&
           formData.tipoInternacao &&
           formData.regimeInternacao &&
           formData.caraterInternacao &&
           formData.origem;
  };

  const filteredMedicos = medicos.filter(m =>
    m.nome.toLowerCase().includes(searchMedico.toLowerCase()) ||
    m.crm.toLowerCase().includes(searchMedico.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Nova Pré-Internação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Paciente */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Paciente</h3>
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

              <div className="max-h-32 overflow-y-auto space-y-2">
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

          {/* Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Prevista de Internação *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataPrevisaoInternacao ? format(formData.dataPrevisaoInternacao, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataPrevisaoInternacao}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, dataPrevisaoInternacao: date }))}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Hora Prevista</Label>
              <Input
                type="time"
                value={formData.horaPrevisaoInternacao}
                onChange={(e) => setFormData(prev => ({ ...prev, horaPrevisaoInternacao: e.target.value }))}
              />
            </div>
          </div>

          {/* Tipo, Regime e Caráter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Internação *</Label>
              <Select value={formData.tipoInternacao} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoInternacao: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELETIVA">Eletiva</SelectItem>
                  <SelectItem value="URGENCIA">Urgência</SelectItem>
                  <SelectItem value="OBSERVACAO">Observação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Regime *</Label>
              <Select value={formData.regimeInternacao} onValueChange={(value) => setFormData(prev => ({ ...prev, regimeInternacao: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AMBULATORIAL">Ambulatorial</SelectItem>
                  <SelectItem value="HOSPITAL_DIA">Hospital Dia</SelectItem>
                  <SelectItem value="INTERNACAO_INTEGRAL">Internação Integral</SelectItem>
                  <SelectItem value="UTI">UTI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Caráter *</Label>
              <Select value={formData.caraterInternacao} onValueChange={(value) => setFormData(prev => ({ ...prev, caraterInternacao: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELETIVO">Eletivo</SelectItem>
                  <SelectItem value="URGENCIA">Urgência</SelectItem>
                  <SelectItem value="ACIDENTE_TRABALHO">Acidente de Trabalho</SelectItem>
                  <SelectItem value="ACIDENTE_TRANSITO">Acidente de Trânsito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Origem */}
          <div className="space-y-2">
            <Label>Origem *</Label>
            <Select value={formData.origem} onValueChange={(value) => setFormData(prev => ({ ...prev, origem: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AMBULATORIO">Ambulatório</SelectItem>
                <SelectItem value="EMERGENCIA">Emergência</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                <SelectItem value="AGENDAMENTO_CIRURGICO">Agendamento Cirúrgico</SelectItem>
                <SelectItem value="CENTRAL_REGULACAO">Central de Regulação</SelectItem>
              </SelectContent>
            </Select>
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
          </div>

          {/* Diagnóstico */}
          <div className="space-y-2">
            <Label>Diagnóstico</Label>
            <Textarea
              placeholder="Descreva o diagnóstico..."
              value={formData.diagnostico}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnostico: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Preferências de Acomodação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Enfermaria Preferida</Label>
              <Input
                placeholder="Ex: Clínica Médica"
                value={formData.enfermariaPreferida}
                onChange={(e) => setFormData(prev => ({ ...prev, enfermariaPreferida: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Acomodação</Label>
              <Select value={formData.tipoAcomodacao} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoAcomodacao: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENFERMARIA">Enfermaria</SelectItem>
                  <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                  <SelectItem value="UTI">UTI</SelectItem>
                  <SelectItem value="ISOLAMENTO">Isolamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isolamento"
                checked={formData.precisaIsolamento}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precisaIsolamento: checked }))}
              />
              <Label htmlFor="isolamento">Precisa de isolamento</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="acompanhante"
                checked={formData.permiteAcompanhante}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permiteAcompanhante: checked }))}
              />
              <Label htmlFor="acompanhante">Permite acompanhante</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="reserva"
                checked={formData.solicitouReservaLeito}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, solicitouReservaLeito: checked }))}
              />
              <Label htmlFor="reserva">Solicitar reserva de leito automaticamente</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="pendencias"
                checked={formData.temPendencias}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, temPendencias: checked }))}
              />
              <Label htmlFor="pendencias" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Possui pendências
              </Label>
            </div>

            {formData.temPendencias && (
              <div className="space-y-2">
                <Label>Descrição das Pendências</Label>
                <Textarea
                  placeholder="Descreva as pendências que impedem a internação..."
                  value={formData.pendencias}
                  onChange={(e) => setFormData(prev => ({ ...prev, pendencias: e.target.value }))}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações gerais..."
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        {/* Botões */}
        <Separator />
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || loading}
          >
            {loading ? 'Criando...' : 'Criar Pré-Internação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};