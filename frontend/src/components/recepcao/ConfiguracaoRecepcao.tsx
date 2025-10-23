// src/components/recepcao/ConfiguracaoRecepcao.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// ANOTAÇÃO: CORREÇÃO: Os valores .default() foram removidos do schema.
// Agora, o schema Zod atua puramente como um validador da "forma" dos dados,
// sem influenciar os valores iniciais. Isso resolve o conflito de tipos.
const configuracaoSchema = z.object({
  habilitarTriagemAutomatica: z.boolean(),
  validacaoDocumento: z.enum(["obrigatoria", "opcional", "desativada"]),
  impressaoEtiquetas: z.boolean(),
  integracaoBiometria: z.boolean(),
});

type ConfiguracaoFormData = z.infer<typeof configuracaoSchema>;

export const ConfiguracaoRecepcao = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ANOTAÇÃO: O hook useForm agora é a única fonte da verdade para os valores padrão.
  const form = useForm<ConfiguracaoFormData>({
    resolver: zodResolver(configuracaoSchema),
    // A propriedade defaultValues garante que o formulário seja inicializado
    // com a estrutura de tipo correta (boolean, e não boolean | undefined).
    defaultValues: {
      habilitarTriagemAutomatica: false,
      validacaoDocumento: "opcional",
      impressaoEtiquetas: true,
      integracaoBiometria: true,
    },
  });

  useEffect(() => {
    const fetchConfig = () => {
      const savedConfig: ConfiguracaoFormData = {
        habilitarTriagemAutomatica: true,
        validacaoDocumento: "obrigatoria",
        impressaoEtiquetas: true,
        integracaoBiometria: false,
      };
      form.reset(savedConfig);
      setIsFetching(false);
    };

    const timer = setTimeout(fetchConfig, 1000);
    return () => clearTimeout(timer);
  }, [form]);

  const onSubmit = (data: ConfiguracaoFormData) => {
    setIsLoading(true);
    console.log("Salvando configurações da recepção:", data);

    setTimeout(() => {
      toast({
        title: "Configurações Salvas!",
        description: "As novas configurações da recepção foram aplicadas com sucesso.",
      });
      setIsLoading(false);
    }, 1000);
  };

  if (isFetching) {
    return (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
    );
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Recepção</CardTitle>
          <CardDescription>
            Ajuste as regras e o fluxo de trabalho para o atendimento na recepção.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                  control={form.control}
                  name="habilitarTriagemAutomatica"
                  render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Habilitar Triagem Automática</FormLabel>
                          <FormDescription>
                            Enviar pacientes diretamente para a triagem após o check-in.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="validacaoDocumento"
                  render={({ field }) => (
                      <FormItem className="rounded-lg border p-4">
                        <FormLabel className="text-base">Validação de Documento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o nível de validação" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="obrigatoria">Obrigatória</SelectItem>
                            <SelectItem value="opcional">Opcional</SelectItem>
                            <SelectItem value="desativada">Desativada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Nível de exigência para apresentação de documento de identidade.
                        </FormDescription>
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="impressaoEtiquetas"
                  render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Impressão de Etiquetas</FormLabel>
                          <FormDescription>
                            Habilitar a impressão de etiquetas de identificação no check-in.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="integracaoBiometria"
                  render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Integração com Biometria</FormLabel>
                          <FormDescription>
                            Permitir identificação do paciente via leitor biométrico.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                  )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
};