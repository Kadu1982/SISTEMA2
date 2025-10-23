import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dados de exemplo
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const ANOS = ["2025", "2024", "2023", "2022"];

const PRODUCAO_EXEMPLO = [
  {
    codigo: "03.01.01.001-0",
    procedimento: "Consulta médica em atenção básica",
    quantidade: 312,
    valorUnitario: 10.0,
    valorTotal: 3120.0,
  },
  {
    codigo: "04.01.01.001-5",
    procedimento: "Curativo simples",
    quantidade: 156,
    valorUnitario: 4.5,
    valorTotal: 702.0,
  },
  {
    codigo: "01.01.02.003-1",
    procedimento: "Administração de medicamentos",
    quantidade: 245,
    valorUnitario: 3.0,
    valorTotal: 735.0,
  },
  {
    codigo: "02.01.01.001-0",
    procedimento: "Eletrocardiograma",
    quantidade: 42,
    valorUnitario: 25.0,
    valorTotal: 1050.0,
  },
  {
    codigo: "03.01.10.001-2",
    procedimento: "Consulta odontológica",
    quantidade: 189,
    valorUnitario: 12.0,
    valorTotal: 2268.0,
  },
];

export const ProducaoMensal = () => {
  const { toast } = useToast();
  const [mes, setMes] = useState("Maio");
  const [ano, setAno] = useState("2024");

  const valorTotal = PRODUCAO_EXEMPLO.reduce(
    (sum, item) => sum + item.valorTotal,
    0,
  );

  const handleDownload = () => {
    toast({
      title: "Relatório gerado",
      description: `Relatório de produção de ${mes}/${ano} baixado com sucesso.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="space-y-2">
          <Label htmlFor="mes">Mês</Label>
          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {MESES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ano">Ano</Label>
          <Select value={ano} onValueChange={setAno}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {ANOS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full md:w-auto">Gerar Relatório</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead className="w-[300px]">Procedimento</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Valor Unitário</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PRODUCAO_EXEMPLO.map((item) => (
              <TableRow key={item.codigo}>
                <TableCell className="font-mono">{item.codigo}</TableCell>
                <TableCell>{item.procedimento}</TableCell>
                <TableCell className="text-right">{item.quantidade}</TableCell>
                <TableCell className="text-right">
                  R$ {item.valorUnitario.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  R$ {item.valorTotal.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} className="text-right font-medium">
                Total
              </TableCell>
              <TableCell className="text-right font-medium">
                R$ {valorTotal.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleDownload}>
          <FileText className="mr-2 h-4 w-4" /> Visualizar PDF
        </Button>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
    </div>
  );
};
