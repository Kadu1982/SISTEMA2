// src/pages/AtendimentoOdontologico.tsx
// -----------------------------------------------------------------------------
// Página de Atendimento Odontológico
// - Coluna esquerda: AtendimentoForm (como já existia).
// - Coluna direita: Odontograma + ProcedimentosSUS (empilhados).
// - Estado do odontograma e da lista de procedimentos “elevado” para o pai.
// - Salvamento encadeado: salva o atendimento e, se houver ID retornado,
//   salva também os procedimentos (endpoint opcional).
// -----------------------------------------------------------------------------

import { useState } from "react";
import { AtendimentoForm, type AtendimentoFormData } from "@/components/atendimento/AtendimentoForm";
import OdontogramaDigital, { type Dente } from "@/components/odontologico/OdontogramaDigital";
import ProcedimentosSUS from "@/components/odontologico/ProcedimentosSUS";
import type { ProcedimentoSelecionado } from "@/services/odontologiaService";
import * as odontoServiceModule from "@/services/odontologiaService";
import * as atendimentoServiceModule from "@/services/AtendimentoService";
import { useToast } from "@/components/ui/use-toast";

// Resolve export default/named do serviço de atendimento (evita quebrar build)
const atendimentoSvc: any =
    // @ts-ignore
    (atendimentoServiceModule as any).default ??
    // @ts-ignore
    (atendimentoServiceModule as any).atendimentoService ??
    atendimentoServiceModule;

// Resolve função de salvar procedimentos (default/named)
const salvarProcedimentosAtendimento: any =
    // @ts-ignore
    (odontoServiceModule as any).salvarProcedimentosAtendimento ??
    // @ts-ignore
    (odontoServiceModule as any).default?.salvarProcedimentosAtendimento ??
    null;

function extractId(resp: any): number | string | undefined {
    return (
        resp?.id ??
        resp?.data?.id ??
        resp?.atendimentoId ??
        resp?.data?.atendimentoId ??
        undefined
    );
}

const AtendimentoOdontologico = () => {
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);

    // 👇 estado “elevado” para o pai
    const [odontograma, setOdontograma] = useState<Dente[]>([]);
    const [procedimentos, setProcedimentos] = useState<ProcedimentoSelecionado[]>([]);

    const handleSaveAtendimento = async (data: AtendimentoFormData) => {
        setIsLoading(true);
        try {
            // 1) Salva o atendimento (mantém seu fluxo atual)
            const resp = await atendimentoSvc.salvar?.(data);

            // 2) Captura o ID retornado (robusto a diferentes formatos)
            const atendimentoId = extractId(resp);

            // 3) (Opcional) Se houver ID e houver itens, salva também os procedimentos
            if (atendimentoId && salvarProcedimentosAtendimento && procedimentos.length > 0) {
                const r = await salvarProcedimentosAtendimento(atendimentoId, procedimentos);
                if (!r?.success) {
                    toast({
                        title: "Procedimentos não salvos",
                        description: r?.message ?? "Ocorreram erros ao salvar os procedimentos SIA/SUS.",
                        variant: "destructive",
                    });
                }
            }

            // 4) (Opcional futuro) Salvar odontograma se o endpoint existir:
            // if (atendimentoId && atendimentoSvc.salvarOdontograma) {
            //   await atendimentoSvc.salvarOdontograma(atendimentoId, odontograma);
            // }

            toast({
                title: "Sucesso!",
                description: "Atendimento odontológico salvo com sucesso.",
            });
        } catch (error) {
            console.error("Erro ao salvar atendimento:", error);
            toast({
                title: "Erro!",
                description: "Não foi possível salvar o atendimento. Verifique o console para mais detalhes.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna esquerda: formulário principal do atendimento */}
                <AtendimentoForm
                    title="Registro de Atendimento Odontológico"
                    description="Preencha os dados da consulta e utilize os módulos ao lado."
                    onSave={handleSaveAtendimento}
                    isLoading={isLoading}
                />

                {/* Coluna direita: Odontograma + Procedimentos SIA/SUS */}
                <div className="flex flex-col gap-8">
                    <OdontogramaDigital
                        value={odontograma}
                        onChange={setOdontograma}
                        // onSalvar={async (dentes) => { /* futura integração se desejar salvar isoladamente */ }}
                    />

                    <ProcedimentosSUS
                        // quando houver id do atendimento, você pode passá-lo aqui
                        // atendimentoId={algumId}
                        value={procedimentos}
                        onChange={setProcedimentos}
                    />
                </div>
            </div>
        </div>
    );
};

export default AtendimentoOdontologico;
