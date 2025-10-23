import React, { useState, useEffect } from 'react';
import { Syringe, Search, Plus, Calendar, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import imunizacaoService, { AplicacaoVacina, Vacina } from '@/services/imunizacao/imunizacaoService';
import PacienteBusca from '@/components/agendamento/PacienteBusca';
import { Paciente } from '@/types/paciente/Paciente';

const AplicacaoVacinas: React.FC = () => {
  const [aplicacoes, setAplicacoes] = useState<AplicacaoVacina[]>([]);
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  const [formData, setFormData] = useState<Partial<AplicacaoVacina>>({
    pacienteId: 0,
    vacinaId: 0,
    unidadeId: 1, // TODO: Pegar da sessão
    dataAplicacao: new Date().toISOString().split('T')[0],
    horaAplicacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    estrategiaVacinacao: 'ROTINA',
    localAtendimento: 'UBS',
    dose: '',
    lote: '',
    fabricante: '',
  });

  useEffect(() => {
    carregarVacinas();
    carregarAplicacoes();
  }, []);

  const carregarVacinas = async () => {
    try {
      const response = await imunizacaoService.listarVacinasAtivas();

      let data: any = [];
      if (response.data) {
        data = response.data.data !== undefined ? response.data.data : response.data;
      }

      setVacinas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar vacinas:', error);
      toast.error('Erro ao carregar vacinas');
      setVacinas([]);
    }
  };

  const carregarAplicacoes = async () => {
    setLoading(true);
    try {
      const response = await imunizacaoService.buscarAplicacoesComFiltros({
        dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0],
      });

      let data: any = [];
      if (response.data) {
        if (response.data.data !== undefined) {
          data = response.data.data.content || response.data.data;
        } else if (response.data.content !== undefined) {
          data = response.data.content;
        } else {
          data = response.data;
        }
      }

      setAplicacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar aplicações:', error);
      toast.error('Erro ao carregar aplicações');
      setAplicacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pacienteSelecionado) {
      toast.error('Selecione um paciente');
      return;
    }

    if (!formData.vacinaId) {
      toast.error('Selecione uma vacina');
      return;
    }

    try {
      const aplicacao: AplicacaoVacina = {
        ...formData,
        pacienteId: pacienteSelecionado.id,
      } as AplicacaoVacina;

      await imunizacaoService.registrarAplicacao(aplicacao);
      toast.success('Aplicação registrada com sucesso!');
      setModalAberto(false);
      limparFormulario();
      carregarAplicacoes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao registrar aplicação');
    }
  };

  const limparFormulario = () => {
    setPacienteSelecionado(null);
    setFormData({
      pacienteId: 0,
      vacinaId: 0,
      unidadeId: 1,
      dataAplicacao: new Date().toISOString().split('T')[0],
      horaAplicacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      estrategiaVacinacao: 'ROTINA',
      localAtendimento: 'UBS',
      dose: '',
      lote: '',
      fabricante: '',
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Syringe />
          Aplicação de Vacinas
        </h1>
        <Button onClick={() => setModalAberto(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Aplicação
        </Button>
      </div>

      {/* Lista de Aplicações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Aplicações Recentes (últimos 30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : aplicacoes.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <Syringe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhuma aplicação registrada</p>
              <p className="text-sm">Clique em "Nova Aplicação" para registrar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {aplicacoes.map((aplicacao) => (
                <Card key={aplicacao.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Paciente</p>
                        <p className="font-semibold">{aplicacao.pacienteNome}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vacina</p>
                        <p className="font-semibold">{aplicacao.vacinaNome}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data</p>
                        <p className="font-semibold">
                          {new Date(aplicacao.dataAplicacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dose</p>
                        <p className="font-semibold">{aplicacao.dose || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nova Aplicação */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Registrar Aplicação de Vacina</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Busca de Paciente */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Paciente <span className="text-red-500">*</span>
                </label>
                <PacienteBusca
                  onPacienteSelecionado={(paciente) => setPacienteSelecionado(paciente)}
                  placeholder="Digite o nome ou CPF do paciente..."
                  pacienteSelecionado={pacienteSelecionado}
                />
              </div>

              {/* Vacina */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vacina <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.vacinaId}
                  onChange={(e) => setFormData({ ...formData, vacinaId: Number(e.target.value) })}
                  required
                >
                  <option value="">Selecione...</option>
                  {vacinas.map((vacina) => (
                    <option key={vacina.id} value={vacina.id}>
                      {vacina.nome} - {vacina.codigo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Data */}
                <div>
                  <label className="block text-sm font-medium mb-2">Data</label>
                  <Input
                    type="date"
                    value={formData.dataAplicacao}
                    onChange={(e) => setFormData({ ...formData, dataAplicacao: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium mb-2">Hora</label>
                  <Input
                    type="time"
                    value={formData.horaAplicacao}
                    onChange={(e) => setFormData({ ...formData, horaAplicacao: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Estratégia */}
                <div>
                  <label className="block text-sm font-medium mb-2">Estratégia</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.estrategiaVacinacao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estrategiaVacinacao: e.target.value as any,
                      })
                    }
                  >
                    <option value="ROTINA">Rotina</option>
                    <option value="CAMPANHA">Campanha</option>
                    <option value="BLOQUEIO">Bloqueio</option>
                    <option value="INTENSIFICACAO">Intensificação</option>
                    <option value="ESPECIAL">Especial</option>
                  </select>
                </div>

                {/* Local de Atendimento */}
                <div>
                  <label className="block text-sm font-medium mb-2">Local de Atendimento</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.localAtendimento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        localAtendimento: e.target.value as any,
                      })
                    }
                  >
                    <option value="UBS">UBS</option>
                    <option value="DOMICILIO">Domicílio</option>
                    <option value="ESCOLA">Escola</option>
                    <option value="OUTROS">Outros</option>
                    <option value="NENHUM">Nenhum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Dose */}
                <div>
                  <label className="block text-sm font-medium mb-2">Dose</label>
                  <Input
                    value={formData.dose}
                    onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                    placeholder="Ex: 1ª dose"
                  />
                </div>

                {/* Lote */}
                <div>
                  <label className="block text-sm font-medium mb-2">Lote</label>
                  <Input
                    value={formData.lote}
                    onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                  />
                </div>

                {/* Validade da Vacina */}
                <div>
                  <label className="block text-sm font-medium mb-2">Validade da Vacina</label>
                  <Input
                    type="date"
                    value={formData.dataValidade || ''}
                    onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })}
                  />
                </div>

                {/* Fabricante */}
                <div>
                  <label className="block text-sm font-medium mb-2">Fabricante</label>
                  <Input
                    value={formData.fabricante}
                    onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium mb-2">Observações</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar Aplicação</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AplicacaoVacinas;
