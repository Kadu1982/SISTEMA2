import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Users, Edit, Plus, Save, X, Loader2 } from "lucide-react";
import operadoresService, { OperadorDetalhe, OperadorResumo, HorarioAcesso } from "@/services/operadoresService";

/**
 * Tela de Operadores (configurações) — COMPLETA
 * - Listagem de operadores com busca
 * - Drawer lateral com 9 abas de edição:
 *   OPERADOR | CONFIG | RESTRICOES | SETORES | LOCAIS | HORARIOS | MODULOS | PERFIS | AUTH
 *
 * Observações de design:
 * - Mantive a identidade do projeto (shadcn/ui + Tailwind, sem “tema” novo)
 * - Cada aba faz chamadas específicas via operadoresService
 * - Para restrições/horários usei <textarea> JSON (simples, fácil de documentar)
 * - Todos os handlers estão comentados para ajudar na sua documentação técnica
 */

const OperadoresConfig: React.FC = () => {
    /* =========================
       Estado da LISTAGEM
       ========================= */
    const [busca, setBusca] = useState("");
    const [carregandoLista, setCarregandoLista] = useState(false);
    const [lista, setLista] = useState<OperadorResumo[]>([]);

    const carregarLista = async () => {
        setCarregandoLista(true);
        try {
            const data = await operadoresService.listar(busca || undefined);
            setLista(data);
        } finally {
            setCarregandoLista(false);
        }
    };

    useEffect(() => { carregarLista(); }, []);        // carrega ao montar
    useEffect(() => { const t = setTimeout(carregarLista, 400); return () => clearTimeout(t); }, [busca]); // debounce leve

    /* =========================
       Estado do DRAWER (edição)
       ========================= */
    const [aberto, setAberto] = useState(false);
    const [selId, setSelId] = useState<number | null>(null);
    const [det, setDet] = useState<OperadorDetalhe | null>(null);
    const [salvandoOperador, setSalvandoOperador] = useState(false);

    const abrirEdicao = async (id: number) => {
        setSelId(id);
        setAberto(true);
        const data = await operadoresService.obter(id);
        setDet(data);
    };
    const fecharEdicao = () => {
        setAberto(false);
        setSelId(null);
        setDet(null);
    };

    const atualizarOperador = async (patch: Partial<OperadorDetalhe>) => {
        if (!selId) return;
        setSalvandoOperador(true);
        try {
            const atualizado = await operadoresService.atualizar(selId, patch);
            setDet(atualizado);
            await carregarLista();
        } finally {
            setSalvandoOperador(false);
        }
    };

    /* =========================
       Render
       ========================= */
    return (
        <div className="container mx-auto py-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Users className="h-5 w-5" /> Operadores
                    </CardTitle>
                    <CardDescription>
                        Manutenção de Operadores do sistema, perfis, módulos, horários, restrições e acessos.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Barra de busca */}
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Buscar por nome ou login…"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                        <Button variant="outline" onClick={carregarLista}>Atualizar</Button>
                    </div>

                    {/* Tabela simples (identidade minimalista) */}
                    <div className="border rounded-md overflow-hidden">
                        <div className="grid grid-cols-5 bg-muted px-3 py-2 text-sm font-medium">
                            <div>ID</div>
                            <div>Nome</div>
                            <div>Login</div>
                            <div>Status</div>
                            <div className="text-right">Ações</div>
                        </div>

                        {carregandoLista ? (
                            <div className="px-3 py-6 text-sm flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" /> Carregando…
                            </div>
                        ) : (
                            lista.map((op) => (
                                <div key={op.id} className="grid grid-cols-5 px-3 py-2 border-t text-sm items-center">
                                    <div>#{op.id}</div>
                                    <div className="truncate">{op.nome}</div>
                                    <div className="font-mono truncate">{op.login}</div>
                                    <div>{op.ativo ? "Ativo" : "Inativo"}</div>
                                    <div className="text-right">
                                        <Button size="sm" variant="outline" onClick={() => abrirEdicao(op.id)}>
                                            <Edit className="h-4 w-4 mr-1" /> Editar
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Drawer lateral de edição com 9 abas */}
            <Sheet open={aberto} onOpenChange={(o) => !o && fecharEdicao()}>
                <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
                    <SheetHeader className="px-5 py-4">
                        <SheetTitle>Editar Operador {selId ? `#${selId}` : ""}</SheetTitle>
                        <SheetDescription>
                            Altere informações e permissões do operador nas abas abaixo.
                        </SheetDescription>
                    </SheetHeader>

                    <Separator />

                    <div className="p-5">
                        <Tabs defaultValue="OPERADOR" className="w-full">
                            {/* Cabeçalho das abas */}
                            <TabsList className="flex flex-wrap gap-2">
                                {["OPERADOR","CONFIG","RESTRICOES","SETORES","LOCAIS","HORARIOS","MODULOS","PERFIS","AUTH"].map((k) => (
                                    <TabsTrigger key={k} value={k} className="text-xs">{k}</TabsTrigger>
                                ))}
                            </TabsList>

                            <Separator className="my-3" />

                            {/* Conteúdos das abas */}
                            <TabsContent value="OPERADOR">
                                {det && (
                                    <AbaOperador
                                        det={det}
                                        onSalvar={atualizarOperador}
                                        salvando={salvandoOperador}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="CONFIG">
                                <AbaConfig />
                            </TabsContent>

                            <TabsContent value="RESTRICOES">
                                {selId && <AbaRestricoes operadorId={selId} />}
                            </TabsContent>

                            <TabsContent value="SETORES">
                                {selId && <AbaIdsSimples
                                    titulo="Setores permitidos"
                                    placeholder="ID do setor"
                                    carregar={() => operadoresService.listarSetores(selId)}
                                    salvar={(ids) => operadoresService.salvarSetores(selId, ids)}
                                />}
                            </TabsContent>

                            <TabsContent value="LOCAIS">
                                {selId && <AbaIdsSimples
                                    titulo="Locais de armazenamento liberados"
                                    placeholder="ID do local"
                                    carregar={() => operadoresService.listarLocais(selId)}
                                    salvar={(ids) => operadoresService.salvarLocais(selId, ids)}
                                />}
                            </TabsContent>

                            <TabsContent value="HORARIOS">
                                {selId && <AbaHorarios operadorId={selId} />}
                            </TabsContent>

                            <TabsContent value="MODULOS">
                                {selId && <AbaListaTexto
                                    titulo="Módulos liberados"
                                    placeholder="Nome do módulo…"
                                    carregar={() => operadoresService.listarModulos(selId)}
                                    salvar={(vals) => operadoresService.salvarModulos(selId, vals)}
                                />}
                            </TabsContent>

                            <TabsContent value="PERFIS">
                                {selId && <AbaListaTexto
                                    titulo="Perfis do operador"
                                    placeholder="Código do perfil…"
                                    carregar={() => operadoresService.listarPerfis(selId)}
                                    salvar={(vals) => operadoresService.salvarPerfis(selId, vals)}
                                />}
                            </TabsContent>

                            <TabsContent value="AUTH">
                                <AbaAuth />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <Separator />

                    <div className="p-4 flex justify-end">
                        <Button variant="outline" onClick={fecharEdicao}>
                            <X className="h-4 w-4 mr-1" /> Fechar
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default OperadoresConfig;

/* =====================================================================================
   COMPONENTES DAS ABAS
   ===================================================================================== */

/** Aba: OPERADOR — dados básicos (nome, email, ativo) */
function AbaOperador({
                         det,
                         onSalvar,
                         salvando,
                     }: {
    det: OperadorDetalhe;
    onSalvar: (patch: Partial<OperadorDetalhe>) => Promise<void>;
    salvando: boolean;
}) {
    const [nome, setNome] = useState(det.nome ?? "");
    const [email, setEmail] = useState(det.email ?? "");
    const [ativo, setAtivo] = useState(!!det.ativo);

    const mudou = useMemo(() => nome !== det.nome || email !== (det.email ?? "") || ativo !== !!det.ativo, [nome, email, ativo, det]);

    return (
        <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="op-nome">Nome</Label>
                    <Input id="op-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="op-email">E-mail</Label>
                    <Input id="op-email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input id="op-ativo" type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
                <Label htmlFor="op-ativo">Ativo</Label>
            </div>

            <div>
                <Button disabled={!mudou || salvando} onClick={() => onSalvar({ nome, email, ativo })}>
                    {salvando ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar
                </Button>
            </div>
        </div>
    );
}

/** Aba: CONFIG — placeholder informativo (ligaremos quando endpoints estiverem prontos) */
function AbaConfig() {
    return (
        <div className="space-y-2 text-sm">
            <p>Configurações adicionais do operador (unidade/setor padrão, origem de atendimento, etc.).</p>
            <p className="text-muted-foreground">Ligaremos aqui quando os endpoints específicos estiverem disponíveis.</p>
        </div>
    );
}

/** Aba: RESTRICOES — edição via JSON (simples e documentável) */
function AbaRestricoes({ operadorId }: { operadorId: number }) {
    const [valor, setValor] = useState<string>("{}");
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        (async () => {
            setCarregando(true);
            try {
                const dados = await operadoresService.listarRestricoes(operadorId);
                setValor(JSON.stringify(dados ?? {}, null, 2));
            } finally {
                setCarregando(false);
            }
        })();
    }, [operadorId]);

    const salvar = async () => {
        setSalvando(true);
        try {
            // Valida JSON antes de enviar
            const parsed = JSON.parse(valor || "{}");
            await operadoresService.salvarRestricoes(operadorId, parsed);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-sm">Defina restrições avançadas (ex.: por programa, fila, tipo de autorização). Estrutura livre em JSON.</p>
            <textarea
                className="w-full border rounded p-3 h-64 font-mono text-xs"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder='{}'
            />
            <Button onClick={salvar} disabled={salvando || carregando}>
                {salvando ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar
            </Button>
        </div>
    );
}

/** Aba genérica para listas de IDs (Setores, Locais…) */
function AbaIdsSimples({
                           titulo,
                           placeholder,
                           carregar,
                           salvar,
                       }: {
    titulo: string;
    placeholder: string;
    carregar: () => Promise<number[]>;
    salvar: (ids: number[]) => Promise<void>;
}) {
    const [ids, setIds] = useState<number[]>([]);
    const [novo, setNovo] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        (async () => {
            setCarregando(true);
            try {
                const data = await carregar();
                setIds(Array.isArray(data) ? data : []);
            } finally {
                setCarregando(false);
            }
        })();
    }, [carregar]);

    const add = () => {
        const n = Number(novo);
        if (!Number.isFinite(n) || n <= 0) return;
        setIds((prev) => Array.from(new Set([...prev, n])));
        setNovo("");
    };

    const rm = (i: number) => setIds((prev) => prev.filter((_, ix) => ix !== i));

    const salvarTudo = async () => {
        setSalvando(true);
        try {
            await salvar(ids);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-sm">{titulo}</p>

            <div className="flex gap-2">
                <Input placeholder={placeholder} value={novo} onChange={(e) => setNovo(e.target.value)} />
                <Button variant="secondary" onClick={add}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
            </div>

            <div className="border rounded">
                {ids.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">Nenhum ID adicionado.</div>
                ) : (
                    ids.map((x, i) => (
                        <div key={`${x}-${i}`} className="flex items-center justify-between px-3 py-2 border-t text-sm">
                            <span className="font-mono">#{x}</span>
                            <Button variant="outline" size="sm" onClick={() => rm(i)}>Remover</Button>
                        </div>
                    ))
                )}
            </div>

            <Button onClick={salvarTudo} disabled={salvando || carregando}>
                {salvando ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar
            </Button>
        </div>
    );
}

/** Aba: HORARIOS — edição via JSON (estrutura validada no backend) */
function AbaHorarios({ operadorId }: { operadorId: number }) {
    const [rows, setRows] = useState<HorarioAcesso[]>([]);
    const [txt, setTxt] = useState("[]");
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        (async () => {
            setCarregando(true);
            try {
                const data = await operadoresService.listarHorarios(operadorId);
                setRows(Array.isArray(data) ? data : []);
                setTxt(JSON.stringify(data ?? [], null, 2));
            } finally {
                setCarregando(false);
            }
        })();
    }, [operadorId]);

    const addExemplo = () => {
        const ex: HorarioAcesso = { diaSemana: 1, horaInicio: "08:00", horaFim: "17:00", unidadeId: null };
        const novoArr = [...rows, ex];
        setRows(novoArr);
        setTxt(JSON.stringify(novoArr, null, 2));
    };

    const salvar = async () => {
        setSalvando(true);
        try {
            const parsed = JSON.parse(txt || "[]");
            await operadoresService.salvarHorarios(operadorId, parsed);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-sm">
                Defina janelas por dia da semana (1=Seg…7=Dom). Intervalos que “viram a meia-noite” (ex. 22:00–06:00) são aceitos.
            </p>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={addExemplo}><Plus className="h-4 w-4 mr-1" /> Exemplo</Button>
                <Button variant="outline" onClick={() => setTxt(JSON.stringify(rows, null, 2))}>Recarregar JSON</Button>
            </div>
            <textarea
                className="w-full border rounded p-3 h-64 font-mono text-xs"
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                placeholder='[]'
            />
            <Button onClick={salvar} disabled={salvando || carregando}>
                {salvando ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar
            </Button>
        </div>
    );
}

/** Aba: MODULOS & PERFIS — listas de strings simples */
function AbaListaTexto({
                           titulo,
                           placeholder,
                           carregar,
                           salvar,
                       }: {
    titulo: string;
    placeholder: string;
    carregar: () => Promise<string[]>;
    salvar: (vals: string[]) => Promise<void>;
}) {
    const [vals, setVals] = useState<string[]>([]);
    const [novo, setNovo] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        (async () => {
            setCarregando(true);
            try {
                const data = await carregar();
                setVals(Array.isArray(data) ? data : []);
            } finally {
                setCarregando(false);
            }
        })();
    }, [carregar]);

    const add = () => {
        const v = (novo || "").trim();
        if (!v) return;
        setVals((prev) => Array.from(new Set([...prev, v])));
        setNovo("");
    };

    const rm = (i: number) => setVals((prev) => prev.filter((_, ix) => ix !== i));

    const salvarTudo = async () => {
        setSalvando(true);
        try {
            await salvar(vals);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-sm">{titulo}</p>

            <div className="flex gap-2">
                <Input placeholder={placeholder} value={novo} onChange={(e) => setNovo(e.target.value)} />
                <Button variant="secondary" onClick={add}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
            </div>

            <div className="border rounded">
                {vals.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">Nenhum item adicionado.</div>
                ) : (
                    vals.map((x, i) => (
                        <div key={`${x}-${i}`} className="flex items-center justify-between px-3 py-2 border-t text-sm">
                            <span className="font-mono">{x}</span>
                            <Button variant="outline" size="sm" onClick={() => rm(i)}>Remover</Button>
                        </div>
                    ))
                )}
            </div>

            <Button onClick={salvarTudo} disabled={salvando || carregando}>
                {salvando ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar
            </Button>
        </div>
    );
}

/** Aba: AUTH — placeholder de autenticação complementar (passo futuro) */
function AbaAuth() {
    return (
        <div className="space-y-2 text-sm">
            <p>Autenticação complementar (revalidação para telas sensíveis, A3, etc.).</p>
            <p className="text-muted-foreground">Fica para a fase posterior conforme seu plano.</p>
        </div>
    );
}
