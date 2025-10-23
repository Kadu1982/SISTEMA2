import React, { useState, useEffect } from "react";
import { Fingerprint, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type IdentificacaoProps = {
  onIdentificar: (dadosIdentificacao: { id: string }) => void;
};

export const IdentificacaoMunicipe: React.FC<IdentificacaoProps> = ({
  onIdentificar,
}) => {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [, setSugestoes] = useState<
    Array<{ id: string; nome: string }>
  >([]);
  const [carregandoBiometria, setCarregandoBiometria] = useState(false);

  const [endereco, setEndereco] = useState("");
  const [telefoneCel, setTelefoneCel] = useState("");
  const [telefoneCon, setTelefoneCon] = useState("");
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  useEffect(() => {
    const buscarSugestoes = async () => {
      if (nome.length >= 3) {
        try {
          const response = await fetch(
            `/api/municipe/sugestoes?nome=${encodeURIComponent(nome)}`,
          );
          if (response.ok) {
            const data = await response.json();
            setSugestoes(data);
          }
        } catch (error) {
          console.error("Erro ao buscar sugestões:", error);
        }
      } else {
        setSugestoes([]);
      }
    };

    buscarSugestoes();
  }, [nome]);

  const atualizarDadosContato = async (usuarioId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/usuarios/${usuarioId}/contato`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endereco, telefoneCel, telefoneCon }),
        },
      );

      if (!response.ok) throw new Error("Falha ao atualizar");

      toast({
        title: "Dados atualizados",
        description: "Endereço e telefones salvos com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao salvar alterações",
        description: "Verifique a conexão ou tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleIdentificar = async () => {
    if (nome && cpf && usuarioId) {
      await atualizarDadosContato(usuarioId);
      onIdentificar({ id: usuarioId });
    } else if (nome && cpf) {
      onIdentificar({ id: `${nome}_${cpf}` });
    } else {
      toast({
        title: "Dados insuficientes",
        description: "Informe o nome e o CPF.",
        variant: "destructive",
      });
    }
  };

  const buscarUsuarioPorBiometria = async (templateId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/biometria/ler/${templateId}`,
      );
      const data = await response.json();

      if (data.sucesso && data.usuario) {
        setNome(data.usuario.usunome || "");
        setCpf(data.usuario.usucpf || "");
        setEndereco(data.usuario.usuendereco || "");
        setTelefoneCel(data.usuario.usutelcel || "");
        setTelefoneCon(data.usuario.usutelcon || "");
        setUsuarioId(String(data.usuario.id));

        toast({
          title: "Munícipe identificado",
          description: `Nome: ${data.usuario.usunome}`,
        });

        // 🔎 Verifica recepcao ativo
        try {
          const agendamentoResp = await fetch(
            `http://localhost:5000/api/agendamentos/ativo/${data.usuario.id}`,
          );
          const agendamentoData = await agendamentoResp.json();

          if (agendamentoData.agendado) {
            toast({
              title: "Agendamento encontrado",
              description: `Redirecionando para: ${agendamentoData.tipo.replace("_", " ")}`,
            });

            window.location.href = agendamentoData.destino;
            return;
          } else {
            toast({
              title: "Sem recepcao",
              description: "Paciente não possui recepcao ativo hoje.",
              variant: "destructive",
            });
          }
        } catch (err) {
          toast({
            title: "Erro ao verificar recepcao",
            description: "Falha ao consultar o backend de agendamentos.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Biometria não encontrada",
          description: "Tente digitar manualmente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao buscar usuário",
        description: "Falha ao consultar o backend com templateId.",
        variant: "destructive",
      });
    }
  };

  const handleBiometriaClick = async () => {
    try {
      setCarregandoBiometria(true);
      const data = { sucesso: true, templateId: "BIO123456789" };

      if (data.sucesso) {
        toast({
          title: "Biometria lida com sucesso!",
          description: `ID: ${data.templateId}`,
        });
        await buscarUsuarioPorBiometria(data.templateId);
      } else {
        toast({
          title: "Leitura falhou",
          description: "Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erro na simulação da biometria",
        description: "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setCarregandoBiometria(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Identificação do Munícipe</h2>

      <div className="mb-4">
        <label className="block mb-1">Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border rounded p-2 w-full"
          readOnly
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">CPF</label>
        <input
          type="text"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="border rounded p-2 w-full"
          readOnly
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Endereço</label>
        <input
          type="text"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Telefone Celular</label>
        <input
          type="text"
          value={telefoneCel}
          onChange={(e) => setTelefoneCel(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Telefone de Contato</label>
        <input
          type="text"
          value={telefoneCon}
          onChange={(e) => setTelefoneCon(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={handleIdentificar} className="bg-blue-500 text-white">
          Identificar
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleBiometriaClick}
          title="Ler biometria"
          disabled={carregandoBiometria}
        >
          {carregandoBiometria ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Fingerprint className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
