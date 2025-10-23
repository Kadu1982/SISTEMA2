import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fingerprint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BiometricCapture } from "../biometria/BiometricCapture";
import { useNavigate } from "react-router-dom";
import { BiometriaService } from "@/services/biometriaService";

const biometriaService = new BiometriaService();

interface Usuario {
  id: number;
  nome: string;
  cargo: string;
  unidadeAtual: string;
}

interface PacienteIdentificado {
  id: string;
  nome: string;
  cpf: string;
  cartaoSus: string;
  dataNascimento: string;
  endereco: string;
  telefone: string;
}

interface BiometricLoginProps {
  onLoginSuccess?: (userData: Usuario) => void;
  onPatientIdentified?: (patientData: PacienteIdentificado) => void;
  mode?: "login" | "patient_identification";
}

export const BiometricLogin: React.FC<BiometricLoginProps> = ({
                                                                onLoginSuccess,
                                                                onPatientIdentified,
                                                                mode = "login",
                                                              }) => {
  const [showBiometric, setShowBiometric] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBiometricVerified = async (templateId: string) => {
    try {
      const userData = await biometriaService.verificar(templateId);

      if (mode === "login") {
        const usuario = userData as Usuario;

        if (usuario.unidadeAtual?.includes("UBS")) {
          navigate("/atendimento/medico");
        } else {
          navigate("/gestao");
        }

        onLoginSuccess?.(usuario);

        toast({
          title: "Login por Biometria",
          description: `Bem-vindo, ${usuario.nome}`,
        });
      } else {
        const paciente = userData as PacienteIdentificado;

        onPatientIdentified?.(paciente);

        toast({
          title: "Paciente Identificado",
          description: `Nome: ${paciente.nome}`,
        });
      }
    } catch {
      toast({
        title: "Erro ao identificar",
        description: "Não foi possível completar a autenticação.",
        variant: "destructive",
      });
    } finally {
      setShowBiometric(false);
    }
  };

  return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Fingerprint className="h-5 w-5" />
            {mode === "login" ? "Login Biométrico" : "Identificação de Paciente"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
                ? "Faça login usando sua impressão digital"
                : "Identifique o paciente através da biometria"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
              onClick={() => setShowBiometric(true)}
              className="w-full"
              size="lg"
          >
            <Fingerprint className="mr-2 h-5 w-5" />
            {mode === "login" ? "Fazer Login" : "Identificar Paciente"}
          </Button>
        </CardContent>

        {showBiometric && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                {/* ✅ CORRIGIDO: A propriedade foi trocada para onCapture, conforme a definição do componente */}
                <BiometricCapture
                    mode="verify"
                    onCapture={handleBiometricVerified}
                />
                <Button
                    variant="outline"
                    onClick={() => setShowBiometric(false)}
                    className="w-full mt-4"
                >
                  Cancelar
                </Button>
              </div>
            </div>
        )}
      </Card>
  );
};