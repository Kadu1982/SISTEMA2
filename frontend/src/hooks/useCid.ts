// src/hooks/useCid.ts

import { useQuery } from "@tanstack/react-query";
import { cidService } from "@/services/cidService";

export function useBuscarCids(query: string) {
  return useQuery({
    queryKey: ["cids", query],
    queryFn: () => cidService.buscar(query),
    enabled: !!query && query.length >= 3, // só busca com 3+ caracteres
    staleTime: 1000 * 60 * 5, // cache de 5 minutos
  });
}
