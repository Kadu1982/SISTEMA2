// src/components/operador/CadastroOperadorForm.tsx

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";

interface UnidadeSaude {
  id: number;
  nomeCnes: string;
  codigoCnes: string;
}

const perfisDisponiveis = [
  "Administrador de Sistema",
  "Recepção",
  "Médico",
  "Enfermeiro",
  "Técnico de Enfermagem",
  "Dentista",
  "Técnico de Higiene Dental",
  "Farmacêutico",
  "Técnico de Farmácia",
];

export const CadastroOperadorForm: React.FC = () => {
  const { toast } = useToast();
  const [unidades, setUnidades] = useState<UnidadeSaude[]>([]);
  const [form, setForm] = useState({
    nome: "",
    login: "",
    senha: "",
    cargo: "",
    unidadeId: "",
    unidadeAtual: "",
    perfis: [] as string[],
  });

  useEffect(() => {
    apiService
      .get("/unidades")
      .then((res) => setUnidades(res.data.data))
      .catch(() =>
        toast({
          title: "Erro",
          description: "Falha ao carregar unidades",
          variant: "destructive",
        }),
      );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePerfil = (perfil: string) => {
    setForm((prev) => ({
      ...prev,
      perfis: prev.perfis.includes(perfil)
        ? prev.perfis.filter((p) => p !== perfil)
        : [...prev.perfis, perfil],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.post("/operadores", form);
      toast({
        title: "Sucesso",
        description: "Operador cadastrado com sucesso",
      });
      setForm({
        nome: "",
        login: "",
        senha: "",
        cargo: "",
        unidadeId: "",
        unidadeAtual: "",
        perfis: [],
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o operador",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Cadastrar Novo Operador</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            value={form.nome}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="login">Login (CPF, email ou usuário)</Label>
          <Input
            id="login"
            name="login"
            value={form.login}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="cargo">Cargo</Label>
          <Input
            id="cargo"
            name="cargo"
            value={form.cargo}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="unidade">Unidade de Saúde</Label>
          <Select
            onValueChange={(valor) => {
              const unidade = unidades.find((u) => u.id.toString() === valor);
              if (unidade) {
                setForm((prev) => ({
                  ...prev,
                  unidadeId: valor,
                  unidadeAtual: unidade.nomeCnes,
                }));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(unidades) &&
                unidades.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.nomeCnes}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Perfis de Acesso</Label>
        <div className="grid grid-cols-2 gap-2">
          {perfisDisponiveis.map((perfil) => (
            <label key={perfil} className="flex items-center space-x-2">
              <Checkbox
                checked={form.perfis.includes(perfil)}
                onCheckedChange={() => togglePerfil(perfil)}
              />
              <span>{perfil}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" className="mt-4">
        Salvar Operador
      </Button>
    </form>
  );
};
