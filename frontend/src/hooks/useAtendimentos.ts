import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atendimentoService, Atendimento, AtendimentoRequest } from "@/services/AtendimentoService";

// ✅ HOOK PRESERVADO E MELHORADO
export function useAtendimentos(pacienteId?: string) {
  return useQuery({
    queryKey: ["atendimentos", pacienteId],
    queryFn: async () => {
      if (pacienteId) {
        const atendimentos = await atendimentoService.listarPorPaciente(pacienteId);
        console.log("📋 Atendimentos carregados para paciente", pacienteId, ":", atendimentos.length);
        return atendimentos;
      } else {
        return atendimentoService.listarTodos();
      }
    },
    enabled: !!pacienteId, // ✅ CORRIGIDO: Só habilitar quando houver pacienteId
    staleTime: 1 * 60 * 1000, // ✅ REDUZIDO: 1 minuto para atualizar mais rápido
    retry: 2,
    refetchOnWindowFocus: true, // ✅ HABILITADO: Recarregar quando voltar à janela
  });
}

// ✅ NOVO HOOK PARA ATENDIMENTO ESPECÍFICO
export function useAtendimento(id: string) {
  return useQuery({
    queryKey: ["atendimento", id],
    queryFn: () => atendimentoService.buscarPorId(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ✅ HOOK PARA CRIAR ATENDIMENTO
export function useCriarAtendimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: AtendimentoRequest) => atendimentoService.criar(dados),
    onSuccess: (data) => {
      console.log('✅ Atendimento criado, invalidando cache...');
      queryClient.invalidateQueries({ queryKey: ["atendimentos"] });

      // Também invalidar dados específicos do paciente
      if (data.pacienteId) {
        queryClient.invalidateQueries({ queryKey: ["atendimentos", data.pacienteId] });
      }
    },
    onError: (error) => {
      console.error('❌ Erro ao criar atendimento:', error);
    }
  });
}

// ✅ HOOK PARA ATUALIZAR ATENDIMENTO
export function useAtualizarAtendimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Partial<AtendimentoRequest> }) =>
        atendimentoService.atualizar(id, dados),
    onSuccess: (data) => {
      console.log('✅ Atendimento atualizado, invalidando cache...');
      queryClient.invalidateQueries({ queryKey: ["atendimentos"] });
      queryClient.invalidateQueries({ queryKey: ["atendimento", data.id] });

      if (data.pacienteId) {
        queryClient.invalidateQueries({ queryKey: ["atendimentos", data.pacienteId] });
      }
    },
    onError: (error) => {
      console.error('❌ Erro ao atualizar atendimento:', error);
    }
  });
}

// ✅ HOOK PARA EXCLUIR ATENDIMENTO
export function useExcluirAtendimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => atendimentoService.excluir(id),
    onSuccess: () => {
      console.log('✅ Atendimento excluído, invalidando cache...');
      queryClient.invalidateQueries({ queryKey: ["atendimentos"] });
    },
    onError: (error) => {
      console.error('❌ Erro ao excluir atendimento:', error);
    }
  });
}

// ✅ HOOK PARA BUSCAR POR PERÍODO
export function useAtendimentosPorPeriodo(dataInicio: string, dataFim: string) {
  return useQuery({
    queryKey: ["atendimentos", "periodo", dataInicio, dataFim],
    queryFn: () => atendimentoService.listarPorPeriodo(dataInicio, dataFim),
    enabled: !!dataInicio && !!dataFim,
    staleTime: 5 * 60 * 1000,
  });
}