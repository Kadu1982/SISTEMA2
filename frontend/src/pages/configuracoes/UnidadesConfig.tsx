import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import unidadesService, { UnidadeDTO as Unidade, TipoUnidadeSaude, getTiposUnidadeOptions, getTipoUnidadeDescricao } from "@/services/unidadesService";
import { useOperador } from "@/contexts/OperadorContext";

/**
 * Unidades de Saúde – Gestão básica
 * -----------------------------------------------------------------------------
 * Funcionalidades:
 *  - Listagem de unidades
 *  - Botão "Adicionar Unidade" (somente para MASTER ou quem tem permissão)
 *  - Diálogo com formulário mínimo (Nome, CNES, CNPJ)
 *
 * Importante:
 *  - Mantém identidade visual (shadcn + Tailwind).
 *  - Usa o `unidadesService` consolidado (métodos `listarUnidades`/`criarUnidade`).
 *  - O service já sanitiza CNPJ/CNES (apenas dígitos) no envio.
 *  - A tabela EXIBE CNPJ/CNES formatados; no backend continuam “limpos”.
 */

// ----------------------------------------
// Helpers de exibição (não alteram payload)
// ----------------------------------------
function formatCnpj(v?: string | null) {
    const d = (v || "").replace(/\D+/g, "");
    if (d.length !== 14) return v || "-";
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatCnes(v?: string | null) {
    const d = (v || "").replace(/\D+/g, "");
    // CNES costuma ter 7 dígitos; exibimos como veio se não bater.
    if (d.length !== 7) return v || "-";
    return d;
}

const UnidadesConfig: React.FC = () => {
    const { operador } = useOperador();

    // ===== Gate de permissão =====
    // Considera várias possibilidades pra não quebrar com payloads diferentes:
    const isMaster = Boolean(operador?.isMaster ?? operador?.master ?? operador?.is_master ?? false);

    const perfis = (operador?.perfis ?? []) as Array<{ codigo: string }>;
    const roles = (operador?.roles ?? []) as string[];
    const permissoes = (operador?.permissoes ?? []) as Array<string | { codigo: string }>;

    // Regra: MASTER OU permissão UNIDADES_WRITE (ou role/perfil MASTER)
    const canWrite = useMemo(() => {
        const hasRoleMaster = roles?.some((r) => String(r).toUpperCase().includes("MASTER"));
        const hasPerfilMaster = perfis?.some((p) => String(p.codigo).toUpperCase().includes("MASTER"));
        const hasPermWrite =
            Array.isArray(permissoes) &&
            permissoes.some((p) => {
                const code = typeof p === "string" ? p : p?.codigo;
                return String(code || "").toUpperCase() === "UNIDADES_WRITE";
            });

        return isMaster || hasRoleMaster || hasPerfilMaster || hasPermWrite;
    }, [isMaster, roles, perfis, permissoes]);

    // ===== Estado =====
    const [carregando, setCarregando] = useState(false);
    const [lista, setLista] = useState<Unidade[]>([]);
    const [erro, setErro] = useState<string | null>(null);

    // Formulário do diálogo "Adicionar"
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<Unidade>({
        nome: "",
        codigoCnes: "",
        cnpj: "",
        tipo: TipoUnidadeSaude.GENERICA // Valor padrão
    });

    // ===== Efeitos =====
    useEffect(() => {
        let abort = new AbortController();
        (async () => {
            setCarregando(true);
            setErro(null);
            try {
                // O service pode retornar Paginação { content: [...] } OU lista simples.
                const dados = await unidadesService.listarUnidades({ signal: abort.signal });
                const itens = Array.isArray((dados as any)?.content) ? (dados as any).content : (dados as any);
                setLista(itens || []);
            } catch (e: any) {
                setErro(e?.response?.data?.message || "Falha ao carregar unidades.");
            } finally {
                setCarregando(false);
            }
        })();
        return () => abort.abort();
    }, []);

    // ===== Ações =====
    async function onCriar(e: React.FormEvent) {
        e.preventDefault();
        setErro(null);

        // Payload com campos obrigatórios (o service já sanitiza cnpj/cnes)
        const payload: Unidade = {
            nome: (form.nome || "").trim(),
            codigoCnes: (form.codigoCnes || "").trim(),
            cnpj: (form.cnpj || "").trim() || undefined, // undefined em vez de null para omitir do JSON
            tipo: form.tipo,
            // ativa será definido automaticamente como true no service
        };

        if (!payload.nome) {
            setErro("Informe o nome da unidade.");
            return;
        }

        if (!payload.codigoCnes) {
            setErro("Informe o código CNES (7 dígitos).");
            return;
        }

        if (!payload.tipo) {
            setErro("Selecione o tipo da unidade.");
            return;
        }

        try {
            const nova = await unidadesService.criarUnidade(payload);
            setLista((prev) => [nova, ...prev]);
            setForm({
                nome: "",
                codigoCnes: "",
                cnpj: "",
                tipo: TipoUnidadeSaude.GENERICA
            });
            setOpen(false);
        } catch (e: any) {
            setErro(e?.message || e?.response?.data?.message || "Não foi possível criar a unidade.");
        }
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Building2 className="h-5 w-5" /> Unidades de Saúde
                        </CardTitle>
                        <CardDescription>
                            Gerenciamento dos locais de atendimento (dados cadastrais, documentos/convênios e dados bancários).
                        </CardDescription>
                    </div>

                    {canWrite && (
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Adicionar Unidade
                                </Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nova Unidade de Saúde</DialogTitle>
                                </DialogHeader>

                                <form onSubmit={onCriar} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="unidade-nome">
                                            Nome *
                                        </Label>
                                        <Input
                                            id="unidade-nome"
                                            value={form.nome}
                                            onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                            placeholder="Ex.: UBS Centro"
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="unidade-tipo">
                                            Tipo *
                                        </Label>
                                        <Select
                                            value={form.tipo}
                                            onValueChange={(value) => setForm({ ...form, tipo: value as TipoUnidadeSaude })}
                                        >
                                            <SelectTrigger id="unidade-tipo">
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getTiposUnidadeOptions().map((opcao) => (
                                                    <SelectItem key={opcao.value} value={opcao.value}>
                                                        {opcao.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="unidade-cnes">CNES *</Label>
                                        <Input
                                            id="unidade-cnes"
                                            value={form.codigoCnes ?? ""}
                                            onChange={(e) => setForm({ ...form, codigoCnes: e.target.value })}
                                            placeholder="Ex.: 1234567"
                                            maxLength={7}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="unidade-cnpj">CNPJ</Label>
                                        <Input
                                            id="unidade-cnpj"
                                            value={form.cnpj ?? ""}
                                            onChange={(e) => {
                                                // Remove todos os caracteres não numéricos
                                                const numericValue = e.target.value.replace(/\D/g, "");

                                                // Aplica a máscara 00.000.000/0000-00
                                                let maskedValue = numericValue;
                                                if (numericValue.length > 2) {
                                                    maskedValue = numericValue.slice(0, 2) + "." + numericValue.slice(2);
                                                }
                                                if (numericValue.length > 5) {
                                                    maskedValue = numericValue.slice(0, 2) + "." + numericValue.slice(2, 5) + "." + numericValue.slice(5);
                                                }
                                                if (numericValue.length > 8) {
                                                    maskedValue = numericValue.slice(0, 2) + "." + numericValue.slice(2, 5) + "." + numericValue.slice(5, 8) + "/" + numericValue.slice(8);
                                                }
                                                if (numericValue.length > 12) {
                                                    maskedValue = numericValue.slice(0, 2) + "." + numericValue.slice(2, 5) + "." + numericValue.slice(5, 8) + "/" + numericValue.slice(8, 12) + "-" + numericValue.slice(12);
                                                }

                                                // Limita a 14 dígitos (CNPJ completo)
                                                if (numericValue.length <= 14) {
                                                    setForm({ ...form, cnpj: maskedValue });
                                                }
                                            }}
                                            placeholder="Ex.: 00.000.000/0001-00"
                                            maxLength={18} // Máximo com formatação: 00.000.000/0000-00
                                        />
                                    </div>

                                    {erro && <p className="text-sm text-red-600">{erro}</p>}

                                    <DialogFooter className="gap-2">
                                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit">Salvar</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>

                <CardContent>
                    {carregando && <p className="text-sm text-muted-foreground">Carregando unidades...</p>}

                    {!carregando && lista.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Nenhuma unidade cadastrada. {canWrite ? 'Clique em "Adicionar Unidade" para criar a primeira.' : ""}
                        </p>
                    )}

                    {!carregando && lista.length > 0 && (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>CNES</TableHead>
                                        <TableHead>CNPJ</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lista.map((u) => (
                                        <TableRow key={u.id ?? `${u.nome}-${u.codigoCnes || u.cnes}-${u.cnpj}`}>
                                            <TableCell className="font-medium">{u.nome}</TableCell>
                                            <TableCell>
                                                {u.tipo ? getTipoUnidadeDescricao(u.tipo) : '-'}
                                            </TableCell>
                                            <TableCell>{formatCnes(u.codigoCnes || u.cnes)}</TableCell>
                                            <TableCell>{formatCnpj(u.cnpj)}</TableCell>
                                            <TableCell>
                                                {u.ativa !== false ? <Badge>Ativa</Badge> : <Badge variant="secondary">Inativa</Badge>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UnidadesConfig;
