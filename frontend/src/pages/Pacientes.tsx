import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPacientes, deletePaciente } from '@/services/pacientesService.ts';
import { Paciente } from '@/types/paciente/Paciente';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// ✅ ADICIONADO: Ícone de seta para o botão Voltar
import { PlusCircle, Edit, Info, Trash2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { obterNomeExibicao } from '@/lib/pacienteUtils';
import { toast } from '@/components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const Pacientes: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [pacienteParaExcluir, setPacienteParaExcluir] = useState<Paciente | null>(null);

    const { data: pacientes = [], isLoading, isError, error } = useQuery<Paciente[], Error>({
        queryKey: ['pacientes'],
        queryFn: getAllPacientes,
    });

    const { mutate: excluirPaciente, isPending: isExcluindoPaciente } = useMutation({
        mutationFn: deletePaciente,
        onSuccess: () => {
            toast({
                title: "Sucesso!",
                description: "Paciente excluído com sucesso.",
            });
            queryClient.invalidateQueries({ queryKey: ['pacientes'] });
        },
        onError: (err: Error) => {
            toast({
                title: "Erro!",
                description: err.message || "Não foi possível excluir o paciente.",
                variant: "destructive",
            });
        },
        onSettled: () => {
            setPacienteParaExcluir(null);
        }
    });

    const handleConfirmarExclusao = () => {
        if (pacienteParaExcluir) {
            excluirPaciente(pacienteParaExcluir.id);
        }
    };

    const pacientesFiltrados = useMemo(() => {
        if (!searchTerm) {
            return pacientes;
        }
        return pacientes.filter(p =>
            obterNomeExibicao(p)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.cpf?.includes(searchTerm)
        );
    }, [pacientes, searchTerm]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>;
        }

        if (isError) {
            return (
                <div className="text-red-600 flex flex-col items-center p-8">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Erro ao carregar pacientes: {error?.message}</p>
                </div>
            );
        }

        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pacientesFiltrados.length > 0 ? (
                            pacientesFiltrados.map((paciente) => (
                                <TableRow key={paciente.id}>
                                    <TableCell className="font-medium">{obterNomeExibicao(paciente)}</TableCell>
                                    <TableCell>{paciente.cpf || "Não informado"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/pacientes/${paciente.id}/editar`)}>
                                            <Info className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/pacientes/${paciente.id}/editar`)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setPacienteParaExcluir(paciente)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">Nenhum paciente encontrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    };

    // ✅ ESTRUTURA PRINCIPAL ATUALIZADA
    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    {/* Container flex para alinhar o título à esquerda e os botões à direita */}
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Gerenciar Pacientes</CardTitle>
                            <CardDescription>Busque, visualize e gerencie os pacientes cadastrados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Botão Voltar adicionado */}
                            <Button variant="outline" onClick={() => navigate('/recepcao/cadastro')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar
                            </Button>
                            {/* Botão Novo Paciente existente */}
                            <Button onClick={() => navigate('/pacientes/novo')}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Novo Paciente
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <Input
                            placeholder="Buscar por nome ou CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    {renderContent()}
                </CardContent>
            </Card>

            {/* Modal de confirmação de exclusão */}
            <Dialog open={!!pacienteParaExcluir} onOpenChange={() => setPacienteParaExcluir(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            Você tem certeza que deseja excluir o paciente {pacienteParaExcluir ? obterNomeExibicao(pacienteParaExcluir) : ''}? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPacienteParaExcluir(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleConfirmarExclusao} disabled={isExcluindoPaciente}>
                            {isExcluindoPaciente && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Pacientes;
