// src/components/cadastro/DadosClinicos.tsx

import { Control } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ANOTAÇÃO: Define um schema específico para a seção de dados clínicos.
// Este schema será depois mesclado (merged) no schema principal do formulário de cadastro.
export const dadosClinicosSchema = z.object({
    tipoSanguineo: z.enum(["A", "B", "AB", "O", "NaoSabe"]),
    fatorRh: z.enum(["Positivo", "Negativo", "NaoSabe"]),
    alergias: z.string().optional(),
    condicoesPreexistentes: z.string().optional(),
});

// ANOTAÇÃO: A interface de props espera receber o 'control' do formulário pai.
// Isso permite que este componente atue como um módulo dentro de um formulário maior.
interface DadosClinicosProps {
    control: Control<any>; // Usamos 'any' para flexibilidade ao ser acoplado no form principal
}

export function DadosClinicos({ control }: DadosClinicosProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Dados Clínicos e Alergias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="tipoSanguineo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo Sanguíneo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo sanguíneo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="AB">AB</SelectItem>
                                        <SelectItem value="O">O</SelectItem>
                                        <SelectItem value="NaoSabe">Não Sabe</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="fatorRh"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fator RH</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o fator RH" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Positivo">Positivo (+)</SelectItem>
                                        <SelectItem value="Negativo">Negativo (-)</SelectItem>
                                        <SelectItem value="NaoSabe">Não Sabe</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={control}
                    name="alergias"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Alergias Conhecidas</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ex: Dipirona, frutos do mar, poeira..."
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Liste todas as alergias conhecidas, separadas por vírgula.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="condicoesPreexistentes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Condições Médicas Preexistentes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ex: Hipertensão, Diabetes tipo 2, Asma..."
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Liste as condições ou doenças crônicas relevantes.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}