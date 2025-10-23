import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NewbornAlertProps {
  dataNascimento: string;
  nome: string;
}

export const NewbornAlert: React.FC<NewbornAlertProps> = ({
  dataNascimento,
  nome,
}) => {
  const birthDate = new Date(dataNascimento);
  const now = new Date();
  const ageInDays = Math.floor(
    (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const ageInMonths =
    (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  const isNewborn = ageInMonths < 12;
  const daysRemaining = 15 - ageInDays;
  const isExpired = daysRemaining <= 0;

  if (!isNewborn) return null;

  return (
    <Alert variant={isExpired ? "destructive" : "default"} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Cadastro de Recém-Nascido
        <Badge variant={isExpired ? "destructive" : "secondary"}>
          <Calendar className="h-3 w-3 mr-1" />
          {isExpired ? "EXPIRADO" : `${daysRemaining} dias restantes`}
        </Badge>
      </AlertTitle>
      <AlertDescription>
        {isExpired ? (
          <span className="text-red-600 font-medium">
            ⚠️ O prazo de 15 dias para atualização do cadastro de {nome} já
            expirou! É obrigatório atualizar as informações imediatamente.
          </span>
        ) : (
          <span>
            Este é um cadastro de recém-nascido. É obrigatório atualizar as
            informações em até 15 dias após o nascimento. Restam {daysRemaining}{" "}
            dias para atualização.
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
};
