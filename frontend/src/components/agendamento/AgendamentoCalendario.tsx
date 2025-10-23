import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Edit2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Dados de exemplo
const MOCK_AGENDAMENTOS = [
  {
    id: "1",
    tipo: "Consulta",
    paciente: "Ana Carolina Silva",
    horario: "08:30",
    especialidade: "Clínico Geral",
    profissional: "Dr. João Silva",
    status: "confirmado",
  },
  {
    id: "2",
    tipo: "Consulta",
    paciente: "Carlos Eduardo Santos",
    horario: "09:00",
    especialidade: "Cardiologia",
    profissional: "Dra. Ana Lima",
    status: "confirmado",
  },
  {
    id: "3",
    tipo: "Exame",
    paciente: "Maria das Dores Pereira",
    horario: "10:30",
    especialidade: "Raio-X",
    profissional: "Dr. Paulo Santos",
    status: "aguardando",
  },
  {
    id: "4",
    tipo: "Consulta",
    paciente: "José Francisco Oliveira",
    horario: "13:30",
    especialidade: "Ortopedia",
    profissional: "Dr. Pedro Costa",
    status: "confirmado",
  },
];

// ANOTAÇÃO 1 (MELHORIA):
// Criamos um tipo chamado `Agendamento`.
// A expressão `(typeof MOCK_AGENDAMENTOS)[0]` é um truque do TypeScript que diz:
// "pegue o tipo da variável MOCK_AGENDAMENTOS (que é um array de objetos) e me dê o tipo de um único elemento desse array".
// Agora, o tipo `Agendamento` corresponde exatamente à estrutura dos objetos no seu mock.
// Se você adicionar ou remover uma propriedade do mock, o tipo será atualizado automaticamente!
type Agendamento = (typeof MOCK_AGENDAMENTOS)[0];

export const AgendamentoCalendario = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // ANOTAÇÃO 2 (MELHORIA):
  // Substituímos o perigoso `any` pelo nosso novo tipo `Agendamento`.
  // O estado agora pode ser um objeto do tipo `Agendamento` ou `null`.
  // Isso garante que qualquer acesso às propriedades de `selectedAgendamento`
  // será verificado pelo TypeScript, evitando erros em tempo de execução.
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
    }
  };

  // ANOTAÇÃO 3 (MELHORIA):
  // Também aplicamos nosso tipo `Agendamento` ao parâmetro da função.
  // Isso garante que a função `handleVerDetalhes` sempre receberá um objeto
  // com a estrutura correta, tornando o fluxo de dados mais previsível e seguro.
  const handleVerDetalhes = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setDialogOpen(true);
  };

  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              className="border rounded-md"
          />
        </div>
        <div className="md:col-span-2">
          <div className="rounded-md border">
            <div className="p-4 border-b bg-muted/50">
              <h3 className="text-lg font-medium capitalize">{formattedDate}</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Profissional/Especialidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_AGENDAMENTOS.map((agendamento) => (
                    <TableRow key={agendamento.id}>
                      <TableCell>{agendamento.horario}</TableCell>
                      <TableCell>{agendamento.paciente}</TableCell>
                      <TableCell>{agendamento.tipo}</TableCell>
                      <TableCell>{agendamento.profissional} ({agendamento.especialidade})</TableCell>
                      <TableCell>{agendamento.status}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleVerDetalhes(agendamento)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ANOTAÇÃO 4 (BOA PRÁTICA):
          // O Dialog para exibir os detalhes do recepcao.
          // A verificação `selectedAgendamento &&` garante que o Dialog só tente
          // renderizar seu conteúdo quando um recepcao foi de fato selecionado.
          // Graças à nossa tipagem, dentro deste bloco, o TypeScript sabe que
          // `selectedAgendamento` não é `null` e nos dá autocompletar para suas propriedades.
      */}
        {selectedAgendamento && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Detalhes do Agendamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <p><strong>Paciente:</strong> {selectedAgendamento.paciente}</p>
                  <p><strong>Horário:</strong> {selectedAgendamento.horario}</p>
                  <p><strong>Tipo:</strong> {selectedAgendamento.tipo}</p>
                  <p><strong>Profissional:</strong> {selectedAgendamento.profissional}</p>
                  <p><strong>Especialidade:</strong> {selectedAgendamento.especialidade}</p>
                  <p><strong>Status:</strong> {selectedAgendamento.status}</p>
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setDialogOpen(false)}>Fechar</Button>
                  <Button><Edit2 className="mr-2 h-4 w-4"/> Editar</Button>
                  <Button variant="destructive"><X className="mr-2 h-4 w-4"/> Cancelar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        )}
      </div>
  );
};