import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Cid } from '@/types/Cid';
import { buscarCidsPorTermo } from '@/services/cidService';

/**
 * Hook customizado para buscar CIDs com debounce, utilizando React Query.
 * @param termo O termo de busca digitado pelo usuário.
 * @param delay O tempo em milissegundos para o debounce (padrão: 500ms).
 */
export const useCidBusca = (termo: string, delay: number = 500) => {
    const [debouncedTermo, setDebouncedTermo] = useState(termo);

    // Efeito para aplicar o debounce ao termo de busca
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTermo(termo);
        }, delay);
        return () => clearTimeout(handler);
    }, [termo, delay]);

    // Verificação para garantir que debouncedTermo é uma string válida
    const isEnabled = typeof debouncedTermo === 'string' && debouncedTermo.trim().length >= 2;

    const {
        data: cids = [],
        isLoading: loading,
        isError,
        error,
    } = useQuery<Cid[], Error>({
        queryKey: ['cids', 'busca', debouncedTermo],
        queryFn: () => buscarCidsPorTermo(debouncedTermo),
        enabled: isEnabled,
        placeholderData: keepPreviousData,
    });

    const finalResults = isEnabled ? cids : [];
    const errorMessage = isError ? error.message : null;

    return { cids: finalResults, loading, error: errorMessage };
};