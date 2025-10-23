/**
 * Serviço HTTP de Estoque — axios(apiService) com endpoints do backend.
 */
import apiService from './apiService';
import type {
    ApiResponse, SaldoPorLoteDTO,
    EntradaDTO, SaidaDTO,
    TransferenciaDTO, AceiteTransferenciaDTO,
    LocalArmazenamento, Operacao, Insumo, Fabricante, TipoOperacao
} from '@/types/estoque';

// ========= Listagens =========
async function listarLocais(): Promise<LocalArmazenamento[]> {
    const { data } = await apiService.get<ApiResponse<LocalArmazenamento[]>>('/estoque/locais');
    if (!data.success) throw new Error(data.message || 'Falha ao listar locais');
    return data.data || [];
}
async function listarInsumos(): Promise<Insumo[]> {
    const { data } = await apiService.get<ApiResponse<Insumo[]>>('/estoque/insumos');
    if (!data.success) throw new Error(data.message || 'Falha ao listar insumos');
    return data.data || [];
}
async function listarOperacoes(tipo: TipoOperacao): Promise<Operacao[]> {
    const { data } = await apiService.get<ApiResponse<Operacao[]>>(`/estoque/operacoes`, { params: { tipo } });
    if (!data.success) throw new Error(data.message || 'Falha ao listar operações');
    return data.data || [];
}
async function listarFabricantes(): Promise<Fabricante[]> {
    const { data } = await apiService.get<ApiResponse<Fabricante[]>>('/estoque/fabricantes');
    if (!data.success) throw new Error(data.message || 'Falha ao listar fabricantes');
    return data.data || [];
}

// ========= Consultas =========
async function listarSaldos(localId: number, insumoId: number): Promise<SaldoPorLoteDTO[]> {
    const { data } = await apiService.get<SaldoPorLoteDTO[]>(`/estoque/saldos`, { params: { localId, insumoId } });
    return data || [];
}
async function listarVencimentos(localId: number, dataLimite: string): Promise<SaldoPorLoteDTO[]> {
    const { data } = await apiService.get<SaldoPorLoteDTO[]>(`/estoque/vencimentos`, { params: { localId, dataLimite } });
    return data || [];
}

// ========= Movimentações =========
async function criarEntrada(dto: EntradaDTO) {
    const { data } = await apiService.post<ApiResponse<number>>(`/estoque/entradas`, dto);
    return data;
}
async function criarSaida(dto: SaidaDTO) {
    const { data } = await apiService.post<ApiResponse<number>>(`/estoque/saidas`, dto);
    return data;
}
async function criarTransferencia(dto: TransferenciaDTO) {
    const { data } = await apiService.post<ApiResponse<number>>(`/estoque/transferencias`, dto);
    return data;
}
async function aceitarTransferencia(id: number, dto: AceiteTransferenciaDTO) {
    const { data } = await apiService.post<ApiResponse<number>>(`/estoque/transferencias/${id}/aceitar`, dto);
    return data;
}

// Exports nomeados (compatíveis com uso antigo) e objeto (uso novo)
export { listarLocais, listarInsumos, listarOperacoes, listarFabricantes,
    listarSaldos, listarVencimentos, criarEntrada, criarSaida,
    criarTransferencia, aceitarTransferencia };

export const estoqueService = {
    listarLocais, listarInsumos, listarOperacoes, listarFabricantes,
    listarSaldos, listarVencimentos, criarEntrada, criarSaida,
    criarTransferencia, aceitarTransferencia
};

export type { SaldoPorLoteDTO } from '@/types/estoque';
