import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paciente } from '../../types/Paciente';
import { createPaciente, getPacienteById, updatePaciente } from '../../services/pacientesService.ts';

const initialState: Omit<Paciente, 'id'> = {
    nomeCompleto: '',
    cpf: '',
    justificativaAusenciaCpf: '',
    cns: '',
    sexo: '',
    dataNascimento: '',
    acamado: false,
    domiciliado: false,
    condSaudeMental: false,
    usaPlantas: false,
    outrasCondicoes: '',
    municipio: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    complemento: '',
    telefoneCelular: '',
    telefoneContato: '',
    tipoSanguineo: '',
    rg: '',
    orgaoEmissor: '',
    certidaoNascimento: '',
    carteiraTrabalho: '',
    tituloEleitor: '',
    prontuarioFamiliar: '',
    corRaca: '',
    etnia: '',
    escolaridade: '',
    situacaoFamiliar: '',
    cbo: ''
};

const CadastroForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [paciente, setPaciente] = useState<Omit<Paciente, 'id'> | Paciente>(initialState);
    const [loading, setLoading] = useState<boolean>(isEditing);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditing) {
            getPacienteById(Number(id))
                .then(data => {
                    if (data.dataNascimento) {
                        data.dataNascimento = data.dataNascimento.split('T')[0];
                    }
                    setPaciente(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Falha ao buscar paciente:', err);
                    setError('Falha ao buscar dados do paciente.');
                    setLoading(false);
                });
        }
    }, [id, isEditing]);

    // CORREÇÃO DEFINITIVA: Usando 'instanceof' para type guarding.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        const target = e.target; // Criamos uma constante para o alvo do evento

        // Agora, a verificação é robusta.
        // Se o alvo for uma instância de HTMLInputElement E seu tipo for 'checkbox'...
        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            // ...o TypeScript tem certeza que target.checked existe.
            setPaciente(prevState => ({
                ...prevState,
                [name]: target.checked
            }));
        } else {
            // Para todos os outros casos (inputs de texto, select, textarea), usamos o .value.
            setPaciente(prevState => ({
                ...prevState,
                [name]: target.value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (isEditing) {
                await updatePaciente({ ...paciente, id: Number(id) });
            } else {
                await createPaciente(paciente);
            }
            navigate('/pacientes');
        } catch (err) {
            console.error('Falha ao salvar paciente:', err);
            setError('Ocorreu um erro ao salvar o paciente. Verifique os dados e tente novamente.');
        }
    };

    if (loading) return <div>Carregando...</div>;

    // O restante do JSX do formulário permanece o mesmo.
    return (
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{isEditing ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-md">{error}</div>}

                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">Dados Pessoais</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <div className="lg:col-span-2">
                            <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" name="nomeCompleto" value={paciente.nomeCompleto || ''} onChange={handleChange} required className="input-style"/>
                        </div>
                        <div>
                            <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                            <input type="date" name="dataNascimento" value={paciente.dataNascimento || ''} onChange={handleChange} className="input-style"/>
                        </div>
                        <div>
                            <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">Sexo</label>
                            <select name="sexo" value={paciente.sexo || ''} onChange={handleChange} className="input-style">
                                <option value="">Selecione...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="corRaca" className="block text-sm font-medium text-gray-700">Cor/Raça</label>
                            <select name="corRaca" value={paciente.corRaca || ''} onChange={handleChange} className="input-style">
                                <option value="">Selecione...</option>
                                <option value="Branca">Branca</option>
                                <option value="Preta">Preta</option>
                                <option value="Parda">Parda</option>
                                <option value="Amarela">Amarela</option>
                                <option value="Indigena">Indígena</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tipoSanguineo" className="block text-sm font-medium text-gray-700">Tipo Sanguíneo</label>
                            <select name="tipoSanguineo" value={paciente.tipoSanguineo || ''} onChange={handleChange} className="input-style">
                                <option value="">Selecione...</option>
                                <option value="A+">A+</option><option value="A-">A-</option>
                                <option value="B+">B+</option><option value="B-">B-</option>
                                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                <option value="O+">O+</option><option value="O-">O-</option>
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">Documentos</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                            <input type="text" name="cpf" value={paciente.cpf || ''} onChange={handleChange} className="input-style"/>
                        </div>
                        <div>
                            <label htmlFor="cns" className="block text-sm font-medium text-gray-700">CNS (Cartão Nac. de Saúde)</label>
                            <input type="text" name="cns" value={paciente.cns || ''} onChange={handleChange} className="input-style"/>
                        </div>
                        <div>
                            <label htmlFor="rg" className="block text-sm font-medium text-gray-700">RG</label>
                            <input type="text" name="rg" value={paciente.rg || ''} onChange={handleChange} className="input-style"/>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">Endereço e Contato</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
                            <input type="text" name="cep" value={paciente.cep || ''} onChange={handleChange} className="input-style"/>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="logradouro" className="block text-sm font-medium text-gray-700">Logradouro (Rua, Av.)</label>
                            <input type="text" name="logradouro" value={paciente.logradouro || ''} onChange={handleChange} className="input-style"/>
                        </div>
                        <div>
                            <label htmlFor="numero" className="block text-sm font-medium text-gray-700">Número</label>
                            <input type="text" name="numero" value={paciente.numero || ''} onChange={handleChange} className="input-style"/>
                        </div>
                        <div>
                            <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">Bairro</label>
                            <input type="text" name="bairro" value={paciente.bairro || ''} onChange={handleChange} className="input-style"/>
                        </div>
                        <div>
                            <label htmlFor="municipio" className="block text-sm font-medium text-gray-700">Município</label>
                            <input type="text" name="municipio" value={paciente.municipio || ''} onChange={handleChange} className="input-style"/>
                        </div>
                        <div>
                            <label htmlFor="telefoneCelular" className="block text-sm font-medium text-gray-700">Telefone Celular</label>
                            <input type="tel" name="telefoneCelular" value={paciente.telefoneCelular || ''} onChange={handleChange} className="input-style"/>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">Condições de Saúde</legend>
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center">
                            <input type="checkbox" id="acamado" name="acamado" checked={paciente.acamado || false} onChange={handleChange} className="h-4 w-4 rounded"/>
                            <label htmlFor="acamado" className="ml-2 block text-sm text-gray-900">Paciente acamado</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="domiciliado" name="domiciliado" checked={paciente.domiciliado || false} onChange={handleChange} className="h-4 w-4 rounded"/>
                            <label htmlFor="domiciliado" className="ml-2 block text-sm text-gray-900">Atendimento domiciliar</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="condSaudeMental" name="condSaudeMental" checked={paciente.condSaudeMental || false} onChange={handleChange} className="h-4 w-4 rounded"/>
                            <label htmlFor="condSaudeMental" className="ml-2 block text-sm text-gray-900">Possui condição de saúde mental</label>
                        </div>
                    </div>
                </fieldset>

                <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => navigate('/pacientes')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition-colors">
                        {isEditing ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CadastroForm;
