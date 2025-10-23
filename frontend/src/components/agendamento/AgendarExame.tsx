// src/components/recepcao/AgendarExame.tsx

// ANOTAÇÃO: CORREÇÃO APLICADA. A importação do 'Controller' foi removida.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// ANOTAÇÃO: Importa os componentes de UI necessários.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// ANOTAÇÃO: Define o 'schema' de validação com Zod para o formulário de exame.
const exameSchema = z.object({
  cartaoSus: z.string().min(1, "O número do Cartão SUS é obrigatório."),
  tipoExame: z.string().min(1, "O tipo de exame é obrigatório."),
  localExame: z.string().min(1, "O local do exame é obrigatório."),
  observacoes: z.string().optional(),
});

// ANOTAÇÃO: Define o componente do formulário de recepcao de exame.
export const AgendarExame = () => {
  const { toast } = useToast();
  // ANOTAÇÃO: Inicializa o hook de formulário com o schema de validação.
  const form = useForm<z.infer<typeof exameSchema>>({
    resolver: zodResolver(exameSchema),
    defaultValues: {
      cartaoSus: "",
      tipoExame: "",
      localExame: "",
      observacoes: "",
    },
  });

  // ANOTAÇÃO: Função chamada no 'submit' do formulário.
  const onSubmit = (data: z.infer<typeof exameSchema>) => {
    console.log("Dados do Exame:", data);
    toast({
      title: "Agendamento de Exame",
      description: "O exame foi agendado com sucesso!",
    });
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle>Preencher detalhes do Exame</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                  control={form.control}
                  name="cartaoSus"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº do Cartão SUS do Paciente</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o número do cartão" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

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
                            <SelectItem value="sangue">Exame de Sangue</SelectItem>
                            <SelectItem value="urina">Exame de Urina</SelectItem>
                            <SelectItem value="raio_x">Raio-X</SelectItem>
                            <SelectItem value="ultrassom">Ultrassom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              <FormField
                  control={form.control}
                  name="localExame"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local do Exame</FormLabel>
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
                            <SelectItem value="lab_municipal">
                              Laboratório Municipal
                            </SelectItem>
                            <SelectItem value="hospital_central">
                              Hospital Central
                            </SelectItem>
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
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                              placeholder="Alguma observação importante? (Opcional)"
                              {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              <Button type="submit" className="w-full">
                Confirmar Agendamento
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
};