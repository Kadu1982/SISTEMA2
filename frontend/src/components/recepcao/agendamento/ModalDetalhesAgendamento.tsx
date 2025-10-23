import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Stethoscope, FileText, Building2 } from 'lucide-react';

import { AgendamentoExameDTO, statusAgendamentoExame } from '@/services/agendamento/agendamentoExameService';

interface ModalDetalhesAgendamentoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: AgendamentoExameDTO;
}

export default function ModalDetalhesAgendamento({
  open,
  onOpenChange,
  agendamento
}: ModalDetalhesAgendamentoProps) {
  const getStatusBadge = () => {
    const config = statusAgendamentoExame[agendamento.status];
    return (
      <Badge variant={config.cor as any}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
          <DialogDescription>
            Protocolo: {agendamento.protocolo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status e Flags */}
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {agendamento.confirmado && (
              <Badge variant="success">Confirmado</Badge>
            )}
            {agendamento.prioridade && (
              <Badge variant="destructive">Prioridade</Badge>
            )}
            {agendamento.encaixe && (
              <Badge variant="secondary">Encaixe</Badge>
            )}
          </div>

          {/* Informações do Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                Informações do Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Data do Exame:</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">
                      {format(new Date(agendamento.dataHoraExame), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Horário:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">
                      {format(new Date(agendamento.dataHoraExame), 'HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="text-sm text-gray-600">Tipo de Agendamento:</span>
                  <p className="font-medium">{agendamento.tipoAgendamento}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Origem:</span>
                  <p className="font-medium">{agendamento.origemSolicitacao || '-'}</p>
                </div>
              </div>

              {agendamento.solicitanteNome && (
                <div className="mt-4">
                  <span className="text-sm text-gray-600">Médico Solicitante:</span>
                  <p className="font-medium">{agendamento.solicitanteNome}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4" />
                Dados do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Nome:</span>
                <p className="font-medium">{agendamento.pacienteNome}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">CPF:</span>
                  <p className="font-medium">{agendamento.pacienteCpf || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Telefone:</span>
                  <p className="font-medium">{agendamento.contatoPaciente || '-'}</p>
                </div>
              </div>
              {agendamento.emailPaciente && (
                <div>
                  <span className="text-sm text-gray-600">E-mail:</span>
                  <p className="font-medium">{agendamento.emailPaciente}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exames */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="w-4 h-4" />
                Exames Agendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agendamento.examesAgendados.map((exame, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{exame.exameNome}</h4>
                        <p className="text-sm text-gray-600">Código: {exame.exameCodigo}</p>
                        {exame.categoria && (
                          <Badge variant="outline" className="mt-1">{exame.categoria}</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Duração estimada</p>
                        <p className="font-medium">{exame.duracaoEstimada || 30} min</p>
                      </div>
                    </div>
                    
                    {exame.requerPreparo && exame.descricaoPreparo && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-md">
                        <p className="text-sm font-medium text-orange-800">Preparo necessário:</p>
                        <p className="text-sm text-orange-700">{exame.descricaoPreparo}</p>
                      </div>
                    )}
                    
                    {exame.observacoesEspecificas && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Observações:</p>
                        <p className="text-sm">{exame.observacoesEspecificas}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {agendamento.duracaoTotalEstimada && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Duração Total Estimada:</span>
                    <span className="font-bold">{agendamento.duracaoTotalEstimada} minutos</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Local e Profissional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="w-4 h-4" />
                Local e Profissional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Unidade:</span>
                  <p className="font-medium">{agendamento.unidadeNome || 'Unidade ' + agendamento.unidadeId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Sala:</span>
                  <p className="font-medium">{agendamento.salaNome || '-'}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Profissional:</span>
                <p className="font-medium">{agendamento.profissionalNome || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Observações e Preparo */}
          {(agendamento.preparacaoPaciente || agendamento.observacoes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4" />
                  Observações e Preparo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {agendamento.preparacaoPaciente && (
                  <div>
                    <span className="text-sm font-medium text-orange-800">Preparação do Paciente:</span>
                    <p className="text-sm mt-1">{agendamento.preparacaoPaciente}</p>
                  </div>
                )}
                {agendamento.observacoes && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Observações Gerais:</span>
                    <p className="text-sm mt-1">{agendamento.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informações de Convênio */}
          {(agendamento.autorizacaoConvenio || agendamento.guiaConvenio) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações do Convênio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {agendamento.autorizacaoConvenio && (
                  <div>
                    <span className="text-sm text-gray-600">Autorização:</span>
                    <p className="font-medium">{agendamento.autorizacaoConvenio}</p>
                  </div>
                )}
                {agendamento.guiaConvenio && (
                  <div>
                    <span className="text-sm text-gray-600">Número da Guia:</span>
                    <p className="font-medium">{agendamento.guiaConvenio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Histórico */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Criado em:</span>
                <span className="ml-2">
                  {format(new Date(agendamento.dataCriacao), "dd/MM/yyyy 'às' HH:mm")}
                </span>
                {agendamento.usuarioCriacao && (
                  <span className="ml-2 text-gray-500">por {agendamento.usuarioCriacao}</span>
                )}
              </div>
              
              {agendamento.dataConfirmacao && (
                <div>
                  <span className="text-gray-600">Confirmado em:</span>
                  <span className="ml-2">
                    {format(new Date(agendamento.dataConfirmacao), "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                  {agendamento.usuarioConfirmacao && (
                    <span className="ml-2 text-gray-500">por {agendamento.usuarioConfirmacao}</span>
                  )}
                </div>
              )}
              
              {agendamento.dataCancelamento && (
                <div>
                  <span className="text-gray-600">Cancelado em:</span>
                  <span className="ml-2">
                    {format(new Date(agendamento.dataCancelamento), "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                  {agendamento.usuarioCancelamento && (
                    <span className="ml-2 text-gray-500">por {agendamento.usuarioCancelamento}</span>
                  )}
                  {agendamento.motivoCancelamento && (
                    <p className="text-red-600 mt-1">Motivo: {agendamento.motivoCancelamento}</p>
                  )}
                </div>
              )}
              
              {agendamento.dataRealizacao && (
                <div>
                  <span className="text-gray-600">Realizado em:</span>
                  <span className="ml-2">
                    {format(new Date(agendamento.dataRealizacao), "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                  {agendamento.usuarioRealizacao && (
                    <span className="ml-2 text-gray-500">por {agendamento.usuarioRealizacao}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}