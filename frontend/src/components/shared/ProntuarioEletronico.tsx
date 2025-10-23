import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProntuarioEletronicoProps {
  tipo: "medico" | "odontologico";
}

// Dados de exemplo
const PACIENTE = {
  nome: "Maria da Silva Santos",
  idade: 42,
  sexo: "Feminino",
  cartaoSUS: "123456789012345",
  alergias: ["Penicilina", "Aspirina"],
  condicoesEspeciais: ["Hipertensão", "Diabetes"],
  ultimaConsulta: "10/04/2023",
  historicoConsultas: [
    {
      data: "10/04/2023",
      medico: "Dr. João Silva",
      especialidade: "Clínico Geral",
      diagnostico: "Infecção respiratória",
      prescricao: "Amoxicilina 500mg, 8/8h por 7 dias",
    },
    {
      data: "15/02/2023",
      medico: "Dra. Ana Lima",
      especialidade: "Cardiologia",
      diagnostico: "Hipertensão",
      prescricao: "Losartana 50mg, 1x ao dia",
    },
  ],
  exames: [
    {
      data: "12/04/2023",
      tipo: "Hemograma",
      resultado: "Normal",
      observacao: "Sem alterações significativas",
    },
    {
      data: "15/02/2023",
      tipo: "Eletrocardiograma",
      resultado: "Alterado",
      observacao: "Alterações sugestivas de sobrecarga ventricular",
    },
  ],
};

export const ProntuarioEletronico: React.FC<ProntuarioEletronicoProps> = ({
  tipo,
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row justify-between gap-2 md:items-center">
            <div>
              <h3 className="text-xl font-bold">{PACIENTE.nome}</h3>
              <p className="text-muted-foreground">
                {PACIENTE.idade} anos, {PACIENTE.sexo}
              </p>
              <p className="text-sm">Cartão SUS: {PACIENTE.cartaoSUS}</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-2 md:mt-0">
              {PACIENTE.condicoesEspeciais.map((condicao) => (
                <Badge key={condicao} variant="outline">
                  {condicao}
                </Badge>
              ))}
              {PACIENTE.alergias.map((alergia) => (
                <Badge key={alergia} variant="destructive">
                  {alergia}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="historico" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="exames">Exames</TabsTrigger>
          <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="historico">
          <div className="border rounded-md divide-y">
            {PACIENTE.historicoConsultas.map((consulta, index) => (
              <div key={index} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {consulta.data} - {consulta.especialidade}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {consulta.medico}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="font-medium">Diagnóstico:</span>{" "}
                    {consulta.diagnostico}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Prescrição:</span>{" "}
                    {consulta.prescricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exames">
          <div className="border rounded-md divide-y">
            {PACIENTE.exames.map((exame, index) => (
              <div key={index} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {exame.data} - {exame.tipo}
                    </p>
                    <p className="text-sm">
                      Resultado:
                      <span
                        className={
                          exame.resultado === "Normal"
                            ? "text-green-600"
                            : "text-amber-600"
                        }
                      >
                        {" "}
                        {exame.resultado}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm">{exame.observacao}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="medicamentos">
          <div className="border rounded-md p-3">
            <ul className="space-y-2">
              <li className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Losartana 50mg</p>
                  <p className="text-sm text-muted-foreground">
                    1 comprimido ao dia
                  </p>
                </div>
                <Badge>Em uso</Badge>
              </li>
              <li className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Metformina 850mg</p>
                  <p className="text-sm text-muted-foreground">
                    1 comprimido após almoço e jantar
                  </p>
                </div>
                <Badge>Em uso</Badge>
              </li>
              <li className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Amoxicilina 500mg</p>
                  <p className="text-sm text-muted-foreground">
                    1 comprimido a cada 8 horas por 7 dias
                  </p>
                </div>
                <Badge variant="outline">Finalizado em 17/04/2023</Badge>
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
