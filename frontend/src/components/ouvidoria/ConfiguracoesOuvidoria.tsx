// src/components/ouvidoria/ConfiguracoesOuvidoria.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// ANOTAÇÃO: Define o schema de validação para as configurações da ouvidoria.
// Inclui campos para prazos, anonimato e notificações.
const ouvidoriaSchema = z.object({
  prazoRespostaGeral: z.number().min(1, "O prazo deve ser de no mínimo 1 dia.").max(90, "O prazo não pode exceder 90 dias."),
  permitirManifestacaoAnonima: z.boolean(),
  notificarStatusEmail: z.boolean(),
  tipoPadraoManifestacao: z.enum(["elogio", "sugestao", "reclamacao", "denuncia"]),
});

type OuvidoriaFormData = z.infer<typeof ouvidoriaSchema>;

export function ConfiguracoesOuvidoria() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ANOTAÇÃO: Inicializa o formulário com o schema e valores padrão.
  const form = useForm<OuvidoriaFormData>({
    resolver: zodResolver(ouvidoriaSchema),
    defaultValues: {
      prazoRespostaGeral: 15,
      permitirManifestacaoAnonima: true,
      notificarStatusEmail: true,
      tipoPadraoManifestacao: "sugestao",
    },
  });

  // ANOTAÇÃO: Simula o carregamento das configurações salvas.
  useEffect(() => {
    const fetchOuvidoriaConfig = () => {
      // Simula uma chamada API
      const savedConfig = {
        prazoRespostaGeral: 20,
        permitirManifestacaoAnonima: false,
        notificarStatusEmail: true,
        tipoPadraoManifestacao: "reclamacao" as const,
      };
      form.reset(savedConfig);
      setIsFetching(false);
    };

    const timer = setTimeout(fetchOuvidoriaConfig, 1000);
    return () => clearTimeout(timer);
  }, [form]);

  // ANOTAÇÃO: Função para salvar os dados do formulário.
  const onSubmit = (data: OuvidoriaFormData) => {
    setIsLoading(true);
    // Converte o campo string para número antes de "salvar"
    const parsedData = {
      ...data,
      prazoRespostaGeral: Number(data.prazoRespostaGeral),
    };
    console.log("Salvando configurações da ouvidoria:", parsedData);

    setTimeout(() => {
      toast({
        title: "Configurações da Ouvidoria Salvas",
        description: "As novas regras foram aplicadas com sucesso.",
      });
      setIsLoading(false);
    }, 1000);
  };

  // ANOTAÇÃO: Exibe um skeleton UI durante o carregamento inicial.
  if (isFetching) {
    return (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
    );
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Ouvidoria</CardTitle>
          <CardDescription>
            Defina as regras e os padrões para o registro e gestão de manifestações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                  control={form.control}
                  name="prazoRespostaGeral"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prazo para Resposta (dias)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex: 15" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormDescription>
                          Prazo padrão em dias para uma manifestação ser respondida.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              <FormField
                  control={form.control}
                  name="tipoPadraoManifestacao"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Padrão de Manifestação</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um tipo..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sugestao">Sugestão</SelectItem>
                            <SelectItem value="elogio">Elogio</SelectItem>
                            <SelectItem value="reclamacao">Reclamação</SelectItem>
                            <SelectItem value="denuncia">Denúncia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          O tipo que será pré-selecionado no formulário de manifestação.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              <FormField
                  control={form.control}
                  name="permitirManifestacaoAnonima"
                  render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Permitir Manifestação Anônima</FormLabel>
                          <FormDescription>
                            Cidadãos podem enviar manifestações sem se identificar.
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
                  name="notificarStatusEmail"
                  render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Notificar Status por E-mail</FormLabel>
                          <FormDescription>
                            Enviar e-mails automáticos sobre a mudança de status da manifestação.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                  )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
}