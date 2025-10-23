import apiService from './apiService';
import { Cid } from '@/types/Cid';

/**
 * Interface for the response from the CID search endpoint
 */
interface CidResponse {
    success: boolean;
    data: Cid[];
}

/**
 * Searches for CID codes by code or description
 * @param termo The search term (code or description)
 * @returns A promise that resolves to an array of CID objects
 */
export const buscarCidsPorTermo = async (termo: string): Promise<Cid[]> => {
    // Avoid API calls for empty or very short terms
    if (!termo || termo.trim().length < 2) {
        return [];
    }

    try {
        const response = await apiService.get<CidResponse>('/cids', {
            params: { busca: termo.trim() }
        });

        // Check if the response was successful
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error('Erro ao buscar CIDs:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Erro ao buscar CIDs:', error);
        return [];
    }
};
