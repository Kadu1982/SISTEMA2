import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import {
  assinaturaDigitalService,
  CriarSenhaAssinaturaRequest,
  AssinaturaDigitalRequest,
} from "@/services/assinaturaDigitalService";
import { useToast } from "@/hooks/use-toast";

interface AssinaturaDigitalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividadeId?: number;
  operadorId: number;
  onSuccess?: () => void;
}

/**
 * Dialog para gerenciar assinatura digital:
 * - Criar/atualizar senha de assinatura
 * - Assinar atividade de enfermagem
 */
export const AssinaturaDigitalDialog: React.FC<AssinaturaDigitalDialogProps> = ({
  open,
  onOpenChange,
  atividadeId,
  operadorId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [modo, setModo] = useState<"senha" | "assinar">("senha");
  const [loading, setLoading] = useState(false);
  const [temSenha, setTemSenha] = useState(false);
  const [verificando, setVerificando] = useState(false);

  // Formulário de senha
  const [senhaAssinatura, setSenhaAssinatura] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [coren, setCoren] = useState("");

  // Formulário de assinatura
  const [senhaLogin, setSenhaLogin] = useState("");
  const [senhaAssinaturaAssinar, setSenhaAssinaturaAssinar] = useState("");
  const [corenAssinar, setCorenAssinar] = useState("");

  // Resetar estado quando o diálogo abre
  useEffect(() => {
    if (open) {
      // Resetar para modo senha quando abre (será ajustado após verificação)
      setModo("senha");
      setTemSenha(false);
      setSenhaAssinatura("");
      setConfirmarSenha("");
      setCoren("");
      setSenhaLogin("");
      setSenhaAssinaturaAssinar("");
      setCorenAssinar("");
    }
  }, [open]);

  // Verifica se operador tem senha cadastrada
  useEffect(() => {
    if (open && operadorId) {
      verificarSenha();
    }
  }, [open, operadorId]);

  const verificarSenha = async () => {
    try {
      setVerificando(true);
      const tem = await assinaturaDigitalService.verificarSenhaAssinatura(operadorId);
      console.log("🔍 Verificação de senha:", { operadorId, tem, atividadeId });
      setTemSenha(tem);
      
      // IMPORTANTE: Se não tem senha, SEMPRE vai para modo "senha" primeiro
      // Só vai para modo "assinar" se TEM senha E tem atividadeId
      if (!tem) {
        console.log("📝 Sem senha cadastrada - forçando modo: senha");
        setModo("senha");
      } else if (atividadeId && tem) {
        console.log("✅ Tem senha e atividadeId - modo: assinar");
        setModo("assinar");
      } else {
        console.log("📝 Sem atividadeId ou sem senha - modo: senha");
        setModo("senha");
      }
    } catch (error: any) {
      console.error("❌ Erro ao verificar senha:", error);
      // Em caso de erro, assume que não tem senha e vai para modo criar senha
      setTemSenha(false);
      setModo("senha");
      console.log("⚠️ Erro na verificação - forçando modo: senha");
    } finally {
      setVerificando(false);
    }
  };

  const handleCriarSenha = async () => {
    if (!senhaAssinatura || senhaAssinatura.length < 6) {
      toast({
        title: "Erro",
        description: "Senha deve ter no mínimo 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (senhaAssinatura !== confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (!coren || coren.trim() === "") {
      toast({
        title: "Erro",
        description: "COREN é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const request: CriarSenhaAssinaturaRequest = {
        operadorId,
        senhaAssinatura,
        coren: coren.trim(),
      };

      console.log("📝 Criando senha de assinatura:", { operadorId, coren: coren.trim(), senhaLength: senhaAssinatura.length });
      
      const resultado = await assinaturaDigitalService.criarSenhaAssinatura(request);
      
      console.log("✅ Senha criada com sucesso:", resultado);

      toast({
        title: "Sucesso!",
        description: "Senha de assinatura criada/atualizada com sucesso",
      });

      setTemSenha(true);
      setSenhaAssinatura("");
      setConfirmarSenha("");
      setCoren("");

      // Se tem atividadeId, muda para modo assinar após criar senha
      if (atividadeId) {
        setModo("assinar");
        // Não fecha o diálogo, apenas muda o modo para permitir assinar
      } else {
        // Se não tem atividadeId, fecha o diálogo após criar senha
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("❌ Erro ao criar senha de assinatura:", error);
      console.error("❌ Detalhes do erro:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Erro ao criar senha de assinatura. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssinar = async () => {
    // Validações de campos obrigatórios
    if (!senhaLogin || senhaLogin.trim() === "") {
      toast({
        title: "Erro",
        description: "A senha de login é obrigatória",
        variant: "destructive",
      });
      return;
    }

    if (!senhaAssinaturaAssinar || senhaAssinaturaAssinar.trim() === "") {
      toast({
        title: "Erro",
        description: "A senha de assinatura é obrigatória",
        variant: "destructive",
      });
      return;
    }

    if (!corenAssinar || corenAssinar.trim() === "") {
      toast({
        title: "Erro",
        description: "O COREN é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!atividadeId) {
      toast({
        title: "Erro",
        description: "ID da atividade não informado",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Obtém IP do cliente (simplificado)
      const ipAddress = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => "0.0.0.0");

      const request: AssinaturaDigitalRequest = {
        operadorId,
        senhaLogin: senhaLogin.trim(),
        senhaAssinatura: senhaAssinaturaAssinar.trim(),
        ipAddress,
        coren: corenAssinar.trim(),
      };

      await assinaturaDigitalService.assinarAtividade(atividadeId, request);

      toast({
        title: "Sucesso!",
        description: "Atividade assinada digitalmente com sucesso",
      });

      setSenhaLogin("");
      setSenhaAssinaturaAssinar("");
      setCorenAssinar("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      // Melhora o tratamento de erros para distinguir entre senha de login e senha de assinatura
      const errorMessage = error?.response?.data?.message || error?.message || "Erro ao assinar atividade";
      
      let title = "Erro";
      let description = errorMessage;

      // Mensagens mais específicas baseadas no tipo de erro
      if (errorMessage.toLowerCase().includes("senha de login")) {
        title = "Senha de Login Inválida";
        description = "A senha de login informada está incorreta. Verifique e tente novamente.";
      } else if (errorMessage.toLowerCase().includes("senha de assinatura")) {
        title = "Senha de Assinatura Inválida";
        description = "A senha de assinatura informada está incorreta. Verifique e tente novamente.";
      } else if (errorMessage.toLowerCase().includes("coren")) {
        title = "COREN Inválido";
        description = "O COREN informado é inválido. Verifique o formato (ex: 123456-EN) e tente novamente.";
      } else if (errorMessage.toLowerCase().includes("checklist")) {
        title = "Checklist Incompleto";
        description = "O checklist dos 5 certos não está completo. Complete todos os itens antes de assinar.";
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {modo === "senha" ? "Criar Senha de Assinatura" : "Assinar Digitalmente"}
          </DialogTitle>
          <DialogDescription>
            {modo === "senha"
              ? "Crie uma senha de assinatura digital (diferente da senha de login)"
              : "Assine digitalmente a atividade de enfermagem"}
          </DialogDescription>
        </DialogHeader>

        {verificando ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : modo === "senha" ? (
          // Formulário para criar/atualizar senha de assinatura
          <div className="space-y-4 py-4">
            {temSenha && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você já possui uma senha de assinatura cadastrada. Ao criar uma nova, a
                  anterior será substituída.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="coren">COREN *</Label>
              <Input
                id="coren"
                type="text"
                placeholder="Ex: 123456-EN"
                value={coren}
                onChange={(e) => setCoren(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha de Assinatura *</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senhaAssinatura}
                onChange={(e) => setSenhaAssinatura(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmar">Confirmar Senha *</Label>
              <Input
                id="confirmar"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {!temSenha && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p>Você precisa criar uma senha de assinatura antes de assinar atividades.</p>
                  {atividadeId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setModo("senha");
                        // Limpa campos de assinatura quando muda para criar senha
                        setSenhaLogin("");
                        setSenhaAssinaturaAssinar("");
                        setCorenAssinar("");
                      }}
                      className="mt-2"
                    >
                      Criar Senha Agora
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="senha-login">Senha de Login *</Label>
              <Input
                id="senha-login"
                type="password"
                placeholder="Digite sua senha de login"
                value={senhaLogin}
                onChange={(e) => setSenhaLogin(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha-assinatura">Senha de Assinatura *</Label>
              <Input
                id="senha-assinatura"
                type="password"
                placeholder="Digite sua senha de assinatura"
                value={senhaAssinaturaAssinar}
                onChange={(e) => setSenhaAssinaturaAssinar(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coren-assinar">COREN *</Label>
              <Input
                id="coren-assinar"
                type="text"
                placeholder="Ex: 123456-EN"
                value={corenAssinar}
                onChange={(e) => setCorenAssinar(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSenhaAssinatura("");
              setConfirmarSenha("");
              setCoren("");
              setSenhaLogin("");
              setSenhaAssinaturaAssinar("");
              setCorenAssinar("");
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={modo === "senha" ? handleCriarSenha : handleAssinar}
            disabled={loading || (modo === "assinar" && !temSenha)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {modo === "senha" ? "Criando..." : "Assinando..."}
              </>
            ) : modo === "senha" ? (
              "Criar Senha"
            ) : (
              "Assinar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssinaturaDigitalDialog;

