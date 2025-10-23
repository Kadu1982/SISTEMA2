// src/hooks/useBiometria.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { biometriaService, NovaBiometria } from "../services/biometriaService";
import { useToast } from "./use-toast";

export function useBiometrias(usuarioId: number) {
  return useQuery({
    queryKey: ["biometrias", usuarioId],
    queryFn: () => biometriaService.listarPorUsuario(usuarioId),
    enabled: !!usuarioId,
  });
}

export function useCriarBiometria() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dados: NovaBiometria) => biometriaService.criar(dados),
    onSuccess: (_, dados) => {
      queryClient.invalidateQueries({
        queryKey: ["biometrias", dados.usuarioId],
      });
      toast({
        title: "Sucesso",
        description: "Biometria registrada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar biometria.",
        variant: "destructive",
      });
    },
  });
}
