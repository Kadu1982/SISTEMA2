import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

// Dados de exemplo
const ATENDIMENTOS = [
  {
    horario: "08:00",
    paciente: "Carlos Eduardo Santos",
    tipo: "Consulta",
    especialidade: "Clínico Geral",
    status: "concluido",
  },
  {
    horario: "09:30",
    paciente: "Maria Silva",
    tipo: "Consulta",
    especialidade: "Cardiologia",
    status: "concluido",
  },
  {
    horario: "10:15",
    paciente: "João Pereira",
    tipo: "Exame",
    especialidade: "Raio-X",
    status: "em_andamento",
  },
  {
    horario: "11:00",
    paciente: "Ana Carolina Oliveira",
    tipo: "Consulta",
    especialidade: "Oftalmologia",
    status: "aguardando",
  },
  {
    horario: "13:30",
    paciente: "Paulo Roberto Mendes",
    tipo: "Consulta Odonto",
    especialidade: "Odontologia",
    status: "aguardando",
  },
  {
    horario: "14:45",
    paciente: "Mariana Souza",
    tipo: "Exame",
    especialidade: "Eletrocardiograma",
    status: "aguardando",
  },
];

export const AgendaDia = () => {
  const dataAtual = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  const horaAtual = new Date().getHours();

  // Filtrar próximos atendimentos (horário atual ou futuro)
  const proximosAtendimentos = ATENDIMENTOS.filter(
    (atend) => parseInt(atend.horario.split(":")[0]) >= horaAtual,
  ).slice(0, 5);

  const getStatusBadge = (status: string) => {
    if (status === "concluido") {
      return <Badge className="bg-green-500">Concluído</Badge>;
    }
    if (status === "em_andamento") {
      return <Badge className="bg-blue-500">Em Andamento</Badge>;
    }
    return <Badge variant="outline">Aguardando</Badge>;
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Agenda de hoje</h3>
        <p className="text-sm text-muted-foreground capitalize">{dataAtual}</p>
      </div>

      <div className="space-y-2">
        {proximosAtendimentos.map((atendimento, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                      atendimento.status === "em_andamento"
                        ? "bg-blue-100 text-blue-700"
                        : atendimento.status === "concluido"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700",
                    )}
                  >
                    {atendimento.horario}
                  </div>
                  <div>
                    <p className="font-medium">{atendimento.paciente}</p>
                    <p className="text-xs text-muted-foreground">
                      {atendimento.tipo} - {atendimento.especialidade}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(atendimento.status)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CardFooter className="flex justify-end mt-4 px-0">
        <Button variant="outline">
          Ver agenda completa
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </div>
  );
};
