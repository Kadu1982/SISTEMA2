import apiService from "@/services/apiService";
import { FarmaciaDTO } from "@/types/FarmaciaDTO";
// AULA: Importamos os novos tipos que definimos para garantir a consistência dos dados.
import { Prescricao, DispensacaoAvulsaPayload, MedicamentoItem } from "@/types/Prescricao";

/**
 * Cria uma nova prescrição médica para um paciente.
 * @param data Dados da prescrição contendo pacienteId, atendimentoId e medicamentos
 * @returns Uma promessa que resolve para a prescrição criada
 */
export const criarPrescricao = async (data: {
    pacienteId: string;
    atendimentoId: string;
    medicamentos: MedicamentoItem[];
}): Promise<Prescricao> => {
    const response = await apiService.post('/prescricoes', data);
    return response.data;
};

export const listarFarmacias = async (): Promise<FarmaciaDTO[]> => {
    const response = await apiService.get("/farmacias");
    return response.data;
};

export const salvarFarmacia = async (farmacia: FarmaciaDTO): Promise<FarmaciaDTO> => {
    const response = await apiService.post("/farmacias", farmacia);
    return response.data;
};

export const buscarFarmaciaPorId = async (id: number): Promise<FarmaciaDTO> => {
    const response = await apiService.get(`/farmacias/${id}`);
    return response.data;
};

export const deletarFarmacia = async (id: number): Promise<void> => {
    await apiService.delete(`/farmacias/${id}`);
};

// --- NOVAS FUNÇÕES ---

/**
 * AULA: Esta é a função que faltava. Agora ela aceita o ID do paciente como parâmetro.
 * O endpoint `/prescricoes/pendentes/${pacienteId}` é o que o backend deverá prover.
 * Retorna uma promessa de um array de Prescrições.
 */
export const buscarPrescricoesPendentes = async (pacienteId: string): Promise<Prescricao[]> => {
    const response = await apiService.get(`/prescricoes/pendentes/${pacienteId}`);
    return response.data;
};

/**
 * AULA: Função para registrar a dispensação de uma prescrição existente.
 * Envia um POST para o backend com os dados dos medicamentos dispensados.
 */
export const dispensarPrescricao = async (prescricaoId: string, medicamentos: MedicamentoItem[]): Promise<void> => {
    await apiService.post(`/prescricoes/${prescricaoId}/dispensar`, { medicamentos });
};

/**
 * AULA: Função para registrar uma dispensação que não está atrelada a uma prescrição prévia.
 * Recebe o payload com o ID do paciente e a lista de medicamentos.
 */
export const criarDispensacaoAvulsa = async (payload: DispensacaoAvulsaPayload): Promise<void> => {
    await apiService.post('/dispensacoes/avulsas', payload);
};
