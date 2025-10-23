// PROFESSOR: Este é o arquivo corrigido. As notas indicam os pontos da "cirurgia".

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// PONTO DA CIRURGIA 1: O ícone 'AlertCircle' não utilizado foi removido da importação.
import { Fingerprint, Scan, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// PONTO DA CIRURGIA 2: A "genética" do componente (sua interface) foi ajustada.
interface BiometricCaptureProps {
  // - A prop foi renomeada para 'onCapture' para corresponder ao que o LoginOperador envia.
  onCapture?: (biometricData: string) => void;
  mode?: "capture" | "verify";
  // - A prop 'patientId' foi removida pois não estava sendo utilizada.
}

export const BiometricCapture: React.FC<BiometricCaptureProps> = ({
                                                                    // PONTO DA CIRURGIA 3: A prop é recebida com o novo nome correto.
                                                                    onCapture,
                                                                    mode = "capture",
                                                                  }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [biometricData, setBiometricData] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCapture = async () => {
    setIsCapturing(true);

    try {
      // Simulação da captura biométrica...
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const mockBiometricData = `BIO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setBiometricData(mockBiometricData);

      // PONTO DA CIRURGIA 4: O "reflexo" do componente agora chama a função correta.
      // Quando a captura é concluída, ele executa a função 'onCapture' que recebeu.
      if (onCapture) {
        onCapture(mockBiometricData);
      }

      toast({
        title: mode === "capture" ? "Biometria Capturada" : "Biometria Verificada",
        description: mode === "capture" ? "Digital capturada com sucesso!" : "Munícipe identificado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na Biometria",
        description: "Não foi possível capturar/verificar a biometria. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  // O restante do JSX (a aparência) permanece o mesmo, pois é perfeitamente saudável.
  return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Fingerprint className="h-5 w-5" />
            {mode === "capture" ? "Captura Biométrica" : "Verificação Biométrica"}
          </CardTitle>
          <CardDescription>
            {mode === "capture"
                ? "Posicione o dedo no leitor biométrico"
                : "Identifique o munícipe através da biometria"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            {isCapturing ? (
                <div className="flex flex-col items-center space-y-2">
                  <Scan className="h-16 w-16 text-blue-500 animate-pulse" />
                  <p className="text-sm text-gray-600">Capturando biometria...</p>
                </div>
            ) : biometricData ? (
                <div className="flex flex-col items-center space-y-2">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <p className="text-sm text-green-600 font-medium">
                    {mode === "capture"
                        ? "Capturada com sucesso!"
                        : "Verificação concluída!"}
                  </p>
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Fingerprint className="h-16 w-16 text-gray-400" />
                  <p className="text-sm text-gray-600">Aguardando captura</p>
                </div>
            )}
            <Button
                onClick={handleCapture}
                disabled={isCapturing}
                className="w-full"
            >
              {isCapturing ? (
                  <>
                    <Scan className="mr-2 h-4 w-4 animate-spin" />
                    Capturando...
                  </>
              ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    {mode === "capture"
                        ? "Capturar Biometria"
                        : "Verificar Identidade"}
                  </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
  );
};