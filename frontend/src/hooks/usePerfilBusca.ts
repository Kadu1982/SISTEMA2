import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import configuracaoService, { Perfil } from '@/services/ConfiguracaoService';

export const usePerfilBusca = (termo: string, delay: number = 400) => {
    const [debounced, setDebounced] = useState(termo);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(termo), delay);
        return () => clearTimeout(id);
    }, [termo, delay]);

    const enabled = typeof debounced === 'string' && debounced.trim().length >= 2;

    const { data = [], isLoading, isError, error } = useQuery<Perfil[], Error>({
        queryKey: ['perfis', 'busca', debounced],
        queryFn: () => configuracaoService.buscarPerfisPorTermo(debounced),
        enabled,
        placeholderData: keepPreviousData,
    });

    return {
        perfis: enabled ? data : [],
        loading: isLoading,
        error: isError ? error.message : null,
    };
};