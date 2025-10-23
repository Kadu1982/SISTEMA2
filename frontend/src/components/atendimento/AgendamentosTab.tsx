import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Calendar as CalendarIcon,
    Search,
    Clock,
    User,
    AlertCircle,
    FileText,
    Stethoscope,
    ClipboardCheck,
    MoreHorizontal
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Types and Hooks
import { AgendamentoDTO, StatusAgendamento, formatarTipoAtendimento, getCorStatus } from '@/types/Agendamento';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { useAtendimentos } from '@/hooks/useAtendimentos';

// Paciente details component
import { PacienteDetalhes } from './PacienteDetalhes';
import MenuReimpressao from '@/components/agendamento/MenuReimpressao';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export const AgendamentosTab: React.FC = () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoDTO | null>(null);
    const [showPacienteDetalhes, setShowPacienteDetalhes] = useState(false);

    // Fetch appointments for the selected date
    const { 
        agendamentos, 
        isLoading, 
        isError, 
        refetch 
    } = useAgendamentos(date);

    // Filter appointments based on search term and status
    const filteredAgendamentos = React.useMemo(() => {
        if (!agendamentos) return [];

        return agendamentos.filter(agendamento => {
            const matchesSearch = searchTerm === '' || 
                agendamento.pacienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formatarTipoAtendimento(agendamento.tipo).toLowerCase().includes(searchTerm.toLowerCase()) ||
                (agendamento.especialidade && agendamento.especialidade.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === null || agendamento.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [agendamentos, searchTerm, statusFilter]);

    // Format date and time
    const formatarDataHora = (dataHoraString: string) => {
        const data = new Date(dataHoraString);
        return format(data, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    };

    const formatarHora = (dataHoraString: string) => {
        const data = new Date(dataHoraString);
        return format(data, 'HH:mm', { locale: ptBR });
    };

    // Get status badge with appropriate color
    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            [StatusAgendamento.AGENDADO]: 'bg-blue-100 text-blue-800',
            [StatusAgendamento.CONFIRMADO]: 'bg-green-100 text-green-800',
            [StatusAgendamento.REALIZADO]: 'bg-emerald-100 text-emerald-800',
            [StatusAgendamento.CANCELADO]: 'bg-red-100 text-red-800',
            [StatusAgendamento.FALTOU]: 'bg-orange-100 text-orange-800',
            [StatusAgendamento.EM_ATENDIMENTO]: 'bg-purple-100 text-purple-800'
        };

        const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
        return <Badge variant="outline" className={colorClass}>{formatarStatus(status)}</Badge>;
    };

    // Format status for display
    const formatarStatus = (status: string): string => {
        const statusMap: Record<string, string> = {
            [StatusAgendamento.AGENDADO]: 'Agendado',
            [StatusAgendamento.CONFIRMADO]: 'Recepcionado',
            [StatusAgendamento.REALIZADO]: 'Realizado',
            [StatusAgendamento.CANCELADO]: 'Cancelado',
            [StatusAgendamento.FALTOU]: 'Faltou',
            [StatusAgendamento.EM_ATENDIMENTO]: 'Em Atendimento'
        };

        return statusMap[status] || status;
    };

    // Handle appointment click
    const handleAgendamentoClick = (agendamento: AgendamentoDTO) => {
        // Only allow clicking on "Recepcionado" appointments with valid pacienteId
        if (agendamento.status === StatusAgendamento.CONFIRMADO && agendamento.pacienteId) {
            setSelectedAgendamento(agendamento);
            setShowPacienteDetalhes(true);
        }
    };

    // Get row class based on status and pacienteId
    const getRowClass = (status: string, pacienteId?: number) => {
        if (status === StatusAgendamento.CONFIRMADO && pacienteId) {
            return 'cursor-pointer hover:bg-gray-100';
        }
        return '';
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Agendamentos Médicos</CardTitle>
                    <CardDescription>
                        Visualize e atenda os pacientes agendados. Clique em um paciente com status "Recepcionado" para iniciar o atendimento.
                        Apenas pacientes com ID válido podem ser atendidos (pacientes com ID inválido são destacados em amarelo).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Date and search filters */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                            </PopoverContent>
                        </Popover>

                        <div className="relative flex-grow max-w-md">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por paciente, tipo ou especialidade..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex-grow">
                            <Tabs defaultValue="todos" className="w-full" onValueChange={(value) => setStatusFilter(value === 'todos' ? null : value)}>
                                <TabsList className="grid grid-cols-3 md:grid-cols-6">
                                    <TabsTrigger value="todos">Todos</TabsTrigger>
                                    <TabsTrigger value={StatusAgendamento.AGENDADO}>Agendados</TabsTrigger>
                                    <TabsTrigger value={StatusAgendamento.CONFIRMADO}>Recepcionados</TabsTrigger>
                                    <TabsTrigger value={StatusAgendamento.EM_ATENDIMENTO}>Em Atendimento</TabsTrigger>
                                    <TabsTrigger value={StatusAgendamento.REALIZADO}>Realizados</TabsTrigger>
                                    <TabsTrigger value={StatusAgendamento.CANCELADO}>Cancelados</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    {/* Loading and error states */}
                    {isLoading && (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3">Carregando agendamentos...</span>
                        </div>
                    )}

                    {isError && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-red-600">
                                Erro ao buscar agendamentos. Tente novamente.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Appointments table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Horário</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Especialidade</TableHead>
                                    <TableHead>Profissional</TableHead>
                                                                        <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAgendamentos && filteredAgendamentos.length > 0 ? (
                                    [...filteredAgendamentos]
                                        .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
                                        .map(agendamento => (
                                            <TableRow 
                                                key={agendamento.id} 
                                                className={getRowClass(agendamento.status, agendamento.pacienteId)}
                                                onClick={() => handleAgendamentoClick(agendamento)}
                                            >
                                                <TableCell className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                    {formatarHora(agendamento.dataHora)}
                                                </TableCell>
                                                <TableCell className="flex items-center gap-2">
                                                    {agendamento.pacienteId ? (
                                                        <>
                                                            <User className="h-4 w-4 text-blue-600" />
                                                            {agendamento.pacienteNome}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="h-4 w-4 text-amber-500" title="ID do paciente inválido" />
                                                            <span className="text-amber-700" title="ID do paciente inválido ou não encontrado">
                                                                {agendamento.pacienteNome} (ID inválido)
                                                            </span>
                                                        </>
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatarTipoAtendimento(agendamento.tipo)}</TableCell>
                                                <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                                                <TableCell>
                                                    {agendamento.especialidade ? 
                                                        agendamento.especialidade.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                                                        (agendamento.examesSelecionados && agendamento.examesSelecionados.length > 0 ? 
                                                            `${agendamento.examesSelecionados.length} exame(s)` : '-')}
                                                </TableCell>
                                                <TableCell>{agendamento.profissionalNome || '-'}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                            {/* Reimpressões disponíveis (SADT/Comprovante) */}
                                                            <MenuReimpressao agendamento={agendamento} />
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            {date ? (
                                                searchTerm ?
                                                    `Nenhum agendamento encontrado para "${searchTerm}" em ${format(date, 'dd/MM/yyyy', { locale: ptBR })}.` :
                                                    `Nenhum agendamento encontrado para ${format(date, 'dd/MM/yyyy', { locale: ptBR })}.`
                                            ) : (
                                                'Selecione uma data para visualizar os agendamentos.'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Patient details dialog */}
            {selectedAgendamento && (
                <Dialog open={showPacienteDetalhes} onOpenChange={setShowPacienteDetalhes}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Atendimento do Paciente</DialogTitle>
                            <DialogDescription>
                                Detalhes do paciente e histórico de atendimentos
                            </DialogDescription>
                        </DialogHeader>
                        <PacienteDetalhes 
                            pacienteId={selectedAgendamento.pacienteId?.toString() || ''} 
                            agendamento={selectedAgendamento} 
                            onClose={() => setShowPacienteDetalhes(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};
