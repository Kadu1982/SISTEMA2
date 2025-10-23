import { Encaminhamento } from '@/services/assistenciaSocialService';

export const unidades = [
    { id: 1, nome: 'CRAS Centro', tipo: 'UNIDADE_ASSISTENCIAL' },
    { id: 2, nome: 'CRAS Norte', tipo: 'UNIDADE_ASSISTENCIAL' },
    { id: 3, nome: 'CREAS Municipal', tipo: 'UNIDADE_ASSISTENCIAL' },
    { id: 4, nome: 'UBS Central', tipo: 'UNIDADE_SAUDE' },
    { id: 5, nome: 'UBS Norte', tipo: 'UNIDADE_SAUDE' }
];

export const orgaosRede = [
    { id: 1, nome: 'Conselho Tutelar', tipo: 'ORGAO_REDE' },
    { id: 2, nome: 'Defensoria Pública', tipo: 'ORGAO_REDE' },
    { id: 3, nome: 'Ministério Público', tipo: 'ORGAO_REDE' },
    { id: 4, nome: 'Secretaria de Educação', tipo: 'ORGAO_REDE' },
    { id: 5, nome: 'INSS', tipo: 'ORGAO_REDE' }
];

export const profissionais = [
    { id: 1, nome: 'Maria Silva', especialidade: 'Assistente Social' },
    { id: 2, nome: 'João Santos', especialidade: 'Psicólogo' },
    { id: 3, nome: 'Ana Oliveira', especialidade: 'Assistente Social' }
];

export const pessoas = [
    { id: 1, nome: 'José Pereira' },
    { id: 2, nome: 'Maria Souza' },
    { id: 3, nome: 'Carlos Santos' },
    { id: 4, nome: 'Ana Oliveira' }
];

export const tiposEncaminhamento = [
    'Acompanhamento', 'Atendimento Psicossocial', 'Benefício Eventual', 'Cadastro Único',
    'Documentação Civil', 'Habitação', 'Saúde', 'Educação', 'Trabalho e Renda',
    'Previdência Social', 'Assistência Jurídica'
];

export const mockEncaminhamentos: Encaminhamento[] = [
    {
        id: 1, data: '2023-06-15', tipo: 'Saúde',
        origem: { id: 1, nome: 'CRAS Centro', tipo: 'UNIDADE_ASSISTENCIAL' },
        destino: { id: 4, nome: 'UBS Central', tipo: 'UNIDADE_SAUDE' },
        pessoa: { id: 1, nome: 'José Pereira' },
        profissional: { id: 1, nome: 'Maria Silva', especialidade: 'Assistente Social' },
        observacoes: 'Encaminhamento para consulta médica devido a problemas de saúde.',
        situacao: 'CONCLUIDO',
        contraReferencia: { data: '2023-06-20', profissional: 'Dr. Carlos Mendes', telefone: '(11) 98765-4321', anotacoes: 'Paciente atendido. Foram solicitados exames complementares.' }
    },
    {
        id: 2, data: '2023-06-16', tipo: 'Assistência Jurídica',
        origem: { id: 3, nome: 'CREAS Municipal', tipo: 'UNIDADE_ASSISTENCIAL' },
        destino: { id: 2, nome: 'Defensoria Pública', tipo: 'ORGAO_REDE' },
        pessoa: { id: 2, nome: 'Maria Souza' },
        profissional: { id: 2, nome: 'João Santos', especialidade: 'Psicólogo' },
        observacoes: 'Encaminhamento para orientação jurídica sobre pensão alimentícia.',
        situacao: 'PENDENTE'
    },
];