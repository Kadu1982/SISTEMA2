import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search, Calendar, User, MapPin, Phone, Clock, AlertCircle,
    FileText, Download, Printer, Eye, Filter, X
} from 'lucide-react';
import samuService, { SolicitacaoSAMU } from '@/services/samu/samuService';

interface Filtros {
    dataInicio: string;
    dataFim: string;
    status: string;
    busca: string;
    page: number;
    size: number;
}

const HistoricoSolicitacoes: React.FC = () => {
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoSAMU[]>([]);
    const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<SolicitacaoSAMU | null>(null);
    const [dialogDetalhesAberto, setDialogDetalhesAberto] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [filtros, setFiltros] = useState<Filtros>({
        dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0],
        status: '',
        busca: '',
        page: 0,
        size: 20
    });
    const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);

    useEffect(() => {
        carregarSolicitacoes();
    }, [filtros.page]);

    const carregarSolicitacoes = async () => {
        try {
            setCarregando(true);
            const response = await samuService.listarSolicitacoes({
                dataInicio: filtros.dataInicio,
                dataFim: filtros.dataFim,
                status: filtros.status || undefined,
                page: filtros.page,
                size: filtros.size
            });

            const data = response.data?.data || response.data;
            const content = data?.content || [];
            const total = data?.totalElements || 0;

            // Aplicar filtro de busca local se houver
            let resultado = content;
            if (filtros.busca) {
                const buscaLower = filtros.busca.toLowerCase();
                resultado = content.filter((s: SolicitacaoSAMU) =>
                    s.codigo?.toString().includes(buscaLower) ||
                    s.telefone?.toLowerCase().includes(buscaLower) ||
                    s.motivoQueixa?.toLowerCase().includes(buscaLower) ||
                    s.solicitante?.toLowerCase().includes(buscaLower) ||
                    s.usuarioNome?.toLowerCase().includes(buscaLower)
                );
            }

            setSolicitacoes(resultado);
            setTotalElements(total);
        } catch (error) {
            console.error('Erro ao carregar solicitações:', error);
        } finally {
            setCarregando(false);
        }
    };

    const aplicarFiltros = () => {
        setFiltros({ ...filtros, page: 0 });
        carregarSolicitacoes();
    };

    const limparFiltros = () => {
        setFiltros({
            dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dataFim: new Date().toISOString().split('T')[0],
            status: '',
            busca: '',
            page: 0,
            size: 20
        });
        setTimeout(() => carregarSolicitacoes(), 100);
    };

    const visualizarDetalhes = async (id: number) => {
        try {
            const response = await samuService.buscarSolicitacao(id);
            const data = response.data?.data || response.data;
            setSolicitacaoSelecionada(data);
            setDialogDetalhesAberto(true);
        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
        }
    };

    const getStatusBadge = (status?: string) => {
        const statusConfig: any = {
            'PENDENTE_REGULACAO': { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente Regulação' },
            'EM_REGULACAO': { color: 'bg-blue-100 text-blue-800', label: 'Em Regulação' },
            'REGULADA': { color: 'bg-purple-100 text-purple-800', label: 'Regulada' },
            'AMBULANCIA_SOLICITADA': { color: 'bg-orange-100 text-orange-800', label: 'Ambulância Solicitada' },
            'EM_ATENDIMENTO': { color: 'bg-cyan-100 text-cyan-800', label: 'Em Atendimento' },
            'FINALIZADA': { color: 'bg-green-100 text-green-800', label: 'Finalizada' },
            'CANCELADA': { color: 'bg-red-100 text-red-800', label: 'Cancelada' },
        };

        const config = statusConfig[status || ''] || { color: 'bg-gray-100 text-gray-800', label: status || 'N/A' };
        return <Badge className={config.color}>{config.label}</Badge>;
    };

    const getRiscoColor = (risco?: string) => {
        switch (risco) {
            case 'MUITO_RISCO': return 'bg-red-600 text-white';
            case 'MEDIO_RISCO': return 'bg-yellow-500 text-white';
            case 'NAO_INFORMADO': return 'bg-gray-500 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };

    const formatarData = (dataHora?: string) => {
        if (!dataHora) return 'N/A';
        const data = new Date(dataHora);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
    };

    const exportarCSV = () => {
        const headers = ['Código', 'Data/Hora', 'Telefone', 'Solicitante', 'Queixa', 'Endereço', 'Status'];
        const rows = solicitacoes.map(s => [
            s.codigo,
            formatarData(s.dataHora),
            s.telefone,
            s.solicitante || 'N/A',
            s.motivoQueixa || 'N/A',
            `${s.logradouro}, ${s.bairro} - ${s.municipio}`,
            s.status || 'N/A'
        ]);

        const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `historico_samu_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-4">
            {/* Header com Estatísticas */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Histórico de Solicitações SAMU
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                {filtrosVisiveis ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportarCSV}
                                disabled={solicitacoes.length === 0}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar CSV
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Total de Solicitações</p>
                            <p className="text-2xl font-bold text-blue-600">{totalElements}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Finalizadas</p>
                            <p className="text-2xl font-bold text-green-600">
                                {solicitacoes.filter(s => s.status === 'FINALIZADA').length}
                            </p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Em Andamento</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {solicitacoes.filter(s => s.status && !['FINALIZADA', 'CANCELADA'].includes(s.status)).length}
                            </p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Canceladas</p>
                            <p className="text-2xl font-bold text-red-600">
                                {solicitacoes.filter(s => s.status === 'CANCELADA').length}
                            </p>
                        </div>
                    </div>

                    {/* Painel de Filtros */}
                    {filtrosVisiveis && (
                        <div className="bg-gray-50 p-4 rounded-lg border space-y-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>Data Início</Label>
                                    <Input
                                        type="date"
                                        value={filtros.dataInicio}
                                        onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Data Fim</Label>
                                    <Input
                                        type="date"
                                        value={filtros.dataFim}
                                        onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select
                                        value={filtros.status}
                                        onValueChange={(value) => setFiltros({ ...filtros, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos os status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos os status</SelectItem>
                                            <SelectItem value="PENDENTE_REGULACAO">Pendente Regulação</SelectItem>
                                            <SelectItem value="EM_REGULACAO">Em Regulação</SelectItem>
                                            <SelectItem value="REGULADA">Regulada</SelectItem>
                                            <SelectItem value="AMBULANCIA_SOLICITADA">Ambulância Solicitada</SelectItem>
                                            <SelectItem value="EM_ATENDIMENTO">Em Atendimento</SelectItem>
                                            <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                                            <SelectItem value="CANCELADA">Cancelada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Buscar</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Código, telefone, paciente..."
                                            value={filtros.busca}
                                            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={aplicarFiltros} size="sm">
                                    <Search className="w-4 h-4 mr-2" />
                                    Aplicar Filtros
                                </Button>
                                <Button onClick={limparFiltros} variant="outline" size="sm">
                                    <X className="w-4 h-4 mr-2" />
                                    Limpar
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Tabela de Solicitações */}
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-24">Código</TableHead>
                                    <TableHead>Data/Hora</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Solicitante/Paciente</TableHead>
                                    <TableHead>Queixa</TableHead>
                                    <TableHead>Endereço</TableHead>
                                    <TableHead>Classificação</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-24">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {carregando ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                            Carregando...
                                        </TableCell>
                                    </TableRow>
                                ) : solicitacoes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            <p>Nenhuma solicitação encontrada</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    solicitacoes.map((solicitacao) => (
                                        <TableRow key={solicitacao.id}>
                                            <TableCell className="font-mono font-bold">
                                                {solicitacao.codigo}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatarData(solicitacao.dataHora)}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {solicitacao.telefone}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    {solicitacao.usuarioNome || solicitacao.solicitante || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm max-w-xs truncate">
                                                {solicitacao.motivoQueixa || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-sm max-w-xs truncate">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    {solicitacao.logradouro}, {solicitacao.bairro}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {solicitacao.classificacaoRisco && (
                                                    <Badge className={getRiscoColor(solicitacao.classificacaoRisco)}>
                                                        {solicitacao.classificacaoRisco}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(solicitacao.status)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => visualizarDetalhes(solicitacao.id!)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginação */}
                    {totalElements > filtros.size && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-gray-600">
                                Mostrando {solicitacoes.length} de {totalElements} solicitações
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filtros.page === 0}
                                    onClick={() => setFiltros({ ...filtros, page: filtros.page - 1 })}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={(filtros.page + 1) * filtros.size >= totalElements}
                                    onClick={() => setFiltros({ ...filtros, page: filtros.page + 1 })}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de Detalhes */}
            <Dialog open={dialogDetalhesAberto} onOpenChange={setDialogDetalhesAberto}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Detalhes da Solicitação #{solicitacaoSelecionada?.codigo}</span>
                            {getStatusBadge(solicitacaoSelecionada?.status)}
                        </DialogTitle>
                    </DialogHeader>

                    {solicitacaoSelecionada && (
                        <div className="space-y-4">
                            {/* Informações da Chamada */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Informações da Chamada</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-600">Data/Hora</Label>
                                        <p className="font-medium">{formatarData(solicitacaoSelecionada.dataHora)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Telefone</Label>
                                        <p className="font-medium">{solicitacaoSelecionada.telefone}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Solicitante</Label>
                                        <p className="font-medium">{solicitacaoSelecionada.solicitante || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Estado Emocional</Label>
                                        <p className="font-medium">{solicitacaoSelecionada.estadoEmocional || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-gray-600">Motivo/Queixa</Label>
                                        <p className="font-medium">{solicitacaoSelecionada.motivoQueixa || 'N/A'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Usuário/Paciente */}
                            {solicitacaoSelecionada.usuarioNome && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Paciente</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <Label className="text-gray-600">Nome</Label>
                                            <p className="font-medium">{solicitacaoSelecionada.usuarioNome}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Local da Ocorrência */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Local da Ocorrência</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-600">Município</Label>
                                        <p className="font-medium">{solicitacaoSelecionada.municipio}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Bairro</Label>
                                        <p className="font-medium">{solicitacaoSelecionada.bairro || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Logradouro</Label>
                                        <p className="font-medium">{solicitacaoSelecionada.logradouro}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Número</Label>
                                        <p className="font-medium">{solicitacaoSelecionada.numero || 'S/N'}</p>
                                    </div>
                                    {solicitacaoSelecionada.complemento && (
                                        <div className="col-span-2">
                                            <Label className="text-gray-600">Complemento</Label>
                                            <p className="font-medium">{solicitacaoSelecionada.complemento}</p>
                                        </div>
                                    )}
                                    {solicitacaoSelecionada.pontoReferencia && (
                                        <div className="col-span-2">
                                            <Label className="text-gray-600">Ponto de Referência</Label>
                                            <p className="font-medium">{solicitacaoSelecionada.pontoReferencia}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Encaminhamento/Regulação */}
                            {(solicitacaoSelecionada.classificacaoRisco || solicitacaoSelecionada.detalhamento) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Regulação/Encaminhamento</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4">
                                        {solicitacaoSelecionada.classificacaoRisco && (
                                            <div>
                                                <Label className="text-gray-600">Classificação de Risco</Label>
                                                <div className="mt-1">
                                                    <Badge className={getRiscoColor(solicitacaoSelecionada.classificacaoRisco)}>
                                                        {solicitacaoSelecionada.classificacaoRisco}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                        {solicitacaoSelecionada.avaliacaoDor !== undefined && (
                                            <div>
                                                <Label className="text-gray-600">Avaliação de Dor</Label>
                                                <p className="font-medium">{solicitacaoSelecionada.avaliacaoDor}/10</p>
                                            </div>
                                        )}
                                        {solicitacaoSelecionada.detalhamento && (
                                            <div className="col-span-2">
                                                <Label className="text-gray-600">Detalhamento</Label>
                                                <p className="font-medium">{solicitacaoSelecionada.detalhamento}</p>
                                            </div>
                                        )}
                                        {solicitacaoSelecionada.tempoAtendimento && (
                                            <div>
                                                <Label className="text-gray-600">Tempo de Atendimento</Label>
                                                <p className="font-medium">{solicitacaoSelecionada.tempoAtendimento}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Botões de Ação */}
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => window.print()}>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Imprimir
                                </Button>
                                <Button onClick={() => setDialogDetalhesAberto(false)}>
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HistoricoSolicitacoes;
