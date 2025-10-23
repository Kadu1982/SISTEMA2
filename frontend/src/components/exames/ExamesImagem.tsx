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
import { Camera } from "lucide-react";

const formSchema = z.object({
  tipoExame: z.string().min(1, "Tipo de exame é obrigatório"),
  equipamento: z.string().min(1, "Equipamento é obrigatório"),
  dataExame: z.string().min(1, "Data do exame é obrigatória"),
  preparo: z.string(),
  observacoes: z.string(),
  medicoPedinte: z.string().min(1, "Médico pedinte é obrigatório"),
  contraste: z.enum(["sim", "nao", "nao_aplicavel"]),
  urgencia: z.enum(["normal", "urgente", "emergencia"]),
});

export const ExamesImagem = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoExame: "",
      equipamento: "",
      dataExame: "",
      preparo: "",
      observacoes: "",
      medicoPedinte: "",
      contraste: "nao_aplicavel",
      urgencia: "normal",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Exame de Imagem Agendado",
      description: "O exame foi agendado com sucesso.",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Exames de Imagem</h2>
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
                      <SelectItem value="raio_x">Raio-X</SelectItem>
                      <SelectItem value="ultrassom">
                        Ultrassonografia
                      </SelectItem>
                      <SelectItem value="tomografia">
                        Tomografia Computadorizada
                      </SelectItem>
                      <SelectItem value="ressonancia">
                        Ressonância Magnética
                      </SelectItem>
                      <SelectItem value="mamografia">Mamografia</SelectItem>
                      <SelectItem value="densitometria">
                        Densitometria Óssea
                      </SelectItem>
                      <SelectItem value="ecocardiograma">
                        Ecocardiograma
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
              name="equipamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local/Equipamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o local" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ubs_central">
                        UBS Central - Sala 1
                      </SelectItem>
                      <SelectItem value="hospital_municipal">
                        Hospital Municipal
                      </SelectItem>
                      <SelectItem value="clinica_especializada">
                        Clínica Especializada
                      </SelectItem>
                      <SelectItem value="terceirizado">
                        Serviço Terceirizado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataExame"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Exame</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contraste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Necessita Contraste?</FormLabel>
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
                      <SelectItem value="sim">Sim</SelectItem>
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
              name="preparo"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Preparo Necessário</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruções de preparo para o exame"
                      {...field}
                      className="resize-none"
                    />
                  </FormControl>
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
            <Button type="submit">Agendar Exame de Imagem</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
