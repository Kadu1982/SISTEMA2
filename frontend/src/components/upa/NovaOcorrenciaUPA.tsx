import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash, Building2 } from 'lucide-react';
import { getUpas, deleteUpa } from '@/services/upaService';
import { UpaDTO } from '@/types/upa';
import { PacienteList } from '@/types/paciente/Paciente';
import UpaForm from './UpaForm';
import PacienteIdNome from '@/components/common/PacienteIdNome';

const NovaOcorrenciaUPA: React.FC = () => {
    const [upas, setUpas] = useState<UpaDTO[]>([]);
    const [selectedUpa, setSelectedUpa] = useState<UpaDTO | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const carregarUpas = async () => {
        try {
            setIsLoading(true);
            console.log('📡 Carregando lista de UPAs...');
            const dados = await getUpas();
            console.log('✅ UPAs carregadas:', dados);
            setUpas(dados);
        } catch (error) {
            console.error('❌ Erro ao carregar UPAs:', error);
            alert('Erro ao carregar os atendimentos. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (upa: UpaDTO) => {
        console.log('✏️ Editando UPA:', upa);
        setSelectedUpa(upa);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Deseja realmente excluir este atendimento?')) {
            return;
        }

        try {
            console.log(`🗑️ Deletando UPA ID: ${id}`);
            await deleteUpa(id);
            console.log('✅ UPA deletada com sucesso');
            await carregarUpas();
        } catch (error) {
            console.error('❌ Erro ao deletar UPA:', error);
            alert('Erro ao excluir o atendimento. Tente novamente.');
        }
    };

    const handleNova = () => {
        console.log('➕ Criando nova UPA');
        setSelectedUpa(null);
        setShowForm(true);
    };

    const handleFormClose = (pacienteCriado?: PacienteList) => {
        console.log('❌ Fechando formulário UPA');
        setShowForm(false);
        setSelectedUpa(null);
        carregarUpas();

        if (pacienteCriado) {
            alert(`Atendimento registrado com sucesso para o paciente: ${pacienteCriado.nomeCompleto}`);
        }
    };

    useEffect(() => {
        carregarUpas();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Carregando atendimentos...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Histórico de Atendimentos
                    </h3>
                </div>
                <Button
                    onClick={handleNova}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                    <PlusCircle size={18} />
                    Nova Ficha
                </Button>
            </div>

            {upas.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">Nenhum atendimento registrado.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {upas.map((upa) => (
                        <div
                            key={upa.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 size={20} className="text-blue-600" />
                                        <p className="font-semibold text-lg">
                                            {upa.pacienteNome || `Paciente ${upa.pacienteId}`}
                                        </p>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Ficha #{upa.id}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        📅 Registrado em: {new Date(upa.dataHoraRegistro).toLocaleString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </p>
                                    {upa.observacoes && (
                                        <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                                            📝 {upa.observacoes}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(upa)}
                                        title="Editar atendimento"
                                        className="hover:bg-blue-50 hover:border-blue-300"
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(upa.id!)}
                                        title="Excluir atendimento"
                                    >
                                        <Trash size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Formulário de UPA */}
            {showForm && (
                <UpaForm upa={selectedUpa} onClose={handleFormClose} />
            )}
        </div>
    );
};

export default NovaOcorrenciaUPA;