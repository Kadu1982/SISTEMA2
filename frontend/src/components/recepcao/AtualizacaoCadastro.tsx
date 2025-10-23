import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Fingerprint, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BiometricLogin } from "../auth/BiometricLogin";
import { IdentificacaoMunicipe } from "./IdentificacaoMunicipe";

interface PatientData {
  id: string;
  nome: string;
  cpf: string;
  cartaoSus: string;
  dataNascimento: string;
}

export const AtualizacaoCadastro: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<
    "auth" | "identify" | "update"
  >("auth");
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(
    null,
  );
  const [showBiometric, setShowBiometric] = useState(false);
  const { toast } = useToast();

  const handleReceptionistAuth = (userData: any) => {
    setAuthenticatedUser(userData);
    setCurrentStep("identify");
    setShowBiometric(false);

    toast({
      title: "Recepcionista Autenticado",
      description: `${userData.nome} autorizado para atualizar cadastros.`,
    });
  };

  const handlePatientSelected = (patientData: any) => {
    setSelectedPatient(patientData);
    setCurrentStep("update");
  };

  if (currentStep === "auth") {
    return (
      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Autorização Necessária:</strong> Para atualizar cadastros é
            necessário autenticação biométrica do recepcionista autorizado.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Edit className="h-5 w-5" />
              Atualização de Cadastro
            </CardTitle>
            <CardDescription>
              Autentique-se para atualizar cadastros existentes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => setShowBiometric(true)}
              size="lg"
              className="w-full"
            >
              <Fingerprint className="mr-2 h-5 w-5" />
              Autenticar Recepcionista
            </Button>
          </CardContent>
        </Card>

        {showBiometric && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <BiometricLogin
                mode="login"
                onLoginSuccess={handleReceptionistAuth}
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
      </div>
    );
  }

  if (currentStep === "identify") {
    return (
      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Recepcionista Autenticado:</strong>{" "}
            {authenticatedUser?.nome} - {authenticatedUser?.unidade}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Identificar Munícipe para Atualização</CardTitle>
            <CardDescription>
              Use a biometria ou busca manual para encontrar o cadastro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IdentificacaoMunicipe />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentStep("auth");
              setAuthenticatedUser(null);
            }}
          >
            Encerrar Sessão
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Atualizando cadastro de:</strong> {selectedPatient?.nome}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Atuais do Munícipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="font-semibold">Nome</label>
              <p>{selectedPatient?.nome}</p>
            </div>
            <div>
              <label className="font-semibold">CPF</label>
              <p>{selectedPatient?.cpf}</p>
            </div>
            <div>
              <label className="font-semibold">Cartão SUS</label>
              <p>{selectedPatient?.cartaoSus}</p>
            </div>
            <div>
              <label className="font-semibold">Data de Nascimento</label>
              <p>
                {selectedPatient?.dataNascimento
                  ? new Date(
                      selectedPatient.dataNascimento,
                    ).toLocaleDateString()
                  : "Não informado"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Formulário de atualização será implementado aqui
            </p>
            <Button
              onClick={() => {
                toast({
                  title: "Cadastro Atualizado",
                  description: "Dados do munícipe atualizados com sucesso!",
                });
                setCurrentStep("auth");
                setAuthenticatedUser(null);
                setSelectedPatient(null);
              }}
            >
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("identify")}>
          Voltar
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setCurrentStep("auth");
            setAuthenticatedUser(null);
            setSelectedPatient(null);
          }}
        >
          Encerrar Sessão
        </Button>
      </div>
    </div>
  );
};
