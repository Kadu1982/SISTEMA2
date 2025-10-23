import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface HistoricoAtendimentosProps {
  tipo: "municipe" | "medico" | "odontologico";
}

// Dados de exemplo - em uma aplicação real, isso viria do backend
const MOCK_ATENDIMENTOS = [
  {
    id: "1",
    data: "15/05/2023",
    tipo: "Consulta Médica",
    profissional: "Dr. João Silva",
    especialidade: "Clínico Geral",
    unidade: "UBS Central",
  },
  {
    id: "2",
    data: "22/04/2023",
    tipo: "Consulta Odontológica",
    profissional: "Dra. Maria Oliveira",
    especialidade: "Odontologia",
    unidade: "UBS Norte",
  },
  {
    id: "3",
    data: "10/03/2023",
    tipo: "Exame",
    profissional: "Dr. Paulo Santos",
    especialidade: "Radiologia",
    unidade: "UBS Central",
  },
  {
    id: "4",
    data: "05/02/2023",
    tipo: "Consulta Médica",
    profissional: "Dra. Ana Lima",
    especialidade: "Cardiologia",
    unidade: "UBS Sul",
  },
];

export const HistoricoAtendimentos: React.FC<HistoricoAtendimentosProps> = ({
  tipo,
}) => {
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ATENDIMENTOS.map((atendimento) => (
              <TableRow key={atendimento.id}>
                <TableCell>{atendimento.data}</TableCell>
                <TableCell>{atendimento.tipo}</TableCell>
                <TableCell>{atendimento.profissional}</TableCell>
                <TableCell>{atendimento.especialidade}</TableCell>
                <TableCell>{atendimento.unidade}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    <Eye size={16} className="mr-1" /> Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
