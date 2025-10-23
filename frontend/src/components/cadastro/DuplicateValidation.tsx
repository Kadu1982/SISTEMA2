import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle, User } from "lucide-react";
import {
  validatePatientDuplicate,
  PatientData,
  ValidationResult,
  ValidationConfig,
} from "@/services/duplicateValidationService";
import { Paciente } from "@/types/paciente/Paciente"; // Importar o tipo Paciente

interface DuplicateValidationProps {
  patientData: PatientData;
  validationConfig?: ValidationConfig;
  onValidationComplete: (result: ValidationResult) => void;
  onCancel: () => void;
}

export const DuplicateValidation: React.FC<DuplicateValidationProps> = ({
                                                                          patientData,
                                                                          validationConfig,
                                                                          onValidationComplete,
                                                                          onCancel,
                                                                        }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
      useState<ValidationResult | null>(null);

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await validatePatientDuplicate(
          patientData,
          validationConfig,
      );
      setValidationResult(result);
      onValidationComplete(result);
    } catch (error) {
      console.error("Erro na validação:", error);
    } finally {
      setIsValidating(false);
    }
  };

  // CORREÇÃO: A função agora aceita 'string | undefined | null' para segurança.
  const formatCPF = (cpf: string | undefined | null) => {
    // Se o CPF for nulo ou indefinido, retorna um texto padrão.
    if (!cpf) {
      return "Não informado";
    }
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const renderValidationData = () => (
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Dados sendo validados:</h3>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Nome:</strong> {patientData.nome}
          </p>
          <p>
            {/* CORREÇÃO: Adicionado fallback para caso o nome da mãe não exista */}
            <strong>Nome da Mãe:</strong> {patientData.nomeMae || "Não informado"}
          </p>
          <p>
            {/* CORREÇÃO: A chamada agora é segura, pois formatCPF trata valores nulos */}
            <strong>CPF da Mãe:</strong> {formatCPF(patientData.cpfMae)}
          </p>
        </div>
      </div>
  );

  if (isValidating) {
    return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Validando Cadastro
            </CardTitle>
            <CardDescription>
              Analisando se o paciente já está cadastrado no sistema...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {renderValidationData()}
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600">
                  Consultando base de dados e analisando com IA...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
    );
  }

  if (validationResult) {
    return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isDuplicate ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Resultado da Validação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <Badge
                    variant={
                      validationResult.isDuplicate ? "destructive" : "default"
                    }
                    className="text-lg px-4 py-2"
                >
                  {validationResult.aiAnalysis}
                </Badge>
              </div>

              {validationResult.isDuplicate && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-2">
                      ⚠️ Possível Duplicata Detectada
                    </h3>
                    <p className="text-red-700 text-sm mb-3">
                      O sistema identificou que este paciente pode já estar
                      cadastrado. Verifique os registros abaixo antes de prosseguir.
                    </p>

                    {validationResult.possibleDuplicates.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-800">
                            Cadastros Similares Encontrados:
                          </h4>
                          {validationResult.possibleDuplicates.map(
                              (duplicate: Paciente, index) => ( // Tipar 'duplicate' como Paciente
                                  <div
                                      key={index}
                                      className="bg-white p-3 rounded border"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <User className="h-4 w-4" />
                                      <span className="font-medium">
                              {duplicate.nome}
                            </span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p>
                                        <strong>CPF:</strong> {duplicate.cpf}
                                      </p>
                                      <p>
                                        <strong>CNS:</strong> {duplicate.cns}
                                      </p>
                                      <p>
                                        <strong>Data Nascimento:</strong>{" "}
                                        {duplicate.dataNascimento}
                                      </p>
                                      <p>
                                        <strong>Unidade:</strong> {duplicate.unidadeSaude}
                                      </p>
                                      {/* O código aqui já é seguro devido à verificação condicional */}
                                      {duplicate.nomeMae && (
                                          <p>
                                            <strong>Nome da Mãe:</strong>{" "}
                                            {duplicate.nomeMae}
                                          </p>
                                      )}
                                      {duplicate.cpfMae && (
                                          <p>
                                            <strong>CPF da Mãe:</strong>{" "}
                                            {formatCPF(duplicate.cpfMae)}
                                          </p>
                                      )}
                                    </div>
                                  </div>
                              ),
                          )}
                        </div>
                    )}
                  </div>
              )}

              {!validationResult.isDuplicate && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">
                      ✅ Cadastro Liberado
                    </h3>
                    <p className="text-green-700 text-sm">
                      Nenhuma duplicata foi encontrada. O cadastro pode prosseguir
                      normalmente.
                    </p>
                  </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                {!validationResult.isDuplicate && (
                    <Button onClick={() => onValidationComplete(validationResult)}>
                      Prosseguir com Cadastro
                    </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Validação de Duplicatas</CardTitle>
          <CardDescription>
            Antes de finalizar o cadastro, vamos verificar se este paciente já
            está registrado no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {renderValidationData()}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button onClick={handleValidate}>Validar Cadastro</Button>
            </div>
          </div>
        </CardContent>
      </Card>
  );
};