import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TestTube } from "lucide-react";

const formSchema = z.object({
  tipoExame: z.string().min(1, "Tipo de exame é obrigatório"),
  laboratorio: z.string().min(1, "Laboratório é obrigatório"),
  dataColeta: z.string().min(1, "Data da coleta é obrigatória"),
  jejum: z.enum(["sim", "nao", "nao_aplicavel"]),
  observacoes: z.string(),
  medicoPedinte: z.string().min(1, "Médico pedinte é obrigatório"),
  urgencia: z.enum(["normal", "urgente", "emergencia"]),
});

export const ExamesLaboratoriais = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoExame: "",
      laboratorio: "",
      dataColeta: "",
      jejum: "nao_aplicavel",
      observacoes: "",
      medicoPedinte: "",
      urgencia: "normal",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Exame Laboratorial Agendado",
      description: "O exame foi agendado com sucesso.",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TestTube className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Exames Laboratoriais</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tipoExame"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Exame</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de exame" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hemograma">
                        Hemograma Completo
                      </SelectItem>
                      <SelectItem value="glicemia">
                        Glicemia em Jejum
                      </SelectItem>
                      <SelectItem value="colesterol">
                        Perfil Lipídico
                      </SelectItem>
                      <SelectItem value="urina">Exame de Urina</SelectItem>
                      <SelectItem value="fezes">
                        Parasitológico de Fezes
                      </SelectItem>
                      <SelectItem value="tsh">
                        TSH - Hormônio da Tireoide
                      </SelectItem>
                      <SelectItem value="psa">
                        PSA - Antígeno Prostático
                      </SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="laboratorio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Laboratório</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o laboratório" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lab_central">
                        Laboratório Central
                      </SelectItem>
                      <SelectItem value="lab_ubs1">
                        Laboratório UBS 1
                      </SelectItem>
                      <SelectItem value="lab_ubs2">
                        Laboratório UBS 2
                      </SelectItem>
                      <SelectItem value="lab_terceirizado">
                        Laboratório Terceirizado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataColeta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Coleta</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jejum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Necessita Jejum?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sim">Sim (12 horas)</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                      <SelectItem value="nao_aplicavel">
                        Não se aplica
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medicoPedinte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médico Pedinte</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do médico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urgencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgência</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a urgência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="emergencia">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o exame"
                      {...field}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Agendar Exame Laboratorial</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
