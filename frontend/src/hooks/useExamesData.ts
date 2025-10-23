import { useQuery } from '@tanstack/react-query';
import apiService from '@/services/apiService';

export interface ExameLaboratorial {
    id: string;
    nome: string;
    codigo: string;
    preparo?: string;
    jejum: boolean;
    disponivel: boolean;
    categoria: string;
}

export interface ExameImagem {
    id: string;
    nome: string;
    tipo: 'ultrassom' | 'raio_x' | 'tomografia' | 'ressonancia' | 'mamografia';
    preparo?: string;
    disponivel: boolean;
    equipamento: string;
}

export const useExamesLaboratoriais = () => {
    return useQuery<ExameLaboratorial[]>({
        queryKey: ['exames-laboratoriais'],
        queryFn: async () => {
            // Por enquanto, dados simulados. Depois conectar com API
            return [
                { id: 'hemograma', nome: 'Hemograma Completo', codigo: 'HEM001', jejum: false, disponivel: true, categoria: 'Hematologia' },
                { id: 'glicemia', nome: 'Glicemia de Jejum', codigo: 'GLI001', jejum: true, disponivel: true, categoria: 'Bioquímica' },
                { id: 'colesterol', nome: 'Colesterol Total e Frações', codigo: 'COL001', jejum: true, disponivel: true, categoria: 'Bioquímica' },
                { id: 'tsh', nome: 'TSH - Hormônio Tireoestimulante', codigo: 'TSH001', jejum: false, disponivel: true, categoria: 'Hormônios' },
                { id: 'ureia', nome: 'Ureia e Creatinina', codigo: 'URE001', jejum: false, disponivel: true, categoria: 'Bioquímica' },
                { id: 'eas', nome: 'Exame de Urina (EAS)', codigo: 'EAS001', jejum: false, disponivel: true, categoria: 'Urinálise' }
            ];
        },
        staleTime: 300000, // 5 minutos
    });
};

export const useExamesImagem = () => {
    return useQuery<ExameImagem[]>({
        queryKey: ['exames-imagem'],
        queryFn: async () => {
            // Por enquanto, dados simulados. Depois conectar com API
            return [
                { id: 'rx_torax', nome: 'Raio-X de Tórax', tipo: 'raio_x', disponivel: true, equipamento: 'Equipamento 1' },
                { id: 'us_abdomen', nome: 'Ultrassom de Abdômen', tipo: 'ultrassom', disponivel: true, equipamento: 'Ultrassom 1' },
                { id: 'mamografia', nome: 'Mamografia Bilateral', tipo: 'mamografia', disponivel: true, equipamento: 'Mamógrafo 1' },
                { id: 'tc_cranio', nome: 'Tomografia de Crânio', tipo: 'tomografia', disponivel: true, equipamento: 'Tomógrafo 1' },
                { id: 'rm_coluna', nome: 'Ressonância de Coluna', tipo: 'ressonancia', disponivel: false, equipamento: 'RM 1' }
            ];
        },
        staleTime: 300000, // 5 minutos
    });
};