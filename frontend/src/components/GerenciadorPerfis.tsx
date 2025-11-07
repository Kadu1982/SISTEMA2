import React, { useEffect, useState } from "react";
import { perfilService, TipoPerfil } from "@/services/perfilService";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface GerenciadorPerfisProps {
  perfisSelecionados: string[];
  onChange: (perfis: string[]) => void;
  disabled?: boolean;
}

/**
 * Componente para gerenciar (adicionar/remover) perfis de um operador
 * Usa a lista padronizada de perfis do backend
 */
export const GerenciadorPerfis: React.FC<GerenciadorPerfisProps> = ({
  perfisSelecionados,
  onChange,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [tiposPerfis, setTiposPerfis] = useState<TipoPerfil[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        setErro(null);
        const tipos = await perfilService.listarTiposDisponiveis();
        setTiposPerfis(tipos);
      } catch (error: any) {
        console.error("Erro ao carregar perfis:", error);
        setErro("Erro ao carregar tipos de perfis");
        toast({
          title: "Erro",
          description: "Não foi possível carregar os perfis disponíveis",
          variant: "destructive",
        });
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [toast]);

  const handleTogglePerfil = (codigo: string) => {
    if (perfisSelecionados.includes(codigo)) {
      onChange(perfisSelecionados.filter((p) => p !== codigo));
    } else {
      onChange([...perfisSelecionados, codigo]);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Carregando perfis...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
        {erro}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tiposPerfis.map((perfil) => (
          <label
            key={perfil.codigo}
            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <Checkbox
              checked={perfisSelecionados.includes(perfil.codigo)}
              onCheckedChange={() => handleTogglePerfil(perfil.codigo)}
              disabled={disabled}
            />
            <div className="flex-1">
              <div className="font-medium text-sm">{perfil.descricao}</div>
              <div className="text-xs text-gray-500">{perfil.codigo}</div>
            </div>
          </label>
        ))}
      </div>

      {perfisSelecionados.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
          ⚠️ Nenhum perfil selecionado. O operador não terá acesso a nenhuma funcionalidade.
        </div>
      )}

      {perfisSelecionados.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm font-medium text-blue-900 mb-2">
            Perfis selecionados ({perfisSelecionados.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {perfisSelecionados.map((codigo) => {
              const perfil = tiposPerfis.find((p) => p.codigo === codigo);
              return (
                <span
                  key={codigo}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-200 text-blue-900 text-sm"
                >
                  {perfil?.descricao || codigo}
                  <button
                    onClick={() => handleTogglePerfil(codigo)}
                    className="ml-2 text-blue-900 hover:text-blue-700"
                    disabled={disabled}
                  >
                    ✕
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciadorPerfis;

